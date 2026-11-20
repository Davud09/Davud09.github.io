const themeToggle = document.querySelector(".theme-toggle");
const themeStorageKey = "davud-portfolio-theme";
const themeColor = document.querySelector('meta[name="theme-color"]');

function getStoredTheme() {
  try {
    const theme = window.localStorage.getItem(themeStorageKey);
    return theme === "light" || theme === "dark" ? theme : null;
  } catch (error) {
    console.warn("The saved theme is unavailable.", error);
    return null;
  }
}

function getActiveTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function updateThemeToggle(theme) {
  const nextTheme = theme === "dark" ? "light" : "dark";
  themeColor?.setAttribute("content", theme === "light" ? "#edf4ee" : "#0c1713");

  if (!themeToggle) {
    return;
  }

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
    updateThemeToggle(nextTheme);
    try {
      window.localStorage.setItem(themeStorageKey, nextTheme);
    } catch (error) {
      console.warn("The theme could not be saved.", error);
    }
  });
}
