const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

export function renderMap(map, content, state) {
  const previousPlayer = reducedMotionPreference.matches
    ? null
    : map.querySelector(".workshop-map__player");
  const previousPlayerBounds = previousPlayer?.getBoundingClientRect();
  const fragment = document.createDocumentFragment();
  const stationAt = new Map(content.stations.map((station) => [`${station.x},${station.y}`, station]));

  for (let y = 0; y < content.rows; y += 1) {
    for (let x = 0; x < content.columns; x += 1) {
      const station = stationAt.get(`${x},${y}`);
      const tile = document.createElement(station ? "button" : "span");
      const isExplored = station ? state.explored.includes(station.id) : false;
      tile.className = `workshop-map__tile${station ? " workshop-map__tile--station" : ""}`;

      if (station) {
        tile.type = "button";
        tile.dataset.stationId = station.id;
        tile.setAttribute(
          "aria-label",
          `${station.label}${isExplored ? ", explored" : ""}${state.position.x === x && state.position.y === y ? ", current location" : ""}`
        );
        tile.setAttribute("aria-pressed", String(state.position.x === x && state.position.y === y));
        const marker = document.createElement("span");
        marker.className = `workshop-map__station${isExplored ? " is-explored" : ""}`;
        marker.setAttribute("aria-hidden", "true");
        marker.textContent = station.symbol;
        marker.style.gridArea = "1 / 1";
        tile.append(marker);
      } else {
        tile.setAttribute("aria-hidden", "true");
      }

      if (state.position.x === x && state.position.y === y) {
        const player = document.createElement("span");
        player.className = `workshop-map__player${station ? " is-at-station" : ""}`;
        player.textContent = "DI";
        player.style.gridArea = "1 / 1";
        tile.append(player);
      }

      tile.style.gridColumn = String(x + 1);
      tile.style.gridRow = String(y + 1);
      fragment.append(tile);
    }
  }

  map.replaceChildren(fragment);

  if (previousPlayerBounds) {
    const player = map.querySelector(".workshop-map__player");
    const playerBounds = player?.getBoundingClientRect();

    if (player && playerBounds) {
      const offsetX = previousPlayerBounds.left - playerBounds.left;
      const offsetY = previousPlayerBounds.top - playerBounds.top;

      if (offsetX !== 0 || offsetY !== 0) {
        player.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => player.style.removeProperty("transform"));
        });
      }
    }
  }
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
