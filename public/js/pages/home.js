/**
 * home.js — Home Page Controller
 * =================================
 * Floating bottle with particles, click-to-open letter,
 * and continue button navigation.
 */

const HomePage = (() => {
  let bottleWrapper;
  let letterContainer;
  let particlesContainer;
  let quoteEl;
  let particlesCreated = false;
  let letterOpened = false;

  function init(contentData) {
    bottleWrapper = document.getElementById("bottle-wrapper");
    letterContainer = document.getElementById("letter-container");
    particlesContainer = document.getElementById("particles-container");
    quoteEl = document.getElementById("letter-quote");

    // Set the romantic quote from config
    if (contentData && contentData.romanticQuote) {
      quoteEl.textContent = `"${contentData.romanticQuote}"`;
    } else {
      quoteEl.textContent = '"[Your romantic quote here]"';
    }

    // Create ambient particles
    createParticles();

    // Bottle click → open letter
    bottleWrapper.addEventListener("click", openLetter);

    // Continue button
    document.getElementById("btn-home-continue").addEventListener("click", () => {
      App.navigateTo("library");
    });
  }

  /**
   * Create glowing ambient particles around the bottle.
   */
  function createParticles() {
    if (particlesCreated) return;
    particlesCreated = true;

    const colors = [
      "rgba(255, 107, 157, 0.6)",
      "rgba(196, 167, 231, 0.5)",
      "rgba(255, 215, 0, 0.4)",
      "rgba(255, 143, 171, 0.5)",
    ];

    for (let i = 0; i < 35; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");

      // Randomize position, size, color, and timing
      particle.style.left = `${20 + Math.random() * 60}%`;
      particle.style.top = `${20 + Math.random() * 60}%`;
      // particle.style.width = `${2 + Math.random() * 4}px`;
      particle.style.width = `${3 + Math.random() * 6}px`; // was 2–6px, now 3–9px
      particle.style.height = particle.style.width;
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDelay = `${Math.random() * 6}s`;
      particle.style.animationDuration = `${4 + Math.random() * 4}s`;

      particlesContainer.appendChild(particle);
    }
  }

  /**
   * Open the letter with an unfolding animation.
   */
  // function openLetter() {
  //   if (letterOpened) return;
  //   letterOpened = true;

  //   const tl = gsap.timeline();

  //   // Bottle shrinks and fades out
  //   tl.to(bottleWrapper, {
  //     scale: 0.3,
  //     opacity: 0,
  //     duration: 0.6,
  //     ease: "power2.in",
  //     onComplete: () => {
  //       bottleWrapper.classList.add("hidden");
  //     },
  //   });

  //   // Letter unfolds in
  //   tl.add(() => {
  //     letterContainer.classList.add("visible");
  //   });

  //   tl.from(
  //     "#letter",
  //     {
  //       scaleY: 0,
  //       scaleX: 0.8,
  //       rotateX: 90,
  //       opacity: 0,
  //       duration: 0.8,
  //       ease: "back.out(1.5)",
  //       transformOrigin: "center center",
  //     },
  //     "-=0.1"
  //   );

  //   // Stagger in the letter content
  //   tl.from(
  //     "#letter .letter-greeting, #letter .letter-quote, #letter .letter-arrow, #letter .btn",
  //     {
  //       opacity: 0,
  //       y: 20,
  //       duration: 0.4,
  //       stagger: 0.15,
  //       ease: "power2.out",
  //     },
  //     "-=0.3"
  //   );
  // }
  function openLetter() {
  if (letterOpened) return;
  letterOpened = true;

  const tl = gsap.timeline();

  tl.to(bottleWrapper, {
    scale: 0.3,
    opacity: 0,
    duration: 0.6,
    ease: "power2.in",
    onComplete: () => {
      bottleWrapper.classList.add("hidden");
    },
  });

  tl.add(() => {
    letterContainer.classList.add("visible");
  });

  tl.from(
    "#letter",
    {
      scaleY: 0,
      scaleX: 0.8,
      rotateX: 90,
      opacity: 0,
      duration: 0.8,
      ease: "back.out(1.5)",
      transformOrigin: "center center",
    },
    "-=0.1"
  );

  tl.from(
    "#letter .letter-greeting, #letter .letter-quote, #letter .letter-arrow, #letter .btn",
    {
      opacity: 0,
      y: 20,
      duration: 0.4,
      stagger: 0.15,
      ease: "power2.out",
      clearProps: "opacity,transform",
    },
    "-=0.3"
  );

  // Safety net: force everything visible once the sequence completes
  tl.set(
    "#letter .letter-greeting, #letter .letter-quote, #letter .letter-arrow, #letter .btn",
    { clearProps: "all" }
  );
}

  /**
   * Reset the page state for re-entry.
   */
  function reset() {
    letterOpened = false;
    bottleWrapper.classList.remove("hidden");
    letterContainer.classList.remove("visible");
    gsap.set(bottleWrapper, { scale: 1, opacity: 1 });
  }

  return { init, reset };
})();
