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
const circuitTimeLimit = 7;

const circuitStages = [
  {
    instruction: "Close the switch to send power to the lamp.",
    hint: "One switch. One bright idea.",
    switches: 1
  },
  {
    instruction: "A series circuit needs both switches closed.",
    hint: "Two switches, one complete path.",
    switches: 2
  },
  {
    instruction: "Close the switches in order: S2 → S1 → S3.",
    hint: "Watch the order. One wrong move resets the sequence.",
    sequence: [1, 0, 2],
    switches: 3
  },
  {
    instruction: "Beat the clock: close S3 → S1 → S2 → S3 → S2.",
    hint: "The timer starts with your first switch. You have 7 seconds.",
    sequence: [2, 0, 1, 2, 1],
    switches: 3,
    timed: true
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
) {
  let currentStage = 0;
  let sequenceProgress = 0;
  let completed = false;
  let switchStates = [];
  let timerInterval;
  let timerDeadline;

  function updateProgress() {
    for (const [index, item] of [...circuitProgress.children].entries()) {
      const stageIsSolved = index === currentStage && !circuitNext.hidden;
      item.classList.toggle("is-complete", index < currentStage || stageIsSolved);
      item.classList.toggle("is-current", index === currentStage && !stageIsSolved);

      if (index === currentStage && !stageIsSolved) {
        item.setAttribute("aria-current", "step");
      } else {
        item.removeAttribute("aria-current");
      }
    }

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
    resetTimedSequence("Time's up. Start again with S3.", "TIME OUT");
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
      control.setAttribute("aria-pressed", "false");
      control.setAttribute("aria-label", `${label}, open`);
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

    switchStates = Array(stage.switches).fill(false);
  }

  function updateCircuit() {
    const isPowered = switchStates.every(Boolean);
    circuitBoard.classList.toggle("is-powered", isPowered);
    circuitLamp.classList.toggle("is-lit", isPowered);
    circuitLamp.setAttribute("aria-label", isPowered ? "Lamp on" : "Lamp off");

    for (const [index, control] of [...circuitControls.children].entries()) {
      const isClosed = switchStates[index];
      control.classList.toggle("is-closed", isClosed);
      control.setAttribute("aria-pressed", String(isClosed));
      control.setAttribute("aria-label", `S${index + 1}, ${isClosed ? "closed" : "open"}`);
    }

    if (isPowered) {
      completeStage();
    }
  }

  function completeStage() {
    if (completed) {
      return;
    }

    circuitStatus.textContent = "CIRCUIT LIVE";
    circuitHint.textContent = currentStage === circuitStages.length - 1
      ? "Every stage cleared. You’ve got a bright future."
      : "Path complete. You got the signal through.";
    circuitBoard.classList.add("is-powered");
    circuitToy.classList.add("is-complete");
    stopTimer();
    circuitTimerWrap.hidden = true;
    const buttonLabel = currentStage === circuitStages.length - 1
      ? "Run it again"
      : "Next stage";
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    circuitNext.replaceChildren(document.createTextNode(buttonLabel), arrow);
    circuitNext.hidden = false;

    if (currentStage === circuitStages.length - 1) {
      completed = true;
    }

    updateProgress();
  }

  function activateSwitch(index) {
    const stage = circuitStages[currentStage];

    if (completed || circuitNext.hidden === false && switchStates.every(Boolean)) {
      return;
    }

    if (stage.sequence) {
      if (stage.timed) {
        startTimer();

        if (timerDeadline <= performance.now()) {
          updateTimer();
          return;
        }
      }

      if (stage.sequence[sequenceProgress] !== index) {
        const restartHint = stage.timed
          ? "Wrong switch. Take a breath, then start again with S3."
          : "Not quite. Start again with S2.";
        resetTimedSequence(restartHint, "SEQUENCE RESET");
        return;
      }

      switchStates[index] = true;
      sequenceProgress += 1;
      circuitStatus.textContent = sequenceProgress === stage.sequence.length
        ? "CIRCUIT LIVE"
        : `STEP ${sequenceProgress} / ${stage.sequence.length}`;
      circuitHint.textContent = sequenceProgress === stage.sequence.length
        ? "Perfect sequence. The lamp is on."
        : stage.timed
          ? `Signal ${sequenceProgress} of ${stage.sequence.length}. Keep moving.`
          : `Good. Now close S${stage.sequence[sequenceProgress] + 1}.`;
    } else {
      switchStates[index] = !switchStates[index];
      circuitStatus.textContent = "CHECKING";
    }

    updateCircuit();
  }

  function loadStage(stageIndex) {
    currentStage = stageIndex;
    sequenceProgress = 0;
    completed = false;
    const stage = circuitStages[currentStage];

    circuitBoard.classList.remove("is-powered");
    circuitToy.classList.remove("is-complete");
    stopTimer();
    circuitTimerWrap.hidden = !stage.timed;
    circuitTimer.textContent = circuitTimeLimit.toFixed(1);
    circuitLamp.classList.remove("is-lit");
    circuitLamp.setAttribute("aria-label", "Lamp off");
    circuitStatus.textContent = "READY";
    circuitHint.textContent = stage.hint;
    circuitInstruction.textContent = stage.instruction;
    circuitNext.hidden = true;
    circuitNext.replaceChildren();
    renderSwitches();
    updateProgress();
  }

  circuitNext.addEventListener("click", () => {
    if (currentStage === circuitStages.length - 1) {
      loadStage(0);
      return;
    }

    loadStage(currentStage + 1);
  });

  loadStage(0);
}
