document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");
const navigationLinks = document.querySelectorAll(".site-nav__link");
const siteHeader = document.querySelector(".site-header");
const desktopNavigation = window.matchMedia("(min-width: 58.01rem)");

function updateHeaderOnScroll() {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);
}

let scrollUpdateScheduled = false;
window.addEventListener("scroll", () => {
  if (scrollUpdateScheduled) {
    return;
  }

  scrollUpdateScheduled = true;
  window.requestAnimationFrame(() => {
    updateHeaderOnScroll();
    scrollUpdateScheduled = false;
  });
}, { passive: true });

updateHeaderOnScroll();

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
}

if (primaryNavigation) {
  const pill = document.createElement("span");
  pill.className = "nav-pill";
  pill.setAttribute("aria-hidden", "true");
  primaryNavigation.prepend(pill);
  const active = primaryNavigation.querySelector('[aria-current="page"]');
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function geometry(link) {
    const nav = primaryNavigation.getBoundingClientRect();
    const bounds = link.getBoundingClientRect();
    return { x: bounds.left - nav.left, y: bounds.top - nav.top, width: bounds.width, height: bounds.height };
  }

  function movePill(bounds) {
    if (!bounds || !bounds.width || !bounds.height) return;
    pill.style.transform = `translate3d(${bounds.x}px, ${bounds.y}px, 0) scale(${bounds.width / 100}, ${bounds.height / 40})`;
  }

  let saved;
  try {
    saved = JSON.parse(sessionStorage.getItem("nav-pill") || "null");
    sessionStorage.removeItem("nav-pill");
  } catch (error) {
    console.warn("Navigation continuity is unavailable.", error);
  }
  if (active) {
    const initial = saved && saved.destination === location.pathname && !reduced.matches
      ? saved.previous : geometry(active);
    pill.style.transition = "none";
    movePill(initial);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      pill.style.removeProperty("transition");
      movePill(geometry(active));
    }));
  }
  for (const link of navigationLinks) {
    link.addEventListener("pointerenter", () => movePill(geometry(link)));
    link.addEventListener("focus", () => movePill(geometry(link)));
    link.addEventListener("click", () => {
      if (!active) return;
      try {
        sessionStorage.setItem("nav-pill", JSON.stringify({
          previous: geometry(active),
          clicked: geometry(link),
          destination: new URL(link.href).pathname
        }));
      } catch (error) {
        console.warn("Navigation continuity could not be saved.", error);
      }
    });
  }
  primaryNavigation.addEventListener("pointerleave", () => active && movePill(geometry(active)));
  primaryNavigation.addEventListener("focusout", (event) => {
    if (!primaryNavigation.contains(event.relatedTarget) && active) movePill(geometry(active));
  });
  window.addEventListener("resize", () => active && movePill(geometry(active)));
}

const scrollHero = document.querySelector(".home-hero, .about-intro, .projects-intro, .quest-intro");
const scrollMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let displayedScroll = window.scrollY;
let scrollFrame;
function scrubScroll() {
  scrollFrame = undefined;
  const target = window.scrollY;
  displayedScroll += (target - displayedScroll) * 0.14;
  if (Math.abs(target - displayedScroll) < 0.1) displayedScroll = target;
  const range = document.documentElement.scrollHeight - window.innerHeight;
  siteHeader?.style.setProperty("--scroll-progress", String(range > 0 ? Math.min(1, displayedScroll / range) : 0));
  if (scrollHero) {
    const amount = Math.min(displayedScroll / Math.max(scrollHero.offsetHeight, 1), 1);
    scrollHero.style.transform = `translate3d(0, ${amount * -24}px, 0)`;
    scrollHero.style.opacity = String(1 - amount * 0.25);
  }
  if (displayedScroll !== target) scrollFrame = requestAnimationFrame(scrubScroll);
}
function scheduleScroll() {
  if (scrollMotion.matches) {
    if (scrollFrame !== undefined) cancelAnimationFrame(scrollFrame);
    scrollFrame = undefined;
    displayedScroll = window.scrollY;
    scrollHero?.style.removeProperty("transform");
    scrollHero?.style.removeProperty("opacity");
    const range = document.documentElement.scrollHeight - window.innerHeight;
    siteHeader?.style.setProperty("--scroll-progress", String(range > 0 ? Math.min(1, window.scrollY / range) : 0));
  } else if (scrollFrame === undefined) {
    scrollFrame = requestAnimationFrame(scrubScroll);
  }
}
window.addEventListener("scroll", scheduleScroll, { passive: true });
window.addEventListener("resize", scheduleScroll);
scrollMotion.addEventListener?.("change", scheduleScroll);
scheduleScroll();

if (menuToggle && primaryNavigation) {
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
