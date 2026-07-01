const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes

  max: 5, // allow only 5 requests

  message: {
    message: "Too many requests. Try again later.",
  },

  standardHeaders: true,

  legacyHeaders: false,
});

module.exports = limiter;
