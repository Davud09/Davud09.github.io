document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");
const navigationLinks = document.querySelectorAll(".site-nav__link");
const siteHeader = document.querySelector(".site-header");
const desktopNavigation = window.matchMedia("(min-width: 58.01rem)");

const currentPath = window.location.pathname.endsWith("/")
  ? `${window.location.pathname}index.html`
  : window.location.pathname;

for (const link of navigationLinks) {
  const linkPath = new URL(link.getAttribute("href"), window.location.href).pathname;

  if (linkPath === currentPath) {
    link.setAttribute("aria-current", "page");
  } else {
    link.removeAttribute("aria-current");
  }
}

function closeNavigation({ returnFocus = false } = {}) {
  if (!menuToggle || !primaryNavigation) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  primaryNavigation.classList.remove("is-open");

  if (returnFocus) {
    menuToggle.focus();
  }
}

if (menuToggle && primaryNavigation) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
    primaryNavigation.classList.toggle("is-open", !isExpanded);
  });

  primaryNavigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeNavigation({ returnFocus: true });
    }
  });

  document.addEventListener("click", (event) => {
    if (
      menuToggle.getAttribute("aria-expanded") === "true"
      && event.target instanceof Node
      && siteHeader
      && !siteHeader.contains(event.target)
    ) {
      closeNavigation();
    }
  });

  desktopNavigation.addEventListener("change", (event) => {
    if (event.matches) {
      closeNavigation();
    }
  });
}
