export const achievements = [
  {
    id: "first-inspection",
    title: "Bench opened",
    description: "Read your first resume station.",
    icon: "01"
  },
  {
    id: "circuit-reader",
    title: "Circuit reader",
    description: "Read the SITE 1101 breadboard project note.",
    icon: "C"
  },
  {
    id: "scoreboard",
    title: "Scoreboard found",
    description: "Check out the academic results station.",
    icon: "S"
  },
  {
    id: "portfolio-builder",
    title: "Built by hand",
    description: "Visit the portfolio studio.",
    icon: "W"
  },
  {
    id: "full-workshop",
    title: "Full tour",
    description: "Explore every stop in the workshop.",
    icon: "✓"
  }
];

export function findNewAchievements(state, stationCount) {
  const unlocked = [];

  if (state.explored.length > 0) {
    unlocked.push("first-inspection");
  }

  if (state.explored.includes("circuit-gates")) {
    unlocked.push("circuit-reader");
  }

  if (state.explored.includes("scores")) {
    unlocked.push("scoreboard");
  }

  if (state.explored.includes("portfolio")) {
    unlocked.push("portfolio-builder");
  }

  if (state.explored.length === stationCount) {
    unlocked.push("full-workshop");
  }

  return unlocked.filter((id) => !state.achievements.includes(id));
}
