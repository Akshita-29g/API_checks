
// /**
//  * heartGestureStage.js
//  * Dedicated page: form a heart with both hands, or lean two faces into
//  * frame together — either one unlocks a hidden message and fires a
//  * sparkle burst across the background. The burst reuses the PLAYLIST
//  * page's exact particle system (.particle / .particle-heart classes +
//  * sparkleRise / sparkleRiseHeart keyframes from playlist.css, loaded
//  * globally) — same mixed round/heart shapes, same random sizes, rising
//  * from the bottom of the screen and fading, as seen when a song plays.
//  *
//  * Background retints toward the detected eye color. Outfit gradient
//  * reuses outfitColorPalette.js (already running globally) — nothing
//  * extra needed for that here.
//  *
//  * Eye-color sampling only runs while this page is visible — a
//  * MutationObserver watches the section's "active" class and toggles it,
//  * so no changes to app.js are needed.
//  */
// import visionEngine from "./visionEngine.js";
// import { initAirWriting } from "./airWriting.js";   // ← add this line

// const BURST_DURATION_MS = 2400;
// const SPAWN_INTERVAL_MS = 150;

// export function initHeartGestureStage({
//   sectionSelector = "#page-heart-gesture",
//   burstZoneSelector = "#heart-burst-zone",
//   hiddenMessageSelector = "#heart-hidden-message",
//   continueSelector = "#btn-heart-continue",
// } = {}) {
//   const section = document.querySelector(sectionSelector);
//   if (!section) return;

//   let unlocked = false;
//   let particleCounter = 0;

//   function unlock() {
//     if (unlocked) return;
//     unlocked = true;
//     document.querySelector(hiddenMessageSelector)?.classList.add("revealed");
//     burst(burstZoneSelector);
//   }

//   visionEngine.addEventListener("hand:heart", unlock);
//   visionEngine.addEventListener("face:together", unlock);

//   visionEngine.addEventListener("face:eyecolor", (e) => {
//     section.style.setProperty("--eye-tint", e.detail.hex);
//   });

//   document.querySelector(continueSelector)?.addEventListener("click", () => {
//     App.navigateTo("contact");
//   });

//   const observer = new MutationObserver(() => {
//     if (section.classList.contains("active")) {
//       visionEngine.enableEyeColorSampling();
//     } else {
//       visionEngine.disableEyeColorSampling();
//       // reset so the next visit gets a fresh reveal instead of showing it pre-unlocked
//       unlocked = false;
//       document.querySelector(hiddenMessageSelector)?.classList.remove("revealed");
//     }
//   });
//   observer.observe(section, { attributes: true, attributeFilter: ["class"] });

//   visionEngine.start();
//    initAirWriting({ sectionSelector, zoneSelector: "#air-writing-zone" });

//   function burst(zoneSelector) {
//     const zone = document.querySelector(zoneSelector) || document.body;
//     let elapsed = 0;
//     const spawnWave = () => {
//       spawnParticle(zone);
//       spawnParticle(zone);
//       elapsed += SPAWN_INTERVAL_MS;
//       if (elapsed < BURST_DURATION_MS) {
//         setTimeout(spawnWave, SPAWN_INTERVAL_MS);
//       }
//     };
//     spawnWave();
//   }

//   function spawnParticle(zone) {
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

//     zone.appendChild(particle);
//     setTimeout(() => particle.remove(), 8500);
//   }
// }

// OUTFIT COLOR + SPARKLES ON EVERY HEART 
/**
 * heartGestureStage.js
 * Dedicated page: form a heart with both hands, or lean two faces into
 * frame together — either one fires a sparkle burst across the background
 * EVERY time it's detected (not just the first time). The hidden message
 * reveals once, on the first successful gesture, and then stays revealed.
 *
 * The burst reuses the PLAYLIST page's exact particle system
 * (.particle / .particle-heart classes + sparkleRise / sparkleRiseHeart
 * keyframes from playlist.css, loaded globally) — same mixed round/heart
 * shapes, same random sizes, rising from the bottom of the screen and
 * fading, as seen when a song plays.
 *
 * Background retints toward the detected eye color. Outfit gradient
 * reuses outfitColorPalette.js (already running globally) — nothing extra
 * needed for that here. The outfit color compliment message
 * (outfitColorLabel.js) is initialized here too, since this is the page
 * that displays it.
 *
 * Eye-color sampling only runs while this page is visible — a
 * MutationObserver watches the section's "active" class and toggles it,
 * so no changes to app.js are needed.
 */

// OUTFIT COLOR + SPARKLES ON EVERY HEART 
// import visionEngine from "./visionEngine.js";
// import { initAirWriting } from "./airWriting.js";
// import { initOutfitColorLabel } from "./outfitColorLabel.js";

// const BURST_DURATION_MS = 2400;
// const SPAWN_INTERVAL_MS = 150;

// // How long to wait after one burst before another can fire. Needed because
// // hand:heart / face:together fire on EVERY frame the gesture is held, not
// // just once — without a cooldown, holding the pose for 2 seconds would
// // spawn dozens of overlapping bursts instead of one clean one.
// const BURST_COOLDOWN_MS = 3000;

// export function initHeartGestureStage({
//   sectionSelector = "#page-heart-gesture",
//   burstZoneSelector = "#heart-burst-zone",
//   hiddenMessageSelector = "#heart-hidden-message",
//   continueSelector = "#btn-heart-continue",
// } = {}) {
//   const section = document.querySelector(sectionSelector);
//   if (!section) return;

//   let messageRevealed = false; // reveal the hidden message only once
//   let lastBurstTime = 0;       // cooldown tracker, so a held gesture doesn't spam bursts
//   let particleCounter = 0;

//   function triggerHeartMoment() {
//     // Reveal the message the first time only — it stays revealed after.
//     if (!messageRevealed) {
//       messageRevealed = true;
//       document.querySelector(hiddenMessageSelector)?.classList.add("revealed");
//     }

//     // Sparkles burst EVERY time the gesture is repeated — just gated by a
//     // cooldown so one held pose doesn't fire 20 overlapping bursts.
//     const now = performance.now();
//     if (now - lastBurstTime < BURST_COOLDOWN_MS) return;
//     lastBurstTime = now;
//     burst(burstZoneSelector);
//   }

//   visionEngine.addEventListener("hand:heart", triggerHeartMoment);
//   visionEngine.addEventListener("face:together", triggerHeartMoment);

//   visionEngine.addEventListener("face:eyecolor", (e) => {
//     section.style.setProperty("--eye-tint", e.detail.hex);
//   });

//   document.querySelector(continueSelector)?.addEventListener("click", () => {
//     App.navigateTo("contact");
//   });

//   const observer = new MutationObserver(() => {
//     if (section.classList.contains("active")) {
//       visionEngine.enableEyeColorSampling();
//     } else {
//       visionEngine.disableEyeColorSampling();
//       // reset so the next visit gets a fresh reveal instead of showing it pre-unlocked
//       messageRevealed = false;
//       lastBurstTime = 0;
//       document.querySelector(hiddenMessageSelector)?.classList.remove("revealed");
//     }
//   });
//   observer.observe(section, { attributes: true, attributeFilter: ["class"] });

//   visionEngine.start();

//   initAirWriting({ sectionSelector, zoneSelector: "#air-writing-zone" });
//   initOutfitColorLabel({ labelSelector: "#outfit-color-label" });

//   function burst(zoneSelector) {
//     const zone = document.querySelector(zoneSelector) || document.body;
//     let elapsed = 0;
//     const spawnWave = () => {
//       spawnParticle(zone);
//       spawnParticle(zone);
//       elapsed += SPAWN_INTERVAL_MS;
//       if (elapsed < BURST_DURATION_MS) {
//         setTimeout(spawnWave, SPAWN_INTERVAL_MS);
//       }
//     };
//     spawnWave();
//   }

//   function spawnParticle(zone) {
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

//     zone.appendChild(particle);
//     setTimeout(() => particle.remove(), 8500);
//   }
// }

// /**
//  * heartGestureStage.js
//  * Dedicated page: form a heart with both hands, or lean two faces into
//  * frame together — either one fires a sparkle burst across the background
//  * EVERY time it's detected (not just the first time). The hidden message
//  * reveals once, on the first successful gesture, and then stays revealed.
//  *
//  * The burst reuses the PLAYLIST page's exact particle system
//  * (.particle / .particle-heart classes + sparkleRise / sparkleRiseHeart
//  * keyframes from playlist.css, loaded globally) — same mixed round/heart
//  * shapes, same random sizes, rising from the bottom of the screen and
//  * fading, as seen when a song plays.
//  *
//  * Background retints toward the detected eye color. Outfit gradient
//  * reuses outfitColorPalette.js (already running globally) — nothing extra
//  * needed for that here. The outfit color compliment message
//  * (outfitColorLabel.js) is initialized here too, since this is the page
//  * that displays it.
//  *
//  * Eye-color sampling only runs while this page is visible — a
//  * MutationObserver watches the section's "active" class and toggles it,
//  * so no changes to app.js are needed.
//  */
// import visionEngine from "./visionEngine.js";
// import { initAirWriting } from "./airWriting.js";
// import { initOutfitColorLabel } from "./outfitColorLabel.js";

// const BURST_DURATION_MS = 2400;
// const SPAWN_INTERVAL_MS = 150;

// // How long to wait after one burst before another can fire. Needed because
// // hand:heart / face:together fire on EVERY frame the gesture is held, not
// // just once — without a cooldown, holding the pose for 2 seconds would
// // spawn dozens of overlapping bursts instead of one clean one.
// const BURST_COOLDOWN_MS = 3000;

// export function initHeartGestureStage({
//   sectionSelector = "#page-heart-gesture",
//   burstZoneSelector = "#heart-burst-zone",
//   hiddenMessageSelector = "#heart-hidden-message",
//   continueSelector = "#btn-heart-continue",
// } = {}) {
//   const section = document.querySelector(sectionSelector);
//   if (!section) return;

//   let messageRevealed = false; // reveal the hidden message only once
//   let lastBurstTime = 0;       // cooldown tracker, so a held gesture doesn't spam bursts
//   let particleCounter = 0;

//   function triggerHeartMoment() {
//     // Reveal the message the first time only — it stays revealed after.
//     if (!messageRevealed) {
//       messageRevealed = true;
//       document.querySelector(hiddenMessageSelector)?.classList.add("revealed");
//     }

//     // Sparkles burst EVERY time the gesture is repeated — just gated by a
//     // cooldown so one held pose doesn't fire 20 overlapping bursts.
//     const now = performance.now();
//     if (now - lastBurstTime < BURST_COOLDOWN_MS) return;
//     lastBurstTime = now;
//     burst(burstZoneSelector);
//   }

//   visionEngine.addEventListener("hand:heart", triggerHeartMoment);
//   visionEngine.addEventListener("face:together", triggerHeartMoment);

//   visionEngine.addEventListener("face:eyecolor", (e) => {
//     section.style.setProperty("--eye-tint", e.detail.hex);
//   });

//   document.querySelector(continueSelector)?.addEventListener("click", () => {
//     App.navigateTo("contact");
//   });

//   const observer = new MutationObserver(() => {
//     if (section.classList.contains("active")) {
//       visionEngine.enableEyeColorSampling();
//     } else {
//       visionEngine.disableEyeColorSampling();
//       // reset so the next visit gets a fresh reveal instead of showing it pre-unlocked
//       messageRevealed = false;
//       lastBurstTime = 0;
//       document.querySelector(hiddenMessageSelector)?.classList.remove("revealed");
//     }
//   });
//   observer.observe(section, { attributes: true, attributeFilter: ["class"] });

//   visionEngine.start();

//   initAirWriting({ sectionSelector, zoneSelector: "#air-writing-zone" });
//   initOutfitColorLabel();

//   function burst(zoneSelector) {
//     const zone = document.querySelector(zoneSelector) || document.body;
//     let elapsed = 0;
//     const spawnWave = () => {
//       spawnParticle(zone);
//       spawnParticle(zone);
//       elapsed += SPAWN_INTERVAL_MS;
//       if (elapsed < BURST_DURATION_MS) {
//         setTimeout(spawnWave, SPAWN_INTERVAL_MS);
//       }
//     };
//     spawnWave();
//   }

//   function spawnParticle(zone) {
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

//     zone.appendChild(particle);
//     setTimeout(() => particle.remove(), 8500);
//   }
// }

// heartGestureStage.js — the Continue button now has two stages, tracked by a continueClicked flag:

// First click → shows the floating popup (top of screen, glassmorphism pill, color swatch + "X suits you!"), and does not navigate away
// Second click → navigates to Contact, same as before

/**
 * heartGestureStage.js
 * Dedicated page: form a heart with both hands, or lean two faces into
 * frame together — either one fires a sparkle burst across the background
 * EVERY time it's detected (not just the first time). The hidden message
 * reveals once, on the first successful gesture, and then stays revealed.
 *
 * The burst reuses the PLAYLIST page's exact particle system
 * (.particle / .particle-heart classes + sparkleRise / sparkleRiseHeart
 * keyframes from playlist.css, loaded globally) — same mixed round/heart
 * shapes, same random sizes, rising from the bottom of the screen and
 * fading, as seen when a song plays.
 *
 * Background retints toward the detected eye color. Outfit gradient
 * reuses outfitColorPalette.js (already running globally) — nothing extra
 * needed for that here. The outfit color compliment message
 * (outfitColorLabel.js) is initialized here too, since this is the page
 * that displays it.
 *
 * Eye-color sampling only runs while this page is visible — a
 * MutationObserver watches the section's "active" class and toggles it,
 * so no changes to app.js are needed.
 */
// import visionEngine from "./visionEngine.js";
// import { initAirWriting } from "./airWriting.js";
// import { initOutfitColorLabel, showOutfitColorPopup } from "./outfitColorLabel.js";

// const BURST_DURATION_MS = 2400;
// const SPAWN_INTERVAL_MS = 150;

// // How long to wait after one burst before another can fire. Needed because
// // hand:heart / face:together fire on EVERY frame the gesture is held, not
// // just once — without a cooldown, holding the pose for 2 seconds would
// // spawn dozens of overlapping bursts instead of one clean one.
// const BURST_COOLDOWN_MS = 3000;

// export function initHeartGestureStage({
//   sectionSelector = "#page-heart-gesture",
//   burstZoneSelector = "#heart-burst-zone",
//   hiddenMessageSelector = "#heart-hidden-message",
//   continueSelector = "#btn-heart-continue",
// } = {}) {
//   const section = document.querySelector(sectionSelector);
//   if (!section) return;

//   let messageRevealed = false; // reveal the hidden message only once
//   let lastBurstTime = 0;       // cooldown tracker, so a held gesture doesn't spam bursts
//   let particleCounter = 0;
//   let continueClicked = false; // first Continue click reveals the outfit popup instead of navigating

//   function triggerHeartMoment() {
//     // Reveal the message the first time only — it stays revealed after.
//     if (!messageRevealed) {
//       messageRevealed = true;
//       document.querySelector(hiddenMessageSelector)?.classList.add("revealed");
//     }

//     // Sparkles burst EVERY time the gesture is repeated — just gated by a
//     // cooldown so one held pose doesn't fire 20 overlapping bursts.
//     const now = performance.now();
//     if (now - lastBurstTime < BURST_COOLDOWN_MS) return;
//     lastBurstTime = now;
//     burst(burstZoneSelector);
//   }

//   visionEngine.addEventListener("hand:heart", triggerHeartMoment);
//   visionEngine.addEventListener("face:together", triggerHeartMoment);

//   visionEngine.addEventListener("face:eyecolor", (e) => {
//     section.style.setProperty("--eye-tint", e.detail.hex);
//   });

//   document.querySelector(continueSelector)?.addEventListener("click", () => {
//     if (!continueClicked) {
//       continueClicked = true;
//       showOutfitColorPopup(); // first click: reveal the outfit-color popup, stay on this page
//       return;
//     }
//     App.navigateTo("contact"); // second click: actually move on
//   });

//   const observer = new MutationObserver(() => {
//     if (section.classList.contains("active")) {
//       visionEngine.enableEyeColorSampling();
//     } else {
//       visionEngine.disableEyeColorSampling();
//       // reset so the next visit gets a fresh reveal instead of showing it pre-unlocked
//       messageRevealed = false;
//       lastBurstTime = 0;
//       continueClicked = false;
//       document.querySelector(hiddenMessageSelector)?.classList.remove("revealed");
//     }
//   });
//   observer.observe(section, { attributes: true, attributeFilter: ["class"] });

//   visionEngine.start();

//   initAirWriting({ sectionSelector, zoneSelector: "#air-writing-zone" });
//   initOutfitColorLabel();

//   function burst(zoneSelector) {
//     const zone = document.querySelector(zoneSelector) || document.body;
//     let elapsed = 0;
//     const spawnWave = () => {
//       spawnParticle(zone);
//       spawnParticle(zone);
//       elapsed += SPAWN_INTERVAL_MS;
//       if (elapsed < BURST_DURATION_MS) {
//         setTimeout(spawnWave, SPAWN_INTERVAL_MS);
//       }
//     };
//     spawnWave();
//   }

//   function spawnParticle(zone) {
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

//     zone.appendChild(particle);
//     setTimeout(() => particle.remove(), 8500);
//   }
// }



// CORRECTED SPARKLES 

/**
 * heartGestureStage.js
 * Dedicated page: form a heart with both hands, or lean two faces into
 * frame together — either one fires a sparkle burst across the background
 * EVERY time it's detected (not just the first time). The hidden message
 * reveals once, on the first successful gesture, and then stays revealed.
 *
 * The burst reuses the PLAYLIST page's exact particle system
 * (.particle / .particle-heart classes + sparkleRise / sparkleRiseHeart
 * keyframes from playlist.css, loaded globally) — same mixed round/heart
 * shapes, same random sizes, rising from the bottom of the screen and
 * fading, as seen when a song plays. This is the SAME mechanism as
 * libraryCompletionSparkle.js on the Library page — both now create their
 * own overlay and append it directly to <body>, rather than depending on
 * any static element in index.html.
 *
 * IMPORTANT — two separate bugs, both now avoided:
 *  1. playlist.css scopes .particle/.particle-heart styling and the
 *     rise animations to ".playlist-particles-container .particle[-heart]"
 *     — so the overlay MUST carry that exact class, or particles render
 *     as unstyled plain text (this was the white-colored heart bug).
 *  2. .page-section gets GSAP transforms applied during page transitions
 *     (per app.js / PageTransitions). ANY transform on an ancestor creates
 *     a new containing block for position:fixed descendants, so a zone
 *     nested inside the page section would size/position itself relative
 *     to that (possibly off-screen, mid-transition) section instead of
 *     the real viewport — producing a narrow sliver of particles instead
 *     of a full-page burst. Appending straight to <body> avoids this
 *     entirely, since <body> is never transformed.
 *
 * If index.html still has a leftover static
 *   <div class="heart-burst-zone" id="heart-burst-zone"></div>
 * inside #page-heart-gesture, it is no longer used by this file at all —
 * it's safe (and recommended) to delete it from index.html.
 *
 * Background retints toward the detected eye color. Outfit gradient
 * reuses outfitColorPalette.js (already running globally) — nothing extra
 * needed for that here. The outfit color compliment message
 * (outfitColorLabel.js) is initialized here too, since this is the page
 * that displays it.
 *
 * Eye-color sampling only runs while this page is visible — a
 * MutationObserver watches the section's "active" class and toggles it,
 * so no changes to app.js are needed.
 */
// import visionEngine from "./visionEngine.js";
// import { initAirWriting } from "./airWriting.js";
// import { initOutfitColorLabel, showOutfitColorPopup } from "./outfitColorLabel.js";

// const BURST_DURATION_MS = 2400;
// const SPAWN_INTERVAL_MS = 150;

// // How long to wait after one burst before another can fire. Needed because
// // hand:heart / face:together fire on EVERY frame the gesture is held, not
// // just once — without a cooldown, holding the pose for 2 seconds would
// // spawn dozens of overlapping bursts instead of one clean one.
// const BURST_COOLDOWN_MS = 3000;

// let burstZoneEl = null;

// /**
//  * Always creates (once) a fresh overlay appended directly to <body> —
//  * never queries for or reuses any static element from index.html. This
//  * guarantees the zone is never nested inside a GSAP-transformed
//  * .page-section, and always carries the class playlist.css requires.
//  */
// function getBurstZone() {
//   if (burstZoneEl) return burstZoneEl;
//   burstZoneEl = document.createElement("div");
//   burstZoneEl.id = "heart-burst-zone";
//   burstZoneEl.className = "playlist-particles-container";
//   burstZoneEl.style.cssText = `
//     position: fixed;
//     inset: 0;
//     pointer-events: none;
//     overflow: hidden;
//     z-index: 9999;
//   `;
//   document.body.appendChild(burstZoneEl);
//   return burstZoneEl;
// }

// export function initHeartGestureStage({
//   sectionSelector = "#page-heart-gesture",
//   hiddenMessageSelector = "#heart-hidden-message",
//   continueSelector = "#btn-heart-continue",
// } = {}) {
//   const section = document.querySelector(sectionSelector);
//   if (!section) return;

//   let messageRevealed = false; // reveal the hidden message only once
//   let lastBurstTime = 0;       // cooldown tracker, so a held gesture doesn't spam bursts
//   let particleCounter = 0;
//   let continueClicked = false; // first Continue click reveals the outfit popup instead of navigating

//   function triggerHeartMoment() {
//     if (!section.classList.contains("active")) return; // only react while this page is showing

//     // Reveal the message the first time only — it stays revealed after.
//     if (!messageRevealed) {
//       messageRevealed = true;
//       document.querySelector(hiddenMessageSelector)?.classList.add("revealed");
//     }

//     // Sparkles burst EVERY time the gesture is repeated — just gated by a
//     // cooldown so one held pose doesn't fire 20 overlapping bursts.
//     const now = performance.now();
//     if (now - lastBurstTime < BURST_COOLDOWN_MS) return;
//     lastBurstTime = now;
//     burst();
//   }

//   visionEngine.addEventListener("hand:heart", triggerHeartMoment);
//   visionEngine.addEventListener("face:together", triggerHeartMoment);

//   visionEngine.addEventListener("face:eyecolor", (e) => {
//     if (!section.classList.contains("active")) return;
//     section.style.setProperty("--eye-tint", e.detail.hex);
//   });

//   document.querySelector(continueSelector)?.addEventListener("click", () => {
//     if (!continueClicked) {
//       continueClicked = true;
//       showOutfitColorPopup(); // first click: reveal the outfit-color popup, stay on this page
//       return;
//     }
//     App.navigateTo("contact"); // second click: actually move on
//   });

//   const observer = new MutationObserver(() => {
//     if (section.classList.contains("active")) {
//       visionEngine.enableEyeColorSampling();
//     } else {
//       visionEngine.disableEyeColorSampling();
//       // reset so the next visit gets a fresh reveal instead of showing it pre-unlocked
//       messageRevealed = false;
//       lastBurstTime = 0;
//       continueClicked = false;
//       document.querySelector(hiddenMessageSelector)?.classList.remove("revealed");
//     }
//   });
//   observer.observe(section, { attributes: true, attributeFilter: ["class"] });

//   visionEngine.start();

//   initAirWriting({ sectionSelector, zoneSelector: "#air-writing-zone" });
//   initOutfitColorLabel();

//   function burst() {
//     const zone = getBurstZone();
//     let elapsed = 0;
//     const spawnWave = () => {
//       spawnParticle(zone);
//       spawnParticle(zone);
//       elapsed += SPAWN_INTERVAL_MS;
//       if (elapsed < BURST_DURATION_MS) {
//         setTimeout(spawnWave, SPAWN_INTERVAL_MS);
//       }
//     };
//     spawnWave();
//   }

//   function spawnParticle(zone) {
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

//     zone.appendChild(particle);
//     setTimeout(() => particle.remove(), 8500);
//   }
// }


// Addition of image and then it changes when user forms a heart 
/**
 * heartGestureStage.js
 * Dedicated page: form a heart with both hands, or lean two faces into
 * frame together — either one fires a sparkle burst across the background
 * EVERY time it's detected (not just the first time). The hidden message
 * reveals once, on the first successful gesture, and then stays revealed.
 *
 * NEW: a small picture card (bottom-right) shows a shy/idle illustration
 * by default, and crossfades to a second "I love you sooo much" illustration
 * the first time a heart gesture is detected — riding on the exact same
 * "first successful gesture" moment that already reveals the hidden
 * message, so both happen together.
 *   Expects two image files at:
 *     /assets/heart-idle.png
 *     /assets/heart-revealed.png
 *
 * The burst reuses the PLAYLIST page's exact particle system
 * (.particle / .particle-heart classes + sparkleRise / sparkleRiseHeart
 * keyframes from playlist.css, loaded globally) — same mixed round/heart
 * shapes, same random sizes, rising from the bottom of the screen and
 * fading, as seen when a song plays. This is the SAME mechanism as
 * libraryCompletionSparkle.js on the Library page — both now create their
 * own overlay and append it directly to <body>, rather than depending on
 * any static element in index.html.
 *
 * IMPORTANT — two separate bugs, both now avoided:
 *  1. playlist.css scopes .particle/.particle-heart styling and the
 *     rise animations to ".playlist-particles-container .particle[-heart]"
 *     — so the overlay MUST carry that exact class, or particles render
 *     as unstyled plain text (this was the white-colored heart bug).
 *  2. .page-section gets GSAP transforms applied during page transitions
 *     (per app.js / PageTransitions). ANY transform on an ancestor creates
 *     a new containing block for position:fixed descendants, so a zone
 *     nested inside the page section would size/position itself relative
 *     to that (possibly off-screen, mid-transition) section instead of
 *     the real viewport — producing a narrow sliver of particles instead
 *     of a full-page burst. Appending straight to <body> avoids this
 *     entirely, since <body> is never transformed.
 *
 * If index.html still has a leftover static
 *   <div class="heart-burst-zone" id="heart-burst-zone"></div>
 * inside #page-heart-gesture, it is no longer used by this file at all —
 * it's safe (and recommended) to delete it from index.html.
 *
 * Background retints toward the detected eye color. Outfit gradient
 * reuses outfitColorPalette.js (already running globally) — nothing extra
 * needed for that here. The outfit color compliment message
 * (outfitColorLabel.js) is initialized here too, since this is the page
 * that displays it.
 *
 * Eye-color sampling only runs while this page is visible — a
 * MutationObserver watches the section's "active" class and toggles it,
 * so no changes to app.js are needed.
 */
import visionEngine from "./visionEngine.js";
import { initAirWriting } from "./airWriting.js";
import { initOutfitColorLabel, showOutfitColorPopup } from "./outfitColorLabel.js";

const BURST_DURATION_MS = 2400;
const SPAWN_INTERVAL_MS = 150;

// How long to wait after one burst before another can fire. Needed because
// hand:heart / face:together fire on EVERY frame the gesture is held, not
// just once — without a cooldown, holding the pose for 2 seconds would
// spawn dozens of overlapping bursts instead of one clean one.
const BURST_COOLDOWN_MS = 3000;

let burstZoneEl = null;

/**
 * Always creates (once) a fresh overlay appended directly to <body> —
 * never queries for or reuses any static element from index.html. This
 * guarantees the zone is never nested inside a GSAP-transformed
 * .page-section, and always carries the class playlist.css requires.
 */
function getBurstZone() {
  if (burstZoneEl) return burstZoneEl;
  burstZoneEl = document.createElement("div");
  burstZoneEl.id = "heart-burst-zone";
  burstZoneEl.className = "playlist-particles-container";
  burstZoneEl.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 9999;
  `;
  document.body.appendChild(burstZoneEl);
  return burstZoneEl;
}

// ── Idle / revealed picture (lives inside the card in index.html) ──
function injectHeartImageStylesOnce() {
  if (document.getElementById("heart-gesture-image-styles")) return;
  const style = document.createElement("style");
  style.id = "heart-gesture-image-styles";
  style.textContent = `
    .heart-gesture-image-wrapper {
      position: relative;
      width: 100%;
      max-width: 320px;
      aspect-ratio: 1 / 1;
      margin: 0 auto 24px auto;
      border-radius: var(--radius-lg, 16px);
      overflow: hidden;
      box-shadow: var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.25));
    }
    .heart-gesture-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .heart-gesture-image--idle {
      opacity: 1;
      transform: scale(1);
    }
    .heart-gesture-image--revealed {
      opacity: 0;
      transform: scale(1.05);
    }
    /* first successful heart gesture crossfades idle -> revealed */
    .heart-gesture-image-wrapper--revealed .heart-gesture-image--idle {
      opacity: 0;
      transform: scale(0.95);
    }
    .heart-gesture-image-wrapper--revealed .heart-gesture-image--revealed {
      opacity: 1;
      transform: scale(1);
    }
  `;
  document.head.appendChild(style);
}

export function initHeartGestureStage({
  sectionSelector = "#page-heart-gesture",
  hiddenMessageSelector = "#heart-hidden-message",
  continueSelector = "#btn-heart-continue",
  imageWrapperSelector = "#heart-gesture-image-wrapper",
} = {}) {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  injectHeartImageStylesOnce();
  const imageWrapper = document.querySelector(imageWrapperSelector);

  let messageRevealed = false; // reveal the hidden message (and swap the picture) only once
  let lastBurstTime = 0;       // cooldown tracker, so a held gesture doesn't spam bursts
  let particleCounter = 0;
  let continueClicked = false; // first Continue click reveals the outfit popup instead of navigating

  function triggerHeartMoment() {
    if (!section.classList.contains("active")) return; // only react while this page is showing

    // Reveal the message + crossfade the picture the first time only —
    // both stay in their "revealed" state after.
    if (!messageRevealed) {
      messageRevealed = true;
      document.querySelector(hiddenMessageSelector)?.classList.add("revealed");
      imageWrapper?.classList.add("heart-gesture-image-wrapper--revealed");
    }

    // Sparkles burst EVERY time the gesture is repeated — just gated by a
    // cooldown so one held pose doesn't fire 20 overlapping bursts.
    const now = performance.now();
    if (now - lastBurstTime < BURST_COOLDOWN_MS) return;
    lastBurstTime = now;
    burst();
  }

  visionEngine.addEventListener("hand:heart", triggerHeartMoment);
  visionEngine.addEventListener("face:together", triggerHeartMoment);

  visionEngine.addEventListener("face:eyecolor", (e) => {
    if (!section.classList.contains("active")) return;
    section.style.setProperty("--eye-tint", e.detail.hex);
  });

  document.querySelector(continueSelector)?.addEventListener("click", () => {
    if (!continueClicked) {
      continueClicked = true;
      showOutfitColorPopup(); // first click: reveal the outfit-color popup, stay on this page
      return;
    }
    App.navigateTo("contact"); // second click: actually move on
  });

  const observer = new MutationObserver(() => {
    if (section.classList.contains("active")) {
      visionEngine.enableEyeColorSampling();
    } else {
      visionEngine.disableEyeColorSampling();
      // reset so the next visit gets a fresh reveal instead of showing it pre-unlocked
      messageRevealed = false;
      lastBurstTime = 0;
      continueClicked = false;
      document.querySelector(hiddenMessageSelector)?.classList.remove("revealed");
      imageWrapper?.classList.remove("heart-gesture-image-wrapper--revealed");
    }
  });
  observer.observe(section, { attributes: true, attributeFilter: ["class"] });

  visionEngine.start();

  initAirWriting({ sectionSelector, zoneSelector: "#air-writing-zone" });
  initOutfitColorLabel();

  function burst() {
    const zone = getBurstZone();
    let elapsed = 0;
    const spawnWave = () => {
      spawnParticle(zone);
      spawnParticle(zone);
      elapsed += SPAWN_INTERVAL_MS;
      if (elapsed < BURST_DURATION_MS) {
        setTimeout(spawnWave, SPAWN_INTERVAL_MS);
      }
    };
    spawnWave();
  }

  function spawnParticle(zone) {
    particleCounter++;
    const particle = document.createElement("div");
    const isHeart = particleCounter % 4 === 0;

    if (isHeart) {
      particle.classList.add("particle-heart");
      particle.textContent = "♥";
      const size = 12 + Math.random() * 14; // 12–26px, same as Playlist's hearts
      particle.style.fontSize = `${size}px`;
    } else {
      particle.classList.add("particle");
      const sizeRoll = particleCounter % 3;
      const size = sizeRoll === 0 ? 4 + Math.random() * 2   // small: 4–6px
                 : sizeRoll === 1 ? 7 + Math.random() * 3   // medium: 7–10px
                 : 11 + Math.random() * 4;                  // big: 11–15px
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
    }

    particle.style.left = `${Math.random() * 100}%`;
    particle.style.bottom = "0";
    particle.style.animationDelay = `${Math.random() * 0.4}s`;
    particle.style.animationDuration = `${5 + Math.random() * 3}s`;

    zone.appendChild(particle);
    setTimeout(() => particle.remove(), 8500);
  }
}