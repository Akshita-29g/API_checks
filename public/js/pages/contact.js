/**
 * contact.js — Contact Page Controller
 * =======================================
 * Handles message submission to the backend,
 * which forwards it to WhatsApp.
 */

const ContactPage = (() => {
  let form;
  let messageInput;
  let charCounter;
  let statusEl;
  let submitBtn;
  let isSending = false;

  function init() {
    form = document.getElementById("contact-form");
    messageInput = document.getElementById("contact-message");
    charCounter = document.getElementById("char-counter");
    statusEl = document.getElementById("contact-status");
    submitBtn = document.getElementById("btn-contact-send");

    // Character counter
    messageInput.addEventListener("input", updateCharCounter);

    // Form submission
    form.addEventListener("submit", onSubmit);
  }

  /**
   * Update the character counter display.
   */
  function updateCharCounter() {
    const len = messageInput.value.length;
    charCounter.textContent = `${len} / 1000`;

    charCounter.classList.remove("warning", "limit");
    if (len > 900) {
      charCounter.classList.add("limit");
    } else if (len > 700) {
      charCounter.classList.add("warning");
    }
  }

  /**
   * Handle form submission.
   * @param {Event} e
   */
  async function onSubmit(e) {
    e.preventDefault();

    if (isSending) return;

    const message = messageInput.value.trim();
    if (!message) {
      showStatus("Please write something before sending.", "error");
      return;
    }

    isSending = true;
    submitBtn.classList.add("btn-loading");
    submitBtn.textContent = "Sending...";

    try {
      const response = await fetch("/api/contact/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (data.success) {
        showStatus(
          `<div class="checkmark-container"><div class="checkmark-circle">✓</div></div>${data.message}`,
          "success"
        );
        messageInput.value = "";
        updateCharCounter();
      } else {
        showStatus(data.message || "Could not send the message. Please try again.", "error");
      }
    } catch (error) {
      showStatus("Network error. Please check your connection and try again.", "error");
    } finally {
      isSending = false;
      submitBtn.classList.remove("btn-loading");
      submitBtn.textContent = "Send 💌";
    }
  }

  /**
   * Show a status message (success or error).
   * @param {string} html - HTML content for the status message.
   * @param {string} type - "success" or "error"
   */
  function showStatus(html, type) {
    statusEl.innerHTML = html;
    statusEl.className = `contact-status visible ${type}`;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusEl.classList.remove("visible");
    }, 5000);
  }

  return { init };
})();
