export const achievements = [
  {
    id: "first-inspection",
    title: "Bench opened",
    description: "Inspect your first resume station.",
    icon: "01"
  },
  {
    id: "circuit-reader",
    title: "Circuit reader",
    description: "Inspect the circuit project station.",
    icon: "⚡"
  },
  {
    id: "full-workshop",
    title: "Full workshop",
    description: "Explore every station.",
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
