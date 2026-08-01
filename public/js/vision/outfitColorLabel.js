// /**
//  * outfitColorLabel.js
//  * Feature: turns the [hex1, hex2] palette that outfitColorPalette.js
//  * already computes into a human-readable compliment message, e.g.
//  * "Black suits you!" — no separate camera sampling needed, since your
//  * outfit color doesn't change mid-session and outfitColorPalette.js
//  * already samples it once.
//  *
//  * Listens for the "vision:outfitPalette" event dispatched by
//  * outfitColorPalette.js. Also checks sessionStorage directly on init, in
//  * case the palette was already determined before this page/module loaded
//  * (e.g. sampled on Home page, read here on the heart-gesture page).
//  */

// const STORAGE_KEY = "outfitPalette"; // must match outfitColorPalette.js

// // Reference palette — the dominant sampled color gets matched to whichever
// // of these is closest (simple distance in RGB space).
// const NAMED_COLORS = [
//   { name: "black", rgb: [25, 25, 25] },
//   { name: "white", rgb: [235, 235, 235] },
//   { name: "grey", rgb: [130, 130, 130] },
//   { name: "red", rgb: [190, 40, 40] },
//   { name: "pink", rgb: [230, 130, 175] },
//   { name: "orange", rgb: [220, 120, 40] },
//   { name: "yellow", rgb: [220, 200, 60] },
//   { name: "green", rgb: [50, 140, 70] },
//   { name: "blue", rgb: [50, 90, 180] },
//   { name: "navy blue", rgb: [20, 30, 80] },
//   { name: "purple", rgb: [120, 60, 150] },
//   { name: "brown", rgb: [110, 70, 40] },
//   { name: "beige", rgb: [210, 190, 150] },
// ];

// function hexToRgb(hex) {
//   const clean = hex.replace("#", "");
//   return [
//     parseInt(clean.substring(0, 2), 16),
//     parseInt(clean.substring(2, 4), 16),
//     parseInt(clean.substring(4, 6), 16),
//   ];
// }

// function nearestColorName(hex) {
//   const [r, g, b] = hexToRgb(hex);
//   let bestName = null;
//   let bestDist = Infinity;

//   for (const c of NAMED_COLORS) {
//     const [cr, cg, cb] = c.rgb;
//     const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
//     if (dist < bestDist) {
//       bestDist = dist;
//       bestName = c.name;
//     }
//   }
//   return bestName;
// }

// function capitalize(s) {
//   return s.charAt(0).toUpperCase() + s.slice(1);
// }

// function showMessage(label, palette) {
//   const dominantHex = palette[0]; // top1 color from outfitColorPalette.js is the most-sampled one
//   const name = nearestColorName(dominantHex);
//   label.textContent = `${capitalize(name)} suits you! 💕`;
//   label.style.color = dominantHex;
// }

// export function initOutfitColorLabel({ labelSelector = "#outfit-color-label" } = {}) {
//   const label = document.querySelector(labelSelector);
//   if (!label) return;

//   // Palette might already be ready (sampled earlier, e.g. on Home page) —
//   // check sessionStorage directly so we don't miss an event fired before
//   // this module was loaded.
//   const cached = sessionStorage.getItem(STORAGE_KEY);
//   if (cached) {
//     showMessage(label, JSON.parse(cached));
//   }

//   // Also listen for the live event, in case sampling finishes AFTER this
//   // page/module has already loaded.
//   document.addEventListener("vision:outfitPalette", (e) => {
//     showMessage(label, e.detail.palette);
//   });
// }

/**
 * outfitColorLabel.js
 * Feature: shows a floating popup with a compliment based on the
 * dominant color outfitColorPalette.js already sampled, e.g.
 * "Black suits you! 💕" — with a small swatch dot in the detected color.
 *
 * No new camera sampling here — outfitColorPalette.js samples the outfit
 * color ONCE per session and caches it (sessionStorage + the
 * "vision:outfitPalette" event). This module just turns that existing
 * result into a nice on-screen moment.
 *
 * Shows once per session (since outfit color doesn't change mid-visit) —
 * checks sessionStorage immediately in case sampling already finished
 * before this module loaded, and also listens for the live event in case
 * it finishes after.
 */

// const STORAGE_KEY = "outfitPalette"; // must match outfitColorPalette.js
// const POPUP_VISIBLE_MS = 4000;       // how long the popup stays fully visible
// const FADE_MS = 500;                 // fade-out transition duration

// // Reference palette — the dominant sampled color gets matched to whichever
// // of these is closest (simple distance in RGB space).
// const NAMED_COLORS = [
//   { name: "black", rgb: [25, 25, 25] },
//   { name: "white", rgb: [235, 235, 235] },
//   { name: "grey", rgb: [130, 130, 130] },
//   { name: "red", rgb: [190, 40, 40] },
//   { name: "pink", rgb: [230, 130, 175] },
//   { name: "orange", rgb: [220, 120, 40] },
//   { name: "yellow", rgb: [220, 200, 60] },
//   { name: "green", rgb: [50, 140, 70] },
//   { name: "blue", rgb: [50, 90, 180] },
//   { name: "navy blue", rgb: [20, 30, 80] },
//   { name: "purple", rgb: [120, 60, 150] },
//   { name: "brown", rgb: [110, 70, 40] },
//   { name: "beige", rgb: [210, 190, 150] },
// ];

// function hexToRgb(hex) {
//   const clean = hex.replace("#", "");
//   return [
//     parseInt(clean.substring(0, 2), 16),
//     parseInt(clean.substring(2, 4), 16),
//     parseInt(clean.substring(4, 6), 16),
//   ];
// }

// function nearestColorName(hex) {
//   const [r, g, b] = hexToRgb(hex);
//   let bestName = null;
//   let bestDist = Infinity;

//   for (const c of NAMED_COLORS) {
//     const [cr, cg, cb] = c.rgb;
//     const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
//     if (dist < bestDist) {
//       bestDist = dist;
//       bestName = c.name;
//     }
//   }
//   return bestName;
// }

// function capitalize(s) {
//   return s.charAt(0).toUpperCase() + s.slice(1);
// }

// function injectStylesOnce() {
//   if (document.getElementById("outfit-color-popup-styles")) return;
//   const style = document.createElement("style");
//   style.id = "outfit-color-popup-styles";
//   style.textContent = `
//     .outfit-color-popup {
//       position: fixed;
//       top: 24px;
//       left: 50%;
//       transform: translate(-50%, -20px);
//       opacity: 0;
//       z-index: 500;
//       display: flex;
//       align-items: center;
//       gap: 10px;
//       padding: 14px 22px;
//       border-radius: 999px;
//       background: rgba(255, 255, 255, 0.12);
//       backdrop-filter: blur(14px);
//       -webkit-backdrop-filter: blur(14px);
//       border: 1px solid rgba(255, 255, 255, 0.25);
//       box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
//       color: #fff;
//       font-family: inherit;
//       font-size: 15px;
//       font-weight: 500;
//       letter-spacing: 0.2px;
//       transition: opacity 0.5s ease, transform 0.5s ease;
//       pointer-events: none;
//     }
//     .outfit-color-popup.visible {
//       opacity: 1;
//       transform: translate(-50%, 0);
//     }
//     .outfit-color-swatch {
//       display: inline-block;
//       width: 14px;
//       height: 14px;
//       border-radius: 50%;
//       background: var(--swatch-color, #ff6b9d);
//       box-shadow: 0 0 8px var(--swatch-color, #ff6b9d);
//       flex-shrink: 0;
//     }
//   `;
//   document.head.appendChild(style);
// }

// let popupShown = false; // only pop once per session — outfit color doesn't change mid-visit

// function showPopup(palette) {
//   if (popupShown) return;
//   popupShown = true;

//   const dominantHex = palette[0]; // outfitColorPalette.js's top1 = most-sampled color
//   const name = nearestColorName(dominantHex);

//   injectStylesOnce();

//   const popup = document.createElement("div");
//   popup.className = "outfit-color-popup";
//   popup.style.setProperty("--swatch-color", dominantHex);
//   popup.innerHTML = `<span class="outfit-color-swatch"></span>${capitalize(name)} suits you! 💕`;
//   document.body.appendChild(popup);

//   // two-step so the CSS transition actually plays (can't animate from
//   // a style set in the same paint frame the element was created in)
//   requestAnimationFrame(() => popup.classList.add("visible"));

//   setTimeout(() => {
//     popup.classList.remove("visible");
//     setTimeout(() => popup.remove(), FADE_MS);
//   }, POPUP_VISIBLE_MS);
// }

// export function initOutfitColorLabel() {
//   const cached = sessionStorage.getItem(STORAGE_KEY);
//   if (cached) {
//     showPopup(JSON.parse(cached));
//   }

//   document.addEventListener("vision:outfitPalette", (e) => {
//     showPopup(e.detail.palette);
//   });
// }

// POP UP ON HEART GESTURE PAGE 
// outfitColorLabel.js — split into two separate functions:

// initOutfitColorLabel() — silently remembers the palette as soon as it's known (via cache or the event), but displays nothing
// showOutfitColorPopup() — actually creates and shows the popup, only when you call it

/**
 * outfitColorLabel.js
 * Feature: shows a floating popup with a compliment based on the
 * dominant color outfitColorPalette.js already sampled, e.g.
 * "Black suits you! 💕" — with a small swatch dot in the detected color.
 *
 * No new camera sampling here — outfitColorPalette.js samples the outfit
 * color ONCE per session and caches it (sessionStorage + the
 * "vision:outfitPalette" event). This module just turns that existing
 * result into a nice on-screen moment.
 *
 * Does NOT show itself automatically — initOutfitColorLabel() only keeps
 * track of the palette once it's known. Call showOutfitColorPopup() from
 * wherever you actually want the popup to appear (e.g. a button click on
 * a specific page) — see heartGestureStage.js for the intended usage.
 */

const STORAGE_KEY = "outfitPalette"; // must match outfitColorPalette.js

const POPUP_VISIBLE_MS = 4000;       // how long the popup stays fully visible
const FADE_MS = 500;                 // fade-out transition duration

// Reference palette — the dominant sampled color gets matched to whichever
// of these is closest (simple distance in RGB space).
const NAMED_COLORS = [
  { name: "black", rgb: [25, 25, 25] },
  { name: "white", rgb: [235, 235, 235] },
  { name: "grey", rgb: [130, 130, 130] },
  { name: "red", rgb: [190, 40, 40] },
  { name: "pink", rgb: [230, 130, 175] },
  { name: "orange", rgb: [220, 120, 40] },
  { name: "yellow", rgb: [220, 200, 60] },
  { name: "green", rgb: [50, 140, 70] },
  { name: "blue", rgb: [50, 90, 180] },
  { name: "navy blue", rgb: [20, 30, 80] },
  { name: "purple", rgb: [120, 60, 150] },
  { name: "brown", rgb: [110, 70, 40] },
  { name: "beige", rgb: [210, 190, 150] },
];

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

function nearestColorName(hex) {
  const [r, g, b] = hexToRgb(hex);
  let bestName = null;
  let bestDist = Infinity;

  for (const c of NAMED_COLORS) {
    const [cr, cg, cb] = c.rgb;
    const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      bestName = c.name;
    }
  }
  return bestName;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function injectStylesOnce() {
  if (document.getElementById("outfit-color-popup-styles")) return;
  const style = document.createElement("style");
  style.id = "outfit-color-popup-styles";
  style.textContent = `
    .outfit-color-popup {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translate(-50%, -20px);
      opacity: 0;
      z-index: 500;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 22px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
      color: #fff;
      font-family: inherit;
      font-size: 15px;
      font-weight: 500;
      letter-spacing: 0.2px;
      transition: opacity 0.5s ease, transform 0.5s ease;
      pointer-events: none;
    }
    .outfit-color-popup.visible {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    .outfit-color-swatch {
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--swatch-color, #ff6b9d);
      box-shadow: 0 0 8px var(--swatch-color, #ff6b9d);
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
}

let currentPalette = null; // filled in once outfitColorPalette.js finishes sampling

function rememberPalette(palette) {
  currentPalette = palette;
}

/**
 * Call this whenever you actually want the popup to appear on screen —
 * e.g. from a button click. Does nothing (silently) if the palette isn't
 * known yet, which can happen if the camera hasn't finished sampling.
 */
export function showOutfitColorPopup() {
  if (!currentPalette) return; // nothing sampled yet — nothing to show

  const dominantHex = currentPalette[0]; // outfitColorPalette.js's top1 = most-sampled color
  const name = nearestColorName(dominantHex);

  injectStylesOnce();

  const popup = document.createElement("div");
  popup.className = "outfit-color-popup";
  popup.style.setProperty("--swatch-color", dominantHex);
  popup.innerHTML = `<span class="outfit-color-swatch"></span>${capitalize(name)} suits you! 💕`;
  document.body.appendChild(popup);

  // two-step so the CSS transition actually plays (can't animate from
  // a style set in the same paint frame the element was created in)
  requestAnimationFrame(() => popup.classList.add("visible"));

  setTimeout(() => {
    popup.classList.remove("visible");
    setTimeout(() => popup.remove(), FADE_MS);
  }, POPUP_VISIBLE_MS);
}

/**
 * Just keeps track of the palette as soon as it's known — checks
 * sessionStorage immediately in case sampling already finished, and
 * listens for the live event in case it finishes later. Does NOT display
 * anything by itself.
 */
export function initOutfitColorLabel() {
  const cached = sessionStorage.getItem(STORAGE_KEY);
  if (cached) {
    rememberPalette(JSON.parse(cached));
  }

  document.addEventListener("vision:outfitPalette", (e) => {
    rememberPalette(e.detail.palette);
  });
}