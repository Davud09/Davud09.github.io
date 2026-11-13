const profileImage = document.querySelector(".home-portrait__image");
const profileFallback = document.querySelector(".home-portrait__fallback");

if (profileImage && profileFallback) {
  profileImage.addEventListener("error", () => {
    profileImage.hidden = true;
    profileFallback.hidden = false;
  }, { once: true });

  if (profileImage.complete && profileImage.naturalWidth === 0) {
    profileImage.dispatchEvent(new Event("error"));
  }
}

const greeting = document.querySelector("[data-greeting]");

if (greeting) {
  const hour = new Date().getHours();
  greeting.textContent = hour < 12
    ? "Good morning, engineer."
    : hour < 18
      ? "Good afternoon, engineer."
      : "Late-night debugging?";
}

const pageReady = document.querySelector("[data-page-ready]");
const pageReadyUnit = document.querySelector("[data-page-ready-unit]");
const pageReadyMeter = document.querySelector("[data-page-ready-meter]");
const navigationTiming = performance.getEntriesByType("navigation")[0];

if (pageReady && pageReadyUnit && pageReadyMeter && navigationTiming) {
  const interactiveTime = navigationTiming.domInteractive - navigationTiming.startTime;

  if (Number.isFinite(interactiveTime) && interactiveTime >= 0) {
    const isUnderOneSecond = interactiveTime < 1000;
    pageReady.textContent = isUnderOneSecond
      ? String(Math.round(interactiveTime))
      : (interactiveTime / 1000).toFixed(1);
    pageReadyUnit.textContent = isUnderOneSecond ? "ms" : "s";
    pageReady.title = `Browser Navigation Timing: the page became interactive in ${Math.round(interactiveTime)} milliseconds.`;
    pageReadyMeter.style.width = `${Math.min(interactiveTime / 250, 1) * 100}%`;
  } else {
    pageReady.textContent = "—";
    pageReadyUnit.textContent = "";
    pageReadyMeter.style.width = "0";
    pageReady.title = "Interactive timing is unavailable for this page load.";
  }
} else if (pageReady && pageReadyUnit && pageReadyMeter) {
  pageReady.textContent = "—";
  pageReadyUnit.textContent = "";
  pageReadyMeter.style.width = "0";
  pageReady.title = "This browser does not provide Navigation Timing data.";
}

const circuitBoard = document.querySelector("[data-circuit-board]");
const circuitToy = document.querySelector(".circuit-toy");
const circuitStatus = document.querySelector("[data-circuit-status]");
const circuitHint = document.querySelector("[data-circuit-hint]");
const circuitInstruction = document.querySelector("[data-circuit-instruction]");
const circuitControls = document.querySelector("[data-circuit-controls]");
const circuitLamp = document.querySelector("[data-circuit-lamp]");
const circuitStageCount = document.querySelector("[data-circuit-stage-count]");
const circuitProgress = document.querySelector("[data-circuit-progress]");
const circuitNext = document.querySelector("[data-circuit-next]");
const circuitTimerWrap = document.querySelector("[data-circuit-timer-wrap]");
const circuitTimer = document.querySelector("[data-circuit-timer]");
const circuitTruth = document.querySelector("[data-circuit-truth]");
const circuitReset = document.querySelector("[data-circuit-reset]");
const circuitSound = document.querySelector("[data-circuit-sound]");
const circuitTimeLimit = 7;

const circuitStages = [
  {
    kind: "series",
    instruction: "Series puzzle: both switches must close to complete the path.",
    hint: "In series, one open switch breaks the whole path.",
    switches: 2,
    goal: true,
    truth: "and"
  },
  {
    kind: "parallel",
    instruction: "Parallel puzzle: either branch can light the lamp.",
    hint: "Try each branch on its own.",
    switches: 2,
    goal: true,
    truth: "or"
  },
  {
    kind: "not",
    instruction: "NOT gate: make the output HIGH by opening the input switch.",
    hint: "A NOT gate reverses its input. Start with S1 closed.",
    switches: 1,
    initial: [true],
    goal: true,
    truth: "not"
  },
  {
    kind: "and",
    instruction: "AND puzzle: find the input combination that makes the output HIGH.",
    hint: "Both inputs must be HIGH.",
    switches: 2,
    goal: true,
    truth: "and"
  },
  {
    kind: "or",
    instruction: "OR puzzle: make the output HIGH with the fewest HIGH inputs.",
    hint: "One HIGH input is enough.",
    switches: 2,
    goal: true,
    truth: "or"
  },
  {
    kind: "nand",
    instruction: "NAND challenge: close A, then B, before the timer expires.",
    hint: "NAND is NOT-AND. The output goes LOW only when both inputs are HIGH.",
    switches: 2,
    sequence: [0, 1],
    timed: true,
    goal: false,
    truth: "nand"
  }
];

if (
  circuitBoard
  && circuitToy
  && circuitStatus
  && circuitHint
  && circuitInstruction
  && circuitControls
  && circuitLamp
  && circuitStageCount
  && circuitProgress
  && circuitNext
  && circuitTimerWrap
  && circuitTimer
  && circuitTruth
  && circuitReset
) {
  let currentStage = 0;
  let sequenceProgress = 0;
  let completed = false;
  let switchStates = [];
  let timerInterval;
  let timerDeadline;
  let bulbBurnedOut = false;
  let lampClickCount = 0;
  let lampClickWindow;
  let soundEnabled = false;
  let audioContext;
  let humOscillator;
  let humGain;

  function getOutput() {
    switch (circuitStages[currentStage].kind) {
      case "series":
      case "and":
        return switchStates.every(Boolean);
      case "parallel":
      case "or":
        return switchStates.some(Boolean);
      case "not":
        return !switchStates[0];
      case "nand":
        return !switchStates.every(Boolean);
      default:
        return false;
    }
  }

  function renderProgress() {
    const fragment = document.createDocumentFragment();

    for (const [index, stage] of circuitStages.entries()) {
      const step = document.createElement("li");
      step.className = index < currentStage ? "is-complete" : "";
      if (index === currentStage && !completed) {
        step.classList.add("is-current");
        step.setAttribute("aria-current", "step");
      }

      const label = document.createElement("span");
      label.textContent = String(index + 1).padStart(2, "0");
      label.setAttribute("aria-hidden", "true");
      step.setAttribute("aria-label", `Stage ${index + 1}: ${stage.kind.toUpperCase()}`);
      step.append(label);
      fragment.append(step);
    }

    circuitProgress.replaceChildren(fragment);
    circuitStageCount.textContent = completed
      ? "ALL STAGES CLEAR"
      : `STAGE ${String(currentStage + 1).padStart(2, "0")} / ${String(circuitStages.length).padStart(2, "0")}`;
  }

  function stopTimer() {
    if (timerInterval !== undefined) {
      window.clearInterval(timerInterval);
      timerInterval = undefined;
    }

    timerDeadline = undefined;
    circuitBoard.classList.remove("is-running");
  }

  function resetTimedSequence(message, status) {
    stopTimer();
    sequenceProgress = 0;
    switchStates.fill(false);
    circuitTimer.textContent = circuitTimeLimit.toFixed(1);
    circuitStatus.textContent = status;
    circuitHint.textContent = message;
    updateCircuit();
  }

  function updateTimer() {
    const timeLeft = Math.max(0, timerDeadline - performance.now());
    circuitTimer.textContent = (timeLeft / 1000).toFixed(1);

    if (timeLeft === 0) {
      resetTimedSequence("Time’s up. Start again with input A.", "TIME OUT");
    }
  }

  function startTimer() {
    if (timerDeadline !== undefined) {
      return;
    }

    circuitTimerWrap.hidden = false;
    timerDeadline = performance.now() + circuitTimeLimit * 1000;
    circuitBoard.classList.add("is-running");
    updateTimer();
    timerInterval = window.setInterval(updateTimer, 100);
  }

  function renderSwitches() {
    const stage = circuitStages[currentStage];
    circuitControls.replaceChildren();

    for (let index = 0; index < stage.switches; index += 1) {
      const control = document.createElement("button");
      const label = `S${index + 1}`;
      control.className = "circuit-toy__switch-button";
      control.type = "button";
      control.setAttribute("aria-pressed", String(Boolean(switchStates[index])));
      control.setAttribute("aria-label", `${label}, ${switchStates[index] ? "closed" : "open"}`);
      const lever = document.createElement("span");
      lever.className = "circuit-toy__switch-lever";
      lever.setAttribute("aria-hidden", "true");
      const switchLabel = document.createElement("span");
      switchLabel.className = "circuit-toy__switch-label";
      switchLabel.textContent = label;
      control.append(lever, switchLabel);
      control.addEventListener("click", () => activateSwitch(index));
      circuitControls.append(control);
    }
  }

  function renderTruthTable() {
    const stage = circuitStages[currentStage];
    const gateName = stage.truth;
    circuitTruth.hidden = !gateName;

    if (!gateName) {
      circuitTruth.replaceChildren();
      return;
    }

    const oneInput = gateName === "not";
    const table = document.createElement("table");
    const caption = document.createElement("caption");
    caption.textContent = `Live ${gateName.toUpperCase()} truth table`;
    table.append(caption);

    const header = document.createElement("tr");
    for (const name of (oneInput ? ["A", "Y"] : ["A", "B", "Y"])) {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = name;
      header.append(cell);
    }
    const head = document.createElement("thead");
    head.append(header);
    table.append(head);

    const body = document.createElement("tbody");
    const rows = oneInput
      ? [[false], [true]]
      : [[false, false], [false, true], [true, false], [true, true]];

    for (const values of rows) {
      const output = gateName === "not"
        ? !values[0]
        : gateName === "and"
          ? values.every(Boolean)
          : gateName === "or"
            ? values.some(Boolean)
            : !values.every(Boolean);
      const row = document.createElement("tr");
      row.classList.toggle(
        "is-current",
        values.every((value, index) => value === switchStates[index])
      );

      for (const value of [...values, output]) {
        const cell = document.createElement("td");
        cell.textContent = value ? "1" : "0";
        row.append(cell);
      }
      body.append(row);
    }

    table.append(body);
    circuitTruth.replaceChildren(table);
  }

  function playClickSound() {
    if (!soundEnabled) {
      return;
    }

    audioContext ??= new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.setValueAtTime(740, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(360, audioContext.currentTime + 0.06);
    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.07);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.075);
  }

  function updateHum(isOn) {
    if (!soundEnabled || !audioContext) {
      return;
    }

    if (isOn && !humOscillator) {
      humOscillator = audioContext.createOscillator();
      humGain = audioContext.createGain();
      humOscillator.frequency.value = 82;
      humGain.gain.setValueAtTime(0.001, audioContext.currentTime);
      humGain.gain.exponentialRampToValueAtTime(0.025, audioContext.currentTime + 0.3);
      humOscillator.connect(humGain);
      humGain.connect(audioContext.destination);
      humOscillator.start();
    } else if (!isOn && humOscillator) {
      humGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      humOscillator.stop(audioContext.currentTime + 0.12);
      humOscillator = undefined;
      humGain = undefined;
    }
  }

  function updateCircuit() {
    const output = getOutput();
    const isPowered = output && !bulbBurnedOut;
    circuitBoard.classList.toggle("is-powered", isPowered);
    circuitToy.classList.toggle("is-parallel", circuitStages[currentStage].kind === "parallel");
    circuitLamp.classList.toggle("is-lit", isPowered);
    circuitLamp.classList.toggle("is-burnt", bulbBurnedOut);
    circuitLamp.setAttribute("aria-label", bulbBurnedOut ? "Lamp burned out" : isPowered ? "Lamp on" : "Lamp off");

    for (const [index, control] of [...circuitControls.children].entries()) {
      const isClosed = switchStates[index];
      control.classList.toggle("is-closed", isClosed);
      control.setAttribute("aria-pressed", String(isClosed));
      control.setAttribute("aria-label", `S${index + 1}, ${isClosed ? "closed" : "open"}`);
    }

    renderTruthTable();
    updateHum(isPowered);
    if (output === circuitStages[currentStage].goal && !bulbBurnedOut) {
      completeStage();
    }
  }

  function completeStage() {
    if (completed) {
      return;
    }

    circuitStatus.textContent = circuitStages[currentStage].goal ? "CIRCUIT LIVE" : "OUTPUT LOW";
    circuitHint.textContent = currentStage === circuitStages.length - 1
      ? "Every stage cleared. You’ve got a bright future."
      : circuitStages[currentStage].goal
        ? "Path complete. You got the signal through."
        : "Correct: the gate output is LOW.";
    circuitToy.classList.add("is-complete");
    stopTimer();
    circuitTimerWrap.hidden = true;
    circuitNext.textContent = currentStage === circuitStages.length - 1
      ? "Run it again"
      : "Next stage";
    circuitNext.hidden = false;

    if (currentStage === circuitStages.length - 1) {
      completed = true;
    }

    renderProgress();
  }

  function activateSwitch(index) {
    const stage = circuitStages[currentStage];

    if (completed || !circuitNext.hidden || bulbBurnedOut) {
      return;
    }

    if (stage.sequence) {
      if (sequenceProgress === 0) {
        startTimer();
      }

      if (stage.sequence[sequenceProgress] !== index) {
        resetTimedSequence("Wrong input. Start again with S1.", "SEQUENCE RESET");
        playClickSound();
        return;
      }

      switchStates[index] = true;
      sequenceProgress += 1;
      circuitStatus.textContent = sequenceProgress === stage.sequence.length
        ? "CIRCUIT LIVE"
        : `STEP ${sequenceProgress} / ${stage.sequence.length}`;
      circuitHint.textContent = sequenceProgress === stage.sequence.length
        ? "Both NAND inputs are HIGH. The output is LOW."
        : "Input A is HIGH. Now close input B.";
    } else {
      switchStates[index] = !switchStates[index];
      circuitStatus.textContent = "CHECKING";
    }

    playClickSound();
    updateCircuit();
  }

  function loadStage(stageIndex) {
    currentStage = stageIndex;
    sequenceProgress = 0;
    completed = false;
    bulbBurnedOut = false;
    circuitToy.classList.remove("is-complete");
    circuitLamp.classList.remove("is-burnt");
    circuitBoard.classList.remove("is-powered");
    stopTimer();
    const stage = circuitStages[currentStage];
    switchStates = stage.initial?.slice() ?? Array(stage.switches).fill(false);
    circuitTimerWrap.hidden = !stage.timed;
    circuitTimer.textContent = circuitTimeLimit.toFixed(1);
    circuitLamp.classList.remove("is-lit");
    circuitLamp.setAttribute("aria-label", "Lamp off");
    circuitStatus.textContent = "READY";
    circuitHint.textContent = stage.hint;
    circuitInstruction.textContent = stage.instruction;
    circuitNext.hidden = true;
    circuitReset.hidden = true;
    circuitNext.replaceChildren();
    renderSwitches();
    renderProgress();
    updateCircuit();
  }

  circuitLamp.addEventListener("click", () => {
    const now = Date.now();
    if (now - lampClickWindow > 1800) {
      lampClickCount = 0;
    }
    lampClickWindow = now;
    lampClickCount += 1;

    if (lampClickCount < 10 || bulbBurnedOut) {
      return;
    }

    bulbBurnedOut = true;
    circuitStatus.textContent = "BULB FAILED";
    circuitHint.textContent = "Check your resistor value. Reset the bulb to continue.";
    circuitReset.hidden = false;
    circuitBoard.classList.remove("is-powered");
    circuitLamp.classList.remove("is-lit");
    circuitLamp.classList.add("is-burnt");
    const smoke = document.createElement("span");
    smoke.className = "circuit-smoke";
    smoke.setAttribute("aria-hidden", "true");
    smoke.textContent = "·  ·  ·";
    circuitBoard.append(smoke);
    lampClickCount = 0;
  });

  circuitReset.addEventListener("click", () => {
    bulbBurnedOut = false;
    circuitBoard.querySelector(".circuit-smoke")?.remove();
    circuitLamp.classList.remove("is-burnt");
    circuitStatus.textContent = "READY";
    circuitHint.textContent = "Bulb replaced. Try the circuit again.";
    circuitReset.hidden = true;
    updateCircuit();
  });

  circuitNext.addEventListener("click", () => {
    loadStage(currentStage === circuitStages.length - 1 ? 0 : currentStage + 1);
  });

  circuitSound?.addEventListener("click", async () => {
    if (!window.AudioContext) {
      circuitSound.disabled = true;
      circuitHint.textContent = "Sound is unavailable in this browser.";
      return;
    }

    soundEnabled = !soundEnabled;
    circuitSound.setAttribute("aria-pressed", String(soundEnabled));
    circuitSound.textContent = soundEnabled ? "Sound on" : "Sound off";
    if (soundEnabled) {
      try {
        audioContext ??= new window.AudioContext();
        await audioContext.resume();
        playClickSound();
        updateHum(circuitBoard.classList.contains("is-powered"));
      } catch (error) {
        soundEnabled = false;
        circuitSound.setAttribute("aria-pressed", "false");
        circuitSound.textContent = "Sound unavailable";
        circuitSound.disabled = true;
        circuitHint.textContent = "Audio could not start in this browser session.";
        console.error("Unable to start Signal Lab audio.", error);
      }
    } else {
      updateHum(false);
    }
  });

  const faultPanel = document.querySelector("[data-fault-panel]");
  const faultReading = document.querySelector("[data-fault-reading]");
  const faultDiagnosis = document.querySelector("[data-fault-diagnosis]");
  const faultFaults = ["open", "bulb", "reversed"];
  let hiddenFault;

  document.querySelector("[data-fault-start]")?.addEventListener("click", () => {
    hiddenFault = faultFaults[Math.floor(Math.random() * faultFaults.length)];
    faultPanel.hidden = false;
    faultDiagnosis.value = "";
    faultReading.textContent = "Fault inserted. Run one or more multimeter tests.";
  });

  document.querySelectorAll("[data-meter-check]").forEach((button) => {
    button.addEventListener("click", () => {
      const readings = {
        open: {
          continuity: "Continuity: OPEN. The path is broken.",
          voltage: "Lamp voltage: 0.0 V.",
          polarity: "LED polarity: correct."
        },
        bulb: {
          continuity: "Continuity: CLOSED. The circuit path is intact.",
          voltage: "Lamp voltage: 0.0 V.",
          polarity: "LED polarity: correct."
        },
        reversed: {
          continuity: "Continuity: CLOSED. The circuit path is intact.",
          voltage: "Lamp voltage: 5.0 V at the LED.",
          polarity: "LED polarity: reversed."
        }
      };
      faultReading.textContent = readings[hiddenFault][button.dataset.meterCheck];
    });
  });

  document.querySelector("[data-fault-submit]")?.addEventListener("click", () => {
    if (!hiddenFault || !faultDiagnosis.value) {
      faultReading.textContent = "Choose a diagnosis after running the multimeter.";
      return;
    }

    const correct = faultDiagnosis.value === hiddenFault;
    faultReading.textContent = correct
      ? "Diagnosis confirmed. The circuit is ready for repair."
      : "That diagnosis does not match the measurements. Take another reading.";
    if (correct) {
      circuitToy.classList.add("is-complete");
    }
  });

  loadStage(0);
}
