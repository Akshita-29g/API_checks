// /**
//  * statistics.js — Statistics Page Controller
//  * =============================================
//  * Creates three Chart.js charts: bar, line (exponential), and pie.
//  * Uses romantic theme colors from the design system.
//  */

// // const StatisticsPage = (() => {
// //   let chartsRendered = false;

// //   // Theme colors for charts
// //   // const COLORS = {
// //   //   pink: "rgba(255, 107, 157, 0.8)",
// //   //   pinkFill: "rgba(255, 107, 157, 0.15)",
// //   //   lavender: "rgba(196, 167, 231, 0.8)",
// //   //   lavenderFill: "rgba(196, 167, 231, 0.15)",
// //   //   gold: "rgba(255, 215, 0, 0.8)",
// //   //   muted: "rgba(150, 140, 170, 0.6)",
// //   //   text: "rgba(245, 240, 255, 0.7)",
// //   //   grid: "rgba(255, 255, 255, 0.06)",
// //   // };
// //   function getThemeColors() {
// //   const styles = getComputedStyle(document.documentElement);
// //   return {
// //     pink: "rgba(255, 107, 157, 0.8)",
// //     pinkFill: "rgba(255, 107, 157, 0.15)",
// //     lavender: "rgba(196, 167, 231, 0.8)",
// //     lavenderFill: "rgba(196, 167, 231, 0.15)",
// //     gold: "rgba(255, 215, 0, 0.8)",
// //     muted: "rgba(150, 140, 170, 0.6)",
// //     text: styles.getPropertyValue("--color-text-secondary").trim(),
// //     grid: document.documentElement.getAttribute("data-theme") === "light"
// //       ? "rgba(0, 0, 0, 0.06)"
// //       : "rgba(255, 255, 255, 0.06)",
// //   };
// // }
// //   function init(contentData) {
// //     // Continue button
// //     document.getElementById("btn-stats-continue").addEventListener("click", () => {
// //       App.navigateTo("faq");
// //     });

// //     // Store content data for later use
// //     StatisticsPage._contentData = contentData;
// //   }

// //   /**
// //    * Render charts when the page becomes visible.
// //    * Charts need to be rendered when visible for proper sizing.
// //    */
// //   function renderCharts() {
// //     if (chartsRendered) return;
// //     chartsRendered = true;

// //     const contentData = StatisticsPage._contentData || {};
// //     const COLORS = getThemeColors();

// //     // Default data
// //     const barLabels = contentData.statisticsBarData?.labels ||
// //       ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
// //     const barValues = contentData.statisticsBarData?.values ||
// //       [2023.8, 2023.9, 2024.0, 2024.2, 2024.5, 2024.8, 2025.0, 2025.3, 2025.5, 2025.7, 2025.9, 2026.0];

// //     const pieLabels = contentData.statisticsPieData?.labels || ["Love", "Arguments", "Ignorance"];
// //     const pieValues = contentData.statisticsPieData?.values || [75, 20, 5];

// //     // Common chart options
// //     const commonOptions = {
// //       responsive: true,
// //       maintainAspectRatio: true,
// //       plugins: {
// //         legend: {
// //           labels: {
// //             color: COLORS.text,
// //             font: { family: "'Poppins', sans-serif", size: 12 },
// //             padding: 16,
// //           },
// //         },
// //       },
// //     };

// //     const scaleOptions = {
// //       x: {
// //         grid: { color: COLORS.grid },
// //         ticks: { color: COLORS.text, font: { family: "'Poppins', sans-serif", size: 11 } },
// //       },
// //       y: {
// //         grid: { color: COLORS.grid },
// //         ticks: {
// //           color: COLORS.text,
// //           font: { family: "'Poppins', sans-serif", size: 11 },
// //           callback: (val) => Math.round(val),
// //         },
// //         min: 2023,
// //         max: 2027,
// //       },
// //     };

// //     // ─── 1. Bar Chart (Histogram) ──────────────
// //     new Chart(document.getElementById("chart-bar"), {
// //       type: "bar",
// //       data: {
// //         labels: barLabels,
// //         datasets: [{
// //           label: "Our Timeline",
// //           data: barValues,
// //           backgroundColor: barValues.map((_, i) => {
// //             const ratio = i / (barValues.length - 1);
// //             return `rgba(255, ${Math.round(107 + ratio * 100)}, ${Math.round(157 + ratio * 40)}, ${0.5 + ratio * 0.4})`;
// //           }),
// //           borderColor: COLORS.pink,
// //           borderWidth: 1,
// //           borderRadius: 6,
// //           borderSkipped: false,
// //         }],
// //       },
// //       options: {
// //         ...commonOptions,
// //         animation: { duration: 1500, easing: "easeOutQuart" },
// //         scales: scaleOptions,
// //       },
// //     });

// //     // ─── 2. Line Chart (Exponential Growth) ────
// //     // Generate exponential curve data
// //     const expValues = barLabels.map((_, i) => {
// //       return 2023 + (Math.exp(i / 3.5) - 1) * 0.35;
// //     });

// //     new Chart(document.getElementById("chart-line"), {
// //       type: "line",
// //       data: {
// //         labels: barLabels,
// //         datasets: [{
// //           label: "Our Growth",
// //           data: expValues,
// //           borderColor: COLORS.lavender,
// //           backgroundColor: COLORS.lavenderFill,
// //           fill: true,
// //           tension: 0.4,
// //           pointBackgroundColor: COLORS.lavender,
// //           pointBorderColor: "#fff",
// //           pointBorderWidth: 1,
// //           pointRadius: 4,
// //           pointHoverRadius: 7,
// //         }],
// //       },
// //       options: {
// //         ...commonOptions,
// //         animation: { duration: 2000, easing: "easeOutQuart" },
// //         scales: scaleOptions,
// //       },
// //     });

// //     // ─── 3. Pie Chart ──────────────────────────
// //     new Chart(document.getElementById("chart-pie"), {
// //       type: "pie",
// //       data: {
// //         labels: pieLabels,
// //         datasets: [{
// //           data: pieValues,
// //           backgroundColor: [COLORS.pink, COLORS.lavender, COLORS.muted],
// //           borderColor: "rgba(13, 10, 26, 0.8)",
// //           borderWidth: 3,
// //           hoverOffset: 12,
// //         }],
// //       },
// //       options: {
// //         ...commonOptions,
// //         animation: { duration: 1500, easing: "easeOutQuart", animateRotate: true },
// //         plugins: {
// //           ...commonOptions.plugins,
// //           legend: {
// //             ...commonOptions.plugins.legend,
// //             position: "bottom",
// //           },
// //         },
// //       },
// //     });
// //   }

// //   return { init, renderCharts };
// // })();

// const StatisticsPage = (() => {
//   let chartsRendered = false;
//   let chartBar = null;
//   let chartLine = null;
//   let chartPie = null;

//   function init(contentData) {
//     // Continue button
//     document.getElementById("btn-stats-continue").addEventListener("click", () => {
//       App.navigateTo("faq");
//     });

//     // Store content data for later use
//     StatisticsPage._contentData = contentData;
//   }

//   /**
//    * Read the currently active theme's colors directly from CSS
//    * variables, so charts always match whichever theme is active
//    * at the moment they're (re)rendered.
//    */
//   function getThemeColors() {
//     const styles = getComputedStyle(document.documentElement);
//     const isLight = document.documentElement.getAttribute("data-theme") === "light";

//     return {
//       pink: "rgba(255, 107, 157, 0.8)",
//       pinkFill: "rgba(255, 107, 157, 0.15)",
//       lavender: "rgba(196, 167, 231, 0.8)",
//       lavenderFill: "rgba(196, 167, 231, 0.15)",
//       gold: "rgba(255, 215, 0, 0.8)",
//       muted: "rgba(150, 140, 170, 0.6)",
//       text: styles.getPropertyValue("--color-text-secondary").trim(),
//       grid: isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.06)",
//     };
//   }

//   /**
//    * Render charts when the page becomes visible.
//    * Charts need to be rendered when visible for proper sizing.
//    */
//   function renderCharts() {
//     if (chartsRendered) return;
//     chartsRendered = true;
//     buildCharts();
//   }

//   /**
//    * Destroy and rebuild all charts with fresh colors — called
//    * when the theme is toggled, so axis/legend text always
//    * matches the currently active theme instead of staying
//    * stuck at whatever color was used on first render.
//    */
//   function refreshTheme() {
//     if (!chartsRendered) return; // nothing rendered yet, nothing to refresh
//     if (chartBar) chartBar.destroy();
//     if (chartLine) chartLine.destroy();
//     if (chartPie) chartPie.destroy();
//     buildCharts();
//   }

//   function buildCharts() {
//     const contentData = StatisticsPage._contentData || {};
//     const COLORS = getThemeColors();

//     // Default data
//     const barLabels = contentData.statisticsBarData?.labels ||
//       ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
//     const barValues = contentData.statisticsBarData?.values ||
//       [2023.8, 2023.9, 2024.0, 2024.2, 2024.5, 2024.8, 2025.0, 2025.3, 2025.5, 2025.7, 2025.9, 2026.0];

//     const pieLabels = contentData.statisticsPieData?.labels || ["Love", "Arguments", "Ignorance"];
//     const pieValues = contentData.statisticsPieData?.values || [75, 20, 5];

//     // Common chart options
//     const commonOptions = {
//       responsive: true,
//       maintainAspectRatio: true,
//       plugins: {
//         legend: {
//           labels: {
//             color: COLORS.text,
//             font: { family: "'Poppins', sans-serif", size: 12 },
//             padding: 16,
//           },
//         },
//       },
//     };

//     const scaleOptions = {
//       x: {
//         grid: { color: COLORS.grid },
//         ticks: { color: COLORS.text, font: { family: "'Poppins', sans-serif", size: 11 } },
//       },
//       y: {
//         grid: { color: COLORS.grid },
//         ticks: {
//           color: COLORS.text,
//           font: { family: "'Poppins', sans-serif", size: 11 },
//           callback: (val) => Math.round(val),
//         },
//         min: 2023,
//         max: 2027,
//       },
//     };

//     // ─── 1. Bar Chart (Histogram) ──────────────
//     chartBar = new Chart(document.getElementById("chart-bar"), {
//       type: "bar",
//       data: {
//         labels: barLabels,
//         datasets: [{
//           label: "Our Timeline",
//           data: barValues,
//           backgroundColor: barValues.map((_, i) => {
//             const ratio = i / (barValues.length - 1);
//             return `rgba(255, ${Math.round(107 + ratio * 100)}, ${Math.round(157 + ratio * 40)}, ${0.5 + ratio * 0.4})`;
//           }),
//           borderColor: COLORS.pink,
//           borderWidth: 1,
//           borderRadius: 6,
//           borderSkipped: false,
//         }],
//       },
//       options: {
//         ...commonOptions,
//         animation: { duration: 1500, easing: "easeOutQuart" },
//         scales: scaleOptions,
//       },
//     });

//     // ─── 2. Line Chart (Exponential Growth) ────
//     const expValues = barLabels.map((_, i) => {
//       return 2023 + (Math.exp(i / 3.5) - 1) * 0.35;
//     });

//     chartLine = new Chart(document.getElementById("chart-line"), {
//       type: "line",
//       data: {
//         labels: barLabels,
//         datasets: [{
//           label: "Our Growth",
//           data: expValues,
//           borderColor: COLORS.lavender,
//           backgroundColor: COLORS.lavenderFill,
//           fill: true,
//           tension: 0.4,
//           pointBackgroundColor: COLORS.lavender,
//           pointBorderColor: "#fff",
//           pointBorderWidth: 1,
//           pointRadius: 4,
//           pointHoverRadius: 7,
//         }],
//       },
//       options: {
//         ...commonOptions,
//         animation: { duration: 2000, easing: "easeOutQuart" },
//         scales: scaleOptions,
//       },
//     });

//     // ─── 3. Pie Chart ──────────────────────────
//     chartPie = new Chart(document.getElementById("chart-pie"), {
//       type: "pie",
//       data: {
//         labels: pieLabels,
//         datasets: [{
//           data: pieValues,
//           backgroundColor: [COLORS.pink, COLORS.lavender, COLORS.muted],
//           borderColor: "rgba(13, 10, 26, 0.8)",
//           borderWidth: 3,
//           hoverOffset: 12,
//         }],
//       },
//       options: {
//         ...commonOptions,
//         animation: { duration: 1500, easing: "easeOutQuart", animateRotate: true },
//         plugins: {
//           ...commonOptions.plugins,
//           legend: {
//             ...commonOptions.plugins.legend,
//             position: "bottom",
//           },
//         },
//       },
//     });
//   }

//   return { init, renderCharts, refreshTheme };
// })();

const StatisticsPage = (() => {
  let chartsRendered = false;
  let chartBar = null;
  let chartLine = null;
  let chartPie = null;

  function init(contentData) {
    // Continue button
    document.getElementById("btn-stats-continue").addEventListener("click", () => {
      App.navigateTo("faq");
    });

    // Store content data for later use
    StatisticsPage._contentData = contentData;
  }

  /**
   * Read the currently active theme's colors directly from CSS
   * variables, so charts always match whichever theme is active
   * at the moment they're (re)rendered.
   */
  function getThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    return {
      pink: "rgba(255, 107, 157, 0.8)",
      pinkFill: "rgba(255, 107, 157, 0.15)",
      lavender: "rgba(196, 167, 231, 0.8)",
      lavenderFill: "rgba(196, 167, 231, 0.15)",
      gold: "rgba(255, 215, 0, 0.8)",
      muted: "rgba(150, 140, 170, 0.6)",
      text: styles.getPropertyValue("--color-text-secondary").trim(),
      grid: isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.06)",
    };
  }

  /**
   * Render charts when the page becomes visible.
   * Charts need to be rendered when visible for proper sizing.
   */
  function renderCharts() {
    if (chartsRendered) return;
    chartsRendered = true;
    buildCharts();
  }

  /**
   * Destroy and rebuild all charts with fresh colors — called
   * when the theme is toggled, so axis/legend text always
   * matches the currently active theme instead of staying
   * stuck at whatever color was used on first render.
   */
  function refreshTheme() {
    if (!chartsRendered) return; // nothing rendered yet, nothing to refresh
    if (chartBar) chartBar.destroy();
    if (chartLine) chartLine.destroy();
    if (chartPie) chartPie.destroy();
    buildCharts();
  }

  function buildCharts() {
    const contentData = StatisticsPage._contentData || {};
    const COLORS = getThemeColors();

    // Default data
    const barLabels = contentData.statisticsBarData?.labels ||
      ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    const barValues = contentData.statisticsBarData?.values ||
      [2023.8, 2023.9, 2024.0, 2024.2, 2024.5, 2024.8, 2025.0, 2025.3, 2025.5, 2025.7, 2025.9, 2026.0];

    const pieLabels = contentData.statisticsPieData?.labels || ["Love", "Arguments", "Ignorance"];
    const pieValues = contentData.statisticsPieData?.values || [75, 20, 5];

    // Common chart options
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: COLORS.text,
            font: { family: "'Poppins', sans-serif", size: 12 },
            padding: 16,
          },
        },
      },
    };

    const scaleOptions = {
      x: {
        grid: { color: COLORS.grid },
        ticks: { color: COLORS.text, font: { family: "'Poppins', sans-serif", size: 11 } },
      },
      y: {
        grid: { color: COLORS.grid },
        ticks: {
          color: COLORS.text,
          font: { family: "'Poppins', sans-serif", size: 11 },
          callback: (val) => Math.round(val),
        },
        min: 2023,
        max: 2027,
      },
    };

    // ─── 1. Bar Chart (Histogram) ──────────────
    chartBar = new Chart(document.getElementById("chart-bar"), {
      type: "bar",
      data: {
        labels: barLabels,
        datasets: [{
          label: "Our Timeline",
          data: barValues,
          backgroundColor: barValues.map((_, i) => {
            const ratio = i / (barValues.length - 1);
            return `rgba(255, ${Math.round(107 + ratio * 100)}, ${Math.round(157 + ratio * 40)}, ${0.5 + ratio * 0.4})`;
          }),
          borderColor: COLORS.pink,
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        ...commonOptions,
        animation: { duration: 1500, easing: "easeOutQuart" },
        scales: scaleOptions,
      },
    });

    // ─── 2. Line Chart (Exponential Growth) ────
    const expValues = barLabels.map((_, i) => {
      return 2023 + (Math.exp(i / 3.5) - 1) * 0.35;
    });

    chartLine = new Chart(document.getElementById("chart-line"), {
      type: "line",
      data: {
        labels: barLabels,
        datasets: [{
          label: "Our Growth",
          data: expValues,
          borderColor: COLORS.lavender,
          backgroundColor: COLORS.lavenderFill,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: COLORS.lavender,
          pointBorderColor: "#fff",
          pointBorderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 7,
        }],
      },
      options: {
        ...commonOptions,
        animation: { duration: 2000, easing: "easeOutQuart" },
        scales: scaleOptions,
      },
    });

    // ─── 3. Pie Chart ──────────────────────────
    chartPie = new Chart(document.getElementById("chart-pie"), {
      type: "pie",
      data: {
        labels: pieLabels,
        datasets: [{
          data: pieValues,
          backgroundColor: [COLORS.pink, COLORS.lavender, COLORS.muted],
          borderColor: "rgba(13, 10, 26, 0.8)",
          borderWidth: 3,
          hoverOffset: 12,
        }],
      },
      options: {
        ...commonOptions,
        animation: { duration: 1500, easing: "easeOutQuart", animateRotate: true },
        plugins: {
          ...commonOptions.plugins,
          legend: {
            ...commonOptions.plugins.legend,
            position: "bottom",
          },
        },
      },
    });
  }

  return { init, renderCharts, refreshTheme };
})();

// Watch the theme attribute directly, so charts always redraw the
// instant the theme changes — regardless of what triggered the
// change or any issue elsewhere in theme.js. No page reload needed.
const _statsThemeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "data-theme") {
      StatisticsPage.refreshTheme();
    }
  });
});
_statsThemeObserver.observe(document.documentElement, { attributes: true });