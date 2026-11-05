const themeToggle = document.querySelector(".theme-toggle");
const themeStorageKey = "davud-portfolio-theme";
const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)");

function getStoredTheme() {
  const theme = window.localStorage.getItem(themeStorageKey);
  return theme === "light" || theme === "dark" ? theme : null;
}

function getActiveTheme() {
  return document.documentElement.dataset.theme
    || (systemPrefersLight.matches ? "light" : "dark");
}

function updateThemeToggle(theme) {
  if (!themeToggle) {
    return;
  }

  const nextTheme = theme === "dark" ? "light" : "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
  themeToggle.setAttribute("title", `Switch to ${nextTheme} theme`);
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
}

const savedTheme = getStoredTheme();

if (savedTheme) {
  document.documentElement.dataset.theme = savedTheme;
}

updateThemeToggle(getActiveTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = getActiveTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(themeStorageKey, nextTheme);
    updateThemeToggle(nextTheme);
  });
}
