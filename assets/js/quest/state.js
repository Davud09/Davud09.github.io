export function createInitialState(start) {
  return {
    position: { x: start.x, y: start.y },
    xp: 0,
    explored: [],
    achievements: []
  };
}

export function movePlayer(state, direction, dimensions) {
  const movement = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  }[direction];

  if (!movement) {
    return state;
  }

  return {
    ...state,
    position: {
      x: Math.max(0, Math.min(dimensions.columns - 1, state.position.x + movement.x)),
      y: Math.max(0, Math.min(dimensions.rows - 1, state.position.y + movement.y))
    }
  };
}

export function inspectStation(state, station) {
  if (!station || state.explored.includes(station.id)) {
    return { state, newlyExplored: false };
  }

  return {
    state: {
      ...state,
      xp: state.xp + 25,
      explored: [...state.explored, station.id]
    },
    newlyExplored: true
  };
}

export function addAchievements(state, achievementIds) {
  const newIds = achievementIds.filter((id) => !state.achievements.includes(id));
  return {
    ...state,
    achievements: [...state.achievements, ...newIds]
  };
}
