export const achievements = [
  {
    id: "first-inspection",
    title: "Bench opened",
    description: "Read your first resume station.",
    icon: "01"
  },
  {
    id: "circuit-reader",
    title: "Logic-gate builder",
    description: "Read the SITE 1101 breadboard project note.",
    icon: "⚡"
  },
  {
    id: "full-workshop",
    title: "Whole workshop",
    description: "Read all six resume stations.",
    icon: "★"
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

  if (state.explored.length === stationCount) {
    unlocked.push("full-workshop");
  }

  return unlocked.filter((id) => !state.achievements.includes(id));
}
