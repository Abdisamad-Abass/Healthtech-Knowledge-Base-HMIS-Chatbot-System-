const { prisma } = require("../config/database");

exports.logChatAnalytics = async ({
  sessionId,
  userId,
  question,

  answerFound,
  fallbackUsed = false,

  articlesRetrieved = 0,
  citationsReturned = 0,

  confidence = null,

  embeddingTime = 0,
  retrievalTime = 0,
  llmTime = 0,
  responseTime = 0,

  model = "Unknown",
}) => {
  try {
    await prisma.chatAnalytics.create({
      data: {
        sessionId,
        userId,
        question,

        answerFound,
        fallbackUsed,

        articlesRetrieved,
        citationsReturned,

        confidence,

        embeddingTime,
        retrievalTime,
        llmTime,
        responseTime,

        model,
      },
    });
  } catch (err) {
    console.error("Analytics logging failed:", err.message);
    // Don't interrupt chat if analytics fails.
  }
};
