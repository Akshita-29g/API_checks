/**
 * waveReveal.js
 * Library page: wave at the camera to reveal a photo instead of clicking.
 *
 * Doesn't duplicate library.js's reveal logic — it simulates a real click,
 * so whatever click handler library.js already has ("Click anywhere") just
 * runs normally. Only fires while the Library page is actually the active
 * page, so waving on Home/FAQ/etc. won't accidentally trigger it.
 */
import visionEngine from "./visionEngine.js";

export function initWaveReveal({
  pageSelector = "#page-library",
  targetSelector = "#library-grid",
} = {}) {
  visionEngine.addEventListener("hand:wave", () => {
    const page = document.querySelector(pageSelector);
    if (!page || !page.classList.contains("active")) return; // only react on the Library page

    const target = document.querySelector(targetSelector) || page;
    target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    window.dispatchEvent(new CustomEvent("vision:waveReveal"));
  });

  visionEngine.start();
}