const { prisma } = require("../config/database");
const { createEmbedding } = require("../services/embeddingService");
const slugify = require("slugify");

// generate slug

async function generateSlug(title) {
  let slug = slugify(title, {
    lower: true,
    strict: true,
  });

  let finalSlug = slug;

  let count = 1;

  while (
    await prisma.article.findUnique({
      where: {
        slug: finalSlug,
      },
    })
  ) {
    finalSlug = `${slug}-${count}`;
    count++;
  }

  return finalSlug;
}

// CREATE ARTICLE
exports.create = async (req, res) => {
  try {
    const { title, content, type, category, tags, product } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content required",
      });
    }

    let categoryId = null;

    if (category) {
      const categoryRecord = await prisma.category.findUnique({
        where: {
          name: category,
        },
      });

      if (!categoryRecord) {
        return res.status(400).json({
          message: "Category does not exist",
        });
      }

      categoryId = categoryRecord.id;
    }

    const slug = await generateSlug(title);

    // create article first

    const article = await prisma.article.create({
      data: {
        title,

        slug,

        content,

        type: type || "FAQ",

        product,

        authorId: req.user.id,

        categoryId: categoryId || null,

        tags: {
          connectOrCreate: (tags || []).map((tag) => ({
            where: {
              name: tag,
            },

            create: {
              name: tag,

              slug: slugify(tag, {
                lower: true,
                strict: true,
              }),
            },
          })),
        },
      },

      include: {
        category: true,

        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        tags: true,
      },
    });

    // create version separately

    await prisma.articleVersion.create({
      data: {
        articleId: article.id,

        title,

        content,

        version: 1,
      },
    });

    // create embedding separately

    const embedding = await createEmbedding(content);

    const vector = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`

INSERT INTO "ArticleEmbedding"

(
"id",
"articleId",
"content",
"embedding"
)

VALUES

(
gen_random_uuid(),
${article.id},
${content},
${vector}::vector
)

`;

    // audit

    await prisma.auditLog.create({
      data: {
        action: "CREATE",

        entity: "Article",

        entityId: article.id,

        userId: req.user.id,

        details: {
          title,
          type,
        },
      },
    });

    res.status(201).json({
      message: "Article created",

      article,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Create failed",

      error: error.message,
    });
  }
};

// GET ALL

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, categoryId } = req.query;

    const where = {};

    if (status) where.status = status;

    if (type) where.type = type;

    if (categoryId) where.categoryId = categoryId;

    // role based visibility

    if (req.user.role === "VIEWER") {
      where.status = "PUBLISHED";
    }

    const articles = await prisma.article.findMany({
      where,

      include: {
        category: true,

        tags: true,

        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        _count: {
          select: {
            feedback: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      skip: (page - 1) * limit,

      take: Number(limit),
    });

    res.json({
      role: req.user.role,

      articles,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed loading",
      error: error.message,
    });
  }
};

// GET SINGLE ARTICLE

exports.getById = async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: {
        id: req.params.id,
      },

      include: {
        category: true,

        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        tags: true,

        versions: true,

        feedback: true,

        embedding: true,
      },
    });

    if (!article) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    await prisma.article.update({
      where: {
        id: article.id,
      },

      data: {
        views: {
          increment: 1,
        },
      },
    });

    // related articles

    const relatedArticles = await prisma.article.findMany({
      where: {
        categoryId: article.categoryId,

        NOT: {
          id: article.id,
        },
      },

      select: {
        id: true,

        title: true,

        createdAt: true,

        views: true,
      },

      take: 5,

      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      ...article,

      relatedArticles,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error",

      error: error.message,
    });
  }
};

// UPDATE ARTICLE

exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    const old = await prisma.article.findUnique({
      where: { id },
    });

    if (!old) {
      return res.status(404).json({
        message: "Article missing",
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // save old version

      const count = await tx.articleVersion.count({
        where: {
          articleId: id,
        },
      });

      await tx.articleVersion.create({
        data: {
          articleId: id,

          title: old.title,

          content: old.content,

          version: count + 1,
        },
      });

      // update

      const article = await tx.article.update({
        where: { id },

        data: req.body,
      });

      if (req.body.content) {
        const embedding = await createEmbedding(req.body.content);

        const vector = `[${embedding.join(",")}]`;

        await tx.$executeRaw`

UPDATE "ArticleEmbedding"

SET

"content"=${req.body.content},

"embedding"=${vector}::vector

WHERE "articleId"=${id}

`;
      }

      await tx.auditLog.create({
        data: {
          action: "UPDATE",

          entity: "Article",

          entityId: id,

          userId: req.user.id,
        },
      });

      return article;
    });

    res.json({
      message: "Updated",

      article: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Update failed",

      error: error.message,
    });
  }
};

// PUBLISH

exports.publish = async (req, res) => {
  try {
    const article = await prisma.article.update({
      where: {
        id: req.params.id,
      },

      data: {
        status: "PUBLISHED",

        publishedAt: new Date(),
      },
    });

    res.json(article);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// ARCHIVE

exports.archive = async (req, res) => {
  const article = await prisma.article.update({
    where: {
      id: req.params.id,
    },

    data: {
      status: "ARCHIVED",
    },
  });

  res.json(article);
};

// DELETE

exports.delete = async (req, res) => {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`

DELETE FROM "ArticleEmbedding"

WHERE "articleId"=${req.params.id}

`;

      await tx.article.delete({
        where: {
          id: req.params.id,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "DELETE",

          entity: "Article",

          entityId: req.params.id,

          userId: req.user.id,
        },
      });
    });

    res.json({
      message: "deleted",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// FEEDBACK

exports.addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const feedback = await prisma.feedback.upsert({
      where: {
        articleId_userId: {
          articleId: req.params.id,

          userId: req.user.id,
        },
      },

      update: {
        rating,

        comment,
      },

      create: {
        rating,

        comment,

        articleId: req.params.id,

        userId: req.user.id,
      },
    });

    const stats = await prisma.feedback.aggregate({
      where: {
        articleId: req.params.id,
      },

      _avg: {
        rating: true,
      },

      _count: {
        rating: true,
      },
    });

    await prisma.article.update({
      where: {
        id: req.params.id,
      },

      data: {
        avgRating: stats._avg.rating || 0,

        reviewCount: stats._count.rating || 0,
      },
    });

    res.json({
      message: "feedback saved",

      feedback,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
