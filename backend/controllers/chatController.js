const { prisma } = require("../config/database");

const { createEmbedding } = require("../services/embeddingService");

const { askGroq } = require("../services/groqService");
const { logChatAnalytics } = require("../services/chatAnalyticsService");

// CHAT

exports.chat = async (req, res) => {
  try {
    const { question, sessionId, userId } = req.body;

    const totalStart = Date.now();

    let embeddingTime = 0;
    let retrievalTime = 0;
    let llmTime = 0;

    if (!question) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    // ===============================
    // CREATE / GET SESSION
    // ===============================

    let session;

    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: {
          id: sessionId,
        },
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          title: question.substring(0, 50),

          userId: userId || req.user?.id || null,
        },
      });
    }

    // ===============================
    // GREETINGS
    // ===============================

    const greetings = [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
    ];

    if (greetings.includes(question.toLowerCase().trim())) {
      const answer =
        "Hello! 👋 I'm the HealthTech Knowledge Base Assistant.\n\nHow can I help you today? You can ask me questions about HMIS, system procedures, troubleshooting, or other approved knowledge base articles.";

      const responseTime = Date.now() - totalStart;

      await prisma.chatMessage.create({
        data: {
          question,

          answer,

          sessionId: session.id,
          responseTime,
          confidence: 1,
          citations: [],
        },
      });

      // ===============================
      // CHAT ANALYTICS
      // ===============================

      await logChatAnalytics({
        sessionId: session.id,
        userId: userId || req.user?.id,

        question,

        answerFound: true,

        fallbackUsed: false,

        articlesRetrieved: 0,

        citationsReturned: 0,

        confidence: 1,

        embeddingTime: 0,
        retrievalTime: 0,
        llmTime: 0,

        responseTime,

        model: "Greeting",
      });

      return res.json({
        answer,

        sessionId: session.id,

        confidence: "HIGH",
        responseTime,
        sessionId: session.id,
        citations: [],
      });
    }

    // ===============================
    // EMBEDDING
    // ===============================

    const embeddingStart = Date.now();

    const embedding = await createEmbedding(question);

    embeddingTime = Date.now() - embeddingStart;

    const vector = `[${embedding.join(",")}]`;

    // ===============================
    // RAG SEARCH
    // ===============================

    const retrievalStart = Date.now();

    const results = await prisma.$queryRaw`

SELECT

ae."articleId",

ae."content",

a."title",

a."slug",

a."type",

a."product",

a."status",

(ae."embedding" <-> ${vector}::vector)
AS distance


FROM "ArticleEmbedding" ae


JOIN "Article" a

ON a.id = ae."articleId"


WHERE a."status"='PUBLISHED'


ORDER BY

ae."embedding" <-> ${vector}::vector


LIMIT 5

`;
    retrievalTime = Date.now() - retrievalStart;

    // ======================================
    // FILTER IRRELEVANT RESULTS
    // ======================================

    // pgvector distance:
    // smaller = more similar
    // larger = less similar

    const MAX_DISTANCE = 0.75;

    const filteredResults = results.filter(
      (article) => Number(article.distance) <= MAX_DISTANCE,
    );

    // ===============================
    // NO ANSWER FOUND
    // ===============================

    if (!filteredResults.length) {
      const answer =
        "I could not find this information in the knowledge base. Please contact support or ask another question.";

      await prisma.chatMessage.create({
        data: {
          question,

          answer,

          sessionId: session.id,

          citations: [],
        },
      });

      // save unanswered question

      await prisma.unansweredQuestion.create({
        data: {
          question,

          sessionId: session.id,
        },
      });

      // ===============================
      // CHAT ANALYTICS
      // ===============================

      await logChatAnalytics({
        sessionId: session.id,
        userId: userId || req.user?.id,

        question,

        answerFound: false,

        fallbackUsed: true,

        articlesRetrieved: 0,

        citationsReturned: 0,

        confidence: 0,

        embeddingTime,
        retrievalTime,
        llmTime: 0,

        responseTime: Date.now() - totalStart,

        model: "RAG",
      });

      return res.json({
        answer,

        sessionId: session.id,

        citations: [],
      });
    }

    // ===============================
    // BUILD CONTEXT
    // ===============================

    const context = filteredResults
      .map((item, index) => {
        return `

SOURCE ${index + 1}

TITLE:
${item.title}


TYPE:
${item.type}


CONTENT:

${item.content.substring(0, 2000)}

`;
      })
      .join("\n");

    // ===============================
    // GROQ ANSWER
    // ===============================

    const llmStart = Date.now();

    const aiResponse = await askGroq({
      context,
      question,
    });

    llmTime = Date.now() - llmStart;

    const answer = aiResponse.answer;

    // Did the AI actually answer?
    const answerFound =
      aiResponse.confidence === "HIGH" || aiResponse.confidence === "MEDIUM";

    const fallbackUsed = !answerFound;

    // Save unanswered questions
    if (!answerFound) {
      await prisma.unansweredQuestion.create({
        data: {
          question,
          sessionId: session.id,
          similarity: Number(filteredResults[0]?.distance ?? 1),
          reason: "LLM rejected retrieved context",
        },
      });
    }
    // ===============================
    // CHAT ANALYTICS
    // ===============================

    await logChatAnalytics({
      sessionId: session.id,
      userId: userId || req.user?.id,

      question,

      answerFound,

      fallbackUsed,

      articlesRetrieved: answerFound ? filteredResults.length : 0,

      citationsReturned: answerFound ? aiResponse.citations.length : 0,

      confidence:
        aiResponse.confidence === "HIGH"
          ? 1
          : aiResponse.confidence === "MEDIUM"
            ? 0.6
            : 0.3,

      embeddingTime,
      retrievalTime,
      llmTime,

      responseTime: Date.now() - totalStart,

      model: "llama-3.1-8b-instant",
    });
    // ===============================
    // SAVE CHAT MESSAGE
    // ===============================

    await prisma.chatMessage.create({
      data: {
        question,

        answer,

        sessionId: session.id,
        responseTime: aiResponse.responseTime,

        confidence:
          aiResponse.confidence === "HIGH"
            ? 1
            : aiResponse.confidence === "MEDIUM"
              ? 0.6
              : 0.3,

        citations: answerFound
          ? filteredResults.map((item) => ({
              articleId: item.articleId,
              title: item.title,
              slug: item.slug,
              type: item.type,
              distance: Number(item.distance),
            }))
          : [],
      },
    });
    await prisma.chatSession.update({
      where: {
        id: session.id,
      },
      data: {
        lastMessageAt: new Date(),
        totalMessages: {
          increment: 1,
        },
      },
    });

    return res.json({
      answer: aiResponse.answer,

      confidence: aiResponse.confidence,

      responseTime: aiResponse.responseTime,

      citations: answerFound ? aiResponse.citations : [],

      sessionId: session.id,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Chat service error",

      error: error.message,
    });
  }
};

// CHAT HISTORY

exports.getHistory = async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId: req.params.sessionId,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: "History error",
    });
  }
};

// CHAT FEEDBACK

exports.addFeedback = async (req, res) => {
  try {
    const { helpful } = req.body;

    const existing = await prisma.chatMessage.findUnique({
      where: {
        id: req.params.messageId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Chat message not found",
      });
    }

    const message = await prisma.chatMessage.update({
      where: {
        id: req.params.messageId,
      },
      data: {
        feedback: helpful,
      },
    });

    return res.json({
      message: "Feedback saved",
      data: message,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Feedback error",
      error: error.message,
    });
  }
};
