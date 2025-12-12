import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  XP_PER_TODO,
  XP_PER_HABIT,
  STREAK_LOOKBACK_DAYS,
  MAX_STREAK_BONUS,
} from "@/lib/xp";
import { formatDayKey, getUtcDayStart } from "@/lib/habit-progress";
import { HABIT_STREAK_THRESHOLD } from "@/lib/streak";
import type { XPActivityEntry } from "@/types/xp";

const normalizeGoal = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return 1;
  }
  return value;
};

const formatTodoDetail = (
  dueAt?: Date | string | null,
  location?: string | null
) => {
  if (dueAt) {
    const date = new Date(dueAt);
    if (!Number.isNaN(date.getTime())) {
      return `Due ${date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}`;
    }
  }
  if (location) {
    return location;
  }
  return undefined;
};

const buildActivityLog = (
  todos: Array<{
    id: string;
    title: string;
    updatedAt: Date;
    dueAt: Date | null;
    location: string | null;
  }>,
  habitEntries: Array<{
    id: string;
    date: Date;
    progress: number;
    habit?: {
      name: string | null;
      goalAmount: number | null;
      goalUnit: string | null;
    } | null;
  }>
): XPActivityEntry[] => {
  const todoEntries: XPActivityEntry[] = todos.map((todo) => ({
    id: `todo-${todo.id}-${todo.updatedAt.toISOString()}`,
    source: "todo",
    label: todo.title || "Todo complete",
    xp: XP_PER_TODO,
    timestamp: todo.updatedAt.toISOString(),
    detail: formatTodoDetail(todo.dueAt, todo.location),
  }));

  const habitEntriesFiltered: XPActivityEntry[] = habitEntries
    .filter((entry) => {
      const goal = normalizeGoal(entry.habit?.goalAmount);
      return entry.progress >= goal;
    })
    .map((entry) => {
      const habitName = entry.habit?.name || "Habit";
      const goal = normalizeGoal(entry.habit?.goalAmount);
      const unit = entry.habit?.goalUnit?.trim() || "goal";
      return {
        id: `habit-${entry.id}-${entry.date.toISOString()}`,
        source: "habit",
        label: `${habitName} completed`,
        xp: XP_PER_HABIT,
        timestamp: entry.date.toISOString(),
        detail: `${goal} ${unit}`,
      };
    });

  return [...todoEntries, ...habitEntriesFiltered]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 8);
};

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Missing authenticated session" },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const totalCompleted = await prisma.todo.count({
    where: { userId, status: "COMPLETED" },
  });
  const totalTodosXP = totalCompleted * XP_PER_TODO;

  const todayStart = getUtcDayStart(new Date());
  const todayKey = formatDayKey(todayStart);

  const todayCompleted = await prisma.todo.count({
    where: {
      userId,
      status: "COMPLETED",
      updatedAt: { gte: todayStart },
    },
  });
  const todayTodoXP = todayCompleted * XP_PER_TODO;

  const lookbackStart = getUtcDayStart(new Date(todayStart));
  lookbackStart.setUTCDate(
    lookbackStart.getUTCDate() - (STREAK_LOOKBACK_DAYS - 1)
  );
  const lookbackKey = formatDayKey(lookbackStart);

  const recentCompletions = await prisma.todo.findMany({
    where: {
      userId,
      status: "COMPLETED",
      updatedAt: { gte: lookbackStart },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      updatedAt: true,
      dueAt: true,
      location: true,
    },
  });

  const habitProgressEntries = await prisma.habitDailyProgress.findMany({
    where: {
      habit: {
        userId,
      },
    },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      progress: true,
      habit: {
        select: {
          goalAmount: true,
          name: true,
          goalUnit: true,
        },
      },
    },
  });

  let totalHabitXP = 0;
  let todayHabitXP = 0;
  const habitStreakDays = new Set<string>();

  habitProgressEntries.forEach((entry) => {
    const goalAmount = entry.habit?.goalAmount ?? 1;
    const normalizedGoal = goalAmount > 0 ? goalAmount : 1;
    const ratio =
      normalizedGoal > 0 ? Math.min(1, entry.progress / normalizedGoal) : 0;
    const entryDayKey = formatDayKey(entry.date);
    const isComplete = entry.progress >= normalizedGoal;

    if (isComplete) {
      totalHabitXP += XP_PER_HABIT;
    }

    if (isComplete && entryDayKey === todayKey) {
      todayHabitXP += XP_PER_HABIT;
    }

    if (ratio >= HABIT_STREAK_THRESHOLD && entryDayKey >= lookbackKey) {
      habitStreakDays.add(entryDayKey);
    }
  });

  const completedDays = new Set(
    recentCompletions.map((todo) => formatDayKey(todo.updatedAt))
  );
  habitStreakDays.forEach((day) => completedDays.add(day));

  let streak = 0;
  const streakCursor = new Date(todayStart);

  while (streak < STREAK_LOOKBACK_DAYS) {
    const key = formatDayKey(streakCursor);
    if (!completedDays.has(key)) {
      break;
    }

    streak += 1;
    streakCursor.setUTCDate(streakCursor.getUTCDate() - 1);
  }

  const streakBonus = Math.min(MAX_STREAK_BONUS, streak * 10);
  const activity = buildActivityLog(recentCompletions, habitProgressEntries);

  return NextResponse.json({
    totalXP: totalTodosXP + totalHabitXP,
    todayXP: todayTodoXP + todayHabitXP,
    streakBonus,
    activity,
  });
}
