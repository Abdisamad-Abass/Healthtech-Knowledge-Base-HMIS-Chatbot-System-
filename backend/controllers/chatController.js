const { prisma } = require("../config/database");

const { createEmbedding } = require("../services/embeddingService");

const { askGroq } = require("../services/groqService");

// ===============================
// CHAT
// ===============================

exports.chat = async (req, res) => {
  try {
    const { question, sessionId, userId } = req.body;

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
        "👋 Hello! I am your HealthTech Knowledge Assistant. I can help with HMIS, healthcare documentation, troubleshooting and system guides.";

      await prisma.chatMessage.create({
        data: {
          question,

          answer,

          sessionId: session.id,
        },
      });

      return res.json({
        answer,

        sessionId: session.id,

        sources: [],
      });
    }

    // ===============================
    // EMBEDDING
    // ===============================

    const embedding = await createEmbedding(question);

    const vector = `[${embedding.join(",")}]`;

    // ===============================
    // RAG SEARCH
    // ===============================

    const results = await prisma.$queryRaw`

SELECT

ae."articleId",

ae."content",

a."title",

a."slug",

a."type",

a."product",

a."status",

(a."embedding" <-> ${vector}::vector) 
AS distance


FROM "ArticleEmbedding" ae


JOIN "Article" a

ON a.id = ae."articleId"


WHERE a."status"='PUBLISHED'


ORDER BY 
ae."embedding" <-> ${vector}::vector


LIMIT 5

`;

    // ===============================
    // NO ANSWER FOUND
    // ===============================

    if (!results.length) {
      const answer =
        "I could not find this information in the knowledge base. Please contact support or ask another question.";

      await prisma.chatMessage.create({
        data: {
          question,

          answer,

          sessionId: session.id,

          sources: [],
        },
      });

      // save unanswered question

      await prisma.unansweredQuestion.create({
        data: {
          question,

          sessionId: session.id,
        },
      });

      return res.json({
        answer,

        sessionId: session.id,

        sources: [],
      });
    }

    // ===============================
    // BUILD CONTEXT
    // ===============================

    const context = results
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

    const answer = await askGroq(context, question);

    // ===============================
    // SAVE CHAT MESSAGE
    // ===============================

    await prisma.chatMessage.create({
      data: {
        question,

        answer,

        sessionId: session.id,

        sources: results.map((item) => ({
          articleId: item.articleId,

          title: item.title,

          slug: item.slug,

          type: item.type,

          distance: Number(item.distance),
        })),
      },
    });

    return res.json({
      answer,

      sessionId: session.id,

      sources: results.map((item) => ({
        articleId: item.articleId,

        title: item.title,

        slug: item.slug,

        type: item.type,
      })),
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Chat service error",

      error: error.message,
    });
  }
};

// ===============================
// CHAT HISTORY
// ===============================

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

// ===============================
// CHAT FEEDBACK
// ===============================

exports.addFeedback = async (req, res) => {
  try {
    const { helpful } = req.body;

    const message = await prisma.chatMessage.update({
      where: {
        id: req.params.messageId,
      },

      data: {
        feedback: helpful,
      },
    });

    res.json({
      message: "Feedback saved",

      data: message,
    });
  } catch (error) {
    res.status(500).json({
      message: "Feedback error",
    });
  }
};
