export const LEVELS = Array.from({ length: 10 }, (_, i) => ({
  level: i + 1,
  timePerFruit: 10 - i,       // seconds: 10, 9, 8, ... 1
  fruitsPerLevel: 20,
  maxHP: 10,
  pauseBetweenFruits: 1000,   // ms
}));

export const HP_PENALTY = {
  miss: 1,
  wrongKey: 0.25,
  bomb: 2,
};

// Bomb config per level
export const BOMB_CONFIG = Array.from({ length: 10 }, (_, i) => ({
  duration: i === 9 ? 1000 : 2000,           // 2s for levels 1-9, 1s for level 10
  chance: 0.15 + i * 0.03,                   // 15% at level 1, up to ~42% at level 10
  minSpawnDelay: 3000,                        // minimum ms between bomb spawns
}));

export const INPUT_LOCK_MS = 200;

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

// Fruit spawn area (percentage of game dimensions)
export const SPAWN_AREA = {
  xMin: 0.1,
  xMax: 0.75,
  yMin: 0.1,
  yMax: 0.6,
};
