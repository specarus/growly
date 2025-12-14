"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "./session-context";

import { MAX_STREAK_BONUS } from "@/lib/xp";
import { computeLevelState } from "@/lib/xp-level";
import type { XPActivityEntry, XPActivitySource } from "@/types/xp";

const MAX_ACTIVITY_LOG = 8;

type XPActivityMetadata = {
  label?: string;
  detail?: string;
};

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
  addXP: (
    amount: number,
    source?: XPActivitySource,
    metadata?: XPActivityMetadata
  ) => void;
  refreshXP: () => Promise<void>;
  activityLog: XPActivityEntry[];
  loading: boolean;
  celebration: CelebrationEvent | null;
  clearCelebration: () => void;
  markNotificationsRead: (ids: string[]) => Promise<void>;
}

const XPContext = createContext<XPContextValue | undefined>(undefined);

interface XPProviderProps {
  children: React.ReactNode;
}

type CelebrationEvent =
  | { type: CelebrationSource; xp: number }
  | { type: "level"; xp: number; level: number };

type CelebrationSource = "todo" | "habit";

export const XPProvider: React.FC<XPProviderProps> = ({ children }) => {
  const { session } = useSession();
  const [totalXP, setTotalXP] = useState<number | null>(null);
  const [todayXP, setTodayXP] = useState<number | null>(null);
  const [streakBonus, setStreakBonus] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<CelebrationEvent | null>(
    null
  );
  const [activityLog, setActivityLog] = useState<XPActivityEntry[]>([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!session?.user?.id) {
      setTotalXP(null);
      setTodayXP(null);
      setStreakBonus(null);
      setCelebration(null);
      setActivityLog([]);
      return;
    }

    const controller = new AbortController();

    const loadXP = async () => {
      try {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        const response = await fetch("/api/xp", {
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load XP");
        }

        const data = await response.json();
        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return;
        }
        setTotalXP(data.totalXP ?? 0);
        setTodayXP(data.todayXP ?? 0);
        setStreakBonus(data.streakBonus ?? 0);
        setActivityLog(data.activity ?? []);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("[XPProvider] load XP", error);
      }
    };

    setTotalXP(null);
    setTodayXP(null);
    setStreakBonus(null);
    setActivityLog([]);

    loadXP();

    return () => controller.abort();
  }, [session?.user?.id]);

  const logActivityEntry = useCallback((entry: XPActivityEntry) => {
    setActivityLog((prev) => {
      const next = [entry, ...prev];
      if (next.length > MAX_ACTIVITY_LOG) {
        next.length = MAX_ACTIVITY_LOG;
      }
      return next;
    });
  }, []);

  const xpTotalValue = totalXP ?? 0;
  const { level, xpGainedInLevel, xpNeededForLevelUp } = useMemo(
    () => computeLevelState(xpTotalValue),
    [xpTotalValue]
  );

  const progress = Math.min(
    100,
    Math.floor((xpGainedInLevel / xpNeededForLevelUp) * 100)
  );

  const addXP = useCallback(
    (
      amount: number,
      source: XPActivitySource = "todo",
      metadata: XPActivityMetadata = {}
    ) => {
      if (amount === 0) return;

      const timestamp = new Date().toISOString();
      const defaultLabel =
        metadata.label ??
        (source === "habit"
          ? "Habit milestone"
          : source === "level"
            ? "Level progress"
            : "Todo complete");
      const buildId = (prefix: string) =>
        `${prefix}-${timestamp}-${Math.random().toString(36).slice(2)}`;

      logActivityEntry({
        id: buildId(source),
        source,
        label: defaultLabel,
        xp: amount,
        timestamp,
        detail: metadata.detail,
      });

      setTotalXP((prev) => {
        const previousTotal = prev ?? 0;
        const nextTotal = Math.max(0, previousTotal + amount);
        const prevLevel = computeLevelState(previousTotal).level;
        const nextLevel = computeLevelState(nextTotal).level;
        if (amount > 0) {
          if (nextLevel > prevLevel) {
            logActivityEntry({
              id: buildId("level"),
              source: "level",
              label: `Level ${nextLevel} unlocked`,
              xp: amount,
              timestamp,
              detail: `Total XP ${nextTotal}`,
            });
            setCelebration({ type: "level", xp: amount, level: nextLevel });
          } else {
            const celebrationSource: CelebrationSource =
              source === "habit" ? "habit" : "todo";
            setCelebration({ type: celebrationSource, xp: amount });
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
    },
    [logActivityEntry]
  );

  const refreshXP = useCallback(async () => {
    if (!session?.user?.id) {
      return;
    }

    try {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      const response = await fetch("/api/xp", {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load XP");
      }

      const data = await response.json();
      if (requestId !== requestIdRef.current) {
        return;
      }

      setTotalXP(data.totalXP ?? 0);
      setTodayXP(data.todayXP ?? 0);
      setStreakBonus(data.streakBonus ?? 0);
      setActivityLog(data.activity ?? []);
    } catch (error) {
      console.error("[XPProvider] refresh XP", error);
    }
  }, [session?.user?.id]);

  const clearCelebration = useCallback(() => setCelebration(null), []);

  const markNotificationsRead = useCallback(
    async (ids: string[]) => {
      if (!session?.user?.id) return;

      const uniqueIds = Array.from(
        new Set(ids.filter((id) => typeof id === "string" && id.length > 0))
      );

      if (uniqueIds.length === 0) return;

      setActivityLog((prev) =>
        prev.filter((entry) => !uniqueIds.includes(entry.id))
      );

      try {
        await fetch("/api/notifications/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: uniqueIds }),
        });
      } catch (error) {
        console.error("[XPProvider] mark notifications read", error);
        void refreshXP();
      }
    },
    [session?.user?.id, refreshXP]
  );

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
      activityLog,
      addXP,
      refreshXP,
      celebration,
      clearCelebration,
      markNotificationsRead,
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
      activityLog,
      addXP,
      refreshXP,
      celebration,
      clearCelebration,
      markNotificationsRead,
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
