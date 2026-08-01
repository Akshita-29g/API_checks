// /**
//  * heartbeatMonitor.js
//  * Detects your ACTUAL heartbeat from tiny, invisible color shifts in your
//  * facial skin caused by blood flow (remote photoplethysmography — the
//  * same underlying principle as a fitness-tracker wrist sensor, done here
//  * with just the webcam). visionEngine.js samples the forehead region's
//  * green-channel brightness over a rolling ~10s window and reports a
//  * measured BPM via face:heartbeat.
//  *
//  * This widget shows a heart icon that visibly beats at your real,
//  * measured rate once a stable reading exists, plus the live BPM number —
//  * not a decorative animation, an actual rendering of your pulse.
//  *
//  * Honest about the real constraint of rPPG: needs ~8-10s of a fairly
//  * still, decently lit face to lock onto a reading. Shows a "reading..."
//  * state while collecting data instead of faking an instant result.
//  *
//  * Only samples while the host page is active — a MutationObserver
//  * toggles visionEngine's heart-rate sensing on/off with the section's
//  * "active" class, same pattern used for eye-color sampling elsewhere.
//  */
// import visionEngine from "./visionEngine.js";

// export function initHeartbeatMonitor({
//   sectionSelector = "#page-heart-gesture",
//   mountSelector = null, // if null, creates its own floating widget
// } = {}) {
//   const section = document.querySelector(sectionSelector);
//   if (!section) return;

//   injectStylesOnce();

//   const widget = document.createElement("div");
//   widget.className = "heartbeat-monitor";
//   widget.innerHTML = `
//     <div class="heartbeat-monitor-icon">♥</div>
//     <div class="heartbeat-monitor-label">reading your heartbeat...</div>
//   `;

//   const mount = mountSelector ? document.querySelector(mountSelector) : null;
//   (mount || document.body).appendChild(widget);
//   if (!mount) {
//     widget.classList.add("heartbeat-monitor--floating");
//   }

//   const icon = widget.querySelector(".heartbeat-monitor-icon");
//   const label = widget.querySelector(".heartbeat-monitor-label");

//   visionEngine.addEventListener("face:heartbeat", (e) => {
//     if (!section.classList.contains("active")) return;
//     const bpm = e.detail.bpm;
//     const periodSec = (60 / bpm).toFixed(2);
//     icon.style.animationDuration = `${periodSec}s`;
//     icon.classList.add("heartbeat-monitor-icon--live");
//     label.textContent = `${bpm} BPM — that's really you`;
//   });

//   const observer = new MutationObserver(() => {
//     if (section.classList.contains("active")) {
//       visionEngine.enableHeartRateSensing();
//     } else {
//       visionEngine.disableHeartRateSensing();
//       icon.classList.remove("heartbeat-monitor-icon--live");
//       icon.style.animationDuration = "";
//       label.textContent = "reading your heartbeat...";
//     }
//   });
//   observer.observe(section, { attributes: true, attributeFilter: ["class"] });

//   visionEngine.start();
// }

// function injectStylesOnce() {
//   if (document.getElementById("heartbeat-monitor-styles")) return;
//   const style = document.createElement("style");
//   style.id = "heartbeat-monitor-styles";
//   style.textContent = `
//     .heartbeat-monitor {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       gap: 6px;
//     }
//     .heartbeat-monitor--floating {
//       position: fixed;
//       bottom: 24px;
//       left: 24px;
//       z-index: 9999;
//       padding: 12px 18px;
//       background: var(--glass-bg, rgba(255,255,255,0.08));
//       border: var(--glass-border, 1px solid rgba(255,255,255,0.1));
//       border-radius: var(--radius-lg, 16px);
//       backdrop-filter: blur(14px);
//       -webkit-backdrop-filter: blur(14px);
//     }
//     .heartbeat-monitor-icon {
//       font-size: 28px;
//       color: var(--color-primary, #ff6b9d);
//       text-shadow: 0 0 12px rgba(255, 107, 157, 0.6);
//       opacity: 0.5;
//       transform: scale(0.9);
//     }
//     .heartbeat-monitor-icon--live {
//       opacity: 1;
//       animation-name: heartbeatMonitorPulse;
//       animation-timing-function: ease-in-out;
//       animation-iteration-count: infinite;
//     }
//     @keyframes heartbeatMonitorPulse {
//       0%, 100% { transform: scale(0.9); }
//       30% { transform: scale(1.25); }
//       50% { transform: scale(0.95); }
//     }
//     .heartbeat-monitor-label {
//       font-family: var(--font-body, sans-serif);
//       font-size: 0.8rem;
//       color: var(--color-text-secondary, rgba(245,240,255,0.7));
//       letter-spacing: 0.03em;
//     }
//   `;
//   document.head.appendChild(style);
// }

/**
 * heartbeatMonitor.js
 * Detects your ACTUAL heartbeat from tiny, invisible color shifts in your
 * facial skin caused by blood flow (remote photoplethysmography — the
 * same underlying principle as a fitness-tracker wrist sensor, done here
 * with just the webcam). visionEngine.js samples the forehead region's
 * green-channel brightness over a rolling ~10s window and reports a
 * measured BPM via face:heartbeat.
 *
 * UI: starts as a small card/button — heart icon + "See your heartbeat".
 * Clicking it expands into a live, continuously scrolling ECG-style
 * waveform (canvas), animated in real time from the actual measured BPM —
 * not a looping GIF, a genuinely synthesized trace whose cycle length
 * equals 60/bpm seconds, redrawn every frame from the real reading.
 * Clicking again collapses it back to the button.
 *
 * Honest about the real constraint of rPPG: needs ~8-10s of a fairly
 * still, decently lit face to lock onto a reading. Shows a gentle
 * "detecting your pulse..." flat/noisy line in the waveform view until a
 * real reading arrives, rather than faking an instant result.
 *
 * Sensing itself (visionEngine.enableHeartRateSensing) stays tied to the
 * host page being active — same MutationObserver pattern used elsewhere —
 * regardless of whether the card is currently expanded or collapsed, so a
 * reading keeps warming up even before the visitor clicks to look at it.
 */
import visionEngine from "./visionEngine.js";

export function initHeartbeatMonitor({
  sectionSelector = "#page-heart-gesture",
  mountSelector = null, // if null, creates its own floating widget
} = {}) {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  injectStylesOnce();

  const widget = document.createElement("div");
  widget.className = "heartbeat-monitor";
  widget.innerHTML = `
    <button type="button" class="heartbeat-monitor-button">
      <span class="heartbeat-monitor-icon">♥</span>
      <span class="heartbeat-monitor-button-label">See your heartbeat</span>
    </button>
    <div class="heartbeat-monitor-panel">
      <canvas class="heartbeat-monitor-canvas"></canvas>
      <div class="heartbeat-monitor-bpm">detecting your pulse...</div>
    </div>
  `;

  const mount = mountSelector ? document.querySelector(mountSelector) : null;
  (mount || document.body).appendChild(widget);
  if (!mount) {
    widget.classList.add("heartbeat-monitor--floating");
  }

  const button = widget.querySelector(".heartbeat-monitor-button");
  const panel = widget.querySelector(".heartbeat-monitor-panel");
  const canvas = widget.querySelector(".heartbeat-monitor-canvas");
  const bpmLabel = widget.querySelector(".heartbeat-monitor-bpm");
  const ctx = canvas.getContext("2d");

  let currentBpm = null;
  let expanded = false;
  let rafId = null;

  const PX_PER_SECOND = 90;   // horizontal sweep speed of the trace
  const FALLBACK_BPM = 70;    // used only for the pre-reading placeholder wiggle

  function resizeCanvas() {
    const rect = panel.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  /** Classic P-QRS-T shape as a function of phase (0-1 through one
   *  heartbeat cycle). Not clinically precise — just reads as "an ECG"
   *  visually: a small P bump, a sharp spike, a T bump, then baseline. */
  function ecgTemplate(phase) {
    if (phase < 0.05) return 0;
    if (phase < 0.09) return Math.sin(((phase - 0.05) / 0.04) * Math.PI) * 0.15;
    if (phase < 0.14) return 0;
    if (phase < 0.16) return -0.2 * ((phase - 0.14) / 0.02);
    if (phase < 0.19) return -0.2 + 1.2 * ((phase - 0.16) / 0.03);
    if (phase < 0.22) return 1.0 - 1.3 * ((phase - 0.19) / 0.03);
    if (phase < 0.26) return -0.3 + 0.3 * ((phase - 0.22) / 0.04);
    if (phase < 0.34) return 0;
    if (phase < 0.46) return Math.sin(((phase - 0.34) / 0.12) * Math.PI) * 0.25;
    return 0;
  }

  function drawFrame() {
    if (!expanded) return;

    const w = canvas.width;
    const h = canvas.height;
    const centerY = h * 0.55;
    const amplitude = h * 0.38;
    const now = performance.now();

    const usingRealBpm = currentBpm !== null;
    const periodMs = 60000 / (currentBpm || FALLBACK_BPM);

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 107, 157, 0.95)";
    ctx.shadowBlur = 14;
    ctx.shadowColor = "rgba(255, 107, 157, 0.7)";
    ctx.beginPath();

    for (let x = 0; x <= w; x++) {
      const tAgoMs = ((w - x) / PX_PER_SECOND) * 1000;
      const sampleTime = now - tAgoMs;
      let phase = (sampleTime % periodMs) / periodMs;
      if (phase < 0) phase += 1;

      let value;
      if (usingRealBpm) {
        value = ecgTemplate(phase);
      } else {
        // gentle placeholder wiggle while no reading exists yet — clearly
        // not a real trace, just enough motion to not look frozen/broken
        value = Math.sin(sampleTime / 260) * 0.08;
      }

      const y = centerY - value * amplitude;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
    ctx.restore();

    rafId = requestAnimationFrame(drawFrame);
  }

  function expand() {
    expanded = true;
    widget.classList.add("heartbeat-monitor--expanded");
    resizeCanvas();
    cancelAnimationFrame(rafId);
    drawFrame();
  }

  function collapse() {
    expanded = false;
    widget.classList.remove("heartbeat-monitor--expanded");
    cancelAnimationFrame(rafId);
  }

  button.addEventListener("click", () => {
    if (expanded) collapse();
    else expand();
  });

  new ResizeObserver(() => {
    if (expanded) resizeCanvas();
  }).observe(panel);

  visionEngine.addEventListener("face:heartbeat", (e) => {
    if (!section.classList.contains("active")) return;
    currentBpm = e.detail.bpm;
    bpmLabel.textContent = `${currentBpm} BPM — that's really you`;
  });

  const observer = new MutationObserver(() => {
    if (section.classList.contains("active")) {
      visionEngine.enableHeartRateSensing();
    } else {
      visionEngine.disableHeartRateSensing();
      currentBpm = null;
      bpmLabel.textContent = "detecting your pulse...";
      collapse();
    }
  });
  observer.observe(section, { attributes: true, attributeFilter: ["class"] });

  visionEngine.start();
}

function injectStylesOnce() {
  if (document.getElementById("heartbeat-monitor-styles")) return;
  const style = document.createElement("style");
  style.id = "heartbeat-monitor-styles";
  style.textContent = `
    .heartbeat-monitor {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .heartbeat-monitor--floating {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 9999;
    }

    .heartbeat-monitor-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 20px 28px;
      background: var(--glass-bg, rgba(255,255,255,0.08));
      border: var(--glass-border, 1px solid rgba(255,255,255,0.1));
      border-radius: var(--radius-lg, 16px);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      box-shadow: var(--glass-shadow, 0 8px 32px rgba(0,0,0,0.3));
      cursor: pointer;
      font-family: var(--font-body, sans-serif);
      color: var(--color-text-primary, #f5f0ff);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .heartbeat-monitor-button:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow, 0 0 20px rgba(255,107,157,0.3));
    }
    .heartbeat-monitor--expanded .heartbeat-monitor-button {
      display: none;
    }

    .heartbeat-monitor-icon {
      font-size: 28px;
      color: var(--color-primary, #ff6b9d);
      text-shadow: 0 0 12px rgba(255, 107, 157, 0.6);
      animation: heartbeatMonitorPulse 1.1s ease-in-out infinite;
    }
    @keyframes heartbeatMonitorPulse {
      0%, 100% { transform: scale(0.9); }
      30% { transform: scale(1.2); }
      50% { transform: scale(0.95); }
    }

    .heartbeat-monitor-button-label {
      font-size: 0.85rem;
      letter-spacing: 0.03em;
      color: var(--color-text-secondary, rgba(245,240,255,0.75));
    }

    .heartbeat-monitor-panel {
      display: none;
      flex-direction: column;
      width: min(90vw, 420px);
      padding: 18px 20px;
      background: var(--glass-bg, rgba(255,255,255,0.08));
      border: var(--glass-border, 1px solid rgba(255,255,255,0.1));
      border-radius: var(--radius-lg, 16px);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      box-shadow: var(--glass-shadow, 0 8px 32px rgba(0,0,0,0.3));
      cursor: pointer;
    }
    .heartbeat-monitor--expanded .heartbeat-monitor-panel {
      display: flex;
    }

    .heartbeat-monitor-canvas {
      width: 100%;
      height: 110px;
      display: block;
    }

    .heartbeat-monitor-bpm {
      margin-top: 8px;
      text-align: center;
      font-family: var(--font-body, sans-serif);
      font-size: 0.85rem;
      letter-spacing: 0.03em;
      color: var(--color-text-secondary, rgba(245,240,255,0.75));
    }
  `;
  document.head.appendChild(style);
}