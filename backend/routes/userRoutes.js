const router = require("express").Router();

const controller = require("../controllers/userController");

const auth = require("../middleware/authMiddleware");

const role = require("../middleware/roleMiddleware");

// ===============================
// USERS
// ===============================

// Get all users
router.get("/", auth, role(["ADMIN"]), controller.getAllUsers);

// Get single user
router.get("/:id", auth, role(["ADMIN"]), controller.getUserById);

// Create user
router.post("/", auth, role(["ADMIN"]), controller.createUser);

// Update user
router.put("/:id", auth, role(["ADMIN"]), controller.updateUser);

// Assign role
router.put("/:id/role", auth, role(["ADMIN"]), controller.assignRole);

// Deactivate
router.put("/:id/deactivate", auth, role(["ADMIN"]), controller.deactivateUser);

// Activate
router.put("/:id/activate", auth, role(["ADMIN"]), controller.activateUser);

// Delete
router.delete("/:id", auth, role(["ADMIN"]), controller.deleteUser);

// Audit Logs
router.get("/audit/logs", auth, role(["ADMIN"]), controller.getAuditLogs);

module.exports = router;
