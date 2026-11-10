const profileImage = document.querySelector(".home-portrait__image");
const profileFallback = document.querySelector(".home-portrait__fallback");

if (profileImage && profileFallback) {
  profileImage.addEventListener("error", () => {
    profileImage.hidden = true;
    profileFallback.hidden = false;
  }, { once: true });

  if (profileImage.complete && profileImage.naturalWidth === 0) {
    profileImage.dispatchEvent(new Event("error"));
  }
}

const circuitBoard = document.querySelector("[data-circuit-board]");
const circuitSwitch = document.querySelector(".circuit-toy__switch-button");
const circuitStatus = document.querySelector("[data-circuit-status]");
const circuitHint = document.querySelector("[data-circuit-hint]");

if (circuitBoard && circuitSwitch && circuitStatus && circuitHint) {
  circuitSwitch.disabled = false;
  circuitSwitch.addEventListener("click", () => {
    const isPowered = circuitSwitch.getAttribute("aria-checked") === "true";
    circuitSwitch.setAttribute("aria-checked", String(!isPowered));
    circuitSwitch.setAttribute("aria-label", isPowered ? "Power the circuit" : "Power down the circuit");
    circuitBoard.classList.toggle("is-powered", !isPowered);
    circuitStatus.textContent = isPowered ? "STANDBY" : "SIGNAL ON";
    circuitHint.textContent = isPowered
      ? "Flip the switch and send a little signal."
      : "Nice. The signal made it all the way through.";
  });
}
