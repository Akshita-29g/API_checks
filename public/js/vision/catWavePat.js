/**
 * catWavePat.js
 * Wave at the camera -> the cat reacts, same as a real pat.
 *
 * Doesn't duplicate cat.js's animation logic — it simulates a real click on
 * your existing #cat-container, so whatever pat reaction cat.js already
 * plays on click just runs normally. Also broadcasts "vision:catPat" on
 * window in case cat.js's real trigger is hover/mousedown instead of click
 * and you'd rather wire it there directly.
 */
import visionEngine from "./visionEngine.js";

export function initCatWavePat(targetSelector = "#cat-container") {
  visionEngine.addEventListener("hand:wave", () => {
    const cat = document.querySelector(targetSelector);
    if (cat) {
      cat.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    }
    window.dispatchEvent(new CustomEvent("vision:catPat"));
  });

  visionEngine.start();
}