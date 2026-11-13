const yearTargets = document.querySelectorAll("[data-current-year]");

for (const target of yearTargets) {
  target.textContent = String(new Date().getFullYear());
}

const paletteLinks = [
  { label: "Home", detail: "Introduction", href: "index.html" },
  { label: "Signal Lab", detail: "Circuit puzzle", href: "index.html#signal-lab" },
  { label: "About", detail: "Skills and experience", href: "about.html" },
  { label: "Hiking map", detail: "Field routes", href: "about.html#hiking" },
  { label: "Fitness records", detail: "Strength log", href: "about.html#fitness" },
  { label: "Contact", detail: "Connect with Davud", href: "about.html#contact" },
  { label: "Projects", detail: "Coursework and builds", href: "projects.html" },
  { label: "Repair Log", detail: "Troubleshooting notes", href: "repair-log.html" },
  { label: "Field Workshop", detail: "Interactive resume", href: "quest.html" }
];

const headerNavigation = document.querySelector(".site-nav");
if (headerNavigation && !headerNavigation.querySelector('[href="repair-log.html"]')) {
  const repairLogLink = document.createElement("a");
  repairLogLink.className = "site-nav__link";
  repairLogLink.href = "repair-log.html";
  repairLogLink.textContent = "Repair Log";
  headerNavigation.append(repairLogLink);
}

const palette = document.createElement("dialog");
palette.className = "command-palette";
palette.setAttribute("aria-labelledby", "command-palette-title");
palette.innerHTML = `
  <div class="command-palette__header">
    <h2 id="command-palette-title">Jump to a page</h2>
    <button class="command-palette__close" type="button" aria-label="Close shortcut palette">×</button>
  </div>
  <label class="visually-hidden" for="command-palette-search">Search pages</label>
  <input id="command-palette-search" type="search" placeholder="Type a page or section…" autocomplete="off">
  <p class="command-palette__hint">Use ↑ ↓ to move · Enter to open · Esc to close</p>
  <ul class="command-palette__results" role="listbox" aria-label="Pages and sections"></ul>
  <p class="command-palette__empty" hidden>No matching destinations.</p>
`;
document.body.append(palette);

const paletteSearch = palette.querySelector("#command-palette-search");
const paletteResults = palette.querySelector(".command-palette__results");
const paletteEmpty = palette.querySelector(".command-palette__empty");
const paletteClose = palette.querySelector(".command-palette__close");
let activePaletteIndex = -1;
const paletteTrigger = document.createElement("button");
paletteTrigger.className = "command-palette-trigger";
paletteTrigger.type = "button";
paletteTrigger.dataset.glassControl = "";
paletteTrigger.setAttribute("aria-label", "Open shortcut palette, Ctrl or Command plus K, or slash");
paletteTrigger.innerHTML = '<span>⌕</span><kbd>/</kbd>';
document.querySelector(".site-header__controls")?.prepend(paletteTrigger);

function renderPaletteResults() {
  const query = paletteSearch.value.trim().toLocaleLowerCase();
  const filtered = paletteLinks.filter((item) =>
    `${item.label} ${item.detail}`.toLocaleLowerCase().includes(query)
  );
  const fragment = document.createDocumentFragment();

  filtered.forEach((item, index) => {
    const link = document.createElement("a");
    link.className = "command-palette__link";
    link.dataset.glassControl = "";
    link.href = item.href;
    link.setAttribute("role", "option");
    link.setAttribute("aria-selected", String(index === activePaletteIndex));
    const title = document.createElement("span");
    title.textContent = item.label;
    const detail = document.createElement("small");
    detail.textContent = item.detail;
    link.append(title, detail);
    fragment.append(link);
  });

  paletteResults.replaceChildren(fragment);
  paletteEmpty.hidden = filtered.length !== 0;
  activePaletteIndex = Math.min(activePaletteIndex, filtered.length - 1);
}

function openPalette() {
  if (!palette.open) {
    palette.showModal();
  }
  paletteSearch.value = "";
  activePaletteIndex = -1;
  renderPaletteResults();
  paletteSearch.focus();
}

function setActivePaletteResult(index) {
  const links = [...paletteResults.querySelectorAll("a")];
  if (links.length === 0) {
    activePaletteIndex = -1;
    return;
  }

  activePaletteIndex = index < 0 ? links.length - 1 : index % links.length;
  links.forEach((link, itemIndex) => {
    link.setAttribute("aria-selected", String(itemIndex === activePaletteIndex));
  });
  links[activePaletteIndex].focus();
}

paletteTrigger.addEventListener("click", openPalette);
paletteClose.addEventListener("click", () => palette.close());
palette.addEventListener("click", (event) => {
  if (event.target === palette) {
    palette.close();
  }
});
paletteSearch.addEventListener("input", () => {
  activePaletteIndex = -1;
  renderPaletteResults();
});
paletteSearch.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    setActivePaletteResult(activePaletteIndex + (event.key === "ArrowDown" ? 1 : -1));
  }
});
paletteResults.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    paletteSearch.focus();
    setActivePaletteResult(activePaletteIndex + (event.key === "ArrowDown" ? 1 : -1));
  }
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isEditing = target instanceof HTMLElement
    && (target.isContentEditable || target.matches("input, textarea, select"));

  if ((event.key === "k" && (event.ctrlKey || event.metaKey)) || (event.key === "/" && !isEditing)) {
    event.preventDefault();
    openPalette();
  } else if (event.key === "Enter" && palette.open && target instanceof HTMLAnchorElement) {
    palette.close();
  }
});

renderPaletteResults();

console.info(
  "   .----.      Hi! You’re looking at the code.\n"
  + "  / .--. \\     Want to build something together?\n"
  + "  | |  | |    https://github.com/Davud09\n"
  + "  \\ '--' /\n"
  + "   '----'"
);
