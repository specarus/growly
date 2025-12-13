export const BASE_XP_PER_LEVEL = 100;
export const LEVEL_XP_INCREMENT = 25;

export const xpForLevel = (level: number) =>
  BASE_XP_PER_LEVEL + (level - 1) * LEVEL_XP_INCREMENT;

export const computeLevelState = (totalXP: number) => {
  let remainingXP = totalXP;
  let currentLevel = 1;
  let xpForCurrentLevel = xpForLevel(currentLevel);

  while (xpForCurrentLevel > 0 && remainingXP >= xpForCurrentLevel) {
    remainingXP -= xpForCurrentLevel;
    currentLevel += 1;
    xpForCurrentLevel = xpForLevel(currentLevel);
  }

  return {
    level: currentLevel,
    xpGainedInLevel: remainingXP,
    xpNeededForLevelUp: xpForCurrentLevel,
    progress: Math.min(
      100,
      Math.floor((remainingXP / xpForCurrentLevel) * 100)
    ),
  };
};
