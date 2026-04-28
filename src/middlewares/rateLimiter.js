const rateLimit = require('express-rate-limit');

// 1. Standard Limiter (For general endpoints like getting profile)
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Strict Limiter (For Auth OTP and AI endpoints to prevent bankruptcy)
exports.strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour
  max: 5, // Limit each IP to 5 requests per hour!
  message: { success: false, message: 'Too many high-cost requests. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});