(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const dialog = document.createElement("dialog");
  dialog.className = "glass-backdrop";
  dialog.setAttribute("aria-labelledby", "liquid-sheet-title");
  dialog.innerHTML = '<div class="liquid-sheet"><div class="liquid-sheet__header"><h2 id="liquid-sheet-title"></h2><button class="btn btn--secondary liquid-sheet__close" type="button">Close <span aria-hidden="true">×</span></button></div><div class="liquid-sheet__content"></div></div>';
  document.body.append(dialog);
  const sheet = dialog.querySelector(".liquid-sheet");
  const title = dialog.querySelector("#liquid-sheet-title");
  const content = dialog.querySelector(".liquid-sheet__content");
  const closeButton = dialog.querySelector(".liquid-sheet__close");
  let source;
  let focusTarget;
  let currentAnim;
  let closing = false;

  function transformFrom(rect, last) {
    return `translate3d(${rect.left - last.left}px, ${rect.top - last.top}px, 0) scale(${rect.width / last.width}, ${rect.height / last.height})`;
  }

  function open(origin, heading, body, returnFocus = origin) {
    const first = origin.getBoundingClientRect();
    if (currentAnim) currentAnim.cancel();
    closing = false;
    source = origin;
    focusTarget = returnFocus;
    title.textContent = heading;
    content.replaceChildren(body);
    sheet.scrollTop = 0;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("has-glass-sheet");
    const last = sheet.getBoundingClientRect();
    const frames = reduced.matches
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [{ transform: transformFrom(first, last), opacity: 0.6 }, { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 }];
    currentAnim = sheet.animate(frames, {
      duration: reduced.matches ? 120 : 440,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)"
    });
    closeButton.focus({ preventScroll: true });
  }

  function close() {
    if (!dialog.open || closing) return;
    closing = true;
    const current = sheet.getBoundingClientRect();
    if (currentAnim) currentAnim.cancel();
    const last = sheet.getBoundingClientRect();
    const target = source?.isConnected ? source.getBoundingClientRect() : current;
    const frames = reduced.matches
      ? [{ opacity: 1 }, { opacity: 0 }]
      : [{ transform: transformFrom(current, last), opacity: 1 }, { transform: transformFrom(target, last), opacity: 0.3 }];
    currentAnim = sheet.animate(frames, {
      duration: reduced.matches ? 120 : 360,
      easing: "cubic-bezier(0.32, 0.72, 0, 1)"
    });
    currentAnim.onfinish = () => {
      dialog.close();
      document.body.classList.remove("has-glass-sheet");
      currentAnim = null;
      closing = false;
      if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
    };
  }

  closeButton.addEventListener("click", close);
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  window.liquidSheet = { open, close };
})();
