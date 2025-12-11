"use client";

import { XP_PER_HABIT } from "@/lib/xp";

import {
  RESCUE_MAX_EVENTS,
  RESCUE_MIN_SAMPLES,
  RESCUE_STORAGE_KEY,
} from "../constants";
import type { Habit, RescueWindow } from "../types";

export const getFocusLabel = (habit: Habit) => {
  const description = habit.description?.trim();
  if (description) {
    return description;
  }

  const amount = habit.goalAmount ?? 0;
  const unit = habit.goalUnit ?? "count";
  const cadence = habit.cadence?.toLowerCase() ?? "";

  return `${amount} ${unit} per ${cadence}`;
};

export const normalizeGoal = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return 1;
  }
  return value;
};

export const calculateHabitXpDelta = (
  previousProgress: number,
  nextProgress: number,
  goalAmount?: number | null
) => {
  const goal = normalizeGoal(goalAmount);
  const wasComplete = previousProgress >= goal;
  const isComplete = nextProgress >= goal;

  if (!wasComplete && isComplete) return XP_PER_HABIT;
  if (wasComplete && !isComplete) return -XP_PER_HABIT;
  return 0;
};

const formatHourPart = (hour: number, includeSuffix: boolean) => {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized >= 12 ? "pm" : "am";
  const value = normalized % 12 === 0 ? 12 : normalized % 12;
  return includeSuffix ? `${value}${suffix}` : `${value}`;
};

export const formatRescueWindowLabel = (startHour: number, endHour: number) => {
  const start = Math.max(0, Math.min(23, Math.floor(startHour)));
  const end = Math.max(1, Math.min(24, Math.ceil(endHour)));
  const sameHalf = start >= 12 === end >= 12;
  const startLabel = formatHourPart(start, !sameHalf);
  const endLabel = formatHourPart(end === 24 ? 0 : end, true);
  return `${startLabel}-${endLabel}`;
};

export const computeRescueWindow = (
  timestamps: number[],
  targetDay: number
): RescueWindow | null => {
  if (!Array.isArray(timestamps) || timestamps.length < RESCUE_MIN_SAMPLES) {
    return null;
  }

  const entries = timestamps
    .map((value) => {
      const date = new Date(value);
      return {
        hour: date.getHours(),
        dayOfWeek: date.getDay(),
      };
    })
    .filter(
      (entry) =>
        Number.isFinite(entry.hour) &&
        entry.dayOfWeek >= 0 &&
        entry.dayOfWeek <= 6
    );

  if (entries.length < RESCUE_MIN_SAMPLES) {
    return null;
  }

  const sameDay = entries.filter((entry) => entry.dayOfWeek === targetDay);
  const pool = (sameDay.length >= RESCUE_MIN_SAMPLES ? sameDay : entries).map(
    (entry) => entry.hour
  );

  if (pool.length < RESCUE_MIN_SAMPLES) {
    return null;
  }

  const sorted = [...pool].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const startHour = Math.max(0, Math.floor(median - 1));
  const endHour = Math.min(24, Math.ceil(median + 1));
  const sampleSize = pool.length;
  const confidence =
    sampleSize >= 8 ? "high" : sampleSize >= 4 ? "medium" : "low";

  return {
    startHour,
    endHour,
    label: formatRescueWindowLabel(startHour, endHour),
    sampleSize,
    confidence,
  };
};

export const readRescueEvents = (): Record<string, number[]> => {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(RESCUE_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, number[]>;
    }
  } catch (error) {
    console.error("Unable to read rescue timing cache", error);
  }
  return {};
};

export const persistRescueEvents = (events: Record<string, number[]>) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(RESCUE_STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error("Unable to write rescue timing cache", error);
  }
};

export const appendRescueEvent = (
  habitId: string,
  timestamp: number
): { events: Record<string, number[]>; window: RescueWindow | null } => {
  const stored = readRescueEvents();
  const updatedList = [...(stored[habitId] ?? []), timestamp].slice(
    -RESCUE_MAX_EVENTS
  );
  const nextEvents = {
    ...stored,
    [habitId]: updatedList,
  };
  persistRescueEvents(nextEvents);
  const today = new Date().getDay();
  const windowData = computeRescueWindow(updatedList, today);
  return { events: nextEvents, window: windowData };
};

export const isWithinRescueWindow = (
  rescueWindow: RescueWindow,
  referenceTime?: number
) => {
  const now = referenceTime ? new Date(referenceTime) : new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  return (
    currentHour >= rescueWindow.startHour && currentHour < rescueWindow.endHour
  );
};

export const computeRescueAmount = (habit: Habit) => {
  const goal = normalizeGoal(habit.goalAmount);
  const logged = habit.dailyProgress ?? 0;
  const remaining = Math.max(goal - logged, 0.1);
  const suggested = Math.min(Math.max(goal * 0.25, 0.25), remaining);
  const rounded =
    suggested < 1 ? Math.round(suggested * 10) / 10 : Math.round(suggested);
  return rounded > 0 ? rounded : remaining;
};
