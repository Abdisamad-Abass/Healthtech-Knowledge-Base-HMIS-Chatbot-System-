const router = require("express").Router();

const { prisma } = require("../config/database");

router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  res.json(categories);
});

module.exports = router;
