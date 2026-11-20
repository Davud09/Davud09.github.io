const keyDirections = new Map([
  ["ArrowUp", "up"],
  ["w", "up"],
  ["W", "up"],
  ["ArrowDown", "down"],
  ["s", "down"],
  ["S", "down"],
  ["ArrowLeft", "left"],
  ["a", "left"],
  ["A", "left"],
  ["ArrowRight", "right"],
  ["d", "right"],
  ["D", "right"]
]);

export function connectInput({ map, controls, onMove, onInspect, onVisit }) {
  map.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const stationButton = event.target.closest("[data-station-id]");
    if (!(stationButton instanceof HTMLButtonElement)) {
      return;
    }

    onVisit(stationButton.dataset.stationId);
    map.focus({ preventScroll: true });
  });

  map.addEventListener("keydown", (event) => {
    const direction = keyDirections.get(event.key);
    if (direction) {
      event.preventDefault();
      onMove(direction);
      map.focus({ preventScroll: true });
    } else if (
      (event.key === "Enter" || event.key === " ")
      && event.target instanceof Element
      && event.target.closest("[data-station-id]")
    ) {
      return;
    } else if ((event.key === "Enter" || event.key === " ") && event.target === map) {
      event.preventDefault();
      onInspect();
    }
  });

  controls.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const moveButton = event.target.closest("[data-move]");
    if (moveButton instanceof HTMLButtonElement) {
      onMove(moveButton.dataset.move);
      map.focus({ preventScroll: true });
      return;
    }

    if (event.target.closest("[data-inspect]")) {
      onInspect();
      map.focus({ preventScroll: true });
    }
  });
}
