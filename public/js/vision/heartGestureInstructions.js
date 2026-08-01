/**
 * heartGestureInstructions.js
 * A small "?" info button on the heart-gesture page that expands into a
 * checklist of everything this page responds to — including air-writing,
 * which has no other visual cue and is easy for a first-time visitor to
 * never discover on their own.
 *
 * Also handles two first-impression touches for this page:
 *  - A pointing arrow + "Tap here" hint toward the "?" button, shown
 *    briefly when the page first becomes active, so visitors actually
 *    notice the instructions exist instead of missing the button
 *    entirely. Disappears as soon as they click it, or after a timeout.
 *  - Ambient floating sparkle particles across the background, same
 *    visual language as Home's bottle-page particles, so this page
 *    doesn't feel bare compared to the rest of the site.
 *
 * Self-contained: creates its own floating button + panel + arrow hint +
 * particle layer, all appended to <body>. Only visible/interactive while
 * #page-heart-gesture is the active page — a MutationObserver toggles a
 * class that controls opacity and pointer-events, same pattern used
 * elsewhere (e.g. heartbeatMonitor.js).
 *
 * Purely informational/decorative — doesn't listen to any visionEngine
 * events itself, doesn't affect any other feature on the page.
 */

const ARROW_AUTO_HIDE_MS = 7000; // hide the hint arrow on its own if never clicked
const PARTICLE_COUNT = 30;

export function initHeartGestureInstructions({
  sectionSelector = "#page-heart-gesture",
} = {}) {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  injectStylesOnce();

  const widget = document.createElement("div");
  widget.className = "heart-instructions";
  widget.innerHTML = `
    <div class="heart-instructions-hint">
      <span class="heart-instructions-hint-arrow">↷</span>
      <span class="heart-instructions-hint-text">Tap this</span>
    </div>
    <button type="button" class="heart-instructions-toggle" aria-label="What can I do on this page?">?</button>
    <div class="heart-instructions-panel">
      <p class="heart-instructions-title">Just in case you're wondering :</p>
      <ul class="heart-instructions-list">
        <li><span class="heart-instructions-icon">🫶🏻</span> Form a heart shape with both hands</li>
        <li><span class="heart-instructions-icon">🫂</span> Lean in together with someone else</li>
        <li><span class="heart-instructions-icon">✍️</span> Point one finger and write in the air</li>
        <li><span class="heart-instructions-icon">❤️</span> Tap "See your heartbeat" (bottom-left) for your real pulse</li>
      </ul>
    </div>
  `;
  document.body.appendChild(widget);

  const toggle = widget.querySelector(".heart-instructions-toggle");
  const panel = widget.querySelector(".heart-instructions-panel");
  const hint = widget.querySelector(".heart-instructions-hint");

  let hintTimer = null;

  function dismissHint() {
    hint.classList.remove("heart-instructions-hint--visible");
    clearTimeout(hintTimer);
  }

  function showHint() {
    // small delay so it doesn't flash in during the page's own entrance
    // animation — feels calmer arriving a beat after the page settles
    setTimeout(() => {
      if (!section.classList.contains("active")) return; // left the page already
      hint.classList.add("heart-instructions-hint--visible");
      hintTimer = setTimeout(dismissHint, ARROW_AUTO_HIDE_MS);
    }, 600);
  }

  toggle.addEventListener("click", () => {
    widget.classList.toggle("heart-instructions--open");
    dismissHint(); // they found the button — no need to keep pointing at it
  });

  // Close if clicking anywhere outside the widget
  document.addEventListener("click", (e) => {
    if (!widget.contains(e.target)) {
      widget.classList.remove("heart-instructions--open");
    }
  });

  // ── Ambient background sparkles ──────────────────────────────
  const particleLayer = document.createElement("div");
  particleLayer.className = "heart-ambient-particles";
  document.body.appendChild(particleLayer);
  let particlesBuilt = false;

  function buildParticles() {
    if (particlesBuilt) return; // build once, CSS keyframes loop forever on their own
    particlesBuilt = true;

    const colors = [
      "rgba(255, 107, 157, 0.6)",
      "rgba(196, 167, 231, 0.5)",
      "rgba(255, 215, 0, 0.4)",
      "rgba(255, 143, 171, 0.5)",
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = document.createElement("div");
      particle.className = "heart-ambient-particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${20 + Math.random() * 70}%`;
      const size = 3 + Math.random() * 6;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDelay = `${Math.random() * 6}s`;
      particle.style.animationDuration = `${4 + Math.random() * 4}s`;
      particleLayer.appendChild(particle);
    }
  }

  const observer = new MutationObserver(() => {
    if (section.classList.contains("active")) {
      widget.classList.add("heart-instructions--visible");
      particleLayer.classList.add("heart-ambient-particles--visible");
      buildParticles();
      showHint();
    } else {
      widget.classList.remove("heart-instructions--visible");
      widget.classList.remove("heart-instructions--open");
      particleLayer.classList.remove("heart-ambient-particles--visible");
      dismissHint();
    }
  });
  observer.observe(section, { attributes: true, attributeFilter: ["class"] });

  // Set initial visibility in case this page is already active on load
  if (section.classList.contains("active")) {
    widget.classList.add("heart-instructions--visible");
    particleLayer.classList.add("heart-ambient-particles--visible");
    buildParticles();
    showHint();
  }
}

function injectStylesOnce() {
  if (document.getElementById("heart-instructions-styles")) return;
  const style = document.createElement("style");
  style.id = "heart-instructions-styles";
  style.textContent = `
    .heart-instructions {
      position: fixed;
      top: 90px;
      right: 24px;
      z-index: 9998;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .heart-instructions--visible {
      opacity: 1;
      pointer-events: auto;
    }

    .heart-instructions-toggle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: var(--glass-border, 1px solid rgba(255,255,255,0.15));
      background: var(--glass-bg, rgba(255,255,255,0.08));
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      color: var(--color-primary-soft, #ff8fab);
      font-family: var(--font-heading, serif);
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: var(--glass-shadow, 0 8px 32px rgba(0,0,0,0.3));
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .heart-instructions-toggle:hover {
      transform: scale(1.08);
      box-shadow: var(--shadow-glow, 0 0 20px rgba(255,107,157,0.3));
    }

    /* ── Pointing hint arrow ──────────────────────────────────── */
    .heart-instructions-hint {
      position: absolute;
      top: 6px;
      right: 52px;
      display: flex;
      align-items: center;
      gap: 6px;
      opacity: 0;
      transform: translateX(8px);
      pointer-events: none;
      transition: opacity 0.4s ease, transform 0.4s ease;
      white-space: nowrap;
    }
    .heart-instructions-hint--visible {
      opacity: 1;
      transform: translateX(0);
    }
    .heart-instructions-hint-arrow {
      display: inline-block;
      font-size: 1.4rem;
      color: var(--color-primary-soft, #ff8fab);
      text-shadow: 0 0 10px rgba(255, 107, 157, 0.6);
      animation: heartHintBounce 1.2s ease-in-out infinite;
    }
    .heart-instructions-hint-text {
      font-family: var(--font-body, sans-serif);
      font-size: 0.78rem;
      font-style: italic;
      color: var(--color-text-secondary, rgba(245,240,255,0.85));
      background: var(--glass-bg, rgba(255,255,255,0.08));
      border: var(--glass-border, 1px solid rgba(255,255,255,0.12));
      padding: 5px 10px;
      border-radius: 999px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    @keyframes heartHintBounce {
      0%, 100% { transform: translateX(0) rotate(0deg); }
      50% { transform: translateX(4px) rotate(8deg); }
    }

    .heart-instructions-panel {
      position: absolute;
      top: 50px;
      right: 0;
      width: 280px;
      padding: 18px 20px;
      background: var(--glass-bg, rgba(255,255,255,0.08));
      border: var(--glass-border, 1px solid rgba(255,255,255,0.12));
      border-radius: var(--radius-lg, 16px);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: var(--glass-shadow, 0 8px 32px rgba(0,0,0,0.3));
      opacity: 0;
      transform: translateY(-8px);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
    .heart-instructions--open .heart-instructions-panel {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .heart-instructions-title {
      margin: 0 0 12px 0;
      font-family: var(--font-heading, serif);
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-text-heading, #fff0f5);
    }

    .heart-instructions-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .heart-instructions-list li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-family: var(--font-body, sans-serif);
      font-size: 0.82rem;
      line-height: 1.4;
      color: var(--color-text-secondary, rgba(245,240,255,0.8));
    }
    .heart-instructions-icon {
      flex-shrink: 0;
      font-size: 1rem;
      line-height: 1.4;
    }

    /* ── Ambient background sparkles ─────────────────────────── */
    .heart-ambient-particles {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.6s ease;
      overflow: hidden;
    }
    .heart-ambient-particles--visible {
      opacity: 1;
    }
    .heart-ambient-particle {
      position: absolute;
      border-radius: 50%;
      animation: heartAmbientFloat 6s ease-in-out infinite;
    }
    @keyframes heartAmbientFloat {
      0%   { transform: translateY(0) scale(1); opacity: 0; }
      15%  { opacity: 1; }
      50%  { transform: translateY(-30px) scale(1.15); }
      85%  { opacity: 1; }
      100% { transform: translateY(-60px) scale(1); opacity: 0; }
    }

    @media (max-width: 480px) {
      .heart-instructions {
        top: 80px;
        right: 16px;
      }
      .heart-instructions-panel {
        width: 240px;
      }
      .heart-instructions-hint-text {
        display: none; /* keep just the arrow on small screens, less clutter */
      }
    }
  `;
  document.head.appendChild(style);
}