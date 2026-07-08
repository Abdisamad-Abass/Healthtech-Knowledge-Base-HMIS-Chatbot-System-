const { Prisma } = require("@prisma/client");
const { prisma } = require("../config/database");
const { createEmbedding } = require("../services/embeddingService");
// Search Articles
exports.search = async (req, res) => {
  try {
    const { q, category, type, product, page = 1, limit = 20 } = req.query;

    const pageNumber = Number.isFinite(Number(page))
      ? Math.max(1, Number(page))
      : 1;

    const limitNumber = Number.isFinite(Number(limit))
      ? Math.min(100, Math.max(1, Number(limit)))
      : 20;

    if (!q || !q.trim()) {
      return res.json({
        results: [],
        count: 0,
      });
    }

    const searchText = q.trim();

    // ===============================
    // ROLE-BASED VISIBILITY
    // ===============================

    let prismaWhere = {};
    let sqlVisibility;

    if (req.user.role === "VIEWER") {
      prismaWhere = {
        status: "PUBLISHED",
      };

      sqlVisibility = Prisma.sql`
    a.status = 'PUBLISHED'
  `;
    } else if (req.user.role === "EDITOR") {
      prismaWhere = {
        OR: [
          {
            status: "PUBLISHED",
          },
          {
            authorId: req.user.id,
          },
        ],
      };

      sqlVisibility = Prisma.sql`
    (
      a.status = 'PUBLISHED'
      OR a."authorId" = ${req.user.id}
    )
  `;
    } else {
      // ADMIN
      prismaWhere = {};

      sqlVisibility = Prisma.sql`TRUE`;
    }

    // ===============================
    // VECTOR SEARCH
    // ===============================

    try {
      const embedding = await createEmbedding(searchText);

      if (!embedding || embedding.length === 0) {
        throw new Error("Failed to generate embedding");
      }

      const vector = `[${embedding.join(",")}]`;
      const SIMILARITY_THRESHOLD = 0.65;
      const vectorResults = await prisma.$queryRaw`

      SELECT
        a.id,
        a.title,
        a.slug,
        a.content,
        a.type,
        a.product,
        a.views,
        a."avgRating",
        a."createdAt",
        (ae."embedding" <-> ${vector}::vector) AS distance

        FROM "ArticleEmbedding" ae
        JOIN "Article" a
        ON a.id = ae."articleId"
        WHERE ${sqlVisibility}
        AND (ae."embedding" <-> ${vector}::vector) <= ${SIMILARITY_THRESHOLD}
        ${
          category
            ? Prisma.sql`
            AND EXISTS (
                SELECT 1
                FROM "Category" c
                WHERE c.id = a."categoryId"
                AND c.name ILIKE ${`%${category}%`}
            )
            `
            : Prisma.sql``
        }
        ${type ? Prisma.sql`AND a.type = ${type}` : Prisma.sql``}
        ${product ? Prisma.sql`AND a.product = ${product}` : Prisma.sql``}
        ORDER BY
        ae."embedding" <-> ${vector}::vector,
        a."avgRating" DESC,
        a.views DESC,
        a."createdAt" DESC
        OFFSET ${(pageNumber - 1) * limitNumber}
        LIMIT ${limitNumber}
      `;
      console.table(vectorResults);
      console.log(`✅ Semantic search found ${vectorResults.length} results`);
      // get relations

      const ids = vectorResults.map((item) => item.id);

      if (!ids.length) {
        console.log("No semantic results. Falling back to keyword search.");
        throw new Error("NO_SEMANTIC_RESULTS");
      }

      const articles = await prisma.article.findMany({
        where: {
          id: {
            in: ids,
          },
          ...prismaWhere,
        },

        include: {
          category: true,
          tags: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // keep vector order
      const articleMap = new Map(
        articles.map((article) => [article.id, article]),
      );
      const ordered = vectorResults
        .map((item) => {
          const article = articleMap.get(item.id);

          if (!article) return null;

          // Calculate similarity score (0-1)
          const similarity = Math.max(
            0,
            Math.min(1, 1 - Number(item.distance) / SIMILARITY_THRESHOLD),
          );

          return {
            ...article,
            similarity: Math.round(similarity * 100) / 100, // Round to 2 decimal places
            _distance: Number(item.distance),
          };
        })
        .filter(Boolean);

      await prisma.searchLog.create({
        data: {
          query: searchText,
          resultCount: ordered.length,
          userId: req.user?.id || null,
        },
      });
      if (ordered.length === 0) {
        await prisma.unansweredQuestion.create({
          data: {
            question: searchText,
          },
        });
      }

      return res.json({
        results: ordered,
        count: ordered.length,
        searchType: "semantic",
      });
    } catch (vectorError) {
      console.error("Semantic search failed:", vectorError.message);
    }

    // ===============================
    // KEYWORD SEARCH FALLBACK
    // ===============================
    console.log(`🔍 Performing keyword search for: "${searchText}"`);
    const where = {
      ...prismaWhere,
    };
    // Add category filter
    if (category) {
      where.category = {
        name: {
          contains: category,
          mode: "insensitive",
        },
      };
    }
    // Add type filter
    if (type) {
      where.type = type;
    }
    // Add product filter
    if (product) {
      where.product = product;
    }

    const searchConditions = [
      { title: { contains: searchText, mode: "insensitive" } },
      { content: { contains: searchText, mode: "insensitive" } },
      {
        tags: {
          some: {
            name: {
              contains: searchText,
              mode: "insensitive",
            },
          },
        },
      },
      {
        category: {
          name: {
            contains: searchText,
            mode: "insensitive",
          },
        },
        product: {
          contains: searchText,
          mode: "insensitive",
        },
      },
    ];

    const results = await prisma.article.findMany({
      where: {
        ...where,
        OR: searchConditions,
      },

      include: {
        category: true,
        tags: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: [
        {
          views: "desc",
        },
        {
          createdAt: "desc",
        },
      ],

      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
    });

    // log search
    const total = await prisma.article.count({
      where: {
        ...where,
        OR: searchConditions,
      },
    });
    console.log(`✅ Keyword search found ${results.length} results`);
    await prisma.searchLog.create({
      data: {
        query: searchText,
        resultCount: results.length,
        userId: req.user?.id || null,
      },
    });

    return res.json({
      results,
      count: results.length,
      total,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      searchType: "keyword",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Search failed",

      error: error.message,
    });
  }
};

// AUTOCOMPLETE - ENHANCED

exports.autocomplete = async (req, res) => {
  try {
    const { q = "", limit = 10 } = req.query;

    if (q.length < 2) {
      return res.json([]);
    }

    const searchTerm = `${q}%`;
    const searchTermAny = `%${q}%`;

    // Get suggestions from titles, tags, and categories
    const suggestions = await prisma.$queryRaw`
      (
        -- Title suggestions
        SELECT 
          title AS value,
          'title' AS type,
          (CASE 
            WHEN title ILIKE ${searchTerm} THEN 100
            ELSE 80
          END) AS priority
        FROM "Article"
        WHERE title ILIKE ${searchTermAny}
        AND status = 'PUBLISHED'
        LIMIT ${Math.floor(limit / 2)}
      )
      UNION
      (
        -- Tag suggestions
        SELECT 
          name AS value,
          'tag' AS type,
          60 AS priority
        FROM "Tag"
        WHERE name ILIKE ${searchTermAny}
        LIMIT ${Math.floor(limit / 3)}
      )
      UNION
      (
        -- Category suggestions
        SELECT 
          name AS value,
          'category' AS type,
          40 AS priority
        FROM "Category"
        WHERE name ILIKE ${searchTermAny}
        LIMIT ${Math.floor(limit / 3)}
      )
      ORDER BY priority DESC, value
      LIMIT ${limit}
    `;

    // Format results with labels
    const formatted = suggestions.map((s) => ({
      text: s.value,
      type: s.type,
      label: `${s.value} (${s.type})`,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("❌ Autocomplete error:", error);
    res.status(500).json({ error: error.message });
  }
};

// RECENT SEARCHES

exports.recentSearches = async (req, res) => {
  try {
    const recent = await prisma.searchLog.findMany({
      where: {
        userId: req.user.id,
      },
      distinct: ["query"],
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      select: {
        query: true,
        resultCount: true,
        createdAt: true,
      },
    });

    res.json({
      searches: recent,
      count: recent.length,
    });
  } catch (error) {
    console.error("❌ Recent searches error:", error);
    res.status(500).json({ error: error.message });
  }
};

// TRENDING SEARCHES

exports.trending = async (req, res) => {
  try {
    const { days = 7, limit = 20 } = req.query;

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    const trending = await prisma.searchLog.groupBy({
      by: ["query"],
      where: {
        createdAt: {
          gte: dateLimit,
        },
      },
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: "desc",
        },
      },
      take: parseInt(limit),
    });

    // Get additional stats for each trending search
    const trendingWithStats = await Promise.all(
      trending.map(async (item) => {
        const lastResults = await prisma.searchLog.findFirst({
          where: { query: item.query },
          orderBy: { createdAt: "desc" },
          select: { resultCount: true, createdAt: true },
        });

        return {
          query: item.query,
          count: item._count.query,
          lastResultCount: lastResults?.resultCount || 0,
          lastSearched: lastResults?.createdAt || null,
          trend: item._count.query > 5 ? "rising" : "stable",
        };
      }),
    );

    res.json({
      trending: trendingWithStats,
      period: `${days} days`,
      count: trendingWithStats.length,
    });
  } catch (error) {
    console.error("❌ Trending search error:", error);
    res.status(500).json({ error: error.message });
  }
};

// SEARCH ANALYTICS

exports.getAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    // Get overall stats
    const totalSearches = await prisma.searchLog.count({
      where: { createdAt: { gte: dateLimit } },
    });

    const uniqueSearches = await prisma.searchLog.groupBy({
      by: ["query"],
      where: { createdAt: { gte: dateLimit } },
      _count: true,
    });

    const zeroResults = await prisma.unansweredQuestion.count({
      where: {
        askedAt: { gte: dateLimit },
        resolved: false,
      },
    });

    // Get daily search counts
    const dailySearches = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*)::int as count
      FROM "SearchLog"
      WHERE "createdAt" >= ${dateLimit}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `;

    // Get popular search terms
    const popularTerms = await prisma.searchLog.groupBy({
      by: ["query"],
      where: { createdAt: { gte: dateLimit } },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    });

    res.json({
      period: `${days} days`,
      summary: {
        totalSearches,
        uniqueSearches: uniqueSearches.length,
        zeroResults,
        averageResults:
          uniqueSearches.reduce((acc, curr) => acc + curr._count, 0) /
            uniqueSearches.length || 0,
      },
      dailyTrend: dailySearches,
      popularTerms,
    });
  } catch (error) {
    console.error("❌ Analytics error:", error);
    res.status(500).json({ error: error.message });
  }
};

// CLEAR SEARCH HISTORY

exports.clearHistory = async (req, res) => {
  try {
    await prisma.searchLog.deleteMany({
      where: {
        userId: req.user.id,
      },
    });

    res.json({
      message: "Search history cleared successfully",
    });
  } catch (error) {
    console.error("❌ Clear history error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET ZERO RESULT QUERIES

exports.getZeroResultQueries = async (req, res) => {
  try {
    const { resolved = false, limit = 50 } = req.query;

    const queries = await prisma.unansweredQuestion.findMany({
      where: {
        resolved: resolved === "true",
      },
      orderBy: {
        askedAt: "desc",
      },
      take: parseInt(limit),
    });

    res.json({
      queries,
      count: queries.length,
    });
  } catch (error) {
    console.error("❌ Zero result queries error:", error);
    res.status(500).json({ error: error.message });
  }
};
