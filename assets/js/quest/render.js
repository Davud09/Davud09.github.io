export function renderMap(map, content, state) {
  if (!map.querySelector(".workshop-map__player")) {
    const fragment = document.createDocumentFragment();
    const stationAt = new Map(content.stations.map((station) => [`${station.x},${station.y}`, station]));

    for (let y = 0; y < content.rows; y += 1) {
      for (let x = 0; x < content.columns; x += 1) {
        const station = stationAt.get(`${x},${y}`);
        const tile = document.createElement(station ? "button" : "span");
        tile.className = `workshop-map__tile${station ? " workshop-map__tile--station" : ""}`;
        tile.dataset.x = x;
        tile.dataset.y = y;

        if (station) {
          tile.type = "button";
          tile.dataset.stationId = station.id;
          const marker = document.createElement("span");
          marker.className = "workshop-map__station";
          marker.setAttribute("aria-hidden", "true");
          marker.textContent = station.symbol;
          tile.append(marker);
        } else {
          tile.setAttribute("aria-hidden", "true");
        }

        tile.style.gridColumn = String(x + 1);
        tile.style.gridRow = String(y + 1);
        fragment.append(tile);
      }
    }
    const player = document.createElement("span");
    player.className = "workshop-map__player";
    player.setAttribute("aria-hidden", "true");
    player.textContent = "DI";
    fragment.append(player);
    map.replaceChildren(fragment);
    if ("ResizeObserver" in window) {
      new ResizeObserver(() => positionPlayer(map)).observe(map);
    } else {
      window.addEventListener("resize", () => positionPlayer(map));
    }
  }

  map.dataset.playerX = state.position.x;
  map.dataset.playerY = state.position.y;
  for (const station of content.stations) {
    const tile = map.querySelector(`[data-station-id="${station.id}"]`);
    const explored = state.explored.includes(station.id);
    const current = state.position.x === station.x && state.position.y === station.y;
    tile.setAttribute("aria-label", `${station.label}${explored ? ", explored" : ""}${current ? ", current location" : ""}`);
    tile.setAttribute("aria-pressed", String(current));
    tile.querySelector(".workshop-map__station").classList.toggle("is-explored", explored);
  }
  map.querySelector(".workshop-map__player").classList.toggle("is-at-station", content.stations.some(
    (station) => station.x === state.position.x && station.y === state.position.y
  ));
  positionPlayer(map);
}

function positionPlayer(map) {
  const tile = map.querySelector(`[data-x="${map.dataset.playerX}"][data-y="${map.dataset.playerY}"]`);
  const player = map.querySelector(".workshop-map__player");
  if (!tile || !player) return;
  const size = tile.offsetWidth * 0.78;
  player.style.width = `${size}px`;
  player.style.height = `${size}px`;
  player.style.transform = `translate3d(${tile.offsetLeft + (tile.offsetWidth - size) / 2}px, ${tile.offsetTop + (tile.offsetHeight - size) / 2}px, 0)`;
}

export function renderHud(elements, content, state, achievementData) {
  const station = content.stations.find(
    (item) => item.x === state.position.x && item.y === state.position.y
  );
  elements.xp.textContent = `${state.xp} XP`;
  elements.progress.textContent = `${state.explored.length} / ${content.stations.length} stops explored`;
  elements.progressFill.style.transform = `scaleX(${state.explored.length / content.stations.length})`;
  elements.location.textContent = station
    ? `Current station: ${station.label}. Its note opens automatically; use Re-read to open it again.`
    : "Open tile. Move to a marked station to explore its note.";
  elements.inspectButton.disabled = !station;

  const stationKey = document.createDocumentFragment();
  for (const [index, item] of content.stations.entries()) {
    const entry = document.createElement("li");
    entry.className = "workshop-key__item";
    const marker = document.createElement("span");
    marker.className = `workshop-key__marker${state.explored.includes(item.id) ? " is-explored" : ""}`;
    marker.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.textContent = `${item.symbol} · ${item.label}`;
    entry.append(marker, label);
    stationKey.append(entry);
  }
  elements.stationKey.replaceChildren(stationKey);

  const unlocked = new Set(state.achievements);
  elements.achievementCount.textContent = `${state.achievements.length} unlocked`;
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
