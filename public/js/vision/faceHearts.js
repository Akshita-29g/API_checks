/**
 * faceHearts.js
 * Smile at the camera -> a burst of hearts floats up.
 *
 * Ships with its own small built-in burst so it works standalone right away.
 * If you'd rather feed this into your existing particle system instead of
 * the built-in one, listen for "vision:smile" on window anywhere in your
 * code and skip calling initFaceHearts()'s burst — the event fires either way.
 *
 * Expected element (hearts spawn from its center — put it wherever makes sense,
 * e.g. over the love-letter bottle on Home):
 *   <div id="heart-burst-origin"></div>
 */
import visionEngine from "./visionEngine.js";

const HEART_COUNT = 8;
const HEART_LIFETIME_MS = 1800;

export function initFaceHearts(originSelector = "#heart-burst-origin") {
  visionEngine.addEventListener("face:smile", (e) => {
    // lets any other part of the site react to a smile without importing this file
    window.dispatchEvent(new CustomEvent("vision:smile", { detail: e.detail }));
    burst(originSelector);
  });

  visionEngine.start();
}

function burst(originSelector) {
  const origin = document.querySelector(originSelector) || document.body;
  const rect = origin.getBoundingClientRect();

  for (let i = 0; i < HEART_COUNT; i++) {
    const heart = document.createElement("span");
    heart.textContent = "💗";
    heart.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      font-size: ${16 + Math.random() * 18}px;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      opacity: 0.95;
      transition: transform ${HEART_LIFETIME_MS}ms ease-out, opacity ${HEART_LIFETIME_MS}ms ease-out;
    `;
    document.body.appendChild(heart);

    const dx = (Math.random() - 0.5) * 160;
    const dy = -120 - Math.random() * 100;
    requestAnimationFrame(() => {
      heart.style.transform = `translate(${dx}px, ${dy}px) scale(${0.8 + Math.random() * 0.6})`;
      heart.style.opacity = "0";
    });

    setTimeout(() => heart.remove(), HEART_LIFETIME_MS + 100);
  }
}