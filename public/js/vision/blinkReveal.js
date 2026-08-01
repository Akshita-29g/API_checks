/**
 * blinkReveal.js
 * Library page: blink to reveal a photo, same as waveReveal.js but using
 * face:blink instead of hand:wave — a fallback for when wave detection
 * isn't picking up reliably.
 *
 * Same trick as waveReveal.js: simulates a real click on the grid, so
 * library.js's existing click handler (and its single revealedCount
 * counter) does the actual work. Wave and blink can never get out of
 * sync with each other because neither one tracks "which photo is next"
 * itself — library.js is the only source of truth for that.
 *
 * Only fires while the Library page is actually active, so blinking on
 * Home/FAQ/etc. won't accidentally trigger it.
 */
import visionEngine from "./visionEngine.js";

export function initBlinkReveal({
  pageSelector = "#page-library",
  targetSelector = "#library-grid",
} = {}) {
  visionEngine.addEventListener("face:blink", () => {
    const page = document.querySelector(pageSelector);
    if (!page || !page.classList.contains("active")) return; // only react on the Library page

    const target = document.querySelector(targetSelector) || page;
    target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    window.dispatchEvent(new CustomEvent("vision:blinkReveal"));
  });

  visionEngine.start();
}