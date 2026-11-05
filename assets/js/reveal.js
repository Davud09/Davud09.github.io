const revealElements = document.querySelectorAll("[data-reveal]");
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if (reducedMotionPreference.matches || !("IntersectionObserver" in window)) {
  for (const element of revealElements) {
    element.classList.add("is-revealed");
  }
} else {
  document.documentElement.classList.add("reveal-ready");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12 });

  for (const element of revealElements) {
    revealObserver.observe(element);
  }
}
