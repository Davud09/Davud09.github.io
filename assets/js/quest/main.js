import { achievements, findNewAchievements } from "./achievements.js";
import { workshopContent } from "./content.js";
import { connectInput } from "./input.js";
import { mountMiniGame } from "./minigames.js";
import { renderHud, renderMap, renderStation } from "./render.js";
import { addAchievements, createInitialState, inspectStation, movePlayer } from "./state.js";

const map = document.querySelector("#workshop-map");
const controls = document.querySelector(".workshop-controls");
const message = document.querySelector("#workshop-message");
const accessibilityToggle = document.querySelector("#workshop-accessibility");
const gamepadStatus = document.querySelector("#workshop-gamepad");
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
  achievementList: document.querySelector("#achievement-list"),
  miniGame: document.querySelector("#station-minigame"),
  bestTime: document.querySelector("#workshop-best-time"),
  unlock: document.querySelector("#workshop-unlock")
};
const storageKey = "davud-workshop-state";
const knownStations = new Set(workshopContent.stations.map((station) => station.id));
let storageUnavailable = false;
let savedState = {};

try {
  const rawState = window.localStorage.getItem(storageKey);
  const parsedState = rawState ? JSON.parse(rawState) : {};
  const legacyXp = Number.parseInt(window.localStorage.getItem("davud-workshop-xp") ?? "0", 10);
  if (parsedState && typeof parsedState === "object" && !Array.isArray(parsedState)) {
    savedState = {
      ...parsedState,
      explored: Array.isArray(parsedState.explored)
        ? [...new Set(parsedState.explored.filter((id) => knownStations.has(id)))]
        : [],
      achievements: Array.isArray(parsedState.achievements)
        ? [...new Set(parsedState.achievements.filter((id) => achievements.some((item) => item.id === id)))]
        : [],
      bestTimes: parsedState.bestTimes && typeof parsedState.bestTimes === "object"
        ? Object.fromEntries(Object.entries(parsedState.bestTimes).filter(
          ([, time]) => Number.isFinite(time) && time >= 0
        ))
        : {},
      xp: Math.max(Number.isSafeInteger(parsedState.xp) ? parsedState.xp : 0, Number.isSafeInteger(legacyXp) ? legacyXp : 0)
    };
  } else {
    savedState = { xp: Number.isSafeInteger(legacyXp) ? legacyXp : 0 };
  }
} catch (error) {
  storageUnavailable = true;
  console.error("Unable to read saved workshop progress.", error);
}

let state = createInitialState(workshopContent.start, savedState);
let selectedStation = null;
let cleanupMiniGame = () => {};

function persistState() {
  if (storageUnavailable) {
    return false;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    window.localStorage.setItem("davud-workshop-xp", String(state.xp));
    return true;
  } catch (error) {
    storageUnavailable = true;
    console.error("Unable to save workshop progress.", error);
    message.textContent = "Progress could not be saved in this browser. You can keep playing for this visit.";
    return false;
  }
}

function render() {
  renderMap(map, workshopContent, state);
  renderHud(elements, workshopContent, state, achievements);
  document.querySelector(".workshop")?.classList.toggle("is-accessible", state.accessibleMode);
  accessibilityToggle?.setAttribute("aria-pressed", String(state.accessibleMode));
  if (accessibilityToggle) {
    accessibilityToggle.textContent = `Accessibility mode: ${state.accessibleMode ? "on" : "off"}`;
  }
  elements.unlock.hidden = state.xp < 100;
  const recordedTimes = Object.values(state.bestTimes).filter(Number.isFinite);
  elements.bestTime.textContent = recordedTimes.length > 0
    ? `Best time: ${(Math.min(...recordedTimes) / 1000).toFixed(2)} s`
    : "Best time: —";
}

function move(direction) {
  cleanupMiniGame();
  selectedStation = null;
  state = movePlayer(state, direction, workshopContent);
  message.textContent = "";
  render();
}

function completeMiniGame(gameId, time, awards) {
  const alreadyComplete = state.games[gameId] === true;
  const bestTime = Number.isFinite(time) ? state.bestTimes[gameId] : undefined;
  state = {
    ...state,
    xp: state.xp + (alreadyComplete ? 0 : 25),
    games: { ...state.games, [gameId]: true },
    bestTimes: Number.isFinite(time) && (!Number.isFinite(bestTime) || time < bestTime)
      ? { ...state.bestTimes, [gameId]: time }
      : state.bestTimes
  };
  state = addAchievements(state, awards);
  render();
  persistState();
  message.textContent = alreadyComplete
    ? "Practice recorded. No extra XP this time."
    : `Practice complete: +25 XP${state.xp >= 100 ? " · bonus contact panel unlocked!" : ""}`;
}

function inspect() {
  const station = workshopContent.stations.find(
    (item) => item.x === state.position.x && item.y === state.position.y
  );

  if (!station) {
    cleanupMiniGame();
    selectedStation = null;
    renderStation(elements, null);
    message.textContent = "Move to a marked station before inspecting.";
    return;
  }

  const result = inspectStation(state, station);
  state = result.state;
  const newAchievements = findNewAchievements(state, workshopContent.stations.length);
  state = addAchievements(state, newAchievements);
  selectedStation = station;
  renderStation(elements, station);
  render();
  cleanupMiniGame();
  cleanupMiniGame = mountMiniGame(elements.miniGame, station, state, completeMiniGame);
  message.textContent = result.newlyExplored
    ? `Station explored: +25 XP${newAchievements.length ? " · achievement unlocked!" : ""}`
    : `${station.label} is already in your workshop notes.`;
  persistState();
}

connectInput({ map, controls, onMove: move, onInspect: inspect });
let swipeOrigin;
let gamepadFrame;
let lastGamepadMove = 0;
let gamepadInspectPressed = false;

map.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch" || event.pointerType === "pen") {
    swipeOrigin = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    map.setPointerCapture(event.pointerId);
  }
});
map.addEventListener("pointerup", (event) => {
  if (!swipeOrigin || swipeOrigin.pointerId !== event.pointerId) {
    return;
  }

  const deltaX = event.clientX - swipeOrigin.x;
  const deltaY = event.clientY - swipeOrigin.y;
  swipeOrigin = undefined;
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 36) {
    return;
  }

  map.focus();
  move(Math.abs(deltaX) > Math.abs(deltaY)
    ? deltaX < 0 ? "left" : "right"
    : deltaY < 0 ? "up" : "down");
});
map.addEventListener("pointercancel", () => {
  swipeOrigin = undefined;
});

function pollGamepad() {
  const gamepads = navigator.getGamepads?.() ?? [];
  const gamepad = [...gamepads].find((item) => item?.connected);
  if (!gamepad) {
    gamepadFrame = undefined;
    return;
  }

  const now = performance.now();
  if (now - lastGamepadMove > 220) {
    const horizontal = gamepad.axes[0] ?? 0;
    const vertical = gamepad.axes[1] ?? 0;
    if (gamepad.buttons[12]?.pressed || vertical < -0.5) {
      move("up");
      lastGamepadMove = now;
    } else if (gamepad.buttons[13]?.pressed || vertical > 0.5) {
      move("down");
      lastGamepadMove = now;
    } else if (gamepad.buttons[14]?.pressed || horizontal < -0.5) {
      move("left");
      lastGamepadMove = now;
    } else if (gamepad.buttons[15]?.pressed || horizontal > 0.5) {
      move("right");
      lastGamepadMove = now;
    }
  }

  const inspectPressed = Boolean(gamepad.buttons[0]?.pressed);
  if (inspectPressed && !gamepadInspectPressed) {
    inspect();
  }
  gamepadInspectPressed = inspectPressed;
  gamepadFrame = window.requestAnimationFrame(pollGamepad);
}

window.addEventListener("gamepadconnected", () => {
  if (gamepadStatus) {
    gamepadStatus.textContent = "Controller connected: D-pad or left stick to move; A to inspect.";
  }
  if (gamepadFrame === undefined) {
    gamepadFrame = window.requestAnimationFrame(pollGamepad);
  }
});
window.addEventListener("gamepaddisconnected", () => {
  if (![...navigator.getGamepads?.() ?? []].some((item) => item?.connected)) {
    if (gamepadFrame !== undefined) {
      window.cancelAnimationFrame(gamepadFrame);
      gamepadFrame = undefined;
    }
    if (gamepadStatus) {
      gamepadStatus.textContent = "Controller disconnected. Use keyboard or touch controls.";
    }
  }
});
if (!navigator.getGamepads && gamepadStatus) {
  gamepadStatus.textContent = "Gamepad support is unavailable here. Use keyboard or touch controls.";
} else if ([...(navigator.getGamepads?.() ?? [])].some((item) => item?.connected)) {
  if (gamepadStatus) {
    gamepadStatus.textContent = "Controller connected: D-pad or left stick to move; A to inspect.";
  }
  gamepadFrame = window.requestAnimationFrame(pollGamepad);
}
accessibilityToggle?.addEventListener("click", () => {
  state = { ...state, accessibleMode: !state.accessibleMode };
  render();
  if (selectedStation) {
    cleanupMiniGame();
    cleanupMiniGame = mountMiniGame(elements.miniGame, selectedStation, state, completeMiniGame);
  }
  persistState();
});
render();

if (storageUnavailable) {
  message.textContent = "Saved progress is unavailable in this browser; this visit will not persist.";
}
