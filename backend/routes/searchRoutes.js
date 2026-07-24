const router = require("express").Router();

const controller = require("../controllers/searchController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, controller.search);
router.get("/auto-complete", auth, controller.autocomplete);
router.get("/recent", auth, controller.recentSearches);

router.get("/trending", auth, controller.trending);

router.get("/analytics", auth, controller.getAnalytics);

router.get("/zero-results", auth, controller.getZeroResultQueries);
// DELETE CURRENT AUTHENTICATED USER'S SEARCH HISTORY
router.delete("/recent", auth, controller.clearHistory);
module.exports = router;
