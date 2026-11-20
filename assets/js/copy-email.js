for (const button of document.querySelectorAll("[data-copy-email]")) {
  const feedback = document.getElementById("copy-email-feedback");
  let feedbackTimer;

  button.addEventListener("click", async () => {
    const email = button.dataset.copyEmail;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(email);
        } catch (error) {
          console.warn("Clipboard API failed; trying the compatibility fallback.", error);
          copyWithFallback(email);
        }
      } else {
        copyWithFallback(email);
      }

      feedback.textContent = "Copied ✓";
      feedback.dataset.state = "success";
    } catch (error) {
      console.error("Could not copy the email address.", error);
      feedback.textContent = "Copy unavailable — use the Email link in the footer.";
      feedback.dataset.state = "error";
    }

    window.clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(() => {
      feedback.textContent = "";
      delete feedback.dataset.state;
    }, 3500);
  });
}

function copyWithFallback(text) {
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();

  try {
    if (!document.execCommand("copy")) {
      throw new Error("The browser declined the copy command.");
    }
  } finally {
    input.remove();
  }
}
