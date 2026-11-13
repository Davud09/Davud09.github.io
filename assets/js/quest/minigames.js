function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}

function createPanel(container, title, description, bestTime) {
  const panel = makeElement("section", "station-minigame__panel");
  panel.setAttribute("aria-label", title);
  panel.append(makeElement("h3", "", title), makeElement("p", "", description));
  panel.append(makeElement(
    "p",
    "station-minigame__record",
    `Personal best: ${Number.isFinite(bestTime) ? `${(bestTime / 1000).toFixed(2)} s` : "not set"}`
  ));
  const status = makeElement("p", "station-minigame__status");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  panel.append(status);
  container.append(panel);
  return { panel, status };
}

function createButton(text, className = "button button--secondary") {
  const button = makeElement("button", className, text);
  button.type = "button";
  return button;
}

export function mountMiniGame(container, station, state, onComplete) {
  container.replaceChildren();
  if (!station) {
    return () => {};
  }

  let cancelPending = () => {};

  if (station.id === "repair") {
    const gameId = "repair-sim";
    const { panel, status } = createPanel(
      container,
      "Device bench · practice simulation",
      "Choose a tool for the pictured fastener, then reconnect the ribbon cable before closing the case.",
      state.bestTimes[gameId]
    );
    const step = makeElement("p", "station-minigame__prompt", "Step 1: choose a Phillips tool.");
    const choices = makeElement("div", "station-minigame__choices");
    let start;
    let mistakes = 0;
    let toolSelected = false;
    choices.append(
      createButton("Phillips screwdriver"),
      createButton("Flathead screwdriver")
    );
    panel.append(step, choices);
    choices.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) {
        return;
      }

      start ??= performance.now();
      if (!toolSelected) {
        if (target.textContent === "Phillips screwdriver") {
          toolSelected = true;
          step.textContent = "Step 2: reconnect the ribbon cable.";
          choices.replaceChildren(createButton("Reconnect cable"));
          status.textContent = "Correct tool selected.";
        } else {
          mistakes += 1;
          status.textContent = "That tip does not match the cross-head fastener. Try the Phillips tool.";
        }
        return;
      }

      if (target.textContent === "Reconnect cable") {
        const time = state.accessibleMode ? null : performance.now() - start;
        const awards = mistakes === 0 ? ["smoke-test", "perfect-run"] : ["smoke-test"];
        status.textContent = "Practice sequence complete. Device reassembly is ready for a final check.";
        choices.replaceChildren(createButton("Run again"));
        choices.addEventListener("click", () => {
          mountMiniGame(container, station, state, onComplete);
        }, { once: true });
        onComplete(gameId, time, awards);
      }
    });
  }

  if (station.id === "repair") {
    const gameId = "engine-cycle";
    const { panel, status } = createPanel(
      container,
      "Four-stroke cycle · practice sequence",
      "Put the four strokes in order. This is a learning exercise, not a record of a specific repair.",
      state.bestTimes[gameId]
    );
    const form = document.createElement("form");
    form.className = "station-minigame__form";
    const strokes = ["Intake", "Compression", "Power", "Exhaust"];
    let start;
    let mistakes = 0;
    form.addEventListener("change", () => {
      start ??= performance.now();
    });

    strokes.forEach((_, index) => {
      const label = makeElement("label", "", `Step ${index + 1}`);
      const select = document.createElement("select");
      select.setAttribute("aria-label", `Four-stroke cycle step ${index + 1}`);
      const empty = makeElement("option", "", "Choose a stroke");
      empty.value = "";
      select.append(empty);
      for (const stroke of strokes) {
        const option = makeElement("option", "", stroke);
        option.value = stroke.toLowerCase();
        select.append(option);
      }
      label.append(select);
      form.append(label);
    });

    const submit = createButton("Check sequence", "button button--primary");
    submit.type = "submit";
    form.append(submit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const answers = [...form.querySelectorAll("select")].map((select) => select.value);
      if (answers.includes("")) {
        status.textContent = "Choose a stroke for each step first.";
        return;
      }
      const correct = answers.every((answer, index) => answer === strokes[index].toLowerCase());
      if (!correct) {
        mistakes += 1;
        status.textContent = "Not quite. Review the order and try again.";
        return;
      }

      const time = state.accessibleMode ? null : performance.now() - (start ?? performance.now());
      const awards = mistakes === 0 ? ["smoke-test", "perfect-run"] : ["smoke-test"];
      status.textContent = "Correct: intake → compression → power → exhaust.";
      submit.disabled = true;
      onComplete(gameId, time, awards);
    });
    panel.append(form);
  }

  if (station.id === "interests") {
    const gameId = "swim-start";
    const { panel, status } = createPanel(
      container,
      "Swim start · reaction practice",
      state.accessibleMode
        ? "Accessibility mode is on: practice at your own pace, with no start delay."
        : "Press start, wait for the signal, then react. An early press is a false start.",
      state.bestTimes[gameId]
    );
    const button = createButton(state.accessibleMode ? "Record relaxed practice" : "Start reaction test", "button button--primary");
    let hadFalseStart = false;
    const start = () => {
      status.textContent = "Get ready… wait for the signal.";
      button.textContent = "Waiting for signal…";
      const delay = 900 + Math.random() * 1700;
      const timeout = window.setTimeout(() => {
        button.textContent = "SIGNAL — press now";
        button.dataset.signalReady = "true";
        const signalTime = performance.now();
        button.dataset.signalTime = String(signalTime);
      }, delay);
      cancelPending = () => window.clearTimeout(timeout);
    };

    button.addEventListener("click", () => {
      if (state.accessibleMode) {
        status.textContent = "Practice logged at your own pace.";
        button.disabled = true;
        onComplete(gameId, null, ["smoke-test"]);
        return;
      }
      if (button.dataset.signalReady === "true") {
        const time = performance.now() - Number(button.dataset.signalTime);
        status.textContent = `Reaction recorded: ${Math.round(time)} ms.`;
        button.disabled = true;
        onComplete(gameId, time, hadFalseStart ? ["smoke-test"] : ["smoke-test", "hot-swap"]);
      } else if (button.textContent === "Waiting for signal…") {
        cancelPending();
        hadFalseStart = true;
        status.textContent = "False start. Take a breath and try again.";
        button.textContent = "Try again";
        button.dataset.signalReady = "false";
      } else {
        button.dataset.signalReady = "false";
        start();
      }
    });
    panel.append(button);
  }

  if (station.id === "interests") {
    const gameId = "hike-climb";
    const { panel, status } = createPanel(
      container,
      "Trail sampler · illustrative elevation",
      "Climb eight segments. The elevation score is illustrative only, not a real route profile.",
      state.bestTimes[gameId]
    );
    const progress = makeElement("progress", "station-minigame__progress");
    progress.max = 8;
    progress.value = 0;
    progress.setAttribute("aria-label", "Trail segments climbed");
    const score = makeElement("p", "station-minigame__prompt", "0 / 8 segments · relative gain 0 m");
    const button = createButton("Climb next segment", "button button--primary");
    let segments = 0;
    let startTime;
    button.addEventListener("click", () => {
      if (startTime === undefined) {
        startTime = performance.now();
      }
      segments += 1;
      progress.value = segments;
      score.textContent = `${segments} / 8 segments · relative gain ${segments * 20} m`;
      if (segments === 8) {
        button.disabled = true;
        status.textContent = "Trail sampler complete. Nice steady climb.";
        const time = state.accessibleMode ? null : performance.now() - startTime;
        onComplete(gameId, time, ["smoke-test", "perfect-run"]);
      }
    });
    panel.append(progress, score, button);
  }

  return () => {
    cancelPending();
    container.replaceChildren();
  };
}
