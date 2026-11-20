import { achievements, findNewAchievements } from "./achievements.js";
import { workshopContent } from "./content.js";
import { connectInput } from "./input.js";
import { renderHud, renderMap, renderStation } from "./render.js";
import { addAchievements, createInitialState, inspectStation, movePlayer } from "./state.js";

const map = document.querySelector("#workshop-map");
const controls = document.querySelector(".workshop-controls");
const message = document.querySelector("#workshop-message");
const stationPanel = document.querySelector(".station-panel");
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const elements = {
  xp: document.querySelector("#workshop-xp"),
  progress: document.querySelector("#workshop-progress"),
  progressFill: document.querySelector("#workshop-progress-fill"),
  location: document.querySelector("#workshop-location"),
  inspectButton: document.querySelector("#workshop-re-read"),
  stationKey: document.querySelector("#workshop-key"),
  title: document.querySelector("#station-title"),
  description: document.querySelector("#station-description"),
  facts: document.querySelector("#station-facts"),
  achievementCount: document.querySelector("#achievement-count"),
  achievementList: document.querySelector("#achievement-list")
};
let state = createInitialState(workshopContent.start);
let xpAnimationFrame;
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

function setFeedback(text) {
  message.textContent = text;
}

function getCurrentStation() {
  return workshopContent.stations.find(
    (item) => item.x === state.position.x && item.y === state.position.y
  );
}

function exploreStation(station, action = "visit") {
  const previousXp = state.xp;
  const result = inspectStation(state, station);
  state = result.state;
  const newAchievements = findNewAchievements(state, workshopContent.stations.length);
  state = addAchievements(state, newAchievements);
  updateStation(station);
  render();
  animateXp(previousXp, state.xp);

  if (result.newlyExplored) {
    const achievementNote = newAchievements.length
      ? ` Achievement unlocked: ${achievements
        .filter((achievement) => newAchievements.includes(achievement.id))
        .map((achievement) => achievement.title)
        .join(", ")}.`
      : "";
    setFeedback(`Explored: ${station.label} (+25 XP). Total: ${state.xp} XP.${achievementNote}`);
  } else if (action === "re-read") {
    setFeedback(`Re-read: ${station.label}. Total: ${state.xp} XP.`);
  } else {
    setFeedback(`Visited: ${station.label}. Already explored · ${state.xp} XP total.`);
  }
}

function move(direction) {
  state = movePlayer(state, direction, workshopContent);
  const station = getCurrentStation();

  if (station) {
    exploreStation(station);
  } else {
    render();
    setFeedback("Moved to an open tile. Keep going to a marked station.");
  }
}

function visitStation(stationId) {
  const station = workshopContent.stations.find((item) => item.id === stationId);

  if (!station) {
    return;
  }

  state = {
    ...state,
    position: { x: station.x, y: station.y }
  };
  exploreStation(station);
}

function inspect() {
  const station = getCurrentStation();

  if (!station) {
    setFeedback("Choose a marked station on the map to open its notes.");
    return;
  }

  exploreStation(station, "re-read");
}

connectInput({ map, controls, onMove: move, onInspect: inspect, onVisit: visitStation });
render();
