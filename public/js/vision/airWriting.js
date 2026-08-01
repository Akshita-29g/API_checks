// /**
//  * airWriting.js
//  * Feature: point at the camera to "write" in the air — a glowing trail
//  * follows your fingertip. A couple seconds after you stop pointing, the
//  * writing fades out and clears, ready for the next attempt.
//  *
//  * Listens: hand:point { x, y } (fires continuously while pointing),
//  *          hand:pointend (fires once when the pointing gesture stops)
//  *
//  * Only draws while the target page is the active page — avoids drawing
//  * on an invisible canvas if you happen to point at the camera on another
//  * page that also has hand tracking running.
//  */
// import visionEngine from "./visionEngine.js";

// const FADE_DELAY_MS = 2200;    // how long the writing stays fully visible after you stop
// const FADE_DURATION_MS = 1400; // how long the fade-out itself takes
// const STROKE_COLOR = "rgba(255, 107, 157, 0.9)";
// const GLOW_COLOR = "rgba(255, 107, 157, 0.65)";
// const LINE_WIDTH = 4;

// export function initAirWriting({
//   sectionSelector = "#page-heart-gesture",
//   zoneSelector = "#air-writing-zone",
// } = {}) {
//   const section = document.querySelector(sectionSelector);
//   const zone = document.querySelector(zoneSelector);
//   if (!section || !zone) return;

//   const canvas = document.createElement("canvas");
//   canvas.style.cssText = `
//     position: absolute;
//     inset: 0;
//     width: 100%;
//     height: 100%;
//     pointer-events: none;
//     z-index: 5;
//     opacity: 1;
//   `;
//   zone.appendChild(canvas);
//   const ctx = canvas.getContext("2d");

//   let lastPoint = null;
//   let fadeTimer = null;

//   function resizeCanvas() {
//     const rect = zone.getBoundingClientRect();
//     canvas.width = rect.width;
//     canvas.height = rect.height;
//   }
//   resizeCanvas();
//   new ResizeObserver(resizeCanvas).observe(zone);

//   function clearCanvas() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     canvas.style.transition = "none";
//     canvas.style.opacity = "1"; // reset instantly so the next attempt starts fresh
//   }

//   function drawSegment(from, to) {
//     ctx.save();
//     ctx.lineCap = "round";
//     ctx.lineJoin = "round";
//     ctx.shadowBlur = 18;
//     ctx.shadowColor = GLOW_COLOR;
//     ctx.strokeStyle = STROKE_COLOR;
//     ctx.lineWidth = LINE_WIDTH;
//     ctx.beginPath();
//     ctx.moveTo(from.x, from.y);
//     ctx.lineTo(to.x, to.y);
//     ctx.stroke();
//     ctx.restore();
//   }

//   visionEngine.addEventListener("hand:point", (e) => {
//     if (!section.classList.contains("active")) return;

//     // if a fade was scheduled/in progress, cancel it — they're still writing
//     clearTimeout(fadeTimer);
//     canvas.style.transition = "none";
//     canvas.style.opacity = "1";

//     const point = { x: e.detail.x * canvas.width, y: e.detail.y * canvas.height };
//     if (lastPoint) drawSegment(lastPoint, point);
//     lastPoint = point;
//   });

//   visionEngine.addEventListener("hand:pointend", () => {
//     lastPoint = null; // next point starts a new stroke instead of jumping a line from the old spot

//     clearTimeout(fadeTimer);
//     fadeTimer = setTimeout(() => {
//       canvas.style.transition = `opacity ${FADE_DURATION_MS}ms ease`;
//       canvas.style.opacity = "0";
//       setTimeout(clearCanvas, FADE_DURATION_MS);
//     }, FADE_DELAY_MS);
//   });

//   // If the visitor navigates away mid-write, reset cleanly rather than
//   // leaving a stale drawing for their next visit to this page.
//   const observer = new MutationObserver(() => {
//     if (!section.classList.contains("active")) {
//       clearTimeout(fadeTimer);
//       lastPoint = null;
//       clearCanvas();
//     }
//   });
//   observer.observe(section, { attributes: true, attributeFilter: ["class"] });
// }

/**
 * airWriting.js
 * Feature: point at the camera to "write" in the air — a glowing trail
 * follows your fingertip. A couple seconds after you stop pointing, the
 * writing fades out and clears, ready for the next attempt.
 *
 * Listens: hand:point { x, y } (fires continuously while pointing),
 *          hand:pointend (fires once when the pointing gesture stops)
 *
 * Only draws while the target page is the active page — avoids drawing
 * on an invisible canvas if you happen to point at the camera on another
 * page that also has hand tracking running.
 */ 

// Smoothened Constant used 
// import visionEngine from "./visionEngine.js";

// const FADE_DELAY_MS = 2200;    // how long the writing stays fully visible after you stop
// const FADE_DURATION_MS = 1400; // how long the fade-out itself takes
// const STROKE_COLOR = "rgba(255, 107, 157, 0.9)";
// const GLOW_COLOR = "rgba(255, 107, 157, 0.65)";
// const LINE_WIDTH = 4;

// // Exponential moving average smoothing — each frame, the drawn point moves
// // only this fraction of the way toward the raw (jittery) fingertip position.
// // Lower = smoother line but more lag behind your real finger movement.
// // Higher = snappier but jitterier. 0.3-0.4 is a good starting range to tune.
// const SMOOTHING_ALPHA = 0.45;

// export function initAirWriting({
//   sectionSelector = "#page-heart-gesture",
//   zoneSelector = "#air-writing-zone",
// } = {}) {
//   const section = document.querySelector(sectionSelector);
//   const zone = document.querySelector(zoneSelector);
//   if (!section || !zone) return;

//   const canvas = document.createElement("canvas");
//   canvas.style.cssText = `
//     position: absolute;
//     inset: 0;
//     width: 100%;
//     height: 100%;
//     pointer-events: none;
//     z-index: 5;
//     opacity: 1;
//   `;
//   zone.appendChild(canvas);
//   const ctx = canvas.getContext("2d");

//   let lastPoint = null;     // last SMOOTHED point actually drawn (used to draw the next segment)
//   let smoothed = null;      // running smoothed {x, y}, updated every raw frame
//   let fadeTimer = null;

//   /**
//    * Nudges the running smoothed point partway toward the new raw point,
//    * instead of jumping straight to it. This is what turns a shaky,
//    * vibrating line into a stable-looking stroke.
//    */
//   function smoothPoint(raw) {
//     if (!smoothed) {
//       smoothed = { x: raw.x, y: raw.y }; // first frame: nothing to smooth against yet
//     } else {
//       smoothed = {
//         x: smoothed.x + (raw.x - smoothed.x) * SMOOTHING_ALPHA,
//         y: smoothed.y + (raw.y - smoothed.y) * SMOOTHING_ALPHA,
//       };
//     }
//     return smoothed;
//   }

//   function resizeCanvas() {
//     const rect = zone.getBoundingClientRect();
//     canvas.width = rect.width;
//     canvas.height = rect.height;
//   }
//   resizeCanvas();
//   new ResizeObserver(resizeCanvas).observe(zone);

//   function clearCanvas() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     canvas.style.transition = "none";
//     canvas.style.opacity = "1"; // reset instantly so the next attempt starts fresh
//   }

//   function drawSegment(from, to) {
//     ctx.save();
//     ctx.lineCap = "round";
//     ctx.lineJoin = "round";
//     ctx.shadowBlur = 18;
//     ctx.shadowColor = GLOW_COLOR;
//     ctx.strokeStyle = STROKE_COLOR;
//     ctx.lineWidth = LINE_WIDTH;
//     ctx.beginPath();
//     ctx.moveTo(from.x, from.y);
//     ctx.lineTo(to.x, to.y);
//     ctx.stroke();
//     ctx.restore();
//   }

//   visionEngine.addEventListener("hand:point", (e) => {
//     // visionEngine.addEventListener("hand:pointend", () => console.log("stroke ended"));
//     if (!section.classList.contains("active")) return;

//     // if a fade was scheduled/in progress, cancel it — they're still writing
//     clearTimeout(fadeTimer);
//     canvas.style.transition = "none";
//     canvas.style.opacity = "1";

//     const raw = { x: e.detail.x * canvas.width, y: e.detail.y * canvas.height };
//     const point = smoothPoint(raw); // smoothed, not the raw jittery position
//     if (lastPoint) drawSegment(lastPoint, point);
//     lastPoint = point;
//   });

//   visionEngine.addEventListener("hand:pointend", () => {
//     lastPoint = null; // next point starts a new stroke instead of jumping a line from the old spot
//     smoothed = null;  // also reset the smoothing baseline, so the new stroke doesn't ease in from the old spot

//     clearTimeout(fadeTimer);
//     fadeTimer = setTimeout(() => {
//       canvas.style.transition = `opacity ${FADE_DURATION_MS}ms ease`;
//       canvas.style.opacity = "0";
//       setTimeout(clearCanvas, FADE_DURATION_MS);
//     }, FADE_DELAY_MS);
//   });

//   // If the visitor navigates away mid-write, reset cleanly rather than
//   // leaving a stale drawing for their next visit to this page.
//   const observer = new MutationObserver(() => {
//     if (!section.classList.contains("active")) {
//       clearTimeout(fadeTimer);
//       lastPoint = null;
//       smoothed = null;
//       clearCanvas();
//     }
//   });
//   observer.observe(section, { attributes: true, attributeFilter: ["class"] });
// }

// sMOOTHING USING QUASRATIC CURVE 
/**
 * airWriting.js
 * Feature: point at the camera to "write" in the air — a glowing trail
 * follows your fingertip. A couple seconds after you stop pointing, the
 * writing fades out and clears, ready for the next attempt.
 *
 * Listens: hand:point { x, y } (fires continuously while pointing),
 *          hand:pointend (fires once when the pointing gesture stops)
 *
 * Only draws while the target page is the active page — avoids drawing
 * on an invisible canvas if you happen to point at the camera on another
 * page that also has hand tracking running.
 */
import visionEngine from "./visionEngine.js";

const FADE_DELAY_MS = 2200;    // how long the writing stays fully visible after you stop
const FADE_DURATION_MS = 1400; // how long the fade-out itself takes
const STROKE_COLOR = "rgba(255, 107, 157, 0.9)";
const GLOW_COLOR = "rgba(255, 107, 157, 0.65)";
const LINE_WIDTH = 4;

// Exponential moving average smoothing — each frame, the drawn point moves
// only this fraction of the way toward the raw (jittery) fingertip position.
// Lower = smoother line but more lag behind your real finger movement.
// Higher = snappier but jitterier. 0.3-0.4 is a good starting range to tune.
const SMOOTHING_ALPHA = 0.35;

export function initAirWriting({
  sectionSelector = "#page-heart-gesture",
  zoneSelector = "#air-writing-zone",
} = {}) {
  const section = document.querySelector(sectionSelector);
  const zone = document.querySelector(zoneSelector);
  if (!section || !zone) return;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
    opacity: 1;
  `;
  zone.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let strokePoints = [];    // last few SMOOTHED points of the current stroke (need 3 to draw a curve)
  let smoothed = null;      // running smoothed {x, y}, updated every raw frame
  let fadeTimer = null;

  /**
   * Nudges the running smoothed point partway toward the new raw point,
   * instead of jumping straight to it. This is what turns a shaky,
   * vibrating line into a stable-looking stroke.
   */
  function smoothPoint(raw) {
    if (!smoothed) {
      smoothed = { x: raw.x, y: raw.y }; // first frame: nothing to smooth against yet
    } else {
      smoothed = {
        x: smoothed.x + (raw.x - smoothed.x) * SMOOTHING_ALPHA,
        y: smoothed.y + (raw.y - smoothed.y) * SMOOTHING_ALPHA,
      };
    }
    return smoothed;
  }

  function resizeCanvas() {
    const rect = zone.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  resizeCanvas();
  new ResizeObserver(resizeCanvas).observe(zone);

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.transition = "none";
    canvas.style.opacity = "1"; // reset instantly so the next attempt starts fresh
  }

  /**
   * Draws one smooth curve segment through the last 3 points, instead of a
   * straight line between just 2. Standard "smooth freehand drawing"
   * technique: connect the MIDPOINTS of consecutive points, using the
   * point between them as the curve's control point. This rounds every
   * joint instead of leaving a hard corner at each point, which is what
   * makes the stroke look like flowing handwriting instead of a dotted/
   * kinked path.
   */
  function drawSmoothSegment(p0, p1, p2) {
    const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
    const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 18;
    ctx.shadowColor = GLOW_COLOR;
    ctx.strokeStyle = STROKE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(mid1.x, mid1.y);
    ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y); // p1 pulls the curve toward itself
    ctx.stroke();
    ctx.restore();
  }

  visionEngine.addEventListener("hand:point", (e) => {
    if (!section.classList.contains("active")) return;

    // if a fade was scheduled/in progress, cancel it — they're still writing
    clearTimeout(fadeTimer);
    canvas.style.transition = "none";
    canvas.style.opacity = "1";

    const raw = { x: e.detail.x * canvas.width, y: e.detail.y * canvas.height };
    const point = smoothPoint(raw); // smoothed, not the raw jittery position

    strokePoints.push(point);
    if (strokePoints.length > 3) strokePoints.shift(); // only need the last 3 to draw the next curve segment

    if (strokePoints.length === 3) {
      const [p0, p1, p2] = strokePoints;
      drawSmoothSegment(p0, p1, p2);
    }
  });

  visionEngine.addEventListener("hand:pointend", () => {
    strokePoints = []; // next point starts a brand new stroke, not connected to the old one
    smoothed = null;  // also reset the smoothing baseline, so the new stroke doesn't ease in from the old spot

    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => {
      canvas.style.transition = `opacity ${FADE_DURATION_MS}ms ease`;
      canvas.style.opacity = "0";
      setTimeout(clearCanvas, FADE_DURATION_MS);
    }, FADE_DELAY_MS);
  });

  // If the visitor navigates away mid-write, reset cleanly rather than
  // leaving a stale drawing for their next visit to this page.
  const observer = new MutationObserver(() => {
    if (!section.classList.contains("active")) {
      clearTimeout(fadeTimer);
      strokePoints = [];
      smoothed = null;
      clearCanvas();
    }
  });
  observer.observe(section, { attributes: true, attributeFilter: ["class"] });
}