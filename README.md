# API_Check


A fully responsive, premium-quality interactive romantic website with a story-like experience across 6 pages. Built with glassmorphism, GSAP animations, Chart.js graphs, and a Node.js backend.

---

## ✨ Features

- **Home** — Floating glass bottle that opens into a love letter
- **Library** — Click-to-reveal photo gallery (6 images)
- **Statistics** — 3 animated charts (bar, exponential, pie) via Chart.js
- **FAQ** — Interactive quiz with backend validation + dodge button
- **Playlist** — Spotify-linked song cards with spinning vinyl disc
- **Contact** — WhatsApp Cloud API message delivery

**Global**: Persistent navbar with glow indicators, animated CSS cat with pat interaction

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ installed

### Installation

```bash
# 1. Navigate to the server directory
cd server

# 2. Install dependencies
npm install

# 3. Copy environment template
copy .env.example .env

# 4. Edit .env with your WhatsApp credentials (optional)
notepad .env

# 5. Start the server
npm run dev
```

The website will be available at **http://localhost:3000**

---

## 🎨 Customization

All user-specific content is in **one file**: `server/config/content.js`

### Images (Library Page)
Replace the `libraryImages` array with your own image paths or URLs:
```js
libraryImages: [
  "/assets/photo1.jpg",   // Place files in public/assets/
  "https://example.com/remote-photo.jpg",
],
```

### Romantic Quote (Home Page)
```js
romanticQuote: "Your custom romantic quote here",
```

### FAQ Answers
```js
faqAnswers: {
  1: "actual_answer",   // "The word I say the most?"
  2: "actual_answer",   // "Exact color of my eyes?"
  3: "actual_answer",   // "Most watched series of mine?"
  4: "actual_answer",   // "My favorite drink?"
},
```

### Spotify URLs (Playlist Page)
```js
playlistSongs: [
  {
    title: "Song Name",
    artist: "Artist",
    lyric: "A meaningful lyric",
    spotifyUrl: "https://open.spotify.com/track/...",
  },
],
```

### WhatsApp (Contact Page)
Edit the `.env` file:
```env
WA_ACCESS_TOKEN=your_permanent_token
WA_PHONE_NUMBER_ID=your_phone_number_id
WA_RECIPIENT_PHONE=919876543210
```

---

## 📁 Project Structure

```
Demo1/
├── server/                    # Backend
│   ├── server.js              # Express entry point
│   ├── config/content.js      # All customizable content
│   ├── routes/faq.js          # FAQ validation API
│   ├── routes/contact.js      # WhatsApp messaging API
│   ├── middleware/             # Rate limiting
│   └── utils/whatsapp.js      # WhatsApp Cloud API helper
│
├── public/                    # Frontend (served as static)
│   ├── index.html             # SPA shell
│   ├── css/                   # Modular stylesheets
│   │   ├── variables.css      # Design tokens
│   │   ├── base.css           # Global styles
│   │   └── [page].css         # Per-page styles
│   ├── js/                    # Modular JavaScript
│   │   ├── app.js             # Main controller
│   │   ├── navbar.js          # Navigation
│   │   ├── cat.js             # Animated cat
│   │   └── pages/             # Per-page controllers
│   └── assets/                # Images
│
└── README.md
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS (ES6+) |
| Animations | GSAP 3.15.0 |
| Charts | Chart.js 4.5.1 |
| Backend | Node.js + Express |
| Messaging | WhatsApp Cloud API |
| Security | Helmet, express-rate-limit |

---

## 💡 Tips

- **Adding images**: Place image files in `public/assets/` and reference them as `/assets/filename.jpg`
- **FAQ answers are case-insensitive** and ignore extra whitespace
- **The "No" button** in the last FAQ question cannot be clicked — it dodges the cursor!
- **WhatsApp**: Without credentials, the Contact page will show a friendly error. Everything else works fine.
