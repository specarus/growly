import type { Habit } from "@prisma/client";

import { HABIT_STREAK_THRESHOLD } from "./streak";
import {
  formatDayKey,
  getUtcDayStart,
  type ProgressByDayMap,
} from "./habit-progress";

export const HABIT_ANALYTICS_LOOKBACK_DAYS = 21;

type HabitProgressEntry = {
  habitId: string;
  date: Date;
  progress: number;
};

export type HabitWithStats = Habit & {
  streak: number;
  averageCompletion: number;
  successRate: number;
};

type HabitAnalyticsResult = {
  habitsWithStats: HabitWithStats[];
  progressByDay: ProgressByDayMap;
  weekdayPerformance: { label: string; value: number }[];
  lookbackDays: number;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const buildHabitAnalytics = (
  habits: Habit[],
  progressEntries: HabitProgressEntry[],
  lookbackDays = HABIT_ANALYTICS_LOOKBACK_DAYS
): HabitAnalyticsResult => {
  const habitGoalMap = new Map<string, number>();
  const habitStartDateMap = new Map<string, Date>();
  const habitStartDates: Date[] = [];
  const today = getUtcDayStart(new Date());
  const todayKey = formatDayKey(today);
  const todayProgressByHabit = new Map<string, number>();

  habits.forEach((habit) => {
    habitGoalMap.set(habit.id, habit.goalAmount ?? 1);
    const startDate = getUtcDayStart(new Date(habit.startDate));
    habitStartDateMap.set(habit.id, startDate);
    habitStartDates.push(startDate);
  });

  const completionByHabit = new Map<string, Map<string, number>>();
  const rawProgressByDay: Record<string, number> = {};
  const weekdayTotals = Array<number>(7).fill(0);
  const weekdayCounts = Array<number>(7).fill(0);

  progressEntries.forEach((entry) => {
    const goalAmount = habitGoalMap.get(entry.habitId) ?? 1;
    const normalizedGoal = goalAmount > 0 ? goalAmount : 1;
    const ratio = Math.min(1, entry.progress / normalizedGoal);
    const dayKey = formatDayKey(entry.date);
    if (dayKey === todayKey) {
      todayProgressByHabit.set(entry.habitId, entry.progress);
    }

    let habitCompletion = completionByHabit.get(entry.habitId);
    if (!habitCompletion) {
      habitCompletion = new Map<string, number>();
      completionByHabit.set(entry.habitId, habitCompletion);
    }
    habitCompletion.set(dayKey, ratio);

    rawProgressByDay[dayKey] = (rawProgressByDay[dayKey] ?? 0) + ratio;

    const weekdayIndex = getUtcDayStart(entry.date).getUTCDay();
    weekdayTotals[weekdayIndex] += ratio;
    weekdayCounts[weekdayIndex] += 1;
  });

  const totalHabits = habits.length;
  const progressByDay: ProgressByDayMap = {};
  if (totalHabits > 0) {
    Object.entries(rawProgressByDay).forEach(([date, sum]) => {
      const day = getUtcDayStart(new Date(date));
      const activeHabitsForDay = habitStartDates.filter(
        (start) => !Number.isNaN(start.getTime()) && start <= day
      ).length;
      const divisor = activeHabitsForDay > 0 ? activeHabitsForDay : totalHabits;
      progressByDay[date] = Math.min(1, sum / divisor);
    });
  }

  const habitsWithStats: HabitWithStats[] = habits.map((habit) => {
    const completionMap = completionByHabit.get(habit.id);
    const habitStart = habitStartDateMap.get(habit.id) ?? today;
    const todaysProgress = todayProgressByHabit.get(habit.id) ?? 0;

    let streak = 0;
    const streakCursor = getUtcDayStart(new Date(today));
    while (streakCursor >= habitStart) {
      const key = formatDayKey(streakCursor);
      const ratio = completionMap?.get(key) ?? 0;
      if (ratio < HABIT_STREAK_THRESHOLD) {
        break;
      }
      streak += 1;
      streakCursor.setUTCDate(streakCursor.getUTCDate() - 1);
    }

    let totalCompletion = 0;
    let successfulDays = 0;
    let countedDays = 0;

    for (let offset = 0; offset < lookbackDays; offset += 1) {
      const day = getUtcDayStart(new Date(today));
      day.setUTCDate(day.getUTCDate() - offset);

      if (day < habitStart) {
        break;
      }

      countedDays += 1;
      const key = formatDayKey(day);
      const ratio = completionMap?.get(key) ?? 0;
      totalCompletion += ratio;
      if (ratio >= 1) {
        successfulDays += 1;
      }
    }

    const averageCompletion =
      countedDays > 0
        ? Math.round((totalCompletion / countedDays) * 100)
        : 0;
    const successRate =
      countedDays > 0 ? Math.round((successfulDays / countedDays) * 100) : 0;

    return {
      ...habit,
      dailyProgress: todaysProgress,
      streak,
      averageCompletion,
      successRate,
    };
  });

  const weekdayPerformance = weekdayLabels.map((label, index) => {
    const total = weekdayTotals[index];
    const count = weekdayCounts[index];
    const value = count > 0 ? Math.min(1, total / count) : 0;
    return {
      label,
      value,
    };
  });

  return {
    habitsWithStats,
    progressByDay,
    weekdayPerformance,
    lookbackDays,
  };
};
