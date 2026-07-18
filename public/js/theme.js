// /**
//  * theme.js — Theme & Time-of-Day Controller
//  * ============================================
//  * Handles:
//  *  1. Light/dark theme toggle, persisted in localStorage
//  *     (safe here since this is a real website, not a
//  *     sandboxed environment).
//  *  2. Time-of-day ambient tinting — subtly shifts the
//  *     background glow and particle colors based on the
//  *     current hour (warmer golds in evening, cooler
//  *     lavenders at night, etc).
//  */

// const ThemeController = (() => {
//   const STORAGE_KEY = "site-theme";

//   function applySavedTheme() {
//     const saved = localStorage.getItem(STORAGE_KEY);
//     if (saved === "light") {
//       document.documentElement.setAttribute("data-theme", "light");
//       updateIcon("light");
//     } else {
//       document.documentElement.removeAttribute("data-theme");
//       updateIcon("dark");
//     }
//   }

//   function toggleTheme() {
//     const isLight = document.documentElement.getAttribute("data-theme") === "light";
//     if (isLight) {
//       document.documentElement.removeAttribute("data-theme");
//       localStorage.setItem(STORAGE_KEY, "dark");
//       updateIcon("dark");
//     } else {
//       document.documentElement.setAttribute("data-theme", "light");
//       localStorage.setItem(STORAGE_KEY, "light");
//       updateIcon("light");
//     }

//     // If the Statistics charts have already been rendered, redraw
//     // them so axis/legend text matches the newly active theme.
//     if (window.StatisticsPage && typeof StatisticsPage.refreshTheme === "function") {
//       StatisticsPage.refreshTheme();
//     }
//   }

//   function updateIcon(mode) {
//     const icon = document.querySelector("#theme-toggle .theme-icon");
//     if (icon) icon.textContent = mode === "light" ? "☀️" : "🌙";
//   }

//   function init() {
//     applySavedTheme();
//     const btn = document.getElementById("theme-toggle");
//     if (btn) btn.addEventListener("click", toggleTheme);
//   }

//   return { init };
// })();

// const TimeOfDayController = (() => {
//   // Each bucket tints the ambient background glow (3 layers)
//   // and the floating particle color used on the Home page.
//   const palettes = {
//     night: {
//       glow1: "rgba(150, 140, 220, 0.07)",
//       glow2: "rgba(100, 90, 170, 0.05)",
//       glow3: "rgba(255, 215, 0, 0.015)",
//       particle: "#a29bfe",
//     },
//     morning: {
//       glow1: "rgba(255, 170, 190, 0.06)",
//       glow2: "rgba(255, 210, 140, 0.045)",
//       glow3: "rgba(255, 215, 0, 0.03)",
//       particle: "#ff9fb8",
//     },
//     afternoon: {
//       glow1: "rgba(255, 107, 157, 0.04)",
//       glow2: "rgba(196, 167, 231, 0.04)",
//       glow3: "rgba(255, 215, 0, 0.02)",
//       particle: "#ff6b9d",
//     },
//     evening: {
//       glow1: "rgba(255, 150, 80, 0.07)",
//       glow2: "rgba(255, 107, 157, 0.05)",
//       glow3: "rgba(255, 180, 60, 0.06)",
//       particle: "#ffb347",
//     },
//   };

//   function getBucket(hour) {
//     if (hour >= 5 && hour < 11) return "morning";
//     if (hour >= 11 && hour < 17) return "afternoon";
//     if (hour >= 17 && hour < 21) return "evening";
//     return "night";
//   }

//   function apply() {
//     const hour = new Date().getHours();
//     const bucket = getBucket(hour);
//     const palette = palettes[bucket];
//     const root = document.documentElement;

//     root.style.setProperty("--ambient-glow-1", palette.glow1);
//     root.style.setProperty("--ambient-glow-2", palette.glow2);
//     root.style.setProperty("--ambient-glow-3", palette.glow3);
//     root.style.setProperty("--particle-tint", palette.particle);
//     root.dataset.timeOfDay = bucket;
//   }

//   function init() {
//     apply();
//     // Re-check periodically in case the tab stays open across
//     // a time-of-day boundary (e.g. evening into night).
//     setInterval(apply, 30 * 60 * 1000);
//   }

//   return { init };
// })();

/**
 * theme.js — Theme & Time-of-Day Controller
 * ============================================
 * Handles:
 *  1. Light/dark theme toggle, persisted in localStorage
 *     (safe here since this is a real website, not a
 *     sandboxed environment).
 *  2. Time-of-day ambient tinting — subtly shifts the
 *     background glow and particle colors based on the
 *     current hour (warmer golds in evening, cooler
 *     lavenders at night, etc).
 */

const ThemeController = (() => {
  const STORAGE_KEY = "site-theme";

  function applySavedTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      updateIcon("light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      updateIcon("dark");
    }
  }

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (isLight) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem(STORAGE_KEY, "dark");
      updateIcon("dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem(STORAGE_KEY, "light");
      updateIcon("light");
    }

    // If the Statistics charts have already been rendered, redraw
    // them so axis/legend text matches the newly active theme.
    if (window.StatisticsPage && typeof StatisticsPage.refreshTheme === "function") {
      StatisticsPage.refreshTheme();
    }
  }

  function updateIcon(mode) {
    const icon = document.querySelector("#theme-toggle .theme-icon");
    if (icon) icon.textContent = mode === "light" ? "☀️" : "🌙";
  }

  function init() {
    applySavedTheme();
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggleTheme);
  }

  return { init };
})();

const TimeOfDayController = (() => {
  // Each bucket tints the ambient background glow (3 layers)
  // and the floating particle color used on the Home page.
  const palettes = {
    night: {
      glow1: "rgba(150, 140, 220, 0.07)",
      glow2: "rgba(100, 90, 170, 0.05)",
      glow3: "rgba(255, 215, 0, 0.015)",
      particle: "#a29bfe",
    },
    morning: {
      glow1: "rgba(255, 170, 190, 0.06)",
      glow2: "rgba(255, 210, 140, 0.045)",
      glow3: "rgba(255, 215, 0, 0.03)",
      particle: "#ff9fb8",
    },
    afternoon: {
      glow1: "rgba(255, 107, 157, 0.04)",
      glow2: "rgba(196, 167, 231, 0.04)",
      glow3: "rgba(255, 215, 0, 0.02)",
      particle: "#ff6b9d",
    },
    evening: {
      glow1: "rgba(255, 150, 80, 0.07)",
      glow2: "rgba(255, 107, 157, 0.05)",
      glow3: "rgba(255, 180, 60, 0.06)",
      particle: "#ffb347",
    },
  };

  function getBucket(hour) {
    if (hour >= 5 && hour < 11) return "morning";
    if (hour >= 11 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  function apply() {
    const hour = new Date().getHours();
    const bucket = getBucket(hour);
    const palette = palettes[bucket];
    const root = document.documentElement;

    root.style.setProperty("--ambient-glow-1", palette.glow1);
    root.style.setProperty("--ambient-glow-2", palette.glow2);
    root.style.setProperty("--ambient-glow-3", palette.glow3);
    root.style.setProperty("--particle-tint", palette.particle);
    root.dataset.timeOfDay = bucket;
  }

  function init() {
    apply();
    // Re-check periodically in case the tab stays open across
    // a time-of-day boundary (e.g. evening into night).
    setInterval(apply, 30 * 60 * 1000);
  }

  return { init };
})();