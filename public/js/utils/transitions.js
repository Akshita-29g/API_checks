/**
 * transitions.js — GSAP Page Transition Helpers
 * ================================================
 * Provides smooth page-in and page-out animations
 * with consistent timing and easing.
 */

const PageTransitions = (() => {
  const DURATION = 0.6;
  const EASE_OUT = "power2.out";
  const EASE_IN = "power2.in";

  /**
   * Animate the current page out (fade + slide up).
   * @param {HTMLElement} el - The page section element.
   * @returns {Promise} Resolves when animation completes.
   */
  function pageOut(el) {
    return new Promise((resolve) => {
      gsap.to(el, {
        opacity: 0,
        y: -30,
        duration: DURATION * 0.6,
        ease: EASE_IN,
        onComplete: () => {
          el.classList.remove("active");
          // Reset position for future transitions
          gsap.set(el, { y: 0, opacity: 1 });
          resolve();
        },
      });
    });
  }

  /**
   * Animate the next page in (fade + slide up from below).
   * @param {HTMLElement} el - The page section element.
   * @returns {Promise} Resolves when animation completes.
   */
  function pageIn(el) {
    return new Promise((resolve) => {
      gsap.set(el, { opacity: 0, y: 40 });
      el.classList.add("active");
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: DURATION,
        ease: EASE_OUT,
        onComplete: resolve,
      });
    });
  }

  /**
   * Full page transition: out → in.
   * @param {HTMLElement} currentEl - Outgoing page.
   * @param {HTMLElement} nextEl - Incoming page.
   * @returns {Promise} Resolves when both animations complete.
   */
  async function transition(currentEl, nextEl) {
    await pageOut(currentEl);
    await pageIn(nextEl);
  }

  /**
   * Animate an element with a staggered entrance.
   * @param {string|HTMLElement[]} targets - Selector or elements.
   * @param {object} options - Override defaults.
   */
  function staggerIn(targets, options = {}) {
    gsap.from(targets, {
      opacity: 0,
      y: 30,
      duration: options.duration || 0.5,
      stagger: options.stagger || 0.1,
      ease: EASE_OUT,
      delay: options.delay || 0,
      ...options,
    });
  }

  return { pageOut, pageIn, transition, staggerIn };
})();
