// /**
//  * libraryCompletionSparkle.js
//  * Once all 6 Library photos are revealed, blinking while still on that
//  * page fires a sparkle burst — visually identical to the Playlist page's
//  * particles (.particle / .particle-heart + sparkleRise / sparkleRiseHeart
//  * keyframes from playlist.css, loaded globally).
//  *
//  * Self-contained: creates its own full-viewport overlay div at runtime
//  * instead of touching #library-particles-container, so library.css and
//  * library.js stay completely untouched — this only reuses the keyframe
//  * classes that already exist globally from playlist.css.
//  *
//  * Doesn't touch library.js's internal revealedCount — just checks the same
//  * "all revealed" signal library.js already exposes in the DOM:
//  * #library-continue gets a "visible" class once the last photo is shown.
//  */
// import visionEngine from "./visionEngine.js";

// const BURST_DURATION_MS = 2000;
// const SPAWN_INTERVAL_MS = 180;
// const COOLDOWN_MS = 1200; // don't let rapid blinks stack multiple bursts

// let overlay = null;

// function getOverlay() {
//   if (overlay) return overlay;
//   overlay = document.createElement("div");
//   overlay.id = "library-completion-sparkle-overlay";
//   overlay.style.cssText = `
//     position: fixed;
//     inset: 0;
//     pointer-events: none;
//     overflow: visible;
//     z-index: 9999;
//   `;
//   document.body.appendChild(overlay);
//   return overlay;
// }

// export function initLibraryCompletionSparkle({
//   pageSelector = "#page-library",
//   continueSelector = "#library-continue",
// } = {}) {
      
//   let particleCounter = 0;
//   let lastBurstTime = 0;

//   visionEngine.addEventListener("face:blink", () => {
//     const page = document.querySelector(pageSelector);
//     if (!page || !page.classList.contains("active")) return; // only on Library

//     const continueWrapper = document.querySelector(continueSelector);
//     if (!continueWrapper || !continueWrapper.classList.contains("visible")) return; // only after all 6 revealed

//     const now = performance.now();
//     if (now - lastBurstTime < COOLDOWN_MS) return;
//     lastBurstTime = now;

//     burst();
//   });

//   visionEngine.start();

//   function burst() {
//     const container = getOverlay();
//     let elapsed = 0;
//     const spawnWave = () => {
//       spawnParticle(container);
//       spawnParticle(container);
//       elapsed += SPAWN_INTERVAL_MS;
//       if (elapsed < BURST_DURATION_MS) {
//         setTimeout(spawnWave, SPAWN_INTERVAL_MS);
//       }
//     };
//     spawnWave();
//   }

//   function spawnParticle(container) {
//     particleCounter++;
//     const particle = document.createElement("div");
//     const isHeart = particleCounter % 4 === 0;

//     if (isHeart) {
//       particle.classList.add("particle-heart");
//       particle.textContent = "♥";
//       const size = 12 + Math.random() * 14; // 12–26px, same as Playlist's hearts
//       particle.style.fontSize = `${size}px`;
//     } else {
//       particle.classList.add("particle");
//       const sizeRoll = particleCounter % 3;
//       const size = sizeRoll === 0 ? 4 + Math.random() * 2
//                  : sizeRoll === 1 ? 7 + Math.random() * 3
//                  : 11 + Math.random() * 4;
//       particle.style.width = `${size}px`;
//       particle.style.height = `${size}px`;
//     }

//     particle.style.left = `${Math.random() * 100}%`;
//     particle.style.bottom = "0";
//     particle.style.animationDelay = `${Math.random() * 0.4}s`;
//     particle.style.animationDuration = `${5 + Math.random() * 3}s`;

//     container.appendChild(particle);
//     setTimeout(() => particle.remove(), 8500);
//   }
// }

/**
 * libraryCompletionSparkle.js
 * Once all 6 Library photos are revealed, blinking while still on that
 * page fires a sparkle burst — visually identical to the Playlist page's
 * particles (.particle / .particle-heart + sparkleRise / sparkleRiseHeart
 * keyframes from playlist.css, loaded globally).
 *
 * IMPORTANT: playlist.css scopes those rules as descendant selectors —
 * ".playlist-particles-container .particle" / ".particle-heart" — so the
 * pink color, glow, position:absolute, and rise animation ONLY apply
 * when the particle divs sit inside an element with that exact class.
 * The overlay below is given that class for that reason; without it,
 * particles fall back to unstyled static divs (default text color,
 * no positioning), which is what produced the white vertical trail.
 *
 * Self-contained: creates its own full-viewport overlay div at runtime
 * instead of touching #library-particles-container, so library.css and
 * library.js stay completely untouched.
 *
 * Doesn't touch library.js's internal revealedCount — just checks the same
 * "all revealed" signal library.js already exposes in the DOM:
 * #library-continue gets a "visible" class once the last photo is shown.
 */
// import visionEngine from "./visionEngine.js";

// const BURST_DURATION_MS = 2000;
// const SPAWN_INTERVAL_MS = 180;
// const COOLDOWN_MS = 1200; // don't let rapid blinks stack multiple bursts

// let overlay = null;

// function getOverlay() {
//   if (overlay) return overlay;
//   overlay = document.createElement("div");
//   overlay.id = "library-completion-sparkle-overlay";
//   // Must carry this exact class — see note above. Inline styles below
//   // override the class's own position/z-index/overflow defaults so this
//   // specific overlay still behaves as a full-viewport top layer.
//   overlay.className = "playlist-particles-container";
//   overlay.style.cssText = `
//     position: fixed;
//     inset: 0;
//     pointer-events: none;
//     overflow: visible;
//     z-index: 9999;
//   `;
//   document.body.appendChild(overlay);
//   return overlay;
// }

// export function initLibraryCompletionSparkle({
//   pageSelector = "#page-library",
//   continueSelector = "#library-continue",
// } = {}) {
//   let particleCounter = 0;
//   let lastBurstTime = 0;

//   visionEngine.addEventListener("face:blink", () => {
//     const page = document.querySelector(pageSelector);
//     if (!page || !page.classList.contains("active")) return; // only on Library

//     const continueWrapper = document.querySelector(continueSelector);
//     if (!continueWrapper || !continueWrapper.classList.contains("visible")) return; // only after all 6 revealed

//     const now = performance.now();
//     if (now - lastBurstTime < COOLDOWN_MS) return;
//     lastBurstTime = now;

//     burst();
//   });

//   visionEngine.start();

//   function burst() {
//     const container = getOverlay();
//     let elapsed = 0;
//     const spawnWave = () => {
//       spawnParticle(container);
//       spawnParticle(container);
//       elapsed += SPAWN_INTERVAL_MS;
//       if (elapsed < BURST_DURATION_MS) {
//         setTimeout(spawnWave, SPAWN_INTERVAL_MS);
//       }
//     };
//     spawnWave();
//   }

//   function spawnParticle(container) {
//     particleCounter++;
//     const particle = document.createElement("div");
//     const isHeart = particleCounter % 4 === 0;

//     if (isHeart) {
//       particle.classList.add("particle-heart");
//       particle.textContent = "♥";
//       const size = 12 + Math.random() * 14; // 12–26px, same as Playlist's hearts
//       particle.style.fontSize = `${size}px`;
//     } else {
//       particle.classList.add("particle");
//       const sizeRoll = particleCounter % 3;
//       const size = sizeRoll === 0 ? 4 + Math.random() * 2   // small: 4–6px
//                  : sizeRoll === 1 ? 7 + Math.random() * 3   // medium: 7–10px
//                  : 11 + Math.random() * 4;                  // big: 11–15px
//       particle.style.width = `${size}px`;
//       particle.style.height = `${size}px`;
//     }

//     particle.style.left = `${Math.random() * 100}%`;
//     particle.style.bottom = "0";
//     particle.style.animationDelay = `${Math.random() * 0.4}s`;
//     particle.style.animationDuration = `${5 + Math.random() * 3}s`;

//     container.appendChild(particle);
//     setTimeout(() => particle.remove(), 8500);
//   }
// }


/**
 * libraryCompletionSparkle.js
 * Once all 6 Library photos are revealed, blinking while still on that
 * page fires a sparkle burst — visually identical to the Playlist page's
 * particles (.particle / .particle-heart + sparkleRise / sparkleRiseHeart
 * keyframes from playlist.css, loaded globally).
 *
 * IMPORTANT: playlist.css scopes those rules as descendant selectors —
 * ".playlist-particles-container .particle" / ".particle-heart" — so the
 * pink color, glow, position:absolute, and rise animation ONLY apply
 * when the particle divs sit inside an element with that exact class.
 * The overlay below is given that class for that reason — without it,
 * particles fall back to unstyled static divs (default text color, no
 * positioning), which is what produced the white vertical trail.
 *
 * Self-contained: creates its own full-viewport overlay div at runtime
 * instead of touching #library-particles-container, so library.css and
 * library.js stay completely untouched — this only reuses the keyframe
 * classes that already exist globally from playlist.css.
 *
 * Doesn't touch library.js's internal revealedCount — just checks the same
 * "all revealed" signal library.js already exposes in the DOM:
 * #library-continue gets a "visible" class once the last photo is shown.
 */
// import visionEngine from "./visionEngine.js";

// const BURST_DURATION_MS = 2000;
// const SPAWN_INTERVAL_MS = 180;
// const COOLDOWN_MS = 1200; // don't let rapid blinks stack multiple bursts

// let overlay = null;

// function getOverlay() {
//   if (overlay) return overlay;
//   overlay = document.createElement("div");
//   overlay.id = "library-completion-sparkle-overlay";
//   // Required — see file header note. Without this exact class, playlist.css's
//   // scoped .particle/.particle-heart rules never match.
//   overlay.className = "playlist-particles-container";
//   overlay.style.cssText = `
//     position: fixed;
//     inset: 0;
//     pointer-events: none;
//     overflow: visible;
//     z-index: 9999;
//   `;
//   document.body.appendChild(overlay);
//   return overlay;
// }

// export function initLibraryCompletionSparkle({
//   pageSelector = "#page-library",
//   continueSelector = "#library-continue",
// } = {}) {

//   let particleCounter = 0;
//   let lastBurstTime = 0;

//   visionEngine.addEventListener("face:blink", () => {
//     const page = document.querySelector(pageSelector);
//     if (!page || !page.classList.contains("active")) return; // only on Library

//     const continueWrapper = document.querySelector(continueSelector);
//     if (!continueWrapper || !continueWrapper.classList.contains("visible")) return; // only after all 6 revealed

//     const now = performance.now();
//     if (now - lastBurstTime < COOLDOWN_MS) return;
//     lastBurstTime = now;

//     burst();
//   });

//   visionEngine.start();

//   function burst() {
//     const container = getOverlay();
//     let elapsed = 0;
//     const spawnWave = () => {
//       spawnParticle(container);
//       spawnParticle(container);
//       elapsed += SPAWN_INTERVAL_MS;
//       if (elapsed < BURST_DURATION_MS) {
//         setTimeout(spawnWave, SPAWN_INTERVAL_MS);
//       }
//     };
//     spawnWave();
//   }

//   function spawnParticle(container) {
//     particleCounter++;
//     const particle = document.createElement("div");
//     const isHeart = particleCounter % 4 === 0;

//     if (isHeart) {
//       particle.classList.add("particle-heart");
//       particle.textContent = "♥";
//       const size = 12 + Math.random() * 14; // 12–26px, same as Playlist's hearts
//       particle.style.fontSize = `${size}px`;
//     } else {
//       particle.classList.add("particle");
//       const sizeRoll = particleCounter % 3;
//       const size = sizeRoll === 0 ? 4 + Math.random() * 2
//                  : sizeRoll === 1 ? 7 + Math.random() * 3
//                  : 11 + Math.random() * 4;
//       particle.style.width = `${size}px`;
//       particle.style.height = `${size}px`;
//     }

//     particle.style.left = `${Math.random() * 100}%`;
//     particle.style.bottom = "0";
//     particle.style.animationDelay = `${Math.random() * 0.4}s`;
//     particle.style.animationDuration = `${5 + Math.random() * 3}s`;

//     container.appendChild(particle);
//     setTimeout(() => particle.remove(), 8500);
//   }
// }



/**
 * libraryCompletionSparkle.js
 * Once all 6 Library photos are revealed, blinking while still on that
 * page fires a sparkle burst — round dots only (no hearts), tinted by
 * the site's time-of-day palette (--particle-tint, set by
 * TimeOfDayController in theme.js: lavender at night, warm gold in
 * evening, etc). This is intentionally a DIFFERENT visual style from
 * the heart-gesture page's pink Playlist-style burst — the two are not
 * meant to look identical.
 *
 * Fully self-contained: injects its own <style> block and creates its
 * own full-viewport overlay div at runtime, appended directly to
 * <body>. Does NOT depend on playlist.css's .particle/.particle-heart
 * classes at all — that dependency was the source of the earlier white
 * heart trail bug (those rules only apply inside an element carrying
 * the exact class ".playlist-particles-container", which is fragile to
 * depend on from another file). Owning the styling here means it can
 * never break that way again.
 *
 * Doesn't touch library.css or library.js — just checks the same "all
 * revealed" signal library.js already exposes in the DOM:
 * #library-continue gets a "visible" class once the last photo is shown.
 */
import visionEngine from "./visionEngine.js";

const BURST_DURATION_MS = 2000;
const SPAWN_INTERVAL_MS = 180;
const COOLDOWN_MS = 1200; // don't let rapid blinks stack multiple bursts
const RISE_DISTANCE_PX = 220;

let overlay = null;

function injectStylesOnce() {
  if (document.getElementById("library-completion-sparkle-styles")) return;
  const style = document.createElement("style");
  style.id = "library-completion-sparkle-styles";
  style.textContent = `
    .library-completion-dot {
      position: absolute;
      bottom: 0;
      border-radius: 50%;
      background: radial-gradient(circle, #fff 0%, var(--particle-tint, var(--color-primary)) 55%, transparent 100%);
      box-shadow: 0 0 10px var(--particle-tint, var(--color-primary)), 0 0 4px rgba(255, 255, 255, 0.8);
      opacity: 0;
      animation: libraryCompletionDotRise ease-out forwards;
    }

    @keyframes libraryCompletionDotRise {
      0%   { opacity: 0; transform: translateY(0) scale(0.4); }
      10%  { opacity: 1; }
      70%  { opacity: 0.9; }
      100% { opacity: 0; transform: translateY(-${RISE_DISTANCE_PX}px) scale(1); }
    }
  `;
  document.head.appendChild(style);
}

function getOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.id = "library-completion-sparkle-overlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 9999;
  `;
  document.body.appendChild(overlay);
  return overlay;
}

export function initLibraryCompletionSparkle({
  pageSelector = "#page-library",
  continueSelector = "#library-continue",
} = {}) {
  let lastBurstTime = 0;

  injectStylesOnce();

  visionEngine.addEventListener("face:blink", () => {
    const page = document.querySelector(pageSelector);
    if (!page || !page.classList.contains("active")) return; // only on Library

    const continueWrapper = document.querySelector(continueSelector);
    if (!continueWrapper || !continueWrapper.classList.contains("visible")) return; // only after all 6 revealed

    const now = performance.now();
    if (now - lastBurstTime < COOLDOWN_MS) return;
    lastBurstTime = now;

    burst();
  });

  visionEngine.start();

  function burst() {
    const container = getOverlay();
    let elapsed = 0;
    const spawnWave = () => {
      spawnParticle(container);
      spawnParticle(container);
      elapsed += SPAWN_INTERVAL_MS;
      if (elapsed < BURST_DURATION_MS) {
        setTimeout(spawnWave, SPAWN_INTERVAL_MS);
      }
    };
    spawnWave();
  }

  function spawnParticle(container) {
    const particle = document.createElement("div");
    particle.classList.add("library-completion-dot");

    const size = 4 + Math.random() * 11; // 4–15px, matches Playlist's dot size range
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 0.4}s`;
    particle.style.animationDuration = `${5 + Math.random() * 3}s`;

    container.appendChild(particle);
    setTimeout(() => particle.remove(), 8500);
  }
}