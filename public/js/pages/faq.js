/**
 * faq.js — FAQ Page Controller
 * ===============================
 * Questionnaire with backend validation, shake animations
 * for wrong answers, and a dodge button for Q5 ("Do you love me?").
 */

const FaqPage = (() => {
  let introCard;
  let questionCard;
  let questionText;
  let questionNumber;
  let answerInput;
  let textInputGroup;
  let yesNoGroup;
  let feedbackEl;
  let progressContainer;
  let btnNo;

  let questions = [];
  let currentIndex = 0;
  let isSubmitting = false;

  function init(contentData) {
    introCard = document.getElementById("faq-intro");
    questionCard = document.getElementById("faq-question-card");
    questionText = document.getElementById("question-text");
    questionNumber = document.getElementById("question-number");
    answerInput = document.getElementById("faq-answer-input");
    textInputGroup = document.getElementById("faq-text-input");
    yesNoGroup = document.getElementById("faq-yesno");
    feedbackEl = document.getElementById("faq-feedback");
    progressContainer = document.getElementById("faq-progress");
    btnNo = document.getElementById("btn-no");

    // Get questions from config
    if (contentData && contentData.faqQuestions) {
      questions = contentData.faqQuestions;
    }

    // Set up FAQ intro image
    if (contentData && contentData.faqCardImage && !contentData.faqCardImage.includes("placeholder")) {
      const imgContainer = document.getElementById("faq-intro-image");
      imgContainer.innerHTML = "";
      imgContainer.classList.remove("faq-intro-placeholder");
      imgContainer.classList.add("faq-intro-image");
      const img = document.createElement("img");
      img.src = contentData.faqCardImage;
      img.alt = "Our photo";
      img.classList.add("faq-intro-image");
      imgContainer.appendChild(img);
    }

    // Start button
    document.getElementById("btn-faq-start").addEventListener("click", startQuiz);

    // Submit button
    document.getElementById("btn-faq-submit").addEventListener("click", submitAnswer);

    // Enter key submits
    answerInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitAnswer();
    });

    // Yes button
    document.getElementById("btn-yes").addEventListener("click", onYesClick);

    // No button dodge behavior
    btnNo.addEventListener("mouseenter", dodgeButton);
    btnNo.addEventListener("mousemove", dodgeButton);
    btnNo.addEventListener("touchstart", dodgeButton, { passive: true });
    btnNo.addEventListener("click", (e) => {
      e.preventDefault();
      dodgeButton();
    });

    // Build progress dots
    buildProgress();
  }

  /**
   * Build progress indicator dots.
   */
  function buildProgress() {
    progressContainer.innerHTML = "";
    for (let i = 0; i < questions.length; i++) {
      const dot = document.createElement("div");
      dot.classList.add("faq-dot");
      if (i === 0) dot.classList.add("active");
      progressContainer.appendChild(dot);
    }
  }

  /**
   * Update progress dots to reflect current question.
   */
  function updateProgress() {
    const dots = progressContainer.querySelectorAll(".faq-dot");
    dots.forEach((dot, i) => {
      dot.classList.remove("active", "completed");
      if (i < currentIndex) dot.classList.add("completed");
      if (i === currentIndex) dot.classList.add("active");
    });
  }

  /**
   * Start the quiz: hide intro, show first question.
   */
  function startQuiz() {
    gsap.to(introCard, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        introCard.style.display = "none";
        showQuestion(0);
      },
    });
  }

  /**
   * Display a specific question.
   * @param {number} index - Question index.
   */
  function showQuestion(index) {
    currentIndex = index;
    const q = questions[index];
    if (!q) return;

    questionCard.classList.add("active");
    questionNumber.textContent = `Question ${index + 1} of ${questions.length}`;
    questionText.textContent = q.question;

    // Clear feedback
    feedbackEl.textContent = "";
    feedbackEl.classList.remove("visible", "error", "success");

    // Show appropriate input type
    if (q.type === "yes-no") {
      textInputGroup.style.display = "none";
      yesNoGroup.style.display = "flex";
      // Reset No button position
      btnNo.style.position = "absolute";
      btnNo.style.right = "0";
      btnNo.style.top = "50%";
      btnNo.style.transform = "translateY(-50%)";
    } else {
      textInputGroup.style.display = "flex";
      yesNoGroup.style.display = "none";
      answerInput.value = "";
      answerInput.focus();
    }

    updateProgress();

    // Animate in
    gsap.from(questionCard, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power2.out",
    });
  }

  /**
   * Submit the text answer for validation.
   */
  async function submitAnswer() {
    if (isSubmitting) return;

    const answer = answerInput.value.trim();
    if (!answer) {
      showFeedback("Please type an answer.", "error");
      return;
    }

    isSubmitting = true;
    const q = questions[currentIndex];

    try {
      const response = await fetch("/api/faq/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, answer }),
      });

      const data = await response.json();

      if (data.correct) {
        showFeedback(data.message, "success");
        // Advance after a short delay
        setTimeout(() => {
          advanceQuestion();
        }, 800);
      } else {
        showFeedback(data.message, "error");
        // Shake the input
        questionCard.classList.add("faq-shake");
        setTimeout(() => {
          questionCard.classList.remove("faq-shake");
        }, 500);
      }
    } catch (error) {
      showFeedback("Something went wrong. Please try again.", "error");
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Show feedback message.
   * @param {string} message
   * @param {string} type - "success" or "error"
   */
  function showFeedback(message, type) {
    feedbackEl.textContent = message;
    feedbackEl.className = `faq-feedback visible ${type}`;
  }

  /**
   * Advance to the next question.
   */
  function advanceQuestion() {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      // Quiz complete — shouldn't happen; Q5 handles its own transition
      App.navigateTo("playlist");
      return;
    }

    // Animate out current, show next
    gsap.to(questionCard, {
      opacity: 0,
      x: -30,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(questionCard, { x: 0, opacity: 1 });
        showQuestion(nextIndex);
      },
    });
  }

  /**
   * Handle the "Yes" button click on Q5.
   */
  function onYesClick() {
    // Celebration animation
    createCelebration();

    // Navigate after celebration
    setTimeout(() => {
      App.navigateTo("playlist");
    }, 1500);
  }

  /**
   * Dodge the "No" button — move it to a random position.
   */
  function dodgeButton() {
    const container = yesNoGroup;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    // Calculate safe random position within the container
    // Use the full page if on mobile for more dodging room
    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;

    const maxX = pageWidth - btnRect.width - 40;
    const maxY = pageHeight - btnRect.height - 40;

    const randomX = 20 + Math.random() * maxX;
    const randomY = 20 + Math.random() * maxY;

    btnNo.style.position = "fixed";
    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
    btnNo.style.right = "auto";
    btnNo.style.transform = "none";
    btnNo.style.zIndex = "200";
  }

  /**
   * Create falling hearts celebration.
   */
  function createCelebration() {
    const container = document.createElement("div");
    container.classList.add("celebration-hearts");
    document.body.appendChild(container);

    const hearts = ["❤️", "💕", "💖", "💗", "💘", "💝", "🥰", "✨"];

    for (let i = 0; i < 30; i++) {
      const heart = document.createElement("span");
      heart.classList.add("celebration-heart");
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.animationDelay = `${Math.random() * 1.5}s`;
      heart.style.fontSize = `${16 + Math.random() * 24}px`;
      container.appendChild(heart);
    }

    // Clean up after animation
    setTimeout(() => {
      container.remove();
    }, 5000);
  }

  return { init };
})();
