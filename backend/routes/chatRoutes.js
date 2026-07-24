const router = require("express").Router();

const controller = require("../controllers/chatController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, controller.chat);
// GET ALL CHAT SESSIONS FOR LOGGED-IN USER
router.get("/sessions", auth, controller.getSessions);

// GET ARCHIVED CHAT SESSIONS
router.get("/sessions/archived", auth, controller.getArchivedSessions);
// Chat history
router.get("/history/:sessionId", auth, controller.getHistory);

// ARCHIVE CHAT
router.patch("/sessions/:sessionId/archive", auth, controller.archiveSession);

// UNARCHIVE CHAT SESSION
router.patch(
  "/sessions/:sessionId/unarchive",
  auth,
  controller.unarchiveSession,
);

// DELETE CHAT
router.delete("/sessions/:sessionId", auth, controller.deleteSession);

// Feedback
router.patch("/:messageId/feedback", auth, controller.addFeedback);

module.exports = router;
