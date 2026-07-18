/**
 * server.js — Express application entry point
 * ==============================================
 * Sets up middleware, static file serving, and API routes.
 * Serves the frontend from ../public as static files.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const { generalLimiter } = require("./middleware/rateLimiter");
const content = require("./config/content");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middleware ────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
           "'unsafe-eval'",  
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
          "https://open.spotify.com",       // ← add this
          "https://*.spotifycdn.com",      // ← covers embed-cdn.spotifycdn.com and similar
          "https://*.scdn.co",    
        ],
        frameSrc: [
        "'self'",
        "https://open.spotify.com",       // ← needed for the embedded iframe player itself
        "https://embed.spotify.com",
      ],
      connectSrc: [
        "'self'",
        "https://open.spotify.com",       // ← needed if the player makes XHR/fetch calls
        "https://api.spotify.com",
        "https://*.spotifycdn.com",
        "https://*.scdn.co",
      ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://*.scdn.co", "blob:", "https:"],
        connectSrc: ["'self'"],
      },
    },
  })
);
app.use(cors());

// ─── Body Parsing ───────────────────────────────────────
app.use(express.json({ limit: "10kb" }));

// ─── Rate Limiting ──────────────────────────────────────
app.use("/api", generalLimiter);

// ─── Static Files ───────────────────────────────────────
app.use(express.static(path.join(__dirname, "..", "public")));

// ─── API: Serve content config to frontend ──────────────
// (only non-sensitive data — no answers!)
app.get("/api/content", (req, res) => {
  res.json({
    romanticQuote: content.romanticQuote,
    libraryImages: content.libraryImages,
    faqCardImage: content.faqCardImage,
    faqQuestions: content.faqQuestions,
    playlistSongs: content.playlistSongs,
    statisticsBarData: content.statisticsBarData,
    statisticsPieData: content.statisticsPieData,
  });
});

// ─── API Routes ─────────────────────────────────────────
app.use("/api/faq", require("./routes/faq"));
app.use("/api/contact", require("./routes/contact"));

// ─── Fallback: serve index.html for SPA ─────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// ─── Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred.",
  });
});

// ─── Start Server ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n   Website Server`);
  console.log(`  ─────────────────────────`);
  console.log(`  🌐 Running at: http://localhost:${PORT}`);
  console.log(`  📁 Serving:    ../public\n`);
});
