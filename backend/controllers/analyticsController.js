const { prisma } = require("../config/database");

// GET ANALYTICS SUMMARY

exports.getSummary = async (req, res) => {
  try {
    const [
      totalChats,
      answered,
      unanswered,
      fallbackUsed,
      avgResponse,
      avgConfidence,
      totalArticles,
    ] = await Promise.all([
      prisma.chatAnalytics.count(),

      prisma.chatAnalytics.count({
        where: {
          answerFound: true,
        },
      }),

      prisma.chatAnalytics.count({
        where: {
          answerFound: false,
        },
      }),
      prisma.chatAnalytics.count({
        where: {
          fallbackUsed: true,
        },
      }),

      prisma.chatAnalytics.aggregate({
        _avg: {
          responseTime: true,
        },
      }),

      prisma.chatAnalytics.aggregate({
        _avg: {
          confidence: true,
        },
      }),

      prisma.chatAnalytics.aggregate({
        _sum: {
          articlesRetrieved: true,
        },
      }),
    ]);

    return res.json({
      totalChats,

      answered,

      unanswered,
      fallbackUsed,

      fallbackRate:
        totalChats > 0
          ? `${((fallbackUsed / totalChats) * 100).toFixed(2)}%`
          : "0%",

      averageResponseTime: avgResponse._avg.responseTime,

      averageConfidence: avgConfidence._avg.confidence,

      totalArticlesRetrieved: totalArticles._sum.articlesRetrieved || 0,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

// GET ALL ANALYTICS

exports.getAll = async (req, res) => {
  try {
    const analytics = await prisma.chatAnalytics.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(analytics);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE ANALYTIC

exports.getOne = async (req, res) => {
  try {
    const analytic = await prisma.chatAnalytics.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!analytic) {
      return res.status(404).json({
        message: "Analytics not found",
      });
    }

    return res.json(analytic);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.getTopViewed = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        views: true,
        avgRating: true,
        reviewCount: true,
      },
      orderBy: [
        {
          views: "desc",
        },
        {
          avgRating: "desc",
        },
        {
          reviewCount: "desc",
        },
      ],
      take: 10,
    });

    return res.json(articles);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.getMostSearched = async (req, res) => {
  try {
    const searches = await prisma.searchLog.groupBy({
      by: ["query"],
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: "desc",
        },
      },
      take: 10,
    });

    res.json(searches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLowRated = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: {
        reviewCount: {
          gt: 0,
        },
      },
      select: {
        id: true,
        title: true,
        avgRating: true,
        reviewCount: true,
      },
      orderBy: {
        avgRating: "asc",
      },
      take: 10,
    });

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPopularCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: {
        articles: {
          _count: "desc",
        },
      },
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPopularModules = async (req, res) => {
  try {
    const modules = await prisma.article.groupBy({
      by: ["product"],
      _count: {
        product: true,
      },
      orderBy: {
        _count: {
          product: "desc",
        },
      },
    });

    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssistantUsage = async (req, res) => {
  try {
    const usage = await prisma.chatAnalytics.groupBy({
      by: ["model"],
      _count: true,
      _avg: {
        responseTime: true,
        confidence: true,
      },
    });

    res.json(usage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET FEEDBACK TRENDS
exports.getFeedbackTrends = async (req, res) => {
  try {
    const trends = await prisma.$queryRaw`
      SELECT
    TO_CHAR(DATE("createdAt"), 'YYYY-MM-DD') AS date,
    ROUND(AVG(rating)::numeric,2) AS "averageRating",
    COUNT(*)::int AS "totalFeedback",

    COUNT(*) FILTER (WHERE rating = 5)::int AS "fiveStar",
    COUNT(*) FILTER (WHERE rating = 4)::int AS "fourStar",
    COUNT(*) FILTER (WHERE rating = 3)::int AS "threeStar",
    COUNT(*) FILTER (WHERE rating = 2)::int AS "twoStar",
    COUNT(*) FILTER (WHERE rating = 1)::int AS "oneStar"

FROM "Feedback"

GROUP BY DATE("createdAt")

ORDER BY DATE("createdAt");
    `;

    return res.json(trends);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
exports.getUnanswered = async (req, res) => {
  try {
    const questions = await prisma.unansweredQuestion.findMany({
      where: {
        resolved: false,
      },
      orderBy: {
        askedAt: "desc",
      },
      take: 50,
    });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSearchTrends = async (req, res) => {
  try {
    const trends = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") AS date,
        COUNT(*)::int AS searches
      FROM "SearchLog"
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 30
    `;

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ARTICLE FEEDBACK ANALYTICS
exports.getArticleFeedback = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: {
        reviewCount: {
          gt: 0,
        },
      },

      select: {
        id: true,
        title: true,
        avgRating: true,
        reviewCount: true,

        feedback: {
          select: {
            rating: true,
          },
        },
      },

      orderBy: {
        avgRating: "desc",
      },
    });

    const results = articles.map((article) => {
      const distribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      article.feedback.forEach((item) => {
        distribution[item.rating]++;
      });

      return {
        id: article.id,
        title: article.title,
        averageRating: Number(article.avgRating.toFixed(2)),
        totalRatings: article.reviewCount,
        ratings: distribution,
      };
    });

    return res.json(results);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET CHAT FEEDBACK ANALYTICS
exports.getChatFeedback = async (req, res) => {
  try {
    const [totalResponses, feedbackGiven, helpful, notHelpful] =
      await Promise.all([
        prisma.chatMessage.count(),

        prisma.chatMessage.count({
          where: {
            feedback: {
              not: null,
            },
          },
        }),

        prisma.chatMessage.count({
          where: {
            feedback: true,
          },
        }),

        prisma.chatMessage.count({
          where: {
            feedback: false,
          },
        }),
      ]);

    const helpfulRate =
      feedbackGiven > 0
        ? `${((helpful / feedbackGiven) * 100).toFixed(2)}%`
        : "0%";

    const notHelpfulRate =
      feedbackGiven > 0
        ? `${((notHelpful / feedbackGiven) * 100).toFixed(2)}%`
        : "0%";

    return res.json({
      totalResponses,
      feedbackGiven,

      helpful,
      notHelpful,

      helpfulRate,
      notHelpfulRate,

      pendingFeedback: totalResponses - feedbackGiven,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
// GET RECENT ACTIVITIES
exports.getRecentActivities = async (req, res) => {
  try {
    const activities = await prisma.auditLog.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    res.json(activities);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
