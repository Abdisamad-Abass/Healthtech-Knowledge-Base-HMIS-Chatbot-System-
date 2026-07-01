const { prisma } = require("../config/database");
const { createEmbedding } = require("../services/embeddingService");

// ===============================
// SEARCH ARTICLES
// ==============================
exports.search = async (req, res) => {
  try {
    const { q, category, type, product, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.json({
        results: [],
        count: 0,
      });
    }

    // ===============================
    // VECTOR SEARCH
    // ===============================

    try {
      const embedding = await createEmbedding(q);

      const vector = `[${embedding.join(",")}]`;

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


(ae."embedding" <-> ${vector}::vector)
AS distance


FROM "ArticleEmbedding" ae


JOIN "Article" a

ON a.id = ae."articleId"



WHERE a.status='PUBLISHED'


${type ? prisma.sql`AND a.type = ${type}` : prisma.sql``}



${product ? prisma.sql`AND a.product = ${product}` : prisma.sql``}



ORDER BY

ae."embedding" <-> ${vector}::vector


LIMIT ${Number(limit)}


`;

      // get relations

      const ids = vectorResults.map((item) => item.id);

      const articles = await prisma.article.findMany({
        where: {
          id: {
            in: ids,
          },
        },

        include: {
          category: true,

          tags: true,
        },
      });

      // keep vector order

      const ordered = vectorResults.map((item) => {
        const article = articles.find((a) => a.id === item.id);

        return {
          ...article,

          similarity: 1 - Number(item.distance),
        };
      });

      await prisma.searchLog.create({
        data: {
          query: q,

          resultCount: ordered.length,

          userId: req.user?.id || null,
        },
      });

      return res.json({
        results: ordered,

        count: ordered.length,

        searchType: "semantic",
      });
    } catch (vectorError) {
      console.log("Vector failed:", vectorError.message);
    }

    // ===============================
    // NORMAL TEXT SEARCH FALLBACK
    // ===============================

    const where = {
      status: "PUBLISHED",

      AND: [
        category
          ? {
              category: {
                name: {
                  contains: category,
                  mode: "insensitive",
                },
              },
            }
          : {},

        type
          ? {
              type,
            }
          : {},

        product
          ? {
              product,
            }
          : {},
      ],
    };

    const results = await prisma.article.findMany({
      where: {
        ...where,

        OR: [
          {
            title: {
              contains: q,
              mode: "insensitive",
            },
          },

          {
            content: {
              contains: q,
              mode: "insensitive",
            },
          },

          {
            tags: {
              some: {
                name: {
                  contains: q,

                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },

      include: {
        category: true,

        tags: true,
      },

      orderBy: {
        views: "desc",
      },

      skip: (Number(page) - 1) * Number(limit),

      take: Number(limit),
    });

    // log search

    await prisma.searchLog.create({
      data: {
        query: q,

        resultCount: results.length,

        userId: req.user?.id || null,
      },
    });

    res.json({
      results,

      count: results.length,

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
