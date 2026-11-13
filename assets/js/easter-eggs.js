const voltageCode = ["v", "o", "l", "t"];
const voltageRoot = document.documentElement;
const themeToggleForEgg = document.querySelector(".theme-toggle");
let voltageCodeProgress = 0;
let themeToggleCount = 0;
let eggResetTimer;
let themeToggleResetTimer;
let voltageToastTimer;
let voltageToast;
const logoClickStorageKey = "davud-logo-click-sequence";
let commandProgress = 0;
let commandResetTimer;
const konamiCode = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"
];

function createEggDialog(className, title, description) {
  const dialog = document.createElement("dialog");
  dialog.className = `egg-dialog ${className}`;
  dialog.innerHTML = `
    <div class="egg-dialog__content">
      <button class="egg-dialog__close" type="button" aria-label="Close">×</button>
      <p class="eyebrow">Hidden feature</p>
      <h2></h2>
      <p class="egg-dialog__description"></p>
      <div class="egg-dialog__body"></div>
    </div>
  `;
  dialog.querySelector("h2").textContent = title;
  dialog.querySelector(".egg-dialog__description").textContent = description;
  dialog.querySelector(".egg-dialog__close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  document.body.append(dialog);
  return dialog;
}

function showResistorQuiz() {
  let quiz = document.querySelector(".resistor-quiz");
  if (!quiz) {
    quiz = createEggDialog(
      "resistor-quiz",
      "Resistor color check",
      "A four-band resistor has brown, black, red, and gold bands. What is its value?"
    );
    const form = document.createElement("form");
    form.className = "resistor-quiz__form";
    const choices = [
      { value: "100", label: "100 Ω ±5%" },
      { value: "1000", label: "1 kΩ ±5%" },
      { value: "10000", label: "10 kΩ ±5%" }
    ];

    for (const [index, choice] of choices.entries()) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "resistor-value";
      input.value = choice.value;
      input.required = index === 0;
      label.append(input, document.createTextNode(choice.label));
      form.append(label);
    }

    const submit = document.createElement("button");
    submit.className = "button button--primary";
    submit.type = "submit";
    submit.textContent = "Check value";
    const feedback = document.createElement("p");
    feedback.className = "resistor-quiz__feedback";
    feedback.setAttribute("role", "status");
    form.append(submit, feedback);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const selected = form.querySelector('input[name="resistor-value"]:checked');
      feedback.textContent = selected?.value === "1000"
        ? "Correct: brown = 1, black = 0, red = ×100, gold = ±5%."
        : "Not quite. The first two bands are digits, the third is the multiplier.";
    });
    quiz.querySelector(".egg-dialog__body").append(form);
  }

  if (!quiz.open) {
    quiz.showModal();
  }
}

function showHireEgg() {
  let dialog = document.querySelector(".hire-egg");
  if (!dialog) {
    dialog = createEggDialog(
      "hire-egg",
      "Signal received.",
      "Thanks for thinking about building something together."
    );
    const link = document.createElement("a");
    link.className = "button button--primary";
    link.href = "about.html#contact";
    link.textContent = "Open resume & contact";
    dialog.querySelector(".egg-dialog__body").append(link);
  }
  if (!dialog.open) {
    dialog.showModal();
  }
}

function activateOscilloscope() {
  const enabled = voltageRoot.classList.toggle("is-oscilloscope");
  showVoltageEgg(enabled
    ? "OSCILLOSCOPE MODE: signal locked."
    : "OSCILLOSCOPE MODE: normal view restored.");
}

function showVoltageEgg(message) {
  if (!voltageToast) {
    voltageToast = document.createElement("p");
    voltageToast.className = "voltage-toast";
    voltageToast.setAttribute("role", "status");
    voltageToast.setAttribute("aria-live", "polite");
    document.body.append(voltageToast);
  }

  window.clearTimeout(voltageToastTimer);
  voltageToast.textContent = message;
  voltageRoot.classList.add("voltage-boost");
  window.requestAnimationFrame(() => {
    voltageToast.classList.add("is-visible");
  });
  voltageToastTimer = window.setTimeout(() => {
    voltageToast.classList.remove("is-visible");
    voltageRoot.classList.remove("voltage-boost");
  }, 2400);
}

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isEditing = target instanceof HTMLElement
    && (target.isContentEditable || target.matches("input, textarea, select"));

  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || isEditing) {
    return;
  }

  const key = event.key.toLowerCase();

  if (!isEditing && !event.repeat && !event.altKey && !event.ctrlKey && !event.metaKey) {
    const konamiKey = event.key.length === 1 ? key : event.key;
    if (konamiKey === konamiCode[commandProgress]) {
      commandProgress += 1;
    } else {
      commandProgress = event.key === konamiCode[0] ? 1 : 0;
    }

    window.clearTimeout(commandResetTimer);
    if (commandProgress === konamiCode.length) {
      commandProgress = 0;
      activateOscilloscope();
    } else if (commandProgress > 0) {
      commandResetTimer = window.setTimeout(() => {
        commandProgress = 0;
      }, 5000);
    }
  }

  if (key === voltageCode[voltageCodeProgress]) {
    voltageCodeProgress += 1;
  } else {
    voltageCodeProgress = key === voltageCode[0] ? 1 : 0;
  }

  window.clearTimeout(eggResetTimer);

  if (voltageCodeProgress === voltageCode.length) {
    voltageCodeProgress = 0;
    showVoltageEgg("VOLTAGE CHECK: all systems nominal.");
  } else if (voltageCodeProgress > 0) {
    eggResetTimer = window.setTimeout(() => {
      voltageCodeProgress = 0;
    }, 2500);
  }
});

document.querySelector(".site-header__brand")?.addEventListener("click", (event) => {
  const now = Date.now();
  let clickCount = 0;
  try {
    const previous = JSON.parse(window.sessionStorage.getItem(logoClickStorageKey) ?? "{}");
    clickCount = previous
      && typeof previous === "object"
      && Number.isSafeInteger(previous.count)
      && Number.isSafeInteger(previous.time)
      && now - previous.time < 3000
      ? previous.count
      : 0;
    clickCount += 1;

    if (clickCount === 5) {
      event.preventDefault();
      window.sessionStorage.removeItem(logoClickStorageKey);
      showResistorQuiz();
    } else {
      window.sessionStorage.setItem(logoClickStorageKey, JSON.stringify({ count: clickCount, time: now }));
    }
  } catch (error) {
    console.error("Unable to track the logo Easter egg.", error);
  }
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey
    || (target instanceof HTMLElement && (target.isContentEditable || target.matches("input, textarea, select")))) {
    return;
  }

  const phrase = "sudo hire davud";
  const key = event.key.toLowerCase();
  voltageRoot.dataset.hireBuffer = `${voltageRoot.dataset.hireBuffer ?? ""}${key}`.slice(-phrase.length);
  if (voltageRoot.dataset.hireBuffer === phrase) {
    voltageRoot.dataset.hireBuffer = "";
    showHireEgg();
  }
});

if (themeToggleForEgg) {
  themeToggleForEgg.addEventListener("click", () => {
    themeToggleCount += 1;
    window.clearTimeout(themeToggleResetTimer);
    themeToggleResetTimer = window.setTimeout(() => {
      themeToggleCount = 0;
    }, 2500);

    if (themeToggleCount === 5) {
      themeToggleCount = 0;
      window.clearTimeout(themeToggleResetTimer);
      showVoltageEgg("POLARITY FLIPPED: workshop lights on.");
    }
  });
}
