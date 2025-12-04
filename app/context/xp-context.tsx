"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "./session-context";

import { MAX_STREAK_BONUS } from "@/lib/xp";

const BASE_XP_PER_LEVEL = 100;
const LEVEL_XP_INCREMENT = 25;

interface GamificationState {
  totalXP: number;
  level: number;
  xpGainedInLevel: number;
  xpNeededForLevelUp: number;
  progress: number;
  todayXP: number;
  streakBonus: number;
}

interface XPContextValue extends GamificationState {
  addXP: (amount: number, source?: CelebrationSource) => void;
  loading: boolean;
  celebration: CelebrationEvent | null;
  clearCelebration: () => void;
}

const XPContext = createContext<XPContextValue | undefined>(undefined);

interface XPProviderProps {
  children: React.ReactNode;
}

const xpForLevel = (level: number) =>
  BASE_XP_PER_LEVEL + (level - 1) * LEVEL_XP_INCREMENT;

type CelebrationEvent =
  | { type: CelebrationSource; xp: number }
  | { type: "level"; xp: number; level: number };

type CelebrationSource = "todo" | "habit";

const computeLevelState = (totalXP: number) => {
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
  };
};

export const XPProvider: React.FC<XPProviderProps> = ({ children }) => {
  const { session } = useSession();
  const [totalXP, setTotalXP] = useState<number | null>(null);
  const [todayXP, setTodayXP] = useState<number | null>(null);
  const [streakBonus, setStreakBonus] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<CelebrationEvent | null>(
    null
  );

  useEffect(() => {
    if (!session?.user?.id) {
      setTotalXP(null);
      setTodayXP(null);
      setStreakBonus(null);
      setCelebration(null);
      return;
    }

    const controller = new AbortController();

    const loadXP = async () => {
      try {
        setTotalXP(null);
        setTodayXP(null);
        setStreakBonus(null);

        const response = await fetch("/api/xp", {
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load XP");
        }

        const data = await response.json();
        setTotalXP(data.totalXP ?? 0);
        setTodayXP(data.todayXP ?? 0);
        setStreakBonus(data.streakBonus ?? 0);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("[XPProvider] load XP", error);
      }
    };

    loadXP();

    return () => controller.abort();
  }, [session?.user?.id]);

  const xpTotalValue = totalXP ?? 0;
  const { level, xpGainedInLevel, xpNeededForLevelUp } = useMemo(
    () => computeLevelState(xpTotalValue),
    [xpTotalValue]
  );

  const progress = Math.min(
    100,
    Math.floor((xpGainedInLevel / xpNeededForLevelUp) * 100)
  );

  const addXP = useCallback((amount: number, source: CelebrationSource = "todo") => {
    if (amount === 0) return;

    setTotalXP((prev) => {
      const previousTotal = prev ?? 0;
      const nextTotal = Math.max(0, previousTotal + amount);
      const prevLevel = computeLevelState(previousTotal).level;
      const nextLevel = computeLevelState(nextTotal).level;
      if (amount > 0) {
        if (nextLevel > prevLevel) {
          setCelebration({ type: "level", xp: amount, level: nextLevel });
        } else {
          setCelebration({ type: source, xp: amount });
        }
      }
      return nextTotal;
    });

    setTodayXP((prev) => {
      const nextToday = (prev == null ? 0 : prev) + amount;
      return Math.max(0, nextToday);
    });

    setStreakBonus((prev) => {
      const nextBonus = (prev == null ? 0 : prev) + Math.floor(amount / 2);
      return Math.max(0, Math.min(MAX_STREAK_BONUS, nextBonus));
    });
  }, []);

  const clearCelebration = useCallback(() => setCelebration(null), []);

  const loading = totalXP === null;

  const value = useMemo(
    () => ({
      totalXP: xpTotalValue,
      level,
      xpGainedInLevel,
      xpNeededForLevelUp,
      progress,
      todayXP: todayXP ?? 0,
      streakBonus: streakBonus ?? 0,
      addXP,
      celebration,
      clearCelebration,
      loading,
    }),
    [
      xpTotalValue,
      level,
      xpGainedInLevel,
      xpNeededForLevelUp,
      progress,
      todayXP,
      streakBonus,
      addXP,
      celebration,
      clearCelebration,
      loading,
    ]
  );

  return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
};

export const useXP = () => {
  const context = useContext(XPContext);

  if (!context) {
    throw new Error("useXP must be used within an XPProvider");
  }

  return context;
};
