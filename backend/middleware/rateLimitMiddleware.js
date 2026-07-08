const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW || 10) * 60 * 1000,

  max: Number(process.env.LOGIN_RATE_LIMIT_MAX || 5),

  standardHeaders: true,

  legacyHeaders: false,

  skipSuccessfulRequests: true,

  message: {
    message: "Too many failed login attempts. Try again later.",
  },
});

module.exports = limiter;
