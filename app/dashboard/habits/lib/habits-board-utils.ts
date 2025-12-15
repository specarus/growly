"use client";

import { XP_PER_HABIT } from "@/lib/xp";
import { formatDayKey, type ProgressByDayMap } from "@/lib/habit-progress";

import type { Habit } from "../types";

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

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export const calculateDisplayCompletion = (habit: Habit) => {
  const completionValue = clampPercent(habit.completion ?? 0);
  const goal = normalizeGoal(habit.goalAmount);
  const loggedAmount = Math.max(0, habit.dailyProgress ?? 0);
  const additionalCompletion = goal > 0 ? (loggedAmount / goal) * 100 : 0;
  return clampPercent(Math.round(completionValue + additionalCompletion));
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

export const buildRecentProgressSeries = (
  progressByDay: ProgressByDayMap,
  days = 7,
  referenceDate = new Date()
) => {
  const series = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(referenceDate);
    day.setDate(referenceDate.getDate() - offset);
    const key = formatDayKey(day);
    const raw = progressByDay[key] ?? 0;
    const clamped = Math.max(0, Math.min(1, raw));
    series.push({
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      value: Math.round(clamped * 100),
      raw: clamped,
    });
  }
  return series;
};
