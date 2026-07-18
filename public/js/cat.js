/**
 * cat.js — Animated Cat Controller
 * ===================================
 * Handles click/pat interaction: happy tail wag,
 * floating hearts, and return to idle state.
 */

// const Cat = (() => {
//   let catContainer;
//   let catEl;
//   let isHappy = false;

//   function init() {
//     catContainer = document.getElementById("cat-container");
//     catEl = document.getElementById("cat");

//     catContainer.addEventListener("click", onPat);
//     catContainer.addEventListener("touchstart", onPat, { passive: true });
//   }

//   /**
//    * Handle cat pat interaction.
//    */
//   function onPat(e) {
//     e.stopPropagation();

//     // Don't stack animations
//     if (isHappy) return;
//     isHappy = true;

//     // Activate happy state (fast tail wag + squinty eyes)
//     catEl.classList.add("happy");

//     // Spawn floating hearts
//     spawnHearts(4);

//     // Return to idle after 2 seconds
//     setTimeout(() => {
//       catEl.classList.remove("happy");
//       isHappy = false;
//     }, 2000);
//   }

//   /**
//    * Spawn floating heart emojis above the cat.
//    * @param {number} count - Number of hearts to spawn.
//    */
//   function spawnHearts(count) {
//     const hearts = ["❤️", "💕", "💖", "💗", "💘"];

//     for (let i = 0; i < count; i++) {
//       const heart = document.createElement("span");
//       heart.classList.add("cat-heart");
//       heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

//       // Randomize position around the cat
//       heart.style.left = `${15 + Math.random() * 50}px`;
//       heart.style.top = `${-10 + Math.random() * 20}px`;
//       heart.style.animation = `heartFloat 1.5s ease-out forwards`;
//       heart.style.animationDelay = `${i * 0.15}s`;

//       catContainer.appendChild(heart);

//       // Clean up after animation
//       setTimeout(() => {
//         heart.remove();
//       }, 2000 + i * 150);
//     }
//   }

//   return { init };
// })();

/**
 * cat.js — Animated Cat Controller
 * ===================================
 * Handles click/pat interaction: happy tail wag,
 * floating hearts, and return to idle state.
 */

const Cat = (() => {
  let catContainer;
  let catEl;
  let isHappy = false;

  function init() {
    catContainer = document.getElementById("cat-container");
    catEl = document.getElementById("cat");

    catContainer.addEventListener("click", onPat);
    catContainer.addEventListener("touchstart", onPat, { passive: true });
  }

  /**
   * Handle cat pat interaction.
   */

  
  function onPat(e) {
    e.stopPropagation();
    console.log("Cat was patted!"); // ← temporary debug line


    // Don't stack animations
    if (isHappy) return;
    isHappy = true;

    // Activate happy state (fast tail wag + squinty eyes)
    catEl.classList.add("happy");

    // Spawn floating hearts
    spawnHearts(4);

    // Return to idle after 2 seconds
    setTimeout(() => {
      catEl.classList.remove("happy");
      isHappy = false;
    }, 2000);
  }

  /**
   * Spawn floating pink glow hearts above the cat, matching the
   * same slow cinematic rise-and-fade used elsewhere on the site.
   * @param {number} count - Number of hearts to spawn.
   */
function spawnHearts(count) {
  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    heart.classList.add("cat-heart");
    heart.textContent = "♥";

    const size = 12 + Math.random() * 14; // 12px–26px
    const duration = 2.2 + Math.random() * 1.2; // 2.2s–3.4s
    const delay = i * 0.18;

    heart.style.left = `${10 + Math.random() * 55}px`;
    heart.style.top = `${-10 + Math.random() * 20}px`;
    heart.style.fontSize = `${size}px`;
    heart.style.color = "#ff6b9d";
    heart.style.textShadow = "0 0 14px rgba(255, 107, 157, 0.95), 0 0 6px rgba(255, 255, 255, 0.7)";
    // Set the full animation directly, inline — this guarantees it
    // runs regardless of anything else defined in cat.css
    heart.style.animation = `heartFloat ${duration}s ease-out forwards`;
    heart.style.animationDelay = `${delay}s`;

    catContainer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, (duration + delay + 0.3) * 1000);
  }
}

  return { init };
})();
