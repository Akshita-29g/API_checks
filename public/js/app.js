/**
 * app.js — Main Application Controller
 * =======================================
 * Orchestrates page navigation, content loading,
 * and initialization of all page modules.
 */

const App = (() => {
  let currentPage = "home";
  let contentData = null;
  let isNavigating = false;

  // Map of page IDs to their section elements
  const pages = {};

  /**
   * Initialize the application.
   */
  async function init() {
    // Cache page section references
    const sections = document.querySelectorAll(".page-section");
    sections.forEach((section) => {
      const id = section.id.replace("page-", "");
      pages[id] = section;
    });

    // Initialize global components
    Navbar.init();
    Cat.init();

    // Load content configuration from backend
    try {
      const response = await fetch("/api/content");
      contentData = await response.json();
    } catch (error) {
      console.warn("Could not load content config, using defaults.", error);
      contentData = {};
    }

    // Initialize all page modules
    HomePage.init(contentData);
    LibraryPage.init(contentData);
    StatisticsPage.init(contentData);
    FaqPage.init(contentData);
    PlaylistPage.init(contentData);
    ContactPage.init();
    ThemeController.init();
    TimeOfDayController.init();

    // Activate the initial page's handlers
    // (Library needs special activate/deactivate since it uses page-wide clicks)

    console.log(" Website initialized!");
  }

  /**
   * Navigate to a specific page.
   * @param {string} pageId - The target page ID (e.g., "library").
   */
  async function navigateTo(pageId) {
    if (pageId === currentPage || isNavigating) return;
    if (!pages[pageId]) {
      console.error(`Page "${pageId}" not found.`);
      return;
    }

    isNavigating = true;

    // Deactivate current page handlers
    if (currentPage === "library") {
      LibraryPage.deactivate();
    }

    const currentEl = pages[currentPage];
    const nextEl = pages[pageId];

    // Perform the GSAP transition
    await PageTransitions.transition(currentEl, nextEl);

    // Update navbar
    Navbar.setActivePage(pageId);

    // Activate new page handlers
    if (pageId === "library") {
      LibraryPage.activate();
    }

    // Trigger page-specific enter animations
    onPageEnter(pageId);

    // Update state
    currentPage = pageId;
    isNavigating = false;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Handle page-specific entrance logic.
   * @param {string} pageId
   */
  function onPageEnter(pageId) {
    switch (pageId) {
      case "statistics":
        // Render charts when page is visible
        setTimeout(() => StatisticsPage.renderCharts(), 100);
        break;

      case "playlist":
        // Animate song card entrance
        setTimeout(() => PlaylistPage.animateEntrance(), 200);
        break;
    }
  }

  /**
   * Get the current page ID.
   */
  function getCurrentPage() {
    return currentPage;
  }

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", init);

  return { navigateTo, getCurrentPage };
})();
