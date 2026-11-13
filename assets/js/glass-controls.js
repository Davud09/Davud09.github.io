const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const interactiveSelector = [
  ".button",
  ".icon-link",
  ".theme-toggle",
  ".menu-toggle",
  ".workshop-controls button",
  ".circuit-toy button",
  ".lightbox__close",
  "[data-glass-control]"
].join(", ");

function decorateControl(control) {
  if (!(control instanceof HTMLElement) || control.dataset.glassReady === "true") {
    return;
  }

  control.dataset.glassReady = "true";
  control.classList.add("glass-control");

  const light = document.createElement("span");
  light.className = "glass-control__light";
  light.setAttribute("aria-hidden", "true");

  const ripple = document.createElement("span");
  ripple.className = "glass-control__ripple";
  ripple.setAttribute("aria-hidden", "true");
  control.prepend(light);
  control.append(ripple);

  for (const child of control.children) {
    if (child === light || child === ripple) {
      continue;
    }

    child.classList.add("glass-control__content");
    if (getComputedStyle(child).position === "absolute") {
      child.classList.add("glass-control__content--absolute");
    }
  }

  control.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches) {
      return;
    }

    const bounds = control.getBoundingClientRect();
    control.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    control.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);

    if (event.pointerType !== "touch" && control.classList.contains("button--magnetic") && finePointer.matches) {
      const offsetX = (event.clientX - bounds.left - bounds.width / 2) / bounds.width;
      const offsetY = (event.clientY - bounds.top - bounds.height / 2) / bounds.height;
      control.style.setProperty("--magnetic-x", `${(offsetX * 5).toFixed(2)}px`);
      control.style.setProperty("--magnetic-y", `${(offsetY * 4).toFixed(2)}px`);
    }
  });

  control.addEventListener("pointerleave", () => {
    control.style.removeProperty("--pointer-x");
    control.style.removeProperty("--pointer-y");
    control.style.removeProperty("--magnetic-x");
    control.style.removeProperty("--magnetic-y");
  });

  control.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || reducedMotion.matches) {
      return;
    }

    const bounds = control.getBoundingClientRect();
    control.style.setProperty("--click-x", `${event.clientX - bounds.left}px`);
    control.style.setProperty("--click-y", `${event.clientY - bounds.top}px`);
    control.classList.remove("is-rippling");
    window.requestAnimationFrame(() => control.classList.add("is-rippling"));
  });

  control.addEventListener("animationend", (event) => {
    if (event.animationName === "glass-ripple") {
      control.classList.remove("is-rippling");
    }
  });
}

for (const control of document.querySelectorAll(interactiveSelector)) {
  decorateControl(control);
}

const controlsObserver = new MutationObserver((records) => {
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (!(node instanceof Element)) {
        continue;
      }

      if (node.matches(interactiveSelector)) {
        decorateControl(node);
      }

      for (const control of node.querySelectorAll(interactiveSelector)) {
        decorateControl(control);
      }
    }
  }
});

controlsObserver.observe(document.body, { childList: true, subtree: true });

const siteNavigation = document.querySelector(".site-nav");

if (siteNavigation) {
  const navLinks = [...siteNavigation.querySelectorAll(".site-nav__link")];
  const activeLink = () => siteNavigation.querySelector('.site-nav__link[aria-current="page"]');

  function moveNavIndicator(link) {
    if (!link || !finePointer.matches) {
      return;
    }

    const navBounds = siteNavigation.getBoundingClientRect();
    const linkBounds = link.getBoundingClientRect();
    siteNavigation.style.setProperty("--nav-indicator-x", `${linkBounds.left - navBounds.left}px`);
    siteNavigation.style.setProperty("--nav-indicator-y", `${linkBounds.top - navBounds.top}px`);
    siteNavigation.style.setProperty("--nav-indicator-width", `${linkBounds.width}px`);
    siteNavigation.style.setProperty("--nav-indicator-height", `${linkBounds.height}px`);
  }

  for (const link of navLinks) {
    link.addEventListener("pointerenter", () => moveNavIndicator(link));
    link.addEventListener("focus", () => moveNavIndicator(link));
  }

  siteNavigation.addEventListener("pointerleave", () => moveNavIndicator(activeLink()));
  window.addEventListener("resize", () => moveNavIndicator(activeLink()));
  moveNavIndicator(activeLink());
}
