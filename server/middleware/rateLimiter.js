/**
 * rateLimiter.js — Rate limiting middleware
 * ==========================================
 * Protects API endpoints from abuse with two tiers:
 * - General: 100 requests per 15 minutes
 * - Contact-specific: 5 messages per hour (stricter)
 */

const rateLimit = require("express-rate-limit");

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// Stricter limiter for WhatsApp contact endpoint
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Message limit reached. Please try again in an hour.",
  },
});

module.exports = { generalLimiter, contactLimiter };
