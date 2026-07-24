const { prisma } = require("../config/database");

const { createEmbedding } = require("../services/embeddingService");

const { askGroq } = require("../services/groqService");
const { logChatAnalytics } = require("../services/chatAnalyticsService");

// CHAT

exports.chat = async (req, res) => {
  try {
    const { question, sessionId } = req.body;
    const userId = req.user.id;

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

          userId,
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
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        name: true,
      },
    });

    if (greetings.includes(question.toLowerCase().trim())) {
      const answer = `Hello ${user.name}!  👋 I'm the HealthTech Knowledge Base Assistant.\n\nHow can I help you today? You can ask me questions about HMIS, system procedures, troubleshooting, or other approved knowledge base articles.`;

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
      // ===============================
      // CHAT ANALYTICS
      // ===============================

      await logChatAnalytics({
        sessionId: session.id,
        userId,

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

    // ENRICH THE QUESTION WITH CONTEXT - MATCH HOW ARTICLES ARE EMBEDDED
    const enrichedQuestion = `
      Title:
      ${question}

      Type:
      Question

      Category:
      General

      Content:
      ${question}
    `;

    const embedding = await createEmbedding(enrichedQuestion);

    embeddingTime = Date.now() - embeddingStart;

    const vector = `[${embedding.join(",")}]`;

    // ===============================
    // RAG SEARCH
    // ===============================

    const retrievalStart = Date.now();

    const results = await prisma.$queryRaw`

      SELECT

      ae."articleId",
      a."title",

      a."slug",

      a."content",

      ae."content" AS embedding_content,

      a."type",

      a."product",

      a."status",

      (ae."embedding" <=> ${vector}::vector) AS embedding_distance


      FROM "ArticleEmbedding" ae


      JOIN "Article" a

      ON a.id = ae."articleId"


      WHERE a."status"='PUBLISHED'


      ORDER BY

      ae."embedding" <=> ${vector}::vector


      LIMIT 10

      `;
    function normalize(text) {
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    function titleSimilarity(question, title) {
      question = normalize(question);
      title = normalize(title);

      if (question === title) return 1;

      const qWords = new Set(question.split(" "));
      const tWords = new Set(title.split(" "));

      let matches = 0;

      for (const word of qWords) {
        if (tWords.has(word)) {
          matches++;
        }
      }

      return matches / Math.max(qWords.size, tWords.size);
    }

    function keywordScore(question, content) {
      const qWords = new Set(
        question.toLowerCase().split(/\W+/).filter(Boolean),
      );

      const text = content.toLowerCase();

      let matches = 0;

      for (const word of qWords) {
        if (text.includes(word)) matches++;
      }

      return matches / qWords.size;
    }

    retrievalTime = Date.now() - retrievalStart;

    // ======================================
    // FILTER IRRELEVANT RESULTS
    // ======================================

    // pgvector distance:
    // smaller = more similar
    // larger = less similar

    // ======================================
    // FILTER RELEVANT RESULTS
    // ======================================
    console.log(
      results.map((r) => ({
        title: r.title,
        distance: Number(r.embedding_distance),
      })),
    );

    if (!results.length) {
      return res.json({
        answer: "I could not find this information in the knowledge base.",
        citations: [],
        sessionId: session.id,
      });
    }

    const rankedResults = results
      .map((article) => {
        const embeddingSimilarity = 1 - Number(article.embedding_distance);

        const titleScore = titleSimilarity(question, article.title);
        const exactTitle = normalize(question) === normalize(article.title);

        const keyword = keywordScore(
          question,
          `${article.title} ${article.content}`,
        );

        let finalScore =
          embeddingSimilarity * 0.5 + titleScore * 0.35 + keyword * 0.15;

        if (exactTitle) {
          finalScore += 0.15;
        }

        finalScore = Math.min(finalScore, 1);

        return {
          ...article,
          embeddingSimilarity,
          titleScore,
          keyword,
          finalScore,
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore);

    const filteredResults = rankedResults.filter((r) => r.finalScore >= 0.5);

    console.table(
      rankedResults.map((r) => ({
        title: r.title,
        distance: Number(r.embedding_distance).toFixed(3),
        embedding: r.embeddingSimilarity.toFixed(3),
        title: r.titleScore.toFixed(3),
        keyword: r.keyword.toFixed(3),
        final: r.finalScore.toFixed(3),
      })),
    );

    console.log(
      "Filtered:",
      filteredResults.map((r) => ({
        title: r.title,
        distance: Number(r.embedding_distance),
      })),
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
        userId,

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
      .slice(0, 3)
      .map(
        (item, index) => `
          SOURCE ${index + 1}

          TITLE:
          ${item.title}

          TYPE:
          ${item.type}

          CONTENT:
          ${item.content.substring(0, 1800)}
          `,
      )
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
          similarity: filteredResults.length
            ? 1 - Number(filteredResults[0].embedding_distance)
            : 0,
          reason: "LLM rejected retrieved context",
        },
      });
    }
    // ===============================
    // CHAT ANALYTICS
    // ===============================

    await logChatAnalytics({
      sessionId: session.id,
      userId,

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
          ? filteredResults.slice(0, 3).map((item) => ({
              articleId: item.articleId,
              title: item.title,
              slug: item.slug,
              type: item.type,
              distance: Number(item.embedding_distance),
            }))
          : [],
      },
    });
    // chat session
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
    //audit logs
    await prisma.auditLog.create({
      data: {
        action: "CHATBOT",
        entity: "Chat",

        entityId: session.id,

        userId: req.user?.id || null,

        details: {
          question,
          confidence: aiResponse.confidence,
        },
      },
    });
    const topResults = filteredResults.slice(0, 3);

    return res.json({
      answer: aiResponse.answer,

      confidence: aiResponse.confidence,

      responseTime: aiResponse.responseTime,

      citations: answerFound
        ? topResults.map((item) => ({
            articleId: item.articleId,
            title: item.title,
            slug: item.slug,
            type: item.type,
            distance: Number(item.embedding_distance),
          }))
        : [],

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
    const session = await prisma.chatSession.findFirst({
      where: {
        id: req.params.sessionId,
        userId: req.user.id,
      },
    });

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId: session.id,
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
// GET ALL CHAT SESSIONS FOR LOGGED-IN USER
exports.getSessions = async (req, res) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: {
        userId: req.user.id,
        isArchived: false,
      },
      orderBy: {
        lastMessageAt: "desc",
      },
      select: {
        id: true,
        title: true,
        totalMessages: true,
        createdAt: true,
        lastMessageAt: true,
        isArchived: true,
      },
    });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch chat sessions",
      error: error.message,
    });
  }
};

// ARCHIVE CHAT SESSION
exports.archiveSession = async (req, res) => {
  try {
    const session = await prisma.chatSession.findFirst({
      where: {
        id: req.params.sessionId,
        userId: req.user.id,
      },
    });

    if (!session) {
      return res.status(404).json({
        message: "Chat session not found",
      });
    }

    const archivedSession = await prisma.chatSession.update({
      where: {
        id: session.id,
      },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    return res.json({
      message: "Chat archived successfully",
      session: archivedSession,
    });
  } catch (error) {
    console.error("Archive session error:", error);

    return res.status(500).json({
      message: "Failed to archive chat",
    });
  }
};

// GET ARCHIVED CHAT SESSIONS
exports.getArchivedSessions = async (req, res) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: {
        userId: req.user.id,
        isArchived: true,
      },
      orderBy: {
        archivedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        totalMessages: true,
        createdAt: true,
        lastMessageAt: true,
        archivedAt: true,
        isArchived: true,
      },
    });

    res.json(sessions);
  } catch (error) {
    console.error("Get archived sessions error:", error);

    res.status(500).json({
      message: "Failed to fetch archived chats",
      error: error.message,
    });
  }
};

// UNARCHIVE CHAT SESSION
exports.unarchiveSession = async (req, res) => {
  try {
    const session = await prisma.chatSession.findFirst({
      where: {
        id: req.params.sessionId,
        userId: req.user.id,
        isArchived: true,
      },
    });

    if (!session) {
      return res.status(404).json({
        message: "Archived chat not found",
      });
    }

    const unarchivedSession = await prisma.chatSession.update({
      where: {
        id: session.id,
      },
      data: {
        isArchived: false,
        archivedAt: null,
      },
    });

    return res.json({
      message: "Chat restored successfully",
      session: unarchivedSession,
    });
  } catch (error) {
    console.error("Unarchive session error:", error);

    return res.status(500).json({
      message: "Failed to restore chat",
    });
  }
};

// DELETE CHAT SESSION
exports.deleteSession = async (req, res) => {
  try {
    const session = await prisma.chatSession.findFirst({
      where: {
        id: req.params.sessionId,
        userId: req.user.id,
      },
    });

    if (!session) {
      return res.status(404).json({
        message: "Chat session not found",
      });
    }

    await prisma.chatSession.delete({
      where: {
        id: session.id,
      },
    });

    return res.json({
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Delete session error:", error);

    return res.status(500).json({
      message: "Failed to delete chat",
    });
  }
};
