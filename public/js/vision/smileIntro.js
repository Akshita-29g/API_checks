/**
 * smileIntro.js
 * A true frosted-glass effect over the entire page — everything (navbar,
 * bottle, background) stays visible right through it, just blurred, like
 * looking through a fogged-up window. The overlay shows a short set of
 * instructions for the experience ahead. Smiling gradually clears the
 * blur until the page is sharp again.
 *
 * Self-contained: one fixed, full-viewport overlay appended to <body>,
 * above everything. Blocks clicks until it clears.
 *
 * Reveals once per session — navigating between pages afterward won't
 * bring the fog back.
 */
import visionEngine from "./visionEngine.js";

const FADE_DURATION_MS = 2200;

export function initSmileIntro() {
  let revealed = false;

  const overlay = document.createElement("div");
  overlay.className = "smile-intro-fog";
  overlay.innerHTML = `
    <div class="smile-intro-card">
      <p class="smile-intro-title">Steps that you should follow :</p>
      <ol class="smile-intro-steps">
        <li>Before clicking the bottle shown, Blink Twice.</li>
        <li>Continue to next page, before clicking anywhere Blink once.</li>
        <li>Rest instructions you'll get later on.</li>
        <li>You should find your way to start as there's no continue button hehe!</li>
      </ol>
      <p class="smile-intro-hint">(HINT: Your smile matters to me, without your "Smile" it's waste.)</p>
    </div>
  `;
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    opacity: 1;
    pointer-events: auto;
    transition: backdrop-filter ${FADE_DURATION_MS}ms ease,
                -webkit-backdrop-filter ${FADE_DURATION_MS}ms ease,
                opacity ${FADE_DURATION_MS}ms ease 400ms;
  `;

  const card = overlay.querySelector(".smile-intro-card");
  card.style.cssText = `
    max-width: 480px;
    padding: var(--space-2xl, 2.5rem) var(--space-xl, 2rem);
    text-align: center;
    background: var(--glass-bg, rgba(20, 10, 30, 0.35));
    border: var(--glass-border, 1px solid rgba(255,255,255,0.1));
    border-radius: var(--radius-lg, 16px);
    box-shadow: var(--glass-shadow, 0 8px 32px rgba(0,0,0,0.3));
  `;

  const title = overlay.querySelector(".smile-intro-title");
  title.style.cssText = `
    font-family: var(--font-heading, serif);
    font-size: 1.15rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: var(--color-text-heading, #fff0f5);
    margin: 0 0 1.2rem 0;
  `;

  const steps = overlay.querySelector(".smile-intro-steps");
  steps.style.cssText = `
    list-style: none;
    counter-reset: step;
    padding: 0;
    margin: 0 0 1.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  `;

  overlay.querySelectorAll(".smile-intro-steps li").forEach((li, i) => {
    li.style.cssText = `
      font-family: var(--font-body, sans-serif);
      font-size: 1rem;
      line-height: 1.5;
      color: var(--color-text-primary, #f5f0ff);
      position: relative;
      padding-left: 2rem;
    `;
    const num = document.createElement("span");
    num.textContent = `${i + 1}.`;
    num.style.cssText = `
      position: absolute;
      left: 0;
      color: var(--color-primary-soft, #ff8fab);
      font-weight: 600;
    `;
    li.prepend(num);
  });

  const hint = overlay.querySelector(".smile-intro-hint");
  hint.style.cssText = `
    font-family: var(--font-heading, serif);
    font-style: italic;
    font-size: 0.95rem;
    color: var(--color-text-secondary, rgba(245, 240, 255, 0.75));
    opacity: 0.9;
    animation: smileIntroPulse 2.4s ease-in-out infinite;
  `;

  if (!document.getElementById("smile-intro-style")) {
    const style = document.createElement("style");
    style.id = "smile-intro-style";
    style.textContent = `
      @keyframes smileIntroPulse {
        0%, 100% { opacity: 0.6; }
        50%      { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);

  visionEngine.addEventListener("face:smile", reveal);
  visionEngine.start();

  function reveal() {
    if (revealed) return;
    revealed = true;

    overlay.style.backdropFilter = "blur(0px)";
    overlay.style.webkitBackdropFilter = "blur(0px)";
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none"; // let clicks through everywhere immediately

    setTimeout(() => overlay.remove(), FADE_DURATION_MS + 600);
  }
}