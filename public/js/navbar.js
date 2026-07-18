/**
 * navbar.js — Navigation Bar Controller
 * ========================================
 * Manages active/completed page states,
 * click navigation, and mobile hamburger toggle.
 */

const Navbar = (() => {
  // Page order for tracking progress
  const PAGE_ORDER = ["home", "library", "statistics", "faq", "playlist", "contact"];

  let navItems;
  let hamburger;
  let navLinks;

  function init() {
    navItems = document.querySelectorAll(".nav-item");
    hamburger = document.getElementById("nav-hamburger");
    navLinks = document.getElementById("nav-links");

    // Hamburger toggle
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      navLinks.classList.toggle("open");
    });

    // Nav item clicks
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        const page = item.dataset.page;
        // Only allow navigation to completed or active pages
        if (item.classList.contains("completed") || item.classList.contains("active")) {
          if (typeof App !== "undefined" && App.navigateTo) {
            App.navigateTo(page);
          }
        }
        // Close mobile menu
        hamburger.classList.remove("open");
        navLinks.classList.remove("open");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".navbar")) {
        hamburger.classList.remove("open");
        navLinks.classList.remove("open");
      }
    });
  }

  /**
   * Update the navbar to reflect the current page.
   * @param {string} currentPage - The ID of the active page.
   */
  function setActivePage(currentPage) {
    const currentIndex = PAGE_ORDER.indexOf(currentPage);

    navItems.forEach((item) => {
      const page = item.dataset.page;
      const index = PAGE_ORDER.indexOf(page);

      item.classList.remove("active", "completed");

      if (page === currentPage) {
        item.classList.add("active");
      } else if (index < currentIndex) {
        item.classList.add("completed");
      }
    });
  }

  /**
   * Get the page order array.
   */
  function getPageOrder() {
    return [...PAGE_ORDER];
  }

  return { init, setActivePage, getPageOrder };
})();
