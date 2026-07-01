const router = require("express").Router();

const { login } = require("../controllers/authController");
const limiter = require("../middleware/rateLimitMiddleware");

router.post("/login", limiter, login);

module.exports = router;
