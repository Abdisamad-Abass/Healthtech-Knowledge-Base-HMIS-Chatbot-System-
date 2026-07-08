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
    return res.status(500).json({
      message: error.message,
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
      orderBy: {
        views: "desc",
      },
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

exports.getFeedbackTrends = async (req, res) => {
  try {
    const feedback = await prisma.feedback.groupBy({
      by: ["rating"],
      _count: {
        rating: true,
      },
      orderBy: {
        rating: "asc",
      },
    });

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
