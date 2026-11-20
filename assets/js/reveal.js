const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let motionIsReduced = reducedMotionPreference.matches;
const revealGroups = [
  { selector: ".home-hero__content > .eyebrow" },
  { selector: ".home-hero__content > h1", delay: 75 },
  { selector: ".home-hero__content > .home-hero__intro", delay: 150 },
  { selector: ".home-hero__content > .page-actions", delay: 225 },
  { selector: ".home-hero__content > .home-vitals" },
  { selector: ".home-hero__content > .circuit-toy" },
  { selector: ".about-intro > *", stagger: true },
  { selector: ".projects-intro > *", stagger: true },
  { selector: ".quest-intro > *", stagger: true },
  { selector: ".about-section" },
  { selector: ".education-card" },
  { selector: ".skill-card", stagger: true },
  { selector: ".score-card", stagger: true },
  { selector: ".timeline-entry", stagger: true },
  { selector: ".language-list li", stagger: true },
  { selector: ".interest-card", stagger: true },
  { selector: ".workshop__hud" },
  { selector: ".workshop__play" },
  { selector: ".station-panel" },
  { selector: ".achievement-panel" },
  { selector: ".plain-resume-link" },
  { selector: ".contact-section" },
  { selector: ".currently-section" },
  { selector: ".project-card", stagger: true },
  { selector: ".project-skeleton", stagger: true }
];
const revealTargets = new Set();
const activeCountAnimations = new Map();
let revealObserver;

function prepareRevealTargets(root = document) {
  for (const group of revealGroups) {
    const matches = [];

    if (root instanceof Element && root.matches(group.selector)) {
      matches.push(root);
    }

    if (root.querySelectorAll) {
      matches.push(...root.querySelectorAll(group.selector));
    }

    matches.forEach((element, index) => {
      element.setAttribute("data-reveal", "");
      const delay = group.delay ?? (group.stagger ? Math.min(index * 70, 280) : 0);
      element.style.setProperty("--reveal-delay", `${delay}ms`);
      revealTargets.add(element);
    });
  }

  if (root.querySelectorAll) {
    for (const element of root.querySelectorAll("[data-reveal]")) {
      revealTargets.add(element);
    }
  }

  if (root instanceof Element && root.matches("[data-reveal]")) {
    revealTargets.add(root);
  }
}

function animateCount(element) {
  const source = element.dataset.countTo ?? element.textContent.trim();
  const target = Number(source);
  if (!Number.isFinite(target)) {
    return;
  }

  const decimalPlaces = String(source).includes(".") ? 1 : 0;
  const formattedTarget = target.toFixed(decimalPlaces);
  const duration = 720;
  const startedAt = performance.now();

  element.textContent = (0).toFixed(decimalPlaces);

  function updateCount(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const easedProgress = 1 - (1 - progress) ** 3;
    element.textContent = (target * easedProgress).toFixed(decimalPlaces);

    if (progress < 1) {
      const frame = window.requestAnimationFrame(updateCount);
      activeCountAnimations.set(element, { frame, value: formattedTarget });
    } else {
      activeCountAnimations.delete(element);
    }
  }

  const frame = window.requestAnimationFrame(updateCount);
  activeCountAnimations.set(element, { frame, value: formattedTarget });
}

function reveal(element) {
  element.classList.add("is-revealed");

  if (element.matches(".skill-card")) {
    element.querySelector(".skill-level-meter")?.classList.add("is-active");
  }

  if (!motionIsReduced && element.matches(".score-card")) {
    const score = element.querySelector("strong");
    if (score) {
      animateCount(score);
    }
  }
}

function revealImmediately(element) {
  element.classList.add("is-revealed");
  if (element.matches(".skill-card")) {
    element.querySelector(".skill-level-meter")?.classList.add("is-active");
  }
}

prepareRevealTargets();

if (reducedMotionPreference.matches || !("IntersectionObserver" in window)) {
  for (const element of revealTargets) {
    revealImmediately(element);
  }
} else {
  document.documentElement.classList.add("reveal-ready");
  revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        reveal(entry.target);
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });

  for (const element of revealTargets) {
    revealObserver.observe(element);
  }

  const projectGrid = document.querySelector("#project-grid");
  if (projectGrid) {
    const projectObserver = new MutationObserver((records) => {
      for (const record of records) {
        const projectCards = [...projectGrid.querySelectorAll(".project-card")];
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) {
            continue;
          }

          prepareRevealTargets(node);
          for (const element of revealTargets) {
            if (node === element || node.contains(element)) {
              if (element.matches(".project-card")) {
                const index = projectCards.indexOf(element);
                element.style.setProperty("--reveal-delay", `${Math.min(index * 70, 280)}ms`);
              }

              if (motionIsReduced) {
                element.classList.add("is-revealed");
              } else {
                revealObserver.observe(element);
              }
            }
          }
        }
      }
    });

    projectObserver.observe(projectGrid, { childList: true });
  }
}

reducedMotionPreference.addEventListener?.("change", (event) => {
  motionIsReduced = event.matches;
  if (!revealObserver) {
    return;
  }

  if (motionIsReduced) {
    revealObserver.disconnect();
    for (const element of revealTargets) {
      revealImmediately(element);
    }
    for (const [element, animation] of activeCountAnimations) {
      window.cancelAnimationFrame(animation.frame);
      element.textContent = animation.value;
      activeCountAnimations.delete(element);
    }
  }
});
