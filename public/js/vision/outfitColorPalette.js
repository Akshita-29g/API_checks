// /**
//  * outfitColorPalette.js
//  * Samples dominant colors from the lower part of the camera frame (roughly
//  * where clothing is, below the face) and turns them into a CSS gradient for
//  * that session — so each visit gets a slightly different accent palette.
//  *
//  * Falls back to a fixed romantic default gradient if the camera never
//  * starts, or if the sampled region is too uniform/dark to say anything
//  * useful (bad lighting, plain black shirt, etc).
//  *
//  * Sets these on :root, so your CSS can use them anywhere:
//  *   --outfit-color-1
//  *   --outfit-color-2
//  *   --outfit-gradient   ("linear-gradient(135deg, c1, c2)")
//  *
//  * Cached in sessionStorage so it's stable across page navigations within
//  * the same visit, and re-samples on the next new tab/session.
//  */
// import visionEngine from "./visionEngine.js";

// const STORAGE_KEY = "outfitPalette";
// const DEFAULT_PALETTE = ["#ff6b9d", "#845ec2"]; // romantic fallback

// const SAMPLE_W = 80;
// const SAMPLE_H = 60;
// const REGION_TOP = 0.55; // start sampling at 55% down the frame (below the face)

// function isSkinTone(r, g, b) {
//   // rough heuristic — just enough to de-weight faces/hands/necks
//   return r > 95 && g > 40 && b > 20 &&
//     r > g && r > b &&
//     Math.abs(r - g) > 15 &&
//     (Math.max(r, g, b) - Math.min(r, g, b)) > 15;
// }

// function quantize(value) {
//   return Math.round(value / 32) * 32;
// }

// function toHex(r, g, b) {
//   return "#" + [r, g, b]
//     .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
//     .join("");
// }

// /** Samples the current video frame and returns [hex1, hex2] or null if inconclusive. */
// function samplePalette() {
//   if (!visionEngine.video || !visionEngine.running) return null;

//   const canvas = document.createElement("canvas");
//   canvas.width = SAMPLE_W;
//   canvas.height = SAMPLE_H;
//   const ctx = canvas.getContext("2d");
//   ctx.drawImage(visionEngine.video, 0, 0, SAMPLE_W, SAMPLE_H);

//   const top = Math.floor(SAMPLE_H * REGION_TOP);
//   const { data } = ctx.getImageData(0, top, SAMPLE_W, SAMPLE_H - top);

//   const buckets = new Map();
//   for (let i = 0; i < data.length; i += 4) {
//     const r = data[i], g = data[i + 1], b = data[i + 2];
//     const brightness = (r + g + b) / 3;
//     if (brightness < 20 || brightness > 235) continue; // skip near-black/near-white (walls, shadow)
//     if (isSkinTone(r, g, b)) continue;

//     const key = `${quantize(r)},${quantize(g)},${quantize(b)}`;
//     const entry = buckets.get(key) ?? { r: 0, g: 0, b: 0, count: 0 };
//     entry.r += r; entry.g += g; entry.b += b; entry.count++;
//     buckets.set(key, entry);
//   }

//   const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);
//   if (sorted.length < 2 || sorted[0].count < 20) return null; // not enough signal, bail to fallback

//   const [top1, top2] = sorted;
//   return [
//     toHex(Math.round(top1.r / top1.count), Math.round(top1.g / top1.count), Math.round(top1.b / top1.count)),
//     toHex(Math.round(top2.r / top2.count), Math.round(top2.g / top2.count), Math.round(top2.b / top2.count)),
//   ];
// }

// function applyPalette([c1, c2]) {
//   const root = document.documentElement.style;
//   root.setProperty("--outfit-color-1", c1);
//   root.setProperty("--outfit-color-2", c2);
//   root.setProperty("--outfit-gradient", `linear-gradient(135deg, ${c1}, ${c2})`);
// }

// export function initOutfitColorPalette({ sampleDelayMs = 2500 } = {}) {
//   const cached = sessionStorage.getItem(STORAGE_KEY);
//   if (cached) {
//     applyPalette(JSON.parse(cached));
//     return; // already sampled this session, don't touch the camera again
//   }

//   // safe default applied immediately so nothing looks broken pre-sample
//   applyPalette(DEFAULT_PALETTE);

//   let sampled = false;
//   function trySample() {
//     if (sampled) return;
//     const palette = samplePalette();
//     if (!palette) return; // inconclusive this attempt, default palette stands for now
//     sampled = true;
//     sessionStorage.setItem(STORAGE_KEY, JSON.stringify(palette));
//     applyPalette(palette);
//   }

//   visionEngine.addEventListener("engine:ready", () => {
//     setTimeout(trySample, sampleDelayMs); // let camera auto-expose/focus first
//   });

//   visionEngine.addEventListener("engine:error", () => {
//     sampled = true; // camera never came up — default palette stands
//   });

//   visionEngine.start();
// }

/**
 * outfitColorPalette.js
 * Samples dominant colors from the lower part of the camera frame (roughly
 * where clothing is, below the face) and turns them into a CSS gradient for
 * that session — so each visit gets a slightly different accent palette.
 *
 * Falls back to a fixed romantic default gradient if the camera never
 * starts, or if the sampled region is too uniform/dark to say anything
 * useful (bad lighting, plain black shirt, etc).
 *
 * Sets these on :root, so your CSS can use them anywhere:
 *   --outfit-color-1
 *   --outfit-color-2
 *   --outfit-gradient   ("linear-gradient(135deg, c1, c2)")
 *
 * Also dispatches a "vision:outfitPalette" document event whenever a real
 * (non-default) palette becomes available — either from a fresh sample or
 * from sessionStorage cache — so other modules (like outfitColorLabel.js)
 * can react without needing to poll or duplicate the sampling logic.
 *
 * Cached in sessionStorage so it's stable across page navigations within
 * the same visit, and re-samples on the next new tab/session.
 */
// import visionEngine from "./visionEngine.js";

// const STORAGE_KEY = "outfitPalette";
// const DEFAULT_PALETTE = ["#ff6b9d", "#845ec2"]; // romantic fallback

// const SAMPLE_W = 80;
// const SAMPLE_H = 60;
// const REGION_TOP = 0.55; // start sampling at 55% down the frame (below the face)

// function isSkinTone(r, g, b) {
//   // rough heuristic — just enough to de-weight faces/hands/necks
//   return r > 95 && g > 40 && b > 20 &&
//     r > g && r > b &&
//     Math.abs(r - g) > 15 &&
//     (Math.max(r, g, b) - Math.min(r, g, b)) > 15;
// }

// function quantize(value) {
//   return Math.round(value / 32) * 32;
// }

// function toHex(r, g, b) {
//   return "#" + [r, g, b]
//     .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
//     .join("");
// }

// /** Samples the current video frame and returns [hex1, hex2] or null if inconclusive. */
// function samplePalette() {
//   if (!visionEngine.video || !visionEngine.running) return null;

//   const canvas = document.createElement("canvas");
//   canvas.width = SAMPLE_W;
//   canvas.height = SAMPLE_H;
//   const ctx = canvas.getContext("2d");
//   ctx.drawImage(visionEngine.video, 0, 0, SAMPLE_W, SAMPLE_H);

//   const top = Math.floor(SAMPLE_H * REGION_TOP);
//   const { data } = ctx.getImageData(0, top, SAMPLE_W, SAMPLE_H - top);

//   const buckets = new Map();
//   for (let i = 0; i < data.length; i += 4) {
//     const r = data[i], g = data[i + 1], b = data[i + 2];
//     const brightness = (r + g + b) / 3;
//     if (brightness < 20 || brightness > 235) continue; // skip near-black/near-white (walls, shadow)
//     if (isSkinTone(r, g, b)) continue;

//     const key = `${quantize(r)},${quantize(g)},${quantize(b)}`;
//     const entry = buckets.get(key) ?? { r: 0, g: 0, b: 0, count: 0 };
//     entry.r += r; entry.g += g; entry.b += b; entry.count++;
//     buckets.set(key, entry);
//   }

//   const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);
//   if (sorted.length < 2 || sorted[0].count < 20) return null; // not enough signal, bail to fallback

//   const [top1, top2] = sorted;
//   return [
//     toHex(Math.round(top1.r / top1.count), Math.round(top1.g / top1.count), Math.round(top1.b / top1.count)),
//     toHex(Math.round(top2.r / top2.count), Math.round(top2.g / top2.count), Math.round(top2.b / top2.count)),
//   ];
// }

// function applyPalette(palette) {
//   const [c1, c2] = palette;
//   const root = document.documentElement.style;
//   root.setProperty("--outfit-color-1", c1);
//   root.setProperty("--outfit-color-2", c2);
//   root.setProperty("--outfit-gradient", `linear-gradient(135deg, ${c1}, ${c2})`);
// }

// export function initOutfitColorPalette({ sampleDelayMs = 2500 } = {}) {
//   const cached = sessionStorage.getItem(STORAGE_KEY);
//   if (cached) {
//     const palette = JSON.parse(cached);
//     applyPalette(palette);
//     document.dispatchEvent(new CustomEvent("vision:outfitPalette", { detail: { palette } }));
//     return; // already sampled this session, don't touch the camera again
//   }

//   // safe default applied immediately so nothing looks broken pre-sample
//   applyPalette(DEFAULT_PALETTE);

//   let sampled = false;
//   function trySample() {
//     if (sampled) return;
//     const palette = samplePalette();
//     if (!palette) return; // inconclusive this attempt, default palette stands for now
//     sampled = true;
//     sessionStorage.setItem(STORAGE_KEY, JSON.stringify(palette));
//     applyPalette(palette);
//     document.dispatchEvent(new CustomEvent("vision:outfitPalette", { detail: { palette } }));
//   }

//   visionEngine.addEventListener("engine:ready", () => {
//     setTimeout(trySample, sampleDelayMs); // let camera auto-expose/focus first
//   });

//   visionEngine.addEventListener("engine:error", () => {
//     sampled = true; // camera never came up — default palette stands
//   });

//   visionEngine.start();
// }




// The fix: skin and pink differ in one key way

// Real skin has a yellow/orange undertone — green is reliably greater 
// than blue (g > b). Pink fabric usually has a magenta/blue undertone — blue is often greater than or close to green (b > g or b ≈ g). 
// That's the distinguishing signal your filter was missing.




/**
 * outfitColorPalette.js
 * Samples dominant colors from the lower part of the camera frame (roughly
 * where clothing is, below the face) and turns them into a CSS gradient for
 * that session — so each visit gets a slightly different accent palette.
 *
 * Falls back to a fixed romantic default gradient if the camera never
 * starts, or if the sampled region is too uniform/dark to say anything
 * useful (bad lighting, plain black shirt, etc).
 *
 * Sets these on :root, so your CSS can use them anywhere:
 *   --outfit-color-1
 *   --outfit-color-2
 *   --outfit-gradient   ("linear-gradient(135deg, c1, c2)")
 *
 * Also dispatches a "vision:outfitPalette" document event whenever a real
 * (non-default) palette becomes available — either from a fresh sample or
 * from sessionStorage cache — so other modules (like outfitColorLabel.js)
 * can react without needing to poll or duplicate the sampling logic.
 *
 * Cached in sessionStorage so it's stable across page navigations within
 * the same visit, and re-samples on the next new tab/session.
 */
// import visionEngine from "./visionEngine.js";

// const STORAGE_KEY = "outfitPalette";
// const DEFAULT_PALETTE = ["#ff6b9d", "#845ec2"]; // romantic fallback

// const SAMPLE_W = 80;
// const SAMPLE_H = 60;
// const REGION_TOP = 0.55; // start sampling at 55% down the frame (below the face)

// function isSkinTone(r, g, b) {
//   // rough heuristic — just enough to de-weight faces/hands/necks.
//   // Added g > b: real skin has a yellow/orange undertone (green clearly
//   // ahead of blue). Pink fabric satisfies every OTHER check here too
//   // (r > g, r > b, big r-g gap) but usually has blue >= green instead —
//   // without this line, pink clothing was being misclassified as skin
//   // and thrown out, leaving background pixels to falsely win as "beige".
//   return r > 95 && g > 40 && b > 20 &&
//     r > g && r > b &&
//     g > b &&
//     Math.abs(r - g) > 15 &&
//     (Math.max(r, g, b) - Math.min(r, g, b)) > 15;
// }

// function quantize(value) {
//   return Math.round(value / 32) * 32;
// }

// function toHex(r, g, b) {
//   return "#" + [r, g, b]
//     .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
//     .join("");
// }

// /** Samples the current video frame and returns [hex1, hex2] or null if inconclusive. */
// function samplePalette() {
//   if (!visionEngine.video || !visionEngine.running) return null;

//   const canvas = document.createElement("canvas");
//   canvas.width = SAMPLE_W;
//   canvas.height = SAMPLE_H;
//   const ctx = canvas.getContext("2d");
//   ctx.drawImage(visionEngine.video, 0, 0, SAMPLE_W, SAMPLE_H);

//   const top = Math.floor(SAMPLE_H * REGION_TOP);
//   const { data } = ctx.getImageData(0, top, SAMPLE_W, SAMPLE_H - top);

//   const buckets = new Map();
//   for (let i = 0; i < data.length; i += 4) {
//     const r = data[i], g = data[i + 1], b = data[i + 2];
//     const brightness = (r + g + b) / 3;
//     if (brightness < 20 || brightness > 235) continue; // skip near-black/near-white (walls, shadow)
//     if (isSkinTone(r, g, b)) continue;

//     const key = `${quantize(r)},${quantize(g)},${quantize(b)}`;
//     const entry = buckets.get(key) ?? { r: 0, g: 0, b: 0, count: 0 };
//     entry.r += r; entry.g += g; entry.b += b; entry.count++;
//     buckets.set(key, entry);
//   }

//   const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);
//   if (sorted.length < 2 || sorted[0].count < 20) return null; // not enough signal, bail to fallback

//   const [top1, top2] = sorted;
//   return [
//     toHex(Math.round(top1.r / top1.count), Math.round(top1.g / top1.count), Math.round(top1.b / top1.count)),
//     toHex(Math.round(top2.r / top2.count), Math.round(top2.g / top2.count), Math.round(top2.b / top2.count)),
//   ];
// }

// function applyPalette(palette) {
//   const [c1, c2] = palette;
//   const root = document.documentElement.style;
//   root.setProperty("--outfit-color-1", c1);
//   root.setProperty("--outfit-color-2", c2);
//   root.setProperty("--outfit-gradient", `linear-gradient(135deg, ${c1}, ${c2})`);
// }

// export function initOutfitColorPalette({ sampleDelayMs = 2500 } = {}) {
//   const cached = sessionStorage.getItem(STORAGE_KEY);
//   if (cached) {
//     const palette = JSON.parse(cached);
//     applyPalette(palette);
//     document.dispatchEvent(new CustomEvent("vision:outfitPalette", { detail: { palette } }));
//     return; // already sampled this session, don't touch the camera again
//   }

//   // safe default applied immediately so nothing looks broken pre-sample
//   applyPalette(DEFAULT_PALETTE);

//   let sampled = false;
//   function trySample() {
//     if (sampled) return;
//     const palette = samplePalette();
//     if (!palette) return; // inconclusive this attempt, default palette stands for now
//     sampled = true;
//     sessionStorage.setItem(STORAGE_KEY, JSON.stringify(palette));
//     applyPalette(palette);
//     document.dispatchEvent(new CustomEvent("vision:outfitPalette", { detail: { palette } }));
//   }

//   visionEngine.addEventListener("engine:ready", () => {
//     setTimeout(trySample, sampleDelayMs); // let camera auto-expose/focus first
//   });

//   visionEngine.addEventListener("engine:error", () => {
//     sampled = true; // camera never came up — default palette stands
//   });

//   visionEngine.start();
// }



// 1. The brightness filter was the main bug — fixed
// Old: excluded anything below brightness 20 or above 235. New: only excludes below 8 or above 250 — true clipped extremes, not "any dark or light clothing." This directly explains why both light and dark outfits were failing before: they were being thrown out by design, not missed by accident.

// 2. Bucket size widened (32 → 48)
// This addresses the "background is more uniform than clothing" problem — natural shirt lighting variation (folds, soft shadow, highlight) now groups into one bucket instead of splitting into several that each lose individually to a flatter wall/background color.

// 3. Center-only horizontal sampling (20%–80% width)
// Cuts out background bleeding in from the left/right edges of frame, where you're less likely to be filling the whole width.

// 4. Multi-frame accumulation instead of one snapshot
// Old: tried once, gave up if inconclusive. New: retries up to 6 times (every ~900ms), merging pixel data into the same buckets across attempts rather than resampling from scratch — so a single bad frame (motion blur, a stray highlight, your hand passing by) doesn't determine the whole result. //


/**
 * outfitColorPalette.js
 * Samples dominant colors from the lower part of the camera frame (roughly
 * where clothing is, below the face) and turns them into a CSS gradient for
 * that session — so each visit gets a slightly different accent palette.
 *
 * Falls back to a fixed romantic default gradient if the camera never
 * starts, or if the sampled region is too uniform/inconclusive to say
 * anything useful after several attempts.
 *
 * Sets these on :root, so your CSS can use them anywhere:
 *   --outfit-color-1
 *   --outfit-color-2
 *   --outfit-gradient   ("linear-gradient(135deg, c1, c2)")
 *
 * Also dispatches a "vision:outfitPalette" document event whenever a real
 * (non-default) palette becomes available — either from a fresh sample or
 * from sessionStorage cache — so other modules (like outfitColorLabel.js)
 * can react without needing to poll or duplicate the sampling logic.
 *
 * Cached in sessionStorage so it's stable across page navigations within
 * the same visit, and re-samples on the next new tab/session.
 */
import visionEngine from "./visionEngine.js";

const STORAGE_KEY = "outfitPalette";
const DEFAULT_PALETTE = ["#ff6b9d", "#845ec2"]; // romantic fallback

const SAMPLE_W = 100;
const SAMPLE_H = 80;
const REGION_TOP = 0.5;    // start sampling at 50% down the frame (below the face)
const REGION_LEFT = 0.2;   // ...and only the CENTER 60% of the width, so side
const REGION_RIGHT = 0.8;  // background at the frame's edges doesn't get counted

// Only exclude TRUE clipped extremes (pure blown-out highlight / pure
// crushed black), not "dark clothing" or "light clothing" in general —
// the old thresholds (20 / 235) were wide enough to throw out real black
// and white/light-colored shirts entirely, which is why both very dark
// and very light outfits were failing to detect before this fix.
const MIN_BRIGHTNESS = 8;
const MAX_BRIGHTNESS = 250;

// How many separate frames to try combining before giving up and falling
// back to the default palette. A single frame can catch a stray highlight,
// motion blur, or a moment your hand passed in front of the camera —
// combining several spaced-out frames is much more robust.
const MAX_SAMPLE_ATTEMPTS = 6;
const RETRY_INTERVAL_MS = 900;

function isSkinTone(r, g, b) {
  // rough heuristic — just enough to de-weight faces/hands/necks.
  // g > b: real skin has a yellow/orange undertone (green clearly ahead
  // of blue). Pink fabric satisfies every OTHER check here too (r > g,
  // r > b, big r-g gap) but usually has blue >= green instead — without
  // this line, pink clothing was being misclassified as skin.
  return r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    g > b &&
    Math.abs(r - g) > 15 &&
    (Math.max(r, g, b) - Math.min(r, g, b)) > 15;
}

// Coarser bucket size (48 instead of 32) so natural lighting variation
// across a shirt (folds, soft shadows, highlights) still lands in the
// SAME bucket as each other, instead of splitting into several
// neighboring buckets that each individually lose to a more uniform
// background. This is what was letting plain walls out-vote real
// clothing even after the brightness/skin fixes.
function quantize(value) {
  return Math.round(value / 48) * 48;
}

function toHex(r, g, b) {
  return "#" + [r, g, b]
    .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
    .join("");
}

/** Reads one frame into pixel buckets, WITHOUT deciding a winner yet —
 *  so multiple frames' buckets can be merged together before picking. */
function collectBucketsFromFrame(buckets) {
  if (!visionEngine.video || !visionEngine.running) return false;

  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_W;
  canvas.height = SAMPLE_H;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(visionEngine.video, 0, 0, SAMPLE_W, SAMPLE_H);

  const top = Math.floor(SAMPLE_H * REGION_TOP);
  const left = Math.floor(SAMPLE_W * REGION_LEFT);
  const right = Math.floor(SAMPLE_W * REGION_RIGHT);
  const { data } = ctx.getImageData(left, top, right - left, SAMPLE_H - top);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const brightness = (r + g + b) / 3;
    if (brightness < MIN_BRIGHTNESS || brightness > MAX_BRIGHTNESS) continue;
    if (isSkinTone(r, g, b)) continue;

    const key = `${quantize(r)},${quantize(g)},${quantize(b)}`;
    const entry = buckets.get(key) ?? { r: 0, g: 0, b: 0, count: 0 };
    entry.r += r; entry.g += g; entry.b += b; entry.count++;
    buckets.set(key, entry);
  }
  return true;
}

function pickPaletteFromBuckets(buckets) {
  const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);
  if (sorted.length < 2 || sorted[0].count < 40) return null; // not enough signal yet

  const [top1, top2] = sorted;
  return [
    toHex(Math.round(top1.r / top1.count), Math.round(top1.g / top1.count), Math.round(top1.b / top1.count)),
    toHex(Math.round(top2.r / top2.count), Math.round(top2.g / top2.count), Math.round(top2.b / top2.count)),
  ];
}

function applyPalette(palette) {
  const [c1, c2] = palette;
  const root = document.documentElement.style;
  root.setProperty("--outfit-color-1", c1);
  root.setProperty("--outfit-color-2", c2);
  root.setProperty("--outfit-gradient", `linear-gradient(135deg, ${c1}, ${c2})`);
}

export function initOutfitColorPalette({ sampleDelayMs = 2500 } = {}) {
  const cached = sessionStorage.getItem(STORAGE_KEY);
  if (cached) {
    const palette = JSON.parse(cached);
    applyPalette(palette);
    document.dispatchEvent(new CustomEvent("vision:outfitPalette", { detail: { palette } }));
    return; // already sampled this session, don't touch the camera again
  }

  // safe default applied immediately so nothing looks broken pre-sample
  applyPalette(DEFAULT_PALETTE);

  let sampled = false;
  let attempts = 0;
  const buckets = new Map(); // accumulates across multiple frames/attempts

  function trySample() {
    if (sampled) return;
    attempts++;

    const gotFrame = collectBucketsFromFrame(buckets);
    const palette = gotFrame ? pickPaletteFromBuckets(buckets) : null;

    if (palette) {
      sampled = true;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(palette));
      applyPalette(palette);
      document.dispatchEvent(new CustomEvent("vision:outfitPalette", { detail: { palette } }));
      return;
    }

    if (attempts >= MAX_SAMPLE_ATTEMPTS) {
      sampled = true; // give up gracefully — default palette stands
      return;
    }

    setTimeout(trySample, RETRY_INTERVAL_MS); // try again, merging into the same buckets
  }

  visionEngine.addEventListener("engine:ready", () => {
    setTimeout(trySample, sampleDelayMs); // let camera auto-expose/focus first
  });

  visionEngine.addEventListener("engine:error", () => {
    sampled = true; // camera never came up — default palette stands
  });

  visionEngine.start();
}