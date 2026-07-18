/**
 * contact.js — Contact message route
 * =====================================
 * POST /api/contact/send
 * Sends a user message to WhatsApp via the Cloud API.
 */

const express = require("express");
const router = express.Router();
const { sendMessage } = require("../utils/whatsapp");
const { contactLimiter } = require("../middleware/rateLimiter");

// Apply stricter rate limiting to the contact endpoint
router.use(contactLimiter);

/**
 * POST /api/contact/send
 * Body: { message: string }
 * Response: { success: boolean, message: string }
 */
router.post("/send", async (req, res) => {
  try {
    const { message } = req.body;

    // Input validation
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please write a message before sending.",
      });
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    if (trimmedMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message is too long. Please keep it under 1000 characters.",
      });
    }

    // Send via WhatsApp Cloud API
    const formattedMessage = `💌 New message from the romantic website:\n\n"${trimmedMessage}"`;
    await sendMessage(formattedMessage);

    return res.json({
      success: true,
      message: "Message sent with love 💕",
    });
  } catch (error) {
    console.error("Contact send error:", error.message);

    // Provide a user-friendly error message
    return res.status(500).json({
      success: false,
      message: "Could not send the message right now. Please try again later.",
    });
  }
});

module.exports = router;
