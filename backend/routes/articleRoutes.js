const router = require("express").Router();

const controller = require("../controllers/articleController");

const auth = require("../middleware/authMiddleware");

const role = require("../middleware/roleMiddleware");

// create
router.post("/", auth, role(["EDITOR", "ADMIN"]), controller.create);
// GET EDITOR DASHBOARD
router.get(
  "/editor/dashboard",
  auth,
  role(["EDITOR"]),
  controller.getEditorDashboard,
);
// get all articles
router.get("/", auth, controller.getAll);
// Get article by slug
router.get("/slug/:slug", auth, controller.getBySlug);
// get single article
router.get("/:id", auth, controller.getById);
// update
router.put("/:id", auth, role(["EDITOR", "ADMIN"]), controller.update);

// WORKFLOW
// Editor submits article
router.put("/:id/submit", auth, role(["EDITOR", "ADMIN"]), controller.submit);
// Admin starts review
router.put("/:id/review", auth, role(["ADMIN"]), controller.review);
// Admin approves
router.put("/:id/approve", auth, role(["ADMIN"]), controller.approve);
// Admin rejects
router.put("/:id/reject", auth, role(["ADMIN"]), controller.reject);
// Resubmit rejected article back to draft
router.put(
  "/:id/resubmit",
  auth,
  role(["EDITOR", "ADMIN"]),
  controller.resubmit,
);
// Admin publishes
router.put("/:id/publish", auth, role(["ADMIN"]), controller.publish);
// Admin archives
router.put("/:id/archive", auth, role(["ADMIN"]), controller.archive);
// Restore archived article
router.put("/:id/restore", auth, role(["ADMIN"]), controller.restore);

// REVIEW HISTORY
router.get("/:id/history", auth, controller.getReviewHistory);
// Add feedback to a published article
router.post(
  "/:id/feedback",
  auth,
  role(["VIEWER", "EDITOR", "ADMIN"]),
  controller.addFeedback,
);
// delete
router.delete("/:id", auth, role(["ADMIN"]), controller.delete);

module.exports = router;
