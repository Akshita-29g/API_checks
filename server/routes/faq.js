/**
 * faq.js — FAQ answer validation route
 * ======================================
 * POST /api/faq/validate
 * Validates user answers against configured correct answers.
 * Comparison is case-insensitive and whitespace-trimmed.
 */

// const express = require("express");
// const router = express.Router();
// const content = require("../config/content");

// /**
//  * POST /api/faq/validate
//  * Body: { questionId: number, answer: string }
//  * Response: { correct: boolean, message: string }
//  */
// router.post("/validate", (req, res) => {
//   try {
//     const { questionId, answer } = req.body;

//     // Input validation
//     if (!questionId || questionId < 1 || questionId > 4) {
//       return res.status(400).json({
//         correct: false,
//         message: "Invalid question ID.",
//       });
//     }

//     if (!answer || typeof answer !== "string") {
//       return res.status(400).json({
//         correct: false,
//         message: "Please provide an answer.",
//       });
//     }

//     // Get the correct answer from config
//     const correctAnswer = content.faqAnswers[questionId];

//     if (!correctAnswer) {
//       return res.status(500).json({
//         correct: false,
//         message: "Answer not configured for this question.",
//       });
//     }

//     // Compare: case-insensitive, trimmed
//     const userAnswer = answer.trim().toLowerCase();
//     const expected = correctAnswer.trim().toLowerCase();

//     if (userAnswer === expected) {
//       return res.json({
//         correct: true,
//         message: "Correct! 💕",
//       });
//     } else {
//       return res.json({
//         correct: false,
//         message: "Try Again 💕",
//       });
//     }
//   } catch (error) {
//     console.error("FAQ validation error:", error);
//     return res.status(500).json({
//       correct: false,
//       message: "Something went wrong. Please try again.",
//     });
//   }
// });

// /**
//  * GET /api/faq/questions
//  * Returns the list of questions (without answers).
//  */
// router.get("/questions", (req, res) => {
//   res.json({
//     success: true,
//     questions: content.faqQuestions,
//   });
// });

// module.exports = router;


/**
 * faq.js — FAQ answer validation route
 * ======================================
 * POST /api/faq/validate
 * Validates user answers against configured correct answers.
 * Comparison is case-insensitive and whitespace-trimmed.
 */

const express = require("express");
const router = express.Router();
const content = require("../config/content");

// Personalized success messages per question ID.
// Falls back to a generic message if a question ID isn't listed here.
const successMessages = {
  1: "Everyone knows that😏 ",
  2: "Woah 💕",
  3: "I never compelled your love,\n it was real and so was mine❤️",
  4: "That was impossible to guess, Glad you did !😁",
};

const DEFAULT_SUCCESS_MESSAGE = "Correct! 💕";

/**
 * POST /api/faq/validate
 * Body: { questionId: number, answer: string }
 * Response: { correct: boolean, message: string }
 */
router.post("/validate", (req, res) => {
  try {
    const { questionId, answer } = req.body;

    // Input validation
    if (!questionId || questionId < 1 || questionId > 4) {
      return res.status(400).json({
        correct: false,
        message: "Invalid question ID.",
      });
    }

    if (!answer || typeof answer !== "string") {
      return res.status(400).json({
        correct: false,
        message: "Please provide an answer.",
      });
    }

    // Get the correct answer from config
    const correctAnswer = content.faqAnswers[questionId];

    if (!correctAnswer) {
      return res.status(500).json({
        correct: false,
        message: "Answer not configured for this question.",
      });
    }

    // Compare: case-insensitive, trimmed
    const userAnswer = answer.trim().toLowerCase();
    const expected = correctAnswer.trim().toLowerCase();

    if (userAnswer === expected) {
      return res.json({
        correct: true,
        message: successMessages[questionId] || DEFAULT_SUCCESS_MESSAGE,
      });
    } else {
      return res.json({
        correct: false,
        message: "Try Again 💕",
      });
    }
  } catch (error) {
    console.error("FAQ validation error:", error);
    return res.status(500).json({
      correct: false,
      message: "Something went wrong. Please try again.",
    });
  }
});

/**
 * GET /api/faq/questions
 * Returns the list of questions (without answers).
 */
router.get("/questions", (req, res) => {
  res.json({
    success: true,
    questions: content.faqQuestions,
  });
});

module.exports = router;