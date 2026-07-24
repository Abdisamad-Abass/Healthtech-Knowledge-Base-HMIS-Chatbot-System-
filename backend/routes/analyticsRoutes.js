const router = require("express").Router();

const controller = require("../controllers/analyticsController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// All analytics endpoints require authentication
router.use(auth);

// Only ADMIN can access analytics
router.use(role(["ADMIN"]));

router.get("/", controller.getAll);

router.get("/summary", controller.getSummary);

router.get("/top-viewed", controller.getTopViewed);

router.get("/most-searched", controller.getMostSearched);

router.get("/low-rated", controller.getLowRated);

router.get("/popular-categories", controller.getPopularCategories);

router.get("/popular-modules", controller.getPopularModules);

router.get("/assistant-usage", controller.getAssistantUsage);

router.get("/feedback-trends", controller.getFeedbackTrends);

router.get("/article-feedback", controller.getArticleFeedback);
router.get("/chat-feedback", controller.getChatFeedback);

router.get("/unanswered", controller.getUnanswered);

router.get("/search-trends", controller.getSearchTrends);
router.get("/recent-activities", controller.getRecentActivities);

router.get("/:id", controller.getOne);

module.exports = router;
