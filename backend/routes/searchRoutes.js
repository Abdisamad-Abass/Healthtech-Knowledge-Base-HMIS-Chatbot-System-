const router = require("express").Router();

const controller = require("../controllers/searchController");

router.get("/", controller.search);

module.exports = router;
