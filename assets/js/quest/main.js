import { achievements, findNewAchievements } from "./achievements.js";
import { workshopContent } from "./content.js";
import { connectInput } from "./input.js";
import { renderHud, renderMap, renderStation } from "./render.js";
import { addAchievements, createInitialState, inspectStation, movePlayer } from "./state.js";

const map = document.querySelector("#workshop-map");
const controls = document.querySelector(".workshop-controls");
const message = document.querySelector("#workshop-message");
const toast = document.querySelector("#workshop-toast");
const stationPanel = document.querySelector(".station-panel");
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const elements = {
  xp: document.querySelector("#workshop-xp"),
  progress: document.querySelector("#workshop-progress"),
  progressFill: document.querySelector("#workshop-progress-fill"),
  location: document.querySelector("#workshop-location"),
  stationKey: document.querySelector("#workshop-key"),
  title: document.querySelector("#station-title"),
  description: document.querySelector("#station-description"),
  facts: document.querySelector("#station-facts"),
  achievementCount: document.querySelector("#achievement-count"),
  achievementList: document.querySelector("#achievement-list")
};
let state = createInitialState(workshopContent.start);
let xpAnimationFrame;
let toastTimeout;
let stationUpdateTimeout;

reducedMotionPreference.addEventListener?.("change", (event) => {
  if (!event.matches || xpAnimationFrame === undefined) {
    return;
  }

  window.cancelAnimationFrame(xpAnimationFrame);
  xpAnimationFrame = undefined;
  elements.xp.textContent = `${state.xp} XP`;
});

function render() {
  renderMap(map, workshopContent, state);
  renderHud(elements, workshopContent, state, achievements);
}

function animateXp(from, to) {
  if (xpAnimationFrame !== undefined) {
    window.cancelAnimationFrame(xpAnimationFrame);
    xpAnimationFrame = undefined;
  }

  if (reducedMotionPreference.matches || from === to) {
    elements.xp.textContent = `${to} XP`;
    return;
  }

  const startedAt = performance.now();
  const duration = 620;

  function update(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const easedProgress = 1 - (1 - progress) ** 3;
    elements.xp.textContent = `${Math.round(from + (to - from) * easedProgress)} XP`;

    if (progress < 1) {
      xpAnimationFrame = window.requestAnimationFrame(update);
    } else {
      xpAnimationFrame = undefined;
    }
  }

  elements.xp.textContent = `${from} XP`;
  xpAnimationFrame = window.requestAnimationFrame(update);
}

function updateStation(station) {
  window.clearTimeout(stationUpdateTimeout);

  if (reducedMotionPreference.matches) {
    renderStation(elements, station);
    return;
  }

  stationPanel.classList.add("is-updating");
  stationUpdateTimeout = window.setTimeout(() => {
    renderStation(elements, station);
    window.requestAnimationFrame(() => stationPanel.classList.remove("is-updating"));
  }, 110);
}

function showAchievementToast(achievementIds) {
  const titles = achievements
    .filter((achievement) => achievementIds.includes(achievement.id))
    .map((achievement) => achievement.title);

  if (titles.length === 0) {
    return;
  }

  window.clearTimeout(toastTimeout);
  toast.textContent = `Achievement unlocked: ${titles.join(" · ")}`;
  toast.setAttribute("aria-hidden", "false");
  toast.classList.remove("is-visible");
  window.requestAnimationFrame(() => toast.classList.add("is-visible"));
  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    toast.setAttribute("aria-hidden", "true");
  }, 3600);
}

function move(direction) {
  state = movePlayer(state, direction, workshopContent);
  message.textContent = "";
  message.classList.remove("is-visible");
  render();
}

function inspect() {
  const station = workshopContent.stations.find(
    (item) => item.x === state.position.x && item.y === state.position.y
  );

  if (!station) {
    updateStation(null);
    message.textContent = "Move to a marked station before inspecting.";
    message.classList.add("is-visible");
    return;
  }

  const previousXp = state.xp;
  const result = inspectStation(state, station);
  state = result.state;
  const newAchievements = findNewAchievements(state, workshopContent.stations.length);
  state = addAchievements(state, newAchievements);
  updateStation(station);
  render();
  animateXp(previousXp, state.xp);
  message.textContent = result.newlyExplored
    ? `Station explored: +25 XP. Total: ${state.xp} XP${newAchievements.length ? " · achievement unlocked!" : ""}`
    : `${station.label} is already in your workshop notes.`;
  message.classList.add("is-visible");
  showAchievementToast(newAchievements);
}

connectInput({ map, controls, onMove: move, onInspect: inspect });
render();
