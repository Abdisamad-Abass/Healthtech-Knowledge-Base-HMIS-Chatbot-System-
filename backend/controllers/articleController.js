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
// log review history
async function logReview(articleId, reviewerId, action, comments = null) {
  await prisma.reviewHistory.create({
    data: {
      articleId,
      reviewerId,
      action,
      comments,
    },
  });

  await prisma.auditLog.create({
    data: {
      action,
      entity: "Article",
      entityId: articleId,
      userId: reviewerId,
      details: {
        comments,
      },
    },
  });
}
// CREATE ARTICLE
exports.create = async (req, res) => {
  try {
    const { title, content, type, category, tags, product } = req.body;

    if (!title?.trim() || !content?.trim()) {
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

    // Generate embedding BEFORE transaction
    // If this fails nothing is written to DB.
    const embeddingText = `
      Title:
      ${title}

      Type:
      ${type || "FAQ"}

      Product:
      ${product || "General"}

      Category:
      ${category || "General"}

      Tags:
      ${(tags || []).join(", ")}

      Content:
      ${content}
      `;

    const embedding = await createEmbedding(embeddingText);

    const vector = `[${embedding.join(",")}]`;

    const article = await prisma.$transaction(async (tx) => {
      // Create article
      const createdArticle = await tx.article.create({
        data: {
          title,
          slug,
          content,
          type: type || "FAQ",
          product,
          authorId: req.user.id,
          categoryId,

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

      // Save first version
      await tx.articleVersion.create({
        data: {
          articleId: createdArticle.id,
          title,
          content,
          version: 1,
        },
      });

      // Save vector
      await tx.$executeRaw`
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
          ${createdArticle.id},
          ${content},
          ${vector}::vector
        )
      `;

      // Audit
      await tx.auditLog.create({
        data: {
          action: "CREATE",
          entity: "Article",
          entityId: createdArticle.id,
          userId: req.user.id,
          details: {
            title,
            type,
          },
        },
      });

      return createdArticle;
    });

    return res.status(201).json({
      message: "Article created successfully.",
      article,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Create failed",
      error: error.message,
    });
  }
};
// GET ALL
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, categoryId } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
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

      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
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
    // Role-based visibility
    if (req.user.role === "VIEWER" && article.status !== "PUBLISHED") {
      return res.status(403).json({
        message: "You are not allowed to view this article.",
      });
    }

    // Editors can only view their own unpublished articles
    if (
      req.user.role === "EDITOR" &&
      article.status !== "PUBLISHED" &&
      article.authorId !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not allowed to view this article.",
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
    // Get existing article
    const old = await prisma.article.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });

    if (!old) {
      return res.status(404).json({
        message: "Article not found.",
      });
    }

    // Only author or admin may edit
    if (req.user.role !== "ADMIN" && old.authorId !== req.user.id) {
      return res.status(403).json({
        message: "You can only edit your own article.",
      });
    }

    // Cannot edit published, archived, or deleted articles
    if (
      old.status === "PUBLISHED" ||
      old.status === "ARCHIVED" ||
      old.status === "DELETED"
    ) {
      return res.status(400).json({
        message: `Cannot edit article in "${old.status}" status.`,
      });
    }
    // If article is in review, only admin can edit
    if (old.status === "IN_REVIEW" && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can edit articles during review.",
      });
    }

    // Allow ONLY these fields
    const { title, content, type, product, categoryId } = req.body;

    // Determine/Get category name
    let categoryName = "General";

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
        select: {
          name: true,
        },
      });

      if (category) {
        categoryName = category.name;
      }
    } else if (old.categoryId) {
      const category = await prisma.category.findUnique({
        where: {
          id: old.categoryId,
        },
        select: {
          name: true,
        },
      });

      if (category) {
        categoryName = category.name;
      }
    }

    // Existing tags
    const tagNames = old.tags.map((tag) => tag.name);

    // Generate embedding BEFORE transaction
    const embeddingText = `
      Title:
      ${title || old.title}

      Type:
      ${type || old.type}

      Product:
      ${product || old.product || "General"}

      Category:
      ${categoryName}

      Tags:
      ${tagNames.join(", ")}

      Content:
      ${content || old.content}
      `;

    const embedding = await createEmbedding(embeddingText);

    const vector = `[${embedding.join(",")}]`;

    // Update article and save version in a transaction
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
      // update only allowed fields
      const article = await tx.article.update({
        where: { id },
        data: {
          title,
          content,
          type,
          product,
          categoryId,
        },
      });
      // Update vector
      await tx.$executeRaw`
          UPDATE "ArticleEmbedding"
          SET
            "content"=${content || old.content},
            "embedding"=${vector}::vector
          WHERE "articleId"=${id}
          `;

      // Audit log
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

    return res.json({
      message: "Article updated successfully.",
      article: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Update failed.",
      error: error.message,
    });
  }
};
// SUBMIT ARTICLE
exports.submit = async (req, res) => {
  try {
    // Check if the article exists
    const existing = await prisma.article.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Article not found.",
      });
    }

    // Only draft articles can be submitted
    if (existing.status !== "DRAFT") {
      return res.status(400).json({
        message: "Only draft articles can be submitted.",
      });
    }
    // Check if the logged-in user is the author of the article
    if (existing.authorId !== req.user.id) {
      return res.status(403).json({
        message: "You can only submit your own articles.",
      });
    }

    const article = await prisma.article.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    await logReview(article.id, req.user.id, "SUBMITTED");

    res.json({
      message: "Article submitted for review.",
      article,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// REVIEW ARTICLE
exports.review = async (req, res) => {
  try {
    const { comments } = req.body;

    // Check if the article exists
    const existing = await prisma.article.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Article not found.",
      });
    }

    // Only submitted articles can be reviewed
    if (existing.status !== "SUBMITTED") {
      return res.status(400).json({
        message: "Only submitted articles can be reviewed.",
      });
    }
    // only admins can review
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can review articles.",
      });
    }
    // Check if the logged-in user is the author of the article
    if (existing.authorId === req.user.id) {
      return res.status(400).json({
        message: "Authors cannot review their own articles.",
      });
    }
    // another admin already claimed it
    if (existing.reviewerId && existing.reviewerId !== req.user.id) {
      return res.status(409).json({
        message: "This article is already being reviewed by another admin.",
      });
    }
    // review has already started
    if (existing.reviewStartedAt) {
      return res.status(409).json({
        message: "Review has already started.",
      });
    }

    const article = await prisma.article.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: "IN_REVIEW",
        reviewerId: req.user.id,
        reviewComments: comments,
        reviewStartedAt: new Date(),
      },
    });

    await logReview(article.id, req.user.id, "IN_REVIEW", comments);

    res.json({
      message: "Review started.",
      article,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// APPROVE ARTICLE
exports.approve = async (req, res) => {
  try {
    // Check if the article exists
    const existing = await prisma.article.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Article not found.",
      });
    }
    // Only admins can approve
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can approve articles.",
      });
    }
    // Only articles in review can be approved
    if (existing.status !== "IN_REVIEW") {
      return res.status(400).json({
        message: "Only articles in review can be approved.",
      });
    }
    // author cannot approve their own article
    if (existing.authorId === req.user.id) {
      return res.status(400).json({
        message: "Authors cannot approve their own articles.",
      });
    }
    // the assigned reviewer must approve
    if (existing.reviewerId !== req.user.id) {
      return res.status(403).json({
        message: "Only the assigned reviewer can approve.",
      });
    }

    const article = await prisma.article.update({
      where: {
        id: req.params.id,
      },

      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });

    await logReview(article.id, req.user.id, "APPROVED");

    res.json({
      message: "Article approved.",
      article,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// REJECT ARTICLE
exports.reject = async (req, res) => {
  try {
    const { comments } = req.body;

    if (!comments || comments.trim() === "") {
      return res.status(400).json({
        message: "Rejection comments are required.",
      });
    }
    // Check if the article exists
    const existing = await prisma.article.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Article not found.",
      });
    }
    // Only admins can reject
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can reject articles.",
      });
    }
    // Only articles in review can be rejected
    if (existing.status !== "IN_REVIEW") {
      return res.status(400).json({
        message: "Only articles in review can be rejected.",
      });
    }
    // Check if the logged-in user is the assigned reviewer
    if (existing.reviewerId !== req.user.id) {
      return res.status(403).json({
        message: "Only assigned reviewer can reject.",
      });
    }
    // author cannot reject their own article
    if (existing.authorId === req.user.id) {
      return res.status(400).json({
        message: "Authors cannot reject their own articles.",
      });
    }

    const article = await prisma.article.update({
      where: {
        id: req.params.id,
      },

      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        reviewerId: req.user.id,
        reviewComments: comments,
      },
    });

    await logReview(article.id, req.user.id, "REJECTED", comments);

    res.json({
      message: "Article rejected.",
      article,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// PUBLISH ARTICLE
exports.publish = async (req, res) => {
  try {
    const existing = await prisma.article.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Article not found.",
      });
    }
    // Only admins can publish
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can publish articles.",
      });
    }
    // Only approved articles can be published
    if (existing.status !== "APPROVED") {
      return res.status(400).json({
        message: "Only approved articles can be published.",
      });
    }
    // Only the admin who approved it can publish
    if (existing.reviewerId !== req.user.id) {
      return res.status(403).json({
        message: "Only the admin who approved this article can publish it.",
      });
    }
    const article = await prisma.article.update({
      where: {
        id: req.params.id,
      },

      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    await logReview(article.id, req.user.id, "PUBLISHED");

    res.json({
      message: "Article published.",
      article,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// ARCHIVE ARTICLE
exports.archive = async (req, res) => {
  try {
    // Check if the article exists
    const existing = await prisma.article.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Article not found.",
      });
    }

    // Only published articles can be archived
    if (existing.status !== "PUBLISHED") {
      return res.status(400).json({
        message: "Only published articles can be archived.",
      });
    }
    // Only the reviewer who approved it or admin can archive
    if (req.user.role !== "ADMIN" && existing.reviewerId !== req.user.id) {
      return res.status(403).json({
        message:
          "Only the reviewer who approved this article or an admin can archive it.",
      });
    }

    const article = await prisma.article.update({
      where: {
        id: req.params.id,
      },

      data: {
        lastStatus: existing.status,
        status: "ARCHIVED",
        archivedAt: new Date(),
      },
    });

    await logReview(article.id, req.user.id, "ARCHIVED");

    res.json({
      message: "Article archived.",
      article,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// RESTORE ARTICLE
exports.restore = async (req, res) => {
  try {
    const existing = await prisma.article.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Article not found.",
      });
    }
    // Only archived articles can be restored
    if (existing.status !== "ARCHIVED") {
      return res.status(400).json({
        message: "Only archived articles can be restored.",
      });
    }

    // Check if the lastStatus is valid for restoration
    if (
      existing.lastStatus !== "PUBLISHED" &&
      existing.lastStatus !== "APPROVED"
    ) {
      return res.status(400).json({
        message: "Invalid restore state.",
      });
    }
    // Only the reviewer who archived it or admin can restore
    if (req.user.role !== "ADMIN" && existing.reviewerId !== req.user.id) {
      return res.status(403).json({
        message:
          "Only the reviewer who archived this article or an admin can restore it.",
      });
    }

    const article = await prisma.article.update({
      where: {
        id: req.params.id,
      },

      data: {
        status: existing.lastStatus || "PUBLISHED",
        lastStatus: null,
        archivedAt: null,
      },
    });

    await logReview(article.id, req.user.id, "RESTORED");

    res.json({
      message: "Article restored.",
      article,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// LOG REVIEW HISTORY
exports.getReviewHistory = async (req, res) => {
  try {
    const history = await prisma.reviewHistory.findMany({
      where: {
        articleId: req.params.id,
      },

      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// DELETE
exports.delete = async (req, res) => {
  try {
    const existing = await prisma.article.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Article not found.",
      });
    }

    // Only admins can delete
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can delete articles.",
      });
    }

    // Cannot delete if already deleted
    if (existing.status === "DELETED") {
      return res.status(400).json({
        message: "Article is already deleted.",
      });
    }

    // Published articles must be archived before deletion
    if (existing.status === "PUBLISHED") {
      return res.status(400).json({
        message:
          "Published articles must be archived before they can be deleted.",
      });
    }

    await prisma.$transaction(async (tx) => {
      // Soft delete by setting status
      await tx.article.update({
        where: {
          id: req.params.id,
        },
        data: {
          status: "DELETED",
          deletedAt: new Date(),
        },
      });

      await tx.$executeRaw`
        DELETE FROM "ArticleEmbedding"
        WHERE "articleId"=${req.params.id}
      `;

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
      message: "Article soft-deleted successfully",
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

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5.",
      });
    }

    const article = await prisma.article.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!article) {
      return res.status(404).json({
        message: "Article not found.",
      });
    }

    // Only allow feedback on published articles
    if (article.status !== "PUBLISHED") {
      return res.status(400).json({
        message: "Feedback can only be added to published articles.",
      });
    }

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
      message: "Feedback saved",
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
