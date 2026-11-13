const printResume = document.querySelector("[data-print-resume]");
printResume?.addEventListener("click", () => window.print());

const hikingMemory = document.querySelector(".hiking-map__memory");
const hikingPins = document.querySelectorAll(".hiking-map__pin");

function selectHikingPin(pin) {
  for (const item of hikingPins) {
    item.classList.toggle("is-selected", item === pin);
  }

  hikingMemory.textContent = `${pin.dataset.place} is one of the hiking locations Davud lists among his interests.`;
}

for (const pin of hikingPins) {
  pin.addEventListener("click", () => selectHikingPin(pin));
  pin.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectHikingPin(pin);
    }
  });
}

const squirrelButton = document.querySelector("[data-squirrel-egg]");

squirrelButton?.addEventListener("click", () => {
  const foundKey = "davud-squirrel-egg-found";
  const xpKey = "davud-workshop-xp";

  if (window.localStorage.getItem(foundKey) === "true") {
    squirrelButton.setAttribute("aria-label", "You already found the squirrel house");
    return;
  }

  const currentXp = Number.parseInt(window.localStorage.getItem(xpKey) ?? "0", 10) || 0;
  window.localStorage.setItem(xpKey, String(currentXp + 50));
  window.localStorage.setItem(foundKey, "true");
  squirrelButton.setAttribute("aria-label", "Squirrel house found: 50 bonus XP earned");
  squirrelButton.classList.add("is-found");
});
