/**
 * proximityGlow.js
 * The closer your face gets to the camera, the warmer/brighter the glow.
 * Fades back to a calm resting state the moment no face is visible, so it
 * never gets stuck mid-glow if you lean away or step out of frame.
 *
 * Expected element:
 *   <div class="proximity-glow"></div>
 * styled with something like:
 *   .proximity-glow {
 *     opacity: calc(0.25 + var(--proximity, 0) * 0.5);
 *     filter: brightness(calc(1 + var(--proximity, 0) * 0.3))
 *             saturate(calc(1 + var(--proximity, 0) * 0.4));
 *   }
 */
import visionEngine from "./visionEngine.js";

const SMOOTHING = 0.08; // higher = snappier response, lower = calmer/slower

export function initProximityGlow(selector = ".proximity-glow") {
  const el = document.querySelector(selector);
  if (!el) return;

  let current = 0;
  let target = 0;

  visionEngine.addEventListener("face:proximity", (e) => {
    target = e.detail.value;
  });

  visionEngine.addEventListener("face:lost", () => {
    target = 0;
  });

  function frame() {
    current += (target - current) * SMOOTHING;
    el.style.setProperty("--proximity", current.toFixed(3));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  visionEngine.start();
}