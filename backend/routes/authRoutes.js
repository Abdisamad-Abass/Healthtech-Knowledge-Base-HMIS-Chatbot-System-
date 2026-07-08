const router = require("express").Router();

const {
  login,
  register,
  me,
  logout,
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const limiter = require("../middleware/rateLimitMiddleware");

router.post("/register", register);

router.post("/login", limiter, login);

router.get("/me", auth, me);

router.post("/logout", auth, logout);

module.exports = router;
