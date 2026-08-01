// /**
//  * visionEngine.js
//  * Single shared webcam + MediaPipe pipeline for the whole site.
//  * Every feature listens for events on `visionEngine` — nothing else should
//  * ever call getUserMedia() or touch a <video> element directly.
//  *
//  * Events dispatched:
//  *   engine:ready                    - camera + face/hand models are live
//  *   engine:error   { reason, err }  - reason: "permission-denied" | "no-camera" | "unsupported"
//  *   face:smile     { score }        - sustained smile detected (~5 consecutive frames)
//  *   face:proximity { value }        - how close the face is, 0 (far) to 1 (close), self-calibrating
//  *   face:blink                      - fires once per completed blink (eyes closed then reopened)
//  *   face:lost                       - no face in frame this tick
//  *   face:together                   - two faces detected in frame at once (cooldown: ~3s)
//  *   face:eyecolor  { hex }          - avg iris-region color of the primary face (only while enabled)
//  *   hand:point     { x, y }         - index-finger "point" gesture, normalized 0-1, mirrored
//  *   hand:pointend                   - pointing gesture stopped
//  *   hand:wave                       - a side-to-side wave was detected (cooldown: ~1.5s between fires)
//  *   hand:heart                      - both hands forming a heart shape (cooldown: ~2s between fires)
//  *   pose:shoulders { y }            - normalized avg shoulder height (only after enablePoseTracking())
//  *
//  * Usage:
//  *   import visionEngine from "./visionEngine.js";
//  *   visionEngine.start();                       // boots camera + face/hand (cheap, always needed)
//  *   visionEngine.enablePoseTracking();           // optional, only if a feature needs pose
//  *   visionEngine.enableEyeColorSampling();       // optional, only while the eye-tint feature is visible
//  */

// import {
//   FilesetResolver,
//   FaceLandmarker,
//   HandLandmarker,
//   PoseLandmarker,
// } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

// const WASM_BASE =
//   "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

// const MODELS = {
//   face: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
//   hand: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
//   pose: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
// };

// // the 478-point face mesh always includes these iris rings — no extra config needed
// const IRIS_LANDMARK_IDS = [468, 469, 470, 471, 472, 473, 474, 475, 476, 477];

// class VisionEngine extends EventTarget {
//   constructor() {
//     super();
//     this.video = null;
//     this.stream = null;
//     this.faceLandmarker = null;
//     this.handLandmarker = null;
//     this.poseLandmarker = null;
//     this.running = false;
//     this._starting = false;
//     this._loadingPose = false;
//     this._vision = null; // cached FilesetResolver result, reused by enablePoseTracking()
//     this._lastVideoTime = -1;
//     this._smileFrames = 0;
//     this._pointing = false;
//    this._notPointingStreak = 0; // ← add this 
//     this._proximity = { smoothed: null, min: null, max: null };
//     this._eyesClosed = false;
//     this._wave = { history: [], lastWaveTime: 0 };
//     this._heart = { lastFireTime: 0 };
//     this._togetherLastTime = 0;
//     this._eyeColorEnabled = false;
//     this._lastEyeSample = 0;
//     this._sampleCanvas = null;
//     this._sampleCtx = null;

//   }

//   /** Boots camera + face/hand tracking. Safe to call more than once — later calls no-op while running. */
//   async start() {
//     if (this.running || this._starting) return;
//     this._starting = true;

//     try {
//       this._vision = await FilesetResolver.forVisionTasks(WASM_BASE);

//       this.faceLandmarker = await FaceLandmarker.createFromOptions(this._vision, {
//         baseOptions: { modelAssetPath: MODELS.face, delegate: "GPU" },
//         outputFaceBlendshapes: true,
//         runningMode: "VIDEO",
//         numFaces: 2, // supports face:together (two people leaning into frame)
//       });

//       this.handLandmarker = await HandLandmarker.createFromOptions(this._vision, {
//         baseOptions: { modelAssetPath: MODELS.hand, delegate: "GPU" },
//         runningMode: "VIDEO",
//         numHands: 2, // supports hand:heart (needs both hands)
//       });

//       this.stream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480, facingMode: "user" },
//         audio: false,
//       });

//       this.video = document.createElement("video");
//       this.video.autoplay = true;
//       this.video.muted = true;
//       this.video.playsInline = true;
//       // kept in the DOM (required for some browsers to decode frames) but invisible
//       this.video.style.cssText =
//         "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;";
//       document.body.appendChild(this.video);
//       this.video.srcObject = this.stream;
//       await new Promise((resolve) => (this.video.onloadedmetadata = resolve));
//       await this.video.play();

//       this.running = true;
//       this._starting = false;
//       this._loop();
//       this.dispatchEvent(new CustomEvent("engine:ready"));
//     } catch (err) {
//       this._starting = false;
//       const reason =
//         err.name === "NotAllowedError"
//           ? "permission-denied"
//           : err.name === "NotFoundError"
//           ? "no-camera"
//           : "unsupported";
//       this.dispatchEvent(new CustomEvent("engine:error", { detail: { reason, err } }));
//     }
//   }

//   /** Call any time (before or after start()) to add pose/shoulder tracking for breathGlow. */
//   async enablePoseTracking() {
//     if (this.poseLandmarker || this._loadingPose) return;
//     this._loadingPose = true;
//     try {
//       const vision = this._vision ?? (await FilesetResolver.forVisionTasks(WASM_BASE));
//       this._vision = vision;
//       this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
//         baseOptions: { modelAssetPath: MODELS.pose, delegate: "GPU" },
//         runningMode: "VIDEO",
//       });
//     } finally {
//       this._loadingPose = false;
//     }
//   }

//   /** Turns on iris-color sampling (face:eyecolor). Cheap to call/uncall repeatedly —
//    *  intended to be toggled on only while a page that uses it is visible. */
//   enableEyeColorSampling() {
//     this._eyeColorEnabled = true;
//   }

//   disableEyeColorSampling() {
//     this._eyeColorEnabled = false;
//   }

//   stop() {
//     this.running = false;
//     this.stream?.getTracks().forEach((t) => t.stop());
//     this.video?.remove();
//     this.video = null;
//     this.stream = null;
//   }

//   _loop = () => {
//     if (!this.running) return;
//     const now = performance.now();
//     if (this.video.currentTime !== this._lastVideoTime) {
//       this._lastVideoTime = this.video.currentTime;
//       this._tick(now);
//     }
//     requestAnimationFrame(this._loop);
//   };

//   _tick(timestamp) {
//     const face = this.faceLandmarker.detectForVideo(this.video, timestamp);
//     this._emitFace(face, timestamp);

//     const hand = this.handLandmarker.detectForVideo(this.video, timestamp);
//     this._emitHand(hand, timestamp);

//     if (this.poseLandmarker) {
//       const pose = this.poseLandmarker.detectForVideo(this.video, timestamp);
//       this._emitPose(pose);
//     }
//   }

//   _emitFace(result, timestamp) {
//     if (!result.faceBlendshapes?.length) {
//       this._smileFrames = 0;
//       this.dispatchEvent(new CustomEvent("face:lost"));
//       return;
//     }
//     const cats = result.faceBlendshapes[0].categories;
//     const score = (name) => cats.find((c) => c.categoryName === name)?.score ?? 0;
//     const smile = (score("mouthSmileLeft") + score("mouthSmileRight")) / 2;

//     if (smile > 0.5) {
//       this._smileFrames++;
//       if (this._smileFrames === 5) {
//         this.dispatchEvent(new CustomEvent("face:smile", { detail: { score: smile } }));
//       }
//     } else {
//       this._smileFrames = 0;
//     }

//     // eyeBlinkLeft/Right are scores MediaPipe already calculates for us —
//     // no manual eye-shape math needed, just watch them cross a threshold
//     const blinkL = score("eyeBlinkLeft");
//     const blinkR = score("eyeBlinkRight");
//     const eyesClosed = blinkL > 0.5 && blinkR > 0.5;

//     if (eyesClosed && !this._eyesClosed) {
//       this._eyesClosed = true; // eyes just closed — wait for reopen to count it
//     } else if (!eyesClosed && this._eyesClosed) {
//       this._eyesClosed = false; // eyes just reopened — that's one completed blink
//       this.dispatchEvent(new CustomEvent("face:blink"));
//     }

//     // two people leaning into frame together
//     if (result.faceLandmarks?.length >= 2 && timestamp - this._togetherLastTime > 3000) {
//       this._togetherLastTime = timestamp;
//       this.dispatchEvent(new CustomEvent("face:together"));
//     }

//     const lm = result.faceLandmarks?.[0];
//     if (lm) {
//       this._emitProximity(lm);
//       this._emitEyeColor(lm, timestamp);
//     }
//   }

//   /** How close the face is to the camera, as a 0 (far) to 1 (close) value that
//    *  recalibrates to whatever range you've actually been sitting in. */
//   _emitProximity(lm) {
//     // landmarks 234 and 454 sit roughly at the left/right edges of the face
//     // outline — the distance between them grows as you lean toward the camera
//     const width = this._dist(lm[234], lm[454]);
//     const p = this._proximity;
//     p.smoothed = p.smoothed === null ? width : p.smoothed + (width - p.smoothed) * 0.15;
//     p.min = p.min === null ? p.smoothed : Math.min(p.min, p.smoothed);
//     p.max = p.max === null ? p.smoothed : Math.max(p.max, p.smoothed);
//     // slowly widen the range back out so it recalibrates through the session
//     p.min += (p.smoothed - p.min) * 0.001;
//     p.max -= (p.max - p.smoothed) * 0.001;

//     const range = Math.max(p.max - p.min, 0.001);
//     const value = Math.min(1, Math.max(0, (p.smoothed - p.min) / range));
//     this.dispatchEvent(new CustomEvent("face:proximity", { detail: { value } }));
//   }

//   /** Averages the pixel color under the iris landmarks of the primary face.
//    *  Throttled to ~2.5 samples/sec and only runs when a feature has opted in,
//    *  since it needs an extra canvas read (readback is the expensive part). */
//   _emitEyeColor(lm, timestamp) {
//     if (!this._eyeColorEnabled) return;
//     if (timestamp - this._lastEyeSample < 400) return;
//     this._lastEyeSample = timestamp;

//     if (!this._sampleCanvas) {
//       this._sampleCanvas = document.createElement("canvas");
//       this._sampleCanvas.width = this.video.videoWidth;
//       this._sampleCanvas.height = this.video.videoHeight;
//       this._sampleCtx = this._sampleCanvas.getContext("2d", { willReadFrequently: true });
//     }
//     this._sampleCtx.drawImage(
//       this.video, 0, 0, this._sampleCanvas.width, this._sampleCanvas.height
//     );

//     const w = this._sampleCanvas.width;
//     const h = this._sampleCanvas.height;
//     let r = 0, g = 0, b = 0, n = 0;

//     for (const i of IRIS_LANDMARK_IDS) {
//       const pt = lm[i];
//       if (!pt) continue;
//       const px = Math.min(w - 1, Math.max(0, Math.round(pt.x * w)));
//       const py = Math.min(h - 1, Math.max(0, Math.round(pt.y * h)));
//       const data = this._sampleCtx.getImageData(px, py, 1, 1).data;
//       r += data[0]; g += data[1]; b += data[2]; n++;
//     }
//     if (n === 0) return;

//     r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
//     // near-black average usually means we caught the pupil, not the iris ring —
//     // skip it, the next sample 400ms later will likely land better
//     if (r + g + b < 60) return;

//     const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
//     this.dispatchEvent(new CustomEvent("face:eyecolor", { detail: { hex } }));
//   }

//   _emitHand(result, timestamp) {
//     console.log("hands found:", result.landmarks?.length ?? 0); // ← add this line
//     const hands = result.landmarks || [];
//     if (hands.length) console.log("hands:", hands.length); // TEMP DEBUG — remove after

//     if (hands.length === 0) {
//       if (this._pointing) {
//         this._pointing = false;
//         this.dispatchEvent(new CustomEvent("hand:pointend"));
//       }
//       return;
//     }

//     const lm = hands[0];
//     this._emitWave(lm, timestamp);

//     const pointing = this._isPointing(lm);
//     if (pointing) {
//       this._pointing = true;
//       // mirror x to match a front-facing camera preview
//       this.dispatchEvent(
//         new CustomEvent("hand:point", { detail: { x: 1 - lm[8].x, y: lm[8].y } })
//       );
//     } else if (this._pointing) {
//       this._pointing = false;
//       this.dispatchEvent(new CustomEvent("hand:pointend"));
//     }

//     if (hands.length >= 2) {
//       const d = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
//       console.log(
//         "thumbDist:", d(hands[0][4], hands[1][4]).toFixed(3),
//         "indexDist:", d(hands[0][8], hands[1][8]).toFixed(3),
//         "wristDist:", d(hands[0][0], hands[1][0]).toFixed(3)
//       ); // TEMP DEBUG — remove after
//       this._emitHeart(hands[0], hands[1], timestamp);
//     }
//   }
//   // _emitHand(result, timestamp) {
//   // const hands = result.landmarks || [];

//   // if (hands.length === 0) {
//   //   this._notPointingStreak++;
//   //   if (this._pointing && this._notPointingStreak >= 4) {
//   //     this._pointing = false;
//   //     this.dispatchEvent(new CustomEvent("hand:pointend"));
//   //   }
//   //   return;
//   // }

// //   const lm = hands[0];
// //   this._emitWave(lm, timestamp);

// //   const pointing = this._isPointing(lm);
// //   if (pointing) {
// //     this._notPointingStreak = 0;
// //     this._pointing = true;
// //     this.dispatchEvent(
// //       new CustomEvent("hand:point", { detail: { x: 1 - lm[8].x, y: lm[8].y } })
// //     );
// //   } else {
// //     this._notPointingStreak++;
// //     if (this._pointing && this._notPointingStreak >= 4) {
// //       this._pointing = false;
// //       this.dispatchEvent(new CustomEvent("hand:pointend"));
// //     }
// //   }

// //   if (hands.length >= 2) {
// //     this._emitHeart(hands[0], hands[1], timestamp);
// //   }
// // }
//   /** A "wave" is just the wrist changing x-direction several times in under
//    *  ~1.2s, with enough side-to-side distance that it isn't just hand jitter. */
//   _emitWave(lm, timestamp) {
//     const w = this._wave;
//     w.history.push({ x: lm[0].x, t: timestamp });
//     w.history = w.history.filter((p) => timestamp - p.t < 1200);
//     if (w.history.length < 6) return;

//     let reversals = 0;
//     let prevDir = null;
//     let minX = Infinity;
//     let maxX = -Infinity;
//     for (let i = 1; i < w.history.length; i++) {
//       const dx = w.history[i].x - w.history[i - 1].x;
//       if (Math.abs(dx) < 0.003) continue; // ignore tiny jitter, not a real direction
//       const dir = dx > 0 ? 1 : -1;
//       if (prevDir !== null && dir !== prevDir) reversals++;
//       prevDir = dir;
//       minX = Math.min(minX, w.history[i].x);
//       maxX = Math.max(maxX, w.history[i].x);
//     }

//     const amplitude = maxX - minX;
//     const cooledDown = timestamp - w.lastWaveTime > 1500; // don't refire every frame of the same wave

//     if (reversals >= 3 && amplitude > 0.08 && cooledDown) {
//       w.lastWaveTime = timestamp;
//       w.history = [];
//       this.dispatchEvent(new CustomEvent("hand:wave"));
//     }
//   }

//   /** Classic "heart" shape: both hands' thumb tips together AND both index
//    *  tips together, while the wrists stay apart — that last check is what
//    *  tells this apart from just clasping your hands together in a ball. */
//   // _emitHeart(handA, handB, timestamp) {
//   //   const thumbDist = this._dist(handA[4], handB[4]);
//   //   const indexDist = this._dist(handA[8], handB[8]);
//   //   const wristDist = this._dist(handA[0], handB[0]);
//   //   const cooledDown = timestamp - this._heart.lastFireTime > 2000;

//   //   if (thumbDist < 0.06 && indexDist < 0.06 && wristDist > 0.15 && cooledDown) {
//   //     this._heart.lastFireTime = timestamp;
//   //     this.dispatchEvent(new CustomEvent("hand:heart"));
//   //   }
//   // }
//   _emitHeart(handA, handB, timestamp) {
//     const thumbDist = this._dist(handA[4], handB[4]);
//     const indexDist = this._dist(handA[8], handB[8]);
//     const wristDist = this._dist(handA[0], handB[0]);
//     const cooledDown = timestamp - this._heart.lastFireTime > 2000;

//     if (thumbDist < 0.07 && indexDist < 0.06 && wristDist > 0.09 && cooledDown) {
//       this._heart.lastFireTime = timestamp;
//       this.dispatchEvent(new CustomEvent("hand:heart"));
//     }
//   }

//   _emitPose(result) {
//     const lm = result.landmarks?.[0];
//     if (!lm) return;
//     const leftShoulder = lm[11];
//     const rightShoulder = lm[12];
//     if (!leftShoulder || !rightShoulder) return;
//     this.dispatchEvent(
//       new CustomEvent("pose:shoulders", { detail: { y: (leftShoulder.y + rightShoulder.y) / 2 } })
//     );
//   }

//   _dist(a, b) {
//     return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
//   }

//   _fingerExtended(lm, tip, pip) {
//   return this._dist(lm[tip], lm[0]) > this._dist(lm[pip], lm[0]) * 1.05;
// }

// _fingerCurled(lm, tip, pip) {
//   return this._dist(lm[tip], lm[0]) < this._dist(lm[pip], lm[0]) * 0.95;
// }

// _isPointing(lm) {
//   return (
//     this._fingerExtended(lm, 8, 6) &&
//     this._fingerCurled(lm, 12, 10) &&
//     this._fingerCurled(lm, 16, 14)
//   );
// }
// }

// const visionEngine = new VisionEngine();
// export default visionEngine;

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
 * visionEngine.js
 * Single shared webcam + MediaPipe pipeline for the whole site.
 * Every feature listens for events on `visionEngine` — nothing else should
 * ever call getUserMedia() or touch a <video> element directly.
 *
 * Events dispatched:
 *   engine:ready                    - camera + face/hand models are live
 *   engine:error   { reason, err }  - reason: "permission-denied" | "no-camera" | "unsupported"
 *   face:smile     { score }        - sustained smile detected (~5 consecutive frames)
 *   face:proximity { value }        - how close the face is, 0 (far) to 1 (close), self-calibrating
 *   face:blink                      - fires once per completed blink (eyes closed then reopened)
 *   face:lost                       - no face in frame this tick
 *   face:together                   - two faces detected in frame at once (cooldown: ~3s)
 *   face:eyecolor  { hex }          - avg iris-region color of the primary face (only while enabled)
 *   face:heartbeat { bpm }          - estimated real heart rate from facial color shifts (only while enabled)
 *   hand:point     { x, y }         - index-finger "point" gesture, normalized 0-1, mirrored
 *   hand:pointend                   - pointing gesture stopped
 *   hand:wave                       - a side-to-side wave was detected (cooldown: ~1.5s between fires)
 *   hand:heart                      - both hands forming a heart shape (cooldown: ~2s between fires)
 *   pose:shoulders { y }            - normalized avg shoulder height (only after enablePoseTracking())
 *
 * Usage:
 *   import visionEngine from "./visionEngine.js";
 *   visionEngine.start();                       // boots camera + face/hand (cheap, always needed)
 *   visionEngine.enablePoseTracking();           // optional, only if a feature needs pose
 *   visionEngine.enableEyeColorSampling();       // optional, only while the eye-tint feature is visible
 *   visionEngine.enableHeartRateSensing();       // optional, only while the heartbeat feature is visible
 */

import {
  FilesetResolver,
  FaceLandmarker,
  HandLandmarker,
  PoseLandmarker,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

const MODELS = {
  face: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
  hand: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
  pose: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
};

// the 478-point face mesh always includes these iris rings — no extra config needed
const IRIS_LANDMARK_IDS = [468, 469, 470, 471, 472, 473, 474, 475, 476, 477];

// Heart-rate sensing tuning
const HR_WINDOW_MS = 10000;          // rolling buffer length used per BPM estimate
const HR_MOVING_AVG_SAMPLES = 15;    // detrend window, in samples
const HR_MIN_PEAK_SPACING_MS = 350;  // caps detectable rate at ~170bpm, filters noise
const HR_MIN_PEAKS = 4;              // minimum peaks in-window before trusting an estimate
const HR_MIN_BPM = 45;
const HR_MAX_BPM = 180;
const HR_EMIT_INTERVAL_MS = 500;     // re-estimate at most twice a second

class VisionEngine extends EventTarget {
  constructor() {
    super();
    this.video = null;
    this.stream = null;
    this.faceLandmarker = null;
    this.handLandmarker = null;
    this.poseLandmarker = null;
    this.running = false;
    this._starting = false;
    this._loadingPose = false;
    this._vision = null; // cached FilesetResolver result, reused by enablePoseTracking()
    this._lastVideoTime = -1;
    this._smileFrames = 0;
    this._pointing = false;
    this._proximity = { smoothed: null, min: null, max: null };
    this._eyesClosed = false;
    this._wave = { history: [], lastWaveTime: 0 };
    this._heart = { lastFireTime: 0 };
    this._togetherLastTime = 0;
    this._eyeColorEnabled = false;
    this._lastEyeSample = 0;
    this._sampleCanvas = null;
    this._sampleCtx = null;
    this._hr = {
      enabled: false,
      buffer: [],
      lastEmit: 0,
      sampleCanvas: null,
      sampleCtx: null,
    };
  }

  /** Boots camera + face/hand tracking. Safe to call more than once — later calls no-op while running. */
  async start() {
    if (this.running || this._starting) return;
    this._starting = true;

    try {
      this._vision = await FilesetResolver.forVisionTasks(WASM_BASE);

      this.faceLandmarker = await FaceLandmarker.createFromOptions(this._vision, {
        baseOptions: { modelAssetPath: MODELS.face, delegate: "GPU" },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 2, // supports face:together (two people leaning into frame)
      });

      this.handLandmarker = await HandLandmarker.createFromOptions(this._vision, {
        baseOptions: { modelAssetPath: MODELS.hand, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 2, // supports hand:heart (needs both hands)
      });

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });

      this.video = document.createElement("video");
      this.video.autoplay = true;
      this.video.muted = true;
      this.video.playsInline = true;
      // kept in the DOM (required for some browsers to decode frames) but invisible
      this.video.style.cssText =
        "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;";
      document.body.appendChild(this.video);
      this.video.srcObject = this.stream;
      await new Promise((resolve) => (this.video.onloadedmetadata = resolve));
      await this.video.play();

      this.running = true;
      this._starting = false;
      this._loop();
      this.dispatchEvent(new CustomEvent("engine:ready"));
    } catch (err) {
      this._starting = false;
      const reason =
        err.name === "NotAllowedError"
          ? "permission-denied"
          : err.name === "NotFoundError"
          ? "no-camera"
          : "unsupported";
      this.dispatchEvent(new CustomEvent("engine:error", { detail: { reason, err } }));
    }
  }

  /** Call any time (before or after start()) to add pose/shoulder tracking for breathGlow. */
  async enablePoseTracking() {
    if (this.poseLandmarker || this._loadingPose) return;
    this._loadingPose = true;
    try {
      const vision = this._vision ?? (await FilesetResolver.forVisionTasks(WASM_BASE));
      this._vision = vision;
      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODELS.pose, delegate: "GPU" },
        runningMode: "VIDEO",
      });
    } finally {
      this._loadingPose = false;
    }
  }

  /** Turns on iris-color sampling (face:eyecolor). Cheap to call/uncall repeatedly —
   *  intended to be toggled on only while a page that uses it is visible. */
  enableEyeColorSampling() {
    this._eyeColorEnabled = true;
  }

  disableEyeColorSampling() {
    this._eyeColorEnabled = false;
  }

  /** Turns on real heart-rate sensing (face:heartbeat). Needs ~8-10s of a
   *  fairly still, decently lit face before the first reading appears —
   *  that's a real constraint of the underlying technique (remote
   *  photoplethysmography), not a bug. Clears its buffer when disabled,
   *  so re-enabling later starts a fresh reading rather than resuming a
   *  stale one. */
  enableHeartRateSensing() {
    this._hr.enabled = true;
  }

  disableHeartRateSensing() {
    this._hr.enabled = false;
    this._hr.buffer = [];
  }

  stop() {
    this.running = false;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.video?.remove();
    this.video = null;
    this.stream = null;
  }

  _loop = () => {
    if (!this.running) return;
    const now = performance.now();
    if (this.video.currentTime !== this._lastVideoTime) {
      this._lastVideoTime = this.video.currentTime;
      this._tick(now);
    }
    requestAnimationFrame(this._loop);
  };

  _tick(timestamp) {
    const face = this.faceLandmarker.detectForVideo(this.video, timestamp);
    this._emitFace(face, timestamp);

    const hand = this.handLandmarker.detectForVideo(this.video, timestamp);
    this._emitHand(hand, timestamp);

    if (this.poseLandmarker) {
      const pose = this.poseLandmarker.detectForVideo(this.video, timestamp);
      this._emitPose(pose);
    }
  }

  _emitFace(result, timestamp) {
    if (!result.faceBlendshapes?.length) {
      this._smileFrames = 0;
      this.dispatchEvent(new CustomEvent("face:lost"));
      return;
    }
    const cats = result.faceBlendshapes[0].categories;
    const score = (name) => cats.find((c) => c.categoryName === name)?.score ?? 0;
    const smile = (score("mouthSmileLeft") + score("mouthSmileRight")) / 2;

    if (smile > 0.5) {
      this._smileFrames++;
      if (this._smileFrames === 5) {
        this.dispatchEvent(new CustomEvent("face:smile", { detail: { score: smile } }));
      }
    } else {
      this._smileFrames = 0;
    }

    // eyeBlinkLeft/Right are scores MediaPipe already calculates for us —
    // no manual eye-shape math needed, just watch them cross a threshold
    const blinkL = score("eyeBlinkLeft");
    const blinkR = score("eyeBlinkRight");
    const eyesClosed = blinkL > 0.5 && blinkR > 0.5;

    if (eyesClosed && !this._eyesClosed) {
      this._eyesClosed = true; // eyes just closed — wait for reopen to count it
    } else if (!eyesClosed && this._eyesClosed) {
      this._eyesClosed = false; // eyes just reopened — that's one completed blink
      this.dispatchEvent(new CustomEvent("face:blink"));
    }

    // two people leaning into frame together
    if (result.faceLandmarks?.length >= 2 && timestamp - this._togetherLastTime > 3000) {
      this._togetherLastTime = timestamp;
      this.dispatchEvent(new CustomEvent("face:together"));
    }

    const lm = result.faceLandmarks?.[0];
    if (lm) {
      this._emitProximity(lm);
      this._emitEyeColor(lm, timestamp);
      this._emitHeartRate(lm, timestamp);
    }
  }

  /** How close the face is to the camera, as a 0 (far) to 1 (close) value that
   *  recalibrates to whatever range you've actually been sitting in. */
  _emitProximity(lm) {
    // landmarks 234 and 454 sit roughly at the left/right edges of the face
    // outline — the distance between them grows as you lean toward the camera
    const width = this._dist(lm[234], lm[454]);
    const p = this._proximity;
    p.smoothed = p.smoothed === null ? width : p.smoothed + (width - p.smoothed) * 0.15;
    p.min = p.min === null ? p.smoothed : Math.min(p.min, p.smoothed);
    p.max = p.max === null ? p.smoothed : Math.max(p.max, p.smoothed);
    // slowly widen the range back out so it recalibrates through the session
    p.min += (p.smoothed - p.min) * 0.001;
    p.max -= (p.max - p.smoothed) * 0.001;

    const range = Math.max(p.max - p.min, 0.001);
    const value = Math.min(1, Math.max(0, (p.smoothed - p.min) / range));
    this.dispatchEvent(new CustomEvent("face:proximity", { detail: { value } }));
  }

  /** Averages the pixel color under the iris landmarks of the primary face.
   *  Throttled to ~2.5 samples/sec and only runs when a feature has opted in,
   *  since it needs an extra canvas read (readback is the expensive part). */
  _emitEyeColor(lm, timestamp) {
    if (!this._eyeColorEnabled) return;
    if (timestamp - this._lastEyeSample < 400) return;
    this._lastEyeSample = timestamp;

    if (!this._sampleCanvas) {
      this._sampleCanvas = document.createElement("canvas");
      this._sampleCanvas.width = this.video.videoWidth;
      this._sampleCanvas.height = this.video.videoHeight;
      this._sampleCtx = this._sampleCanvas.getContext("2d", { willReadFrequently: true });
    }
    this._sampleCtx.drawImage(
      this.video, 0, 0, this._sampleCanvas.width, this._sampleCanvas.height
    );

    const w = this._sampleCanvas.width;
    const h = this._sampleCanvas.height;
    let r = 0, g = 0, b = 0, n = 0;

    for (const i of IRIS_LANDMARK_IDS) {
      const pt = lm[i];
      if (!pt) continue;
      const px = Math.min(w - 1, Math.max(0, Math.round(pt.x * w)));
      const py = Math.min(h - 1, Math.max(0, Math.round(pt.y * h)));
      const data = this._sampleCtx.getImageData(px, py, 1, 1).data;
      r += data[0]; g += data[1]; b += data[2]; n++;
    }
    if (n === 0) return;

    r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
    // near-black average usually means we caught the pupil, not the iris ring —
    // skip it, the next sample 400ms later will likely land better
    if (r + g + b < 60) return;

    const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
    this.dispatchEvent(new CustomEvent("face:eyecolor", { detail: { hex } }));
  }

  /**
   * Remote photoplethysmography (rPPG): blood volume changes with every
   * heartbeat subtly change how much light facial skin reflects — most
   * visible in the green channel. Sampling the forehead's average green
   * value continuously and finding the periodic peaks in that signal
   * gives a real, measured heart rate — the same principle used by
   * fitness-tracker wrist sensors, just via camera instead of LED+photodiode.
   *
   * This is inherently noisier than dedicated hardware: it needs decent,
   * fairly even lighting and a mostly-still face to lock on. Genuinely
   * unreliable in bad lighting or with a lot of head movement — that's a
   * real limitation of the technique, not a bug to "fix" with tighter
   * thresholds.
   */
  _emitHeartRate(lm, timestamp) {
    if (!this._hr.enabled) return;

    if (!this._hr.sampleCanvas) {
      this._hr.sampleCanvas = document.createElement("canvas");
      this._hr.sampleCanvas.width = this.video.videoWidth;
      this._hr.sampleCanvas.height = this.video.videoHeight;
      this._hr.sampleCtx = this._hr.sampleCanvas.getContext("2d", { willReadFrequently: true });
    }
    const w = this._hr.sampleCanvas.width;
    const h = this._hr.sampleCanvas.height;
    this._hr.sampleCtx.drawImage(this.video, 0, 0, w, h);

    // Forehead ROI: midpoint of landmark 10 (hairline) and landmark 9
    // (glabella, between the brows), sized relative to face width so it
    // scales correctly whether you're close to or far from the camera.
    const faceWidthPx = this._dist(lm[234], lm[454]) * w;
    const cx = ((lm[10].x + lm[9].x) / 2) * w;
    const cy = ((lm[10].y + lm[9].y) / 2) * h;
    const boxW = Math.max(10, faceWidthPx * 0.25);
    const boxH = Math.max(8, faceWidthPx * 0.15);

    const x = Math.max(0, Math.round(cx - boxW / 2));
    const y = Math.max(0, Math.round(cy - boxH / 2));
    const bw = Math.min(w - x, Math.round(boxW));
    const bh = Math.min(h - y, Math.round(boxH));
    if (bw <= 0 || bh <= 0) return;

    const data = this._hr.sampleCtx.getImageData(x, y, bw, bh).data;
    let gSum = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) {
      gSum += data[i + 1]; // green channel — most sensitive to blood-volume changes
      n++;
    }
    if (n === 0) return;
    const gAvg = gSum / n;

    const buf = this._hr.buffer;
    buf.push({ t: timestamp, g: gAvg });
    while (buf.length && timestamp - buf[0].t > HR_WINDOW_MS) buf.shift();

    if (timestamp - this._hr.lastEmit < HR_EMIT_INTERVAL_MS) return;
    if (buf.length < 30) return; // not enough samples yet
    if (buf[buf.length - 1].t - buf[0].t < HR_WINDOW_MS * 0.8) return; // need a near-full window

    const bpm = this._estimateBpm(buf);
    if (bpm) {
      this._hr.lastEmit = timestamp;
      this.dispatchEvent(new CustomEvent("face:heartbeat", { detail: { bpm } }));
    }
  }

  /** Detrends the green-channel signal (removes slow lighting drift via a
   *  moving average), finds peaks with a minimum spacing to reject noise,
   *  and converts the average peak-to-peak interval into BPM. Returns null
   *  if there's not yet enough of a clean periodic signal to trust. */
  _estimateBpm(buf) {
    const values = buf.map((p) => p.g);
    const detrended = values.map((v, i) => {
      const start = Math.max(0, i - HR_MOVING_AVG_SAMPLES);
      const slice = values.slice(start, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      return v - avg;
    });

    const peaks = [];
    for (let i = 1; i < detrended.length - 1; i++) {
      if (detrended[i] > detrended[i - 1] && detrended[i] > detrended[i + 1] && detrended[i] > 0) {
        const t = buf[i].t;
        if (!peaks.length || t - peaks[peaks.length - 1] > HR_MIN_PEAK_SPACING_MS) {
          peaks.push(t);
        }
      }
    }

    if (peaks.length < HR_MIN_PEAKS) return null;

    const intervals = [];
    for (let i = 1; i < peaks.length; i++) intervals.push(peaks[i] - peaks[i - 1]);
    const avgIntervalMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60000 / avgIntervalMs);

    if (bpm < HR_MIN_BPM || bpm > HR_MAX_BPM) return null; // outside realistic human range
    return bpm;
  }

  _emitHand(result, timestamp) {
    const hands = result.landmarks || [];
    if (hands.length === 0) {
      if (this._pointing) {
        this._pointing = false;
        this.dispatchEvent(new CustomEvent("hand:pointend"));
      }
      return;
    }

    const lm = hands[0];
    this._emitWave(lm, timestamp);

    const pointing = this._isPointing(lm);
    if (pointing) {
      this._pointing = true;
      // mirror x to match a front-facing camera preview
      this.dispatchEvent(
        new CustomEvent("hand:point", { detail: { x: 1 - lm[8].x, y: lm[8].y } })
      );
    } else if (this._pointing) {
      this._pointing = false;
      this.dispatchEvent(new CustomEvent("hand:pointend"));
    }

    if (hands.length >= 2) {
      this._emitHeart(hands[0], hands[1], timestamp);
    }
  }

  /** A "wave" is just the wrist changing x-direction several times in under
   *  ~1.2s, with enough side-to-side distance that it isn't just hand jitter. */
  _emitWave(lm, timestamp) {
    const w = this._wave;
    w.history.push({ x: lm[0].x, t: timestamp });
    w.history = w.history.filter((p) => timestamp - p.t < 1200);
    if (w.history.length < 6) return;

    let reversals = 0;
    let prevDir = null;
    let minX = Infinity;
    let maxX = -Infinity;
    for (let i = 1; i < w.history.length; i++) {
      const dx = w.history[i].x - w.history[i - 1].x;
      if (Math.abs(dx) < 0.003) continue; // ignore tiny jitter, not a real direction
      const dir = dx > 0 ? 1 : -1;
      if (prevDir !== null && dir !== prevDir) reversals++;
      prevDir = dir;
      minX = Math.min(minX, w.history[i].x);
      maxX = Math.max(maxX, w.history[i].x);
    }

    const amplitude = maxX - minX;
    const cooledDown = timestamp - w.lastWaveTime > 1500; // don't refire every frame of the same wave

    if (reversals >= 3 && amplitude > 0.08 && cooledDown) {
      w.lastWaveTime = timestamp;
      w.history = [];
      this.dispatchEvent(new CustomEvent("hand:wave"));
    }
  }

  /** Classic "heart" shape: both hands' thumb tips together AND both index
   *  tips together, while the wrists stay apart — that last check is what
   *  tells this apart from just clasping your hands together in a ball. */
  _emitHeart(handA, handB, timestamp) {
    const thumbDist = this._dist(handA[4], handB[4]);
    const indexDist = this._dist(handA[8], handB[8]);
    const wristDist = this._dist(handA[0], handB[0]);
    const cooledDown = timestamp - this._heart.lastFireTime > 2000;

    if (thumbDist < 0.07 && indexDist < 0.06 && wristDist > 0.09 && cooledDown) {
      this._heart.lastFireTime = timestamp;
      this.dispatchEvent(new CustomEvent("hand:heart"));
    }
  }

  _emitPose(result) {
    const lm = result.landmarks?.[0];
    if (!lm) return;
    const leftShoulder = lm[11];
    const rightShoulder = lm[12];
    if (!leftShoulder || !rightShoulder) return;
    this.dispatchEvent(
      new CustomEvent("pose:shoulders", { detail: { y: (leftShoulder.y + rightShoulder.y) / 2 } })
    );
  }

  _dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
  }

  _fingerExtended(lm, tip, pip) {
    return this._dist(lm[tip], lm[0]) > this._dist(lm[pip], lm[0]) * 1.15;
  }

  _isPointing(lm) {
    return (
      this._fingerExtended(lm, 8, 6) &&
      !this._fingerExtended(lm, 12, 10) &&
      !this._fingerExtended(lm, 16, 14) &&
      !this._fingerExtended(lm, 20, 18)
    );
  }
}

const visionEngine = new VisionEngine();
export default visionEngine;