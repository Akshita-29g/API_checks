/**
 * content.js — Centralized configurable content
 * ================================================
 * Edit this file to customize all user-specific content
 * without modifying any application logic.
 */

module.exports = {
  // ─── Home Page ────────────────────────────────────────
  romanticQuote: "Here's Something for YOU",

  // ─── Library Page ─────────────────────────────────────
  // Replace these with actual image paths or URLs.
  // Images are served from /assets/ so use paths like "/assets/photo1.jpg"
  // or full URLs like "https://example.com/photo.jpg"
  libraryImages: [
    "/assets/photo1.jpeg",
    "/assets/photo2.jpeg",
    "/assets/photo3.jpeg",
    "/assets/photo4.jpeg",
    "/assets/photo5.jpeg",
    "/assets/photo6.jpeg",
  ],

  // ─── FAQ Page ─────────────────────────────────────────
  // Image shown on the FAQ intro card
  faqCardImage: "/assets/photo7.jpg",

  // Correct answers for the text questions (case-insensitive, trimmed)
  // IMPORTANT: Replace these placeholder answers with the real ones!
  faqAnswers: {
    1: "Aesthetic",   // "The word I say the most?"
    2: "Hazel Brown",   // "Exact color of my eyes?"
    3: "Vampire diaries",   // "Most watched series of mine?"
    4: "Bombay Sapphire",   // "My favorite drink?"
  },

  // FAQ questions (displayed on the frontend)
  faqQuestions: [
    { id: 1, question: "The word I say the most?" },
    { id: 2, question: "Exact color of my eyes?" },
    { id: 3, question: "Most watched series of mine?" },
    { id: 4, question: "My favorite drink?" },
    { id: 5, question: "Do you love me?", type: "yes-no" },
  ],

  // ─── Playlist Page ───────────────────────────────────
  // Replace these with actual Spotify URLs
  playlistSongs: [
    {
      title: "Tum Se Hi",
      movie: "Jab We Met",
      lyric: "Tera Na Hona Jaane Kyun Hona Hi Hai",
      spotifyUrl: "https://open.spotify.com/track/7eQl3Yqv35ioqUfveKHitE?flow_ctx=d0605b91-b142-4846-b143-0b5900f7c543%3A1783901672&creation_point=https%3A%2F%2Fopen.spotify.com%2F&autoplay_ok=1",
      lyricTimestamp: 43,
    },
    {
      title: "Nothing",
      artist: "Bruno Major",
      lyric: "Dumb conversations we lost track of time, Have I told you lately I'm grateful that you're mine",
      spotifyUrl: "https://open.spotify.com/track/1lORkxEMmsCZqhoxcmk3A3?autoplay_ok=1",
      lyricTimestamp: 40,
    },
    {
      title: "I Wanna Be Yours",
      artist: "Arctic Monkeys",
      lyric: "Secrets I have held in my heart",
      spotifyUrl: "https://open.spotify.com/track/5XeFesFbtLpXzIVDNQP22n",
      lyricTimestamp: 45,
    },
    {
      title: "I Like Me Better",
      artist: "Lauv",
      lyric: "I like me better when I'm with you.",
      spotifyUrl: "https://open.spotify.com/track/1jXfVzMk8cSbvAXMML4Y4f?si=682e720623a64afa",
      lyricTimestamp: 44,
    },
  ],

  // ─── Statistics Page ──────────────────────────────────
  // Bar chart data: months from Oct 2023 to Sep 2026
  statisticsBarData: {
    labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    values: [2023.8, 2023.9, 2024.0, 2024.2, 2024.5, 2024.8, 2025.0, 2025.3, 2025.5, 2025.7, 2025.9, 2026.0],
  },

  // Pie chart data
  statisticsPieData: {
    labels: ["Love", "Arguments", "Ignorance"],
    values: [75, 20, 5],
  },
};
