/**
 * library.js — Library Page Controller
 * =======================================
 * Click-to-reveal image gallery. Each click reveals
 * one image; after all 6, a Continue button appears.
 */

/**
 * library.js — Library Page Controller
 * =======================================
 * Click-to-reveal image gallery. Each click reveals
 * one image; after all 6, a Continue button appears.
 */

// const LibraryPage = (() => {
//   let grid;
//   let prompt;
//   let continueWrapper;
//   let revealedCount = 0;
//   let totalImages = 6;
//   let imageData = [];
//   let initialized = false;
//   let isActive = false;

//   function init(contentData) {
//     grid = document.getElementById("library-grid");
//     prompt = document.getElementById("library-prompt");
//     continueWrapper = document.getElementById("library-continue");

//     // Get image data from config
//     if (contentData && contentData.libraryImages) {
//       imageData = contentData.libraryImages;
//       totalImages = imageData.length;
//     }

//     // Build image cards
//     buildGrid();

//     // Continue button
//     document.getElementById("btn-library-continue").addEventListener("click", () => {
//       App.navigateTo("statistics");
//     });

//     initialized = true;
//   }

//   /**
//    * Build the image grid with hidden cards.
//    */
//   function buildGrid() {
//     grid.innerHTML = "";

//     for (let i = 0; i < totalImages; i++) {
//       const card = document.createElement("div");
//       card.classList.add("library-image-card");
//       card.dataset.index = i;

//       // Number badge
//       const badge = document.createElement("span");
//       badge.classList.add("image-number");
//       badge.textContent = i + 1;
//       card.appendChild(badge);

//       // Image or placeholder
//       const src = imageData[i];
//       if (src && !src.includes("placeholder")) {
//         const img = document.createElement("img");
//         img.src = src;
//         img.alt = `Memory ${i + 1}`;
//         img.loading = "lazy";
//         card.appendChild(img);
//       } else {
//         // Styled placeholder
//         const placeholder = document.createElement("div");
//         placeholder.classList.add("placeholder-img");
//         const emojis = ["📷", "🌸", "✨", "💫", "🌹", "💝"];
//         placeholder.textContent = emojis[i] || "📷";
//         card.appendChild(placeholder);
//       }

//       grid.appendChild(card);
//     }
//   }

//   /**
//    * Handle page click to reveal next image.
//    * Called by the page section's click listener.
//    */
//   function onPageClick(e) {
//     // Don't trigger on button clicks
//     if (e.target.closest(".btn") || e.target.closest(".nav-link") || e.target.closest(".cat-container")) {
//       return;
//     }

//     if (revealedCount >= totalImages) return;

//     const card = grid.children[revealedCount];
//     if (!card) return;

//     // Reveal with GSAP animation
//     gsap.to(card, {
//       opacity: 1,
//       scale: 1,
//       duration: 0.6,
//       ease: "back.out(1.5)",
//       overwrite: "auto",
//       onStart: () => {
//         card.classList.add("revealed");
//         card.classList.add("just-revealed");
//       },
//       onComplete: () => {
//         // Remove glow after a moment
//         setTimeout(() => {
//           card.classList.remove("just-revealed");
//         }, 800);
//       },
//     });

//     revealedCount++;

//     // After all images revealed, show Continue
//     if (revealedCount >= totalImages) {
//       prompt.classList.add("hidden");
//       setTimeout(() => {
//         continueWrapper.classList.add("visible");
//         gsap.fromTo(
//           continueWrapper,
//           { opacity: 0, y: 20 },
//           {
//             opacity: 1,
//             y: 0,
//             duration: 0.5,
//             ease: "power2.out",
//             overwrite: "auto",
//             clearProps: "opacity,transform",
//           }
//         );
//       }, 400);
//     }
//   }

//   /**
//    * Activate the page (set up click listener).
//    */
//   function activate() {
//     if (isActive) return;
//     isActive = true;
//     const section = document.getElementById("page-library");
//     section.addEventListener("click", onPageClick);
//   }

//   /**
//    * Deactivate (remove click listener to avoid conflicts).
//    */
//   function deactivate() {
//     isActive = false;
//     const section = document.getElementById("page-library");
//     section.removeEventListener("click", onPageClick);
//   }

//   return { init, activate, deactivate };
// })();


/**
 * library.js — Library Page Controller
 * =======================================
 * Click-to-reveal image gallery. Each click reveals
 * one image; after all 6, a Continue button appears.
 * A sparkle burst fires from each photo as it reveals.
 */

const LibraryPage = (() => {
  let grid;
  let prompt;
  let continueWrapper;
  let particlesContainer;
  let revealedCount = 0;
  let totalImages = 6;
  let imageData = [];
  let initialized = false;
  let isActive = false;
  let particleCounter = 0;

  function init(contentData) {
    grid = document.getElementById("library-grid");
    prompt = document.getElementById("library-prompt");
    continueWrapper = document.getElementById("library-continue");
    particlesContainer = document.getElementById("library-particles-container");

    // Get image data from config
    if (contentData && contentData.libraryImages) {
      imageData = contentData.libraryImages;
      totalImages = imageData.length;
    }

    // Build image cards
    buildGrid();

    // Continue button
    document.getElementById("btn-library-continue").addEventListener("click", () => {
      App.navigateTo("statistics");
    });

    initialized = true;
  }

  /**
   * Build the image grid with hidden cards.
   */
  function buildGrid() {
    grid.innerHTML = "";

    for (let i = 0; i < totalImages; i++) {
      const card = document.createElement("div");
      card.classList.add("library-image-card");
      card.dataset.index = i;

      // Number badge
      const badge = document.createElement("span");
      badge.classList.add("image-number");
      badge.textContent = i + 1;
      card.appendChild(badge);

      // Image or placeholder
      const src = imageData[i];
      if (src && !src.includes("placeholder")) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = `Memory ${i + 1}`;
        img.loading = "lazy";
        card.appendChild(img);
      } else {
        // Styled placeholder
        const placeholder = document.createElement("div");
        placeholder.classList.add("placeholder-img");
        const emojis = ["📷", "🌸", "✨", "💫", "🌹", "💝"];
        placeholder.textContent = emojis[i] || "📷";
        card.appendChild(placeholder);
      }

      grid.appendChild(card);
    }
  }

  /**
   * Emit a slow, ambient glow that appears to rise from behind
   * the given card — soft particles drift upward and fade,
   * spawned in gentle waves rather than one instant burst.
   */
  function revealGlowAtCard(card) {
    if (!particlesContainer || !card) return;

    const cardRect = card.getBoundingClientRect();
    const containerRect = particlesContainer.getBoundingClientRect();

    const originLeft = cardRect.left - containerRect.left;
    const originTop = cardRect.top - containerRect.top;
    const width = cardRect.width;
    const height = cardRect.height;

    let tick = 0;
    const maxTicks = 7;

    const spawnWave = () => {
  tick++;
  const countThisWave = 3 + Math.floor(Math.random() * 2); // 3–4 per wave (was 2–3)

  for (let i = 0; i < countThisWave; i++) {
    particleCounter++;
    const isHeart = particleCounter % 5 === 0;

    const px = originLeft + Math.random() * width;
    const py = originTop + height * (0.55 + Math.random() * 0.5);

    const riseDistance = 70 + Math.random() * 110;
    const drift = (Math.random() - 0.5) * 50;
    const duration = 2.4 + Math.random() * 1.4;

    const particle = document.createElement("div");
    particle.style.left = `${px}px`;
    particle.style.top = `${py}px`;
    particle.style.setProperty("--dx", `${drift}px`);
    particle.style.setProperty("--dy", `${-riseDistance}px`);
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${Math.random() * 0.2}s`;

    if (isHeart) {
      particle.classList.add("lib-glow-heart");
      particle.textContent = "♥";
      particle.style.fontSize = `${16 + Math.random() * 14}px`; // was 9–18px, now 16–30px
    } else {
      particle.classList.add("lib-glow-dot");
      const size = 7 + Math.random() * 9; // was 3–9px, now 7–16px
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
    }

    particlesContainer.appendChild(particle);
    setTimeout(() => particle.remove(), (duration + 0.4) * 1000);
  }

  if (tick < maxTicks) {
    setTimeout(spawnWave, 160);
  }
};

    spawnWave();
  }

  /**
   * Handle page click to reveal next image.
   * Called by the page section's click listener.
   */
  function onPageClick(e) {
    // Don't trigger on button clicks
    if (e.target.closest(".btn") || e.target.closest(".nav-link") || e.target.closest(".cat-container")) {
      return;
    }

    if (revealedCount >= totalImages) return;

    const card = grid.children[revealedCount];
    if (!card) return;

    // Reveal with GSAP animation
    gsap.to(card, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.5)",
      overwrite: "auto",
      onStart: () => {
        card.classList.add("revealed");
        card.classList.add("just-revealed");
        revealGlowAtCard(card);
      },
      onComplete: () => {
        // Remove glow after a moment
        setTimeout(() => {
          card.classList.remove("just-revealed");
        }, 800);
      },
    });

    revealedCount++;

    // After all images revealed, show Continue
    if (revealedCount >= totalImages) {
      prompt.classList.add("hidden");
      setTimeout(() => {
        continueWrapper.classList.add("visible");
        gsap.fromTo(
          continueWrapper,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto",
            clearProps: "opacity,transform",
          }
        );
      }, 400);
    }
  }

  /**
   * Activate the page (set up click listener).
   */
  function activate() {
    if (isActive) return;
    isActive = true;
    const section = document.getElementById("page-library");
    section.addEventListener("click", onPageClick);
  }

  /**
   * Deactivate (remove click listener to avoid conflicts).
   */
  function deactivate() {
    isActive = false;
    const section = document.getElementById("page-library");
    section.removeEventListener("click", onPageClick);
  }

  return { init, activate, deactivate };
})();