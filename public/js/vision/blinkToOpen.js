/**
 * blinkToOpen.js
 * "Blink twice to open the bottle" — a playful alternative to tapping it.
 *
 * Counts completed blinks (from visionEngine's face:blink event) within a
 * short time window. On the 2nd blink, it simulates a real click on your
 * existing bottle element — so whatever click handler home.js already has
 * for opening the letter just runs normally. No duplicate open logic here.
 *
 * No new markup required — reuses your existing #bottle-wrapper.
 * Optionally pass a hintSelector to update the "tap to open" text live.
 */
import visionEngine from "./visionEngine.js";

const BLINK_WINDOW_MS = 1500; // both blinks must land within this window
const BLINKS_NEEDED = 2;

export function initBlinkToOpen({
  targetSelector = "#bottle-wrapper",
  hintSelector = ".bottle-hint",
} = {}) {
  let blinkTimes = [];
  const hint = document.querySelector(hintSelector);
  const originalHint = hint?.textContent;

  visionEngine.addEventListener("face:blink", () => {
    const now = performance.now();
    blinkTimes.push(now);
    blinkTimes = blinkTimes.filter((t) => now - t < BLINK_WINDOW_MS);

    if (blinkTimes.length === 1 && hint) {
      hint.textContent = "blink once more…";
    }

    if (blinkTimes.length >= BLINKS_NEEDED) {
      blinkTimes = [];
      if (hint && originalHint) hint.textContent = originalHint;
      triggerOpen(targetSelector);
    }
  });

  visionEngine.start();
}

function triggerOpen(targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  // also broadcast separately, in case you ever want to hook into this without a fake click
  window.dispatchEvent(new CustomEvent("vision:blinkOpen"));
}