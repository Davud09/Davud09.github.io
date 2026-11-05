import { achievements, findNewAchievements } from "./achievements.js";
import { workshopContent } from "./content.js";
import { connectInput } from "./input.js";
import { renderHud, renderMap, renderStation } from "./render.js";
import { addAchievements, createInitialState, inspectStation, movePlayer } from "./state.js";

const map = document.querySelector("#workshop-map");
const controls = document.querySelector(".workshop-controls");
const message = document.querySelector("#workshop-message");
const elements = {
  xp: document.querySelector("#workshop-xp"),
  progress: document.querySelector("#workshop-progress"),
  location: document.querySelector("#workshop-location"),
  stationKey: document.querySelector("#workshop-key"),
  title: document.querySelector("#station-title"),
  description: document.querySelector("#station-description"),
  facts: document.querySelector("#station-facts"),
  achievementCount: document.querySelector("#achievement-count"),
  achievementList: document.querySelector("#achievement-list")
};
let state = createInitialState(workshopContent.start);

function render() {
  renderMap(map, workshopContent, state);
  renderHud(elements, workshopContent, state, achievements);
}

function move(direction) {
  state = movePlayer(state, direction, workshopContent);
  message.textContent = "";
  render();
}

function inspect() {
  const station = workshopContent.stations.find(
    (item) => item.x === state.position.x && item.y === state.position.y
  );

  if (!station) {
    renderStation(elements, null);
    message.textContent = "Move to a marked station before inspecting.";
    return;
  }

  const result = inspectStation(state, station);
  state = result.state;
  const newAchievements = findNewAchievements(state, workshopContent.stations.length);
  state = addAchievements(state, newAchievements);
  renderStation(elements, station);
  render();
  message.textContent = result.newlyExplored
    ? `Station explored: +25 XP${newAchievements.length ? " · achievement unlocked!" : ""}`
    : `${station.label} is already in your workshop notes.`;
}

connectInput({ map, controls, onMove: move, onInspect: inspect });
render();
