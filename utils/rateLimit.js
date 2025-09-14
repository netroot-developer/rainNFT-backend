// utils/rateLimit.js
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit"); // 👈 Import helper

// Use recommended ipKeyGenerator instead of req.ip directly
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req), // 👈 FIX
  message: {
    status: 429,
    error: "Too many requests, please try again later.",
  },
});

module.exports = { limiter };
