const router = require("express").Router();

const { prisma } = require("../config/database");

router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load categories",
      error: error.message,
    });
  }
});

module.exports = router;
