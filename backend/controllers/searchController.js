const { Prisma } = require("@prisma/client");
const { prisma } = require("../config/database");
const { createEmbedding } = require("../services/embeddingService");
// Search Articles

// ============================================================
// SEARCH ARTICLES - HYBRID SEARCH
// Keyword Search + Semantic Search + Relevance Ranking
// ============================================================

exports.search = async (req, res) => {
  try {
    // ========================================================
    // 1. EXTRACT AND VALIDATE QUERY PARAMETERS
    // ========================================================
    const { q, category, type, product, page = 1, limit = 20 } = req.query;

    const pageNumber = Number.isFinite(Number(page))
      ? Math.max(1, Number(page))
      : 1;

    const limitNumber = Number.isFinite(Number(limit))
      ? Math.min(100, Math.max(1, Number(limit)))
      : 20;

    if (!q || q.trim().length < 3) {
      return res.json({
        results: [],
        count: 0,
        total: 0,
        currentPage: pageNumber,
        totalPages: 0,
        searchType: "hybrid",
      });
    }

    const searchText = q.trim();

    // ========================================================
    // 2. ROLE-BASED VISIBILITY
    // ========================================================

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
            status: "SUBMITTED",
          },
          {
            status: "IN_REVIEW",
          },
          {
            authorId: req.user.id,
            status: {
              in: ["DRAFT", "REJECTED"],
            },
          },
        ],
      };

      sqlVisibility = Prisma.sql`
    (
      a.status = 'PUBLISHED'
      OR a.status = 'SUBMITTED'
      OR a.status = 'IN_REVIEW'
      OR (
        a."authorId" = ${req.user.id}
        AND a.status IN ('DRAFT', 'REJECTED')
      )
    )
  `;
    } else {
      // ADMIN
      prismaWhere = {};
      sqlVisibility = Prisma.sql`TRUE`;
    }

    // ========================================================
    // 3. BUILD FILTERS
    // ========================================================

    const filters = {
      category: category || null,
      type: type || null,
      product: product || null,
    };

    const sqlFilters = Prisma.sql`
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

  ${
    type
      ? Prisma.sql`
        AND a.type = ${type}
      `
      : Prisma.sql``
  }

  ${
    product
      ? Prisma.sql`
        AND a.product ILIKE ${`%${product}%`}
      `
      : Prisma.sql``
  }
`;

    // ========================================================
    // 4. GET SEMANTIC SEARCH CANDIDATES
    // ========================================================

    let semanticCandidates = [];

    try {
      console.log(`🔍 Performing semantic search for: "${searchText}"`);

      const embedding = await createEmbedding(searchText);

      if (!embedding || embedding.length === 0) {
        throw new Error("Failed to generate embedding");
      }

      const vector = `[${embedding.join(",")}]`;

      // Cosine distance.
      // Smaller distance = more similar.
      const SIMILARITY_THRESHOLD = 0.6;

      semanticCandidates = await prisma.$queryRaw`
    SELECT
      a.id,
      a.views,
      a."avgRating",
      a."createdAt",

      (
        1 - (ae."embedding" <=> ${vector}::vector)
      ) AS semantic_score

    FROM "ArticleEmbedding" ae

    JOIN "Article" a
      ON a.id = ae."articleId"

    WHERE ${sqlVisibility}

    AND (
      ae."embedding" <=> ${vector}::vector
    ) <= ${SIMILARITY_THRESHOLD}

    ${sqlFilters}

    ORDER BY
      ae."embedding" <=> ${vector}::vector ASC

    LIMIT 100
  `;

      console.log(`✅ Semantic candidates found: ${semanticCandidates.length}`);
    } catch (semanticError) {
      console.error("⚠️ Semantic search failed:", semanticError.message);

      // Important:
      // Do not return an error.
      // Keyword search can still work.
      semanticCandidates = [];
    }

    // ========================================================
    // 5. GET KEYWORD SEARCH CANDIDATES
    // ========================================================

    const keywordCandidates = await prisma.$queryRaw`
  SELECT
    a.id,
    a.views,
    a."avgRating",
    a."createdAt",

    -- TITLE SCORE
    CASE
      WHEN LOWER(a.title) = LOWER(${searchText})
        THEN 1.0

      WHEN LOWER(a.title) LIKE LOWER(${searchText + "%"})
        THEN 0.90

     WHEN LOWER(a.title) LIKE LOWER(${`%${searchText}%`})
        THEN 0.70

      ELSE 0.0
    END AS title_score,

    -- TAG SCORE
    COALESCE(
      (
        SELECT MAX(
          CASE
            WHEN LOWER(t.name) = LOWER(${searchText})
              THEN 1.0

            WHEN LOWER(t.name) LIKE LOWER(${searchText + "%"})
              THEN 0.80

            WHEN LOWER(t.name) LIKE LOWER(${`%${searchText}%`})
              THEN 0.50

            ELSE 0.0
          END
        )

        FROM "_ArticleToTag" at

        JOIN "Tag" t
          ON t.id = at."B"

        WHERE at."A" = a.id
      ),
      0
    ) AS tag_score,

    -- CATEGORY SCORE
    CASE
      WHEN LOWER(c.name) = LOWER(${searchText})
        THEN 1.0

      WHEN LOWER(c.name) LIKE LOWER(${searchText + "%"})
        THEN 0.70

      WHEN LOWER(c.name) LIKE LOWER(${`%${searchText}%`})
        THEN 0.40

      ELSE 0.0
    END AS category_score,

    -- PRODUCT SCORE
    CASE
      WHEN LOWER(COALESCE(a.product, '')) = LOWER(${searchText})
        THEN 1.0

      WHEN LOWER(COALESCE(a.product, '')) LIKE LOWER(${`%${searchText}%`})
        THEN 0.60

      ELSE 0.0
    END AS product_score,

    -- CONTENT SCORE
    CASE
      WHEN LOWER(a.content) LIKE LOWER(${`%${searchText}%`})
        THEN 0.30

      ELSE 0.0
    END AS content_score

  FROM "Article" a

  LEFT JOIN "Category" c
    ON c.id = a."categoryId"

  WHERE ${sqlVisibility}

  ${sqlFilters}

  AND (
    a.title ILIKE ${`%${searchText}%`}

    OR a.content ILIKE ${`%${searchText}%`}

    OR c.name ILIKE ${`%${searchText}%`}

    OR a.product ILIKE ${`%${searchText}%`}

    OR EXISTS (
      SELECT 1

      FROM "_ArticleToTag" at

      JOIN "Tag" t
        ON t.id = at."B"

      WHERE at."A" = a.id

      AND t.name ILIKE ${`%${searchText}%`}
    )
  )

  LIMIT 100
`;

    console.log(`✅ Keyword candidates found: ${keywordCandidates.length}`);

    // ========================================================
    // 6. MERGE SEMANTIC + KEYWORD RESULTS
    // ========================================================

    const mergedResults = new Map();

    // Add keyword results
    keywordCandidates.forEach((item) => {
      mergedResults.set(item.id, {
        id: item.id,

        titleScore: Number(item.title_score) || 0,
        tagScore: Number(item.tag_score) || 0,
        categoryScore: Number(item.category_score) || 0,
        productScore: Number(item.product_score) || 0,
        contentScore: Number(item.content_score) || 0,

        semanticScore: 0,

        views: Number(item.views) || 0,
        avgRating: Number(item.avgRating) || 0,
        createdAt: item.createdAt,
      });
    });

    // Add semantic results
    semanticCandidates.forEach((item) => {
      const semanticScore = Number(item.semantic_score) || 0;

      if (mergedResults.has(item.id)) {
        mergedResults.get(item.id).semanticScore = semanticScore;
      } else {
        mergedResults.set(item.id, {
          id: item.id,

          titleScore: 0,
          tagScore: 0,
          categoryScore: 0,
          productScore: 0,
          contentScore: 0,

          semanticScore,

          views: Number(item.views) || 0,
          avgRating: Number(item.avgRating) || 0,
          createdAt: item.createdAt,
        });
      }
    });

    // ========================================================
    // 7. CALCULATE FINAL RELEVANCE SCORE
    // ========================================================

    const scoredResults = Array.from(mergedResults.values()).map((item) => {
      const viewsScore = Math.min(1, Math.log10(item.views + 1) / 5);

      const ratingScore = Math.min(1, item.avgRating / 5);

      const createdAt = new Date(item.createdAt);

      const daysOld = Math.max(
        0,
        (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      const freshnessScore = Math.max(0, 1 - Math.min(daysOld, 365) / 365);

      // ====================================================
      // FINAL WEIGHTED SCORE
      // ====================================================

      const finalScore =
        item.titleScore * 0.35 +
        item.tagScore * 0.2 +
        item.semanticScore * 0.2 +
        item.categoryScore * 0.1 +
        item.productScore * 0.05 +
        item.contentScore * 0.05 +
        viewsScore * 0.03 +
        ratingScore * 0.01 +
        freshnessScore * 0.01;

      return {
        ...item,

        viewsScore,
        ratingScore,
        freshnessScore,

        finalScore,
      };
    });

    // ========================================================
    // 8. SORT BY RELEVANCE
    // ========================================================

    scoredResults.sort((a, b) => {
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
      }

      // Tie-breaker 1: rating
      if (b.ratingScore !== a.ratingScore) {
        return b.ratingScore - a.ratingScore;
      }

      // Tie-breaker 2: views
      if (b.viewsScore !== a.viewsScore) {
        return b.viewsScore - a.viewsScore;
      }

      // Tie-breaker 3: newest article
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // ========================================================
    // 9. PAGINATE AFTER RANKING
    // ========================================================

    const total = scoredResults.length;

    const start = (pageNumber - 1) * limitNumber;

    const paginatedResults = scoredResults.slice(start, start + limitNumber);

    // ========================================================
    // 10. FETCH FULL ARTICLE DATA
    // ========================================================

    const ids = paginatedResults.map((item) => item.id);

    const articles = ids.length
      ? await prisma.article.findMany({
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
        })
      : [];

    // ========================================================
    // 11. PRESERVE RANKING ORDER
    // ========================================================

    const articleMap = new Map(
      articles.map((article) => [article.id, article]),
    );

    const results = paginatedResults
      .map((rankedItem) => {
        const article = articleMap.get(rankedItem.id);

        if (!article) {
          return null;
        }

        return {
          ...article,

          _score: Number(rankedItem.finalScore.toFixed(4)),

          _scores: {
            title: rankedItem.titleScore,
            tag: rankedItem.tagScore,
            semantic: rankedItem.semanticScore,
            category: rankedItem.categoryScore,
            product: rankedItem.productScore,
            content: rankedItem.contentScore,
            views: rankedItem.viewsScore,
            rating: rankedItem.ratingScore,
            freshness: rankedItem.freshnessScore,
          },
        };
      })
      .filter(Boolean);

    // ========================================================
    // 12. LOG SEARCH
    // ========================================================

    const normalizedSearchQuery = searchText
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[?!.,;:]+$/g, "");

    await prisma.searchLog.create({
      data: {
        query: normalizedSearchQuery,

        resultCount: results.length,

        userId: req.user?.id || null,
      },
    });

    // ========================================================
    // 13. HANDLE ZERO RESULTS
    // ========================================================

    if (results.length === 0) {
      await prisma.unansweredQuestion.create({
        data: {
          question: searchText,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "SEARCH_NO_RESULTS",

          entity: "KnowledgeBase",

          entityId: "SEARCH",

          userId: req.user.id,

          details: {
            query: searchText,

            searchType: "hybrid",

            filters,
          },
        },
      });
    }

    // ========================================================
    // 14. AUDIT LOG
    // ========================================================

    await prisma.auditLog.create({
      data: {
        action: "SEARCH_PERFORMED",

        entity: "KnowledgeBase",

        entityId: "SEARCH",

        userId: req.user.id,

        details: {
          query: searchText,

          searchType: "hybrid",

          filters,

          resultCount: results.length,

          totalResults: total,

          page: pageNumber,

          limit: limitNumber,
        },
      },
    });

    // ========================================================
    // 15. RETURN RESPONSE
    // ========================================================

    return res.json({
      results,

      count: results.length,

      total,

      currentPage: pageNumber,

      totalPages: Math.max(1, Math.ceil(total / limitNumber)),

      searchType: "hybrid",
    });
  } catch (error) {
    console.error("❌ Search failed:", error);

    return res.status(500).json({
      message: "Search failed",

      error: error.message,
    });
  }
};

// AUTOCOMPLETE - ENHANCED

exports.autocomplete = async (req, res) => {
  try {
    // ========================================================
    // 1. EXTRACT AND VALIDATE QUERY
    // ========================================================

    const { q = "", limit = 10 } = req.query;

    const searchText = q.trim();

    const limitNumber = Math.min(20, Math.max(1, Number(limit) || 10));

    if (searchText.length < 2) {
      return res.json([]);
    }

    // ========================================================
    // 2. SAME VISIBILITY RULES AS SEARCH
    // ========================================================

    let autocompleteVisibility;

    if (req.user.role === "VIEWER") {
      autocompleteVisibility = Prisma.sql`
    a.status = 'PUBLISHED'
  `;
    } else if (req.user.role === "EDITOR") {
      autocompleteVisibility = Prisma.sql`
    (
      a.status = 'PUBLISHED'

      OR a.status = 'SUBMITTED'

      OR a.status = 'IN_REVIEW'

      OR (
        a."authorId" = ${req.user.id}

        AND a.status IN (
          'DRAFT',
          'REJECTED'
        )
      )
    )
  `;
    } else {
      autocompleteVisibility = Prisma.sql`
    TRUE
  `;
    }

    const startsWith = `${searchText}%`;

    const contains = `%${searchText}%`;

    // ========================================================
    // 3. GET AUTOCOMPLETE SUGGESTIONS
    // ========================================================

    const suggestions = await prisma.$queryRaw`

  (
    -- ================================================
    -- TITLE: HIGHEST PRIORITY
    -- ================================================

    SELECT DISTINCT
      a.title AS value,

      'title' AS type,

      CASE
        WHEN LOWER(a.title) = LOWER(${searchText})
          THEN 120

        WHEN LOWER(a.title) LIKE LOWER(${startsWith})
          THEN 100

        ELSE 80
      END AS priority

    FROM "Article" a

    WHERE ${autocompleteVisibility}

    AND a.title ILIKE ${contains}

    ORDER BY priority DESC, value ASC

    LIMIT ${Math.max(3, Math.floor(limitNumber * 0.5))}
  )

  UNION

  (
    -- ================================================
    -- TAGS
    -- ================================================

    SELECT DISTINCT
      t.name AS value,

      'tag' AS type,

      CASE
        WHEN LOWER(t.name) LIKE LOWER(${startsWith})
          THEN 70

        ELSE 60
      END AS priority

    FROM "Tag" t

    JOIN "_ArticleToTag" at
      ON at."B" = t.id

    JOIN "Article" a
      ON a.id = at."A"

    WHERE ${autocompleteVisibility}

    AND t.name ILIKE ${contains}

    ORDER BY priority DESC, value ASC

    LIMIT ${Math.max(2, Math.floor(limitNumber * 0.3))}
  )

  UNION

  (
    -- ================================================
    -- CATEGORIES
    -- ================================================

    SELECT DISTINCT
      c.name AS value,

      'category' AS type,

      CASE
        WHEN LOWER(c.name) LIKE LOWER(${startsWith})
          THEN 50

        ELSE 40
      END AS priority

    FROM "Category" c

    JOIN "Article" a
      ON a."categoryId" = c.id

    WHERE ${autocompleteVisibility}

    AND c.name ILIKE ${contains}

    ORDER BY priority DESC, value ASC

    LIMIT ${Math.max(2, Math.floor(limitNumber * 0.2))}
  )

  ORDER BY priority DESC, value ASC

  LIMIT ${limitNumber}
`;

    // ========================================================
    // 4. FORMAT RESPONSE
    // ========================================================

    const formatted = suggestions.map((suggestion) => ({
      text: suggestion.value,

      type: suggestion.type,

      label:
        suggestion.type === "title"
          ? suggestion.value
          : `${suggestion.value} (${suggestion.type})`,
    }));

    // ========================================================
    // 5. AUDIT LOG
    // ========================================================

    await prisma.auditLog.create({
      data: {
        action: "SEARCH_AUTOCOMPLETE",

        entity: "KnowledgeBase",

        entityId: "AUTOCOMPLETE",

        userId: req.user.id,

        details: {
          query: searchText,

          suggestionsReturned: formatted.length,
        },
      },
    });

    return res.json(formatted);
  } catch (error) {
    console.error("❌ Autocomplete error:", error);

    return res.status(500).json({
      error: error.message,
    });
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
    const days = Math.min(30, Math.max(1, Number(req.query.days) || 7));

    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const now = new Date();

    // ========================================================
    // 1. CURRENT PERIOD
    // ========================================================

    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - days);

    // ========================================================
    // 2. PREVIOUS PERIOD
    // ========================================================

    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - days);

    // ========================================================
    // 3. FETCH SEARCH LOGS
    // ========================================================

    const logs = await prisma.searchLog.findMany({
      where: {
        createdAt: {
          gte: previousStart,
        },
      },

      select: {
        query: true,
        resultCount: true,
        createdAt: true,
      },
    });

    // ========================================================
    // 4. QUERY NORMALIZATION
    // ========================================================

    const normalizeQuery = (value) => {
      return value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[?!.,;:]+$/g, "");
    };

    // ========================================================
    // 5. QUERY QUALITY FILTER
    // ========================================================

    const isValidQuery = (query) => {
      if (!query) return false;

      // Minimum length
      if (query.length < 3) return false;

      // Maximum length
      if (query.length > 100) return false;

      // Must contain at least one letter
      if (!/[a-zA-Z]/.test(query)) return false;

      // Reject repeated single characters
      if (/^(.)\1{5,}$/.test(query)) return false;

      // Reject queries with excessive repeated characters
      const repeatedCharacterRatio =
        query.replace(/(.)\1{3,}/g, "").length / query.length;

      if (repeatedCharacterRatio < 0.5) return false;

      // Reject extremely long words
      const words = query.split(" ");

      if (words.some((word) => word.length > 40)) {
        return false;
      }

      return true;
    };

    // ========================================================
    // 6. AGGREGATE CURRENT AND PREVIOUS SEARCHES
    // ========================================================

    const current = new Map();
    const previous = new Map();

    for (const log of logs) {
      const query = normalizeQuery(log.query);

      if (!isValidQuery(query)) continue;

      const isCurrent = log.createdAt >= currentStart;

      const collection = isCurrent ? current : previous;

      if (!collection.has(query)) {
        collection.set(query, {
          count: 0,
          successfulSearches: 0,
          zeroResultSearches: 0,
          latestSearch: log.createdAt,
        });
      }

      const item = collection.get(query);

      item.count += 1;

      if (log.resultCount > 0) {
        item.successfulSearches += 1;
      } else {
        item.zeroResultSearches += 1;
      }

      if (
        new Date(log.createdAt).getTime() >
        new Date(item.latestSearch).getTime()
      ) {
        item.latestSearch = log.createdAt;
      }
    }

    // ========================================================
    // 7. CALCULATE TRENDING SCORE
    // ========================================================

    const trending = [];

    for (const [query, currentData] of current.entries()) {
      const previousData = previous.get(query);

      const currentCount = currentData.count;

      const previousCount = previousData?.count || 0;

      // ----------------------------------------------------
      // GROWTH
      // ----------------------------------------------------

      let growth = 0;

      if (previousCount === 0) {
        // New queries should receive a moderate boost,
        // not an automatic 100% or infinite growth score.
        growth = Math.min(100, currentCount * 20);
      } else {
        growth = ((currentCount - previousCount) / previousCount) * 100;

        growth = Math.max(-100, Math.min(200, growth));
      }

      // ----------------------------------------------------
      // VOLUME SCORE
      // Logarithmic scaling prevents huge volumes
      // from completely dominating the ranking.
      // ----------------------------------------------------

      const volumeScore = Math.min(100, Math.log10(currentCount + 1) * 40);

      // ----------------------------------------------------
      // GROWTH SCORE
      // ----------------------------------------------------

      const growthScore = Math.min(100, Math.max(0, growth));

      // ----------------------------------------------------
      // SUCCESS SCORE
      // Searches returning results are more valuable.
      // ----------------------------------------------------

      const successRate =
        currentCount > 0 ? currentData.successfulSearches / currentCount : 0;

      const successScore = successRate * 100;

      // ----------------------------------------------------
      // RECENCY SCORE
      // ----------------------------------------------------

      const hoursSinceSearch =
        (now.getTime() - new Date(currentData.latestSearch).getTime()) /
        (1000 * 60 * 60);

      const recencyScore = Math.max(0, 100 - hoursSinceSearch * 2);

      // ====================================================
      // FINAL TRENDING SCORE
      // ====================================================

      const trendingScore =
        volumeScore * 0.45 +
        growthScore * 0.25 +
        successScore * 0.2 +
        recencyScore * 0.1;

      trending.push({
        query,

        currentCount,

        previousCount,

        growth: Math.round(growth),

        trendingScore: Number(trendingScore.toFixed(2)),

        successRate: Number((successRate * 100).toFixed(1)),

        latestSearch: currentData.latestSearch,
      });
    }

    // ========================================================
    // 8. APPLY MINIMUM ACTIVITY REQUIREMENTS
    // ========================================================

    const filteredTrending = trending.filter((item) => {
      // Queries searched at least twice are valid.
      if (item.currentCount >= 2) return true;

      // A single search is only allowed if it has
      // a strong previous history and significant growth.
      if (
        item.currentCount === 1 &&
        item.previousCount >= 3 &&
        item.growth >= 50
      ) {
        return true;
      }

      return false;
    });

    // ========================================================
    // 9. SORT BY PROFESSIONAL TRENDING SCORE
    // ========================================================

    filteredTrending.sort((a, b) => {
      if (b.trendingScore !== a.trendingScore) {
        return b.trendingScore - a.trendingScore;
      }

      if (b.currentCount !== a.currentCount) {
        return b.currentCount - a.currentCount;
      }

      return b.growth - a.growth;
    });

    // ========================================================
    // 10. RETURN RESPONSE
    // ========================================================

    return res.json({
      trending: filteredTrending.slice(0, limit),

      period: `${days} days`,

      count: Math.min(filteredTrending.length, limit),
    });
  } catch (error) {
    console.error("❌ Trending search error:", error);

    return res.status(500).json({
      error: error.message,
    });
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
    // Count records BEFORE deleting them
    const totalDeleted = await prisma.searchLog.count({
      where: {
        userId: req.user.id,
      },
    });

    // Delete search history
    await prisma.searchLog.deleteMany({
      where: {
        userId: req.user.id,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "SEARCH_HISTORY_CLEARED",

        entity: "SearchLog",

        entityId: req.user.id,

        userId: req.user.id,

        details: {
          totalDeleted,
        },
      },
    });

    return res.json({
      message: "Search history cleared successfully",

      totalDeleted,
    });
  } catch (error) {
    console.error("❌ Clear history error:", error);

    return res.status(500).json({
      error: error.message,
    });
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
