const router = require("express").Router();

const controller = require("../controllers/chatController");

router.post("/", controller.chat);
// Chat history
router.get("/history/:sessionId", controller.getHistory);

// Feedback
router.patch("/:messageId/feedback", controller.addFeedback);

module.exports = router;
