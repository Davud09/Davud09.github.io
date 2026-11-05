export function renderMap(map, content, state) {
  const fragment = document.createDocumentFragment();
  const stationAt = new Map(content.stations.map((station) => [`${station.x},${station.y}`, station]));

  for (let y = 0; y < content.rows; y += 1) {
    for (let x = 0; x < content.columns; x += 1) {
      const tile = document.createElement("span");
      tile.className = "workshop-map__tile";
      tile.setAttribute("aria-hidden", "true");

      const station = stationAt.get(`${x},${y}`);
      if (station) {
        const marker = document.createElement("span");
        marker.className = `workshop-map__station${state.explored.includes(station.id) ? " is-explored" : ""}`;
        marker.style.gridColumn = String(x + 1);
        marker.style.gridRow = String(y + 1);
        tile.append(marker);
      }

      if (state.position.x === x && state.position.y === y) {
        const player = document.createElement("span");
        player.className = `workshop-map__player${station ? " is-at-station" : ""}`;
        player.textContent = "YOU";
        tile.append(player);
      }

      tile.style.gridColumn = String(x + 1);
      tile.style.gridRow = String(y + 1);
      fragment.append(tile);
    }
  }

  map.replaceChildren(fragment);
}

export function renderHud(elements, content, state, achievementData) {
  const station = content.stations.find(
    (item) => item.x === state.position.x && item.y === state.position.y
  );
  elements.xp.textContent = `${state.xp} XP`;
  elements.progress.textContent = `${state.explored.length} / ${content.stations.length} stations explored`;
  elements.location.textContent = station
    ? `You’re at: ${station.label}. Select “Inspect station” to read this resume note.`
    : "You are at the workshop entrance. Move to a marked station.";

  const stationKey = document.createDocumentFragment();
  for (const [index, item] of content.stations.entries()) {
    const entry = document.createElement("li");
    entry.className = "workshop-key__item";
    const marker = document.createElement("span");
    marker.className = `workshop-key__marker${state.explored.includes(item.id) ? " is-explored" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.textContent = `${String(index + 1).padStart(2, "0")} · ${item.label}`;
    entry.append(marker, label);
    stationKey.append(entry);
  }
  elements.stationKey.replaceChildren(stationKey);

  const unlocked = new Set(state.achievements);
  elements.achievementCount.textContent = `${state.achievements.length} / ${achievementData.length}`;
  const achievements = document.createDocumentFragment();

  for (const item of achievementData) {
    const entry = document.createElement("li");
    entry.className = `achievement${unlocked.has(item.id) ? " is-unlocked" : ""}`;
    const icon = document.createElement("span");
    icon.className = "achievement__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = unlocked.has(item.id) ? item.icon : "·";
    const text = document.createElement("span");
    const title = document.createElement("h3");
    title.textContent = item.title;
    const description = document.createElement("p");
    description.textContent = item.description;
    text.append(title, description);
    entry.append(icon, text);
    achievements.append(entry);
  }

  elements.achievementList.replaceChildren(achievements);
}

export function renderStation(elements, station) {
  elements.title.textContent = station?.title ?? "No station here";
  elements.description.textContent = station?.description
    ?? "Move to a marked station to inspect a resume note.";
  const facts = document.createDocumentFragment();

  for (const fact of station?.facts ?? []) {
    const item = document.createElement("li");
    item.textContent = fact;
    facts.append(item);
  }

  elements.facts.replaceChildren(facts);
}
