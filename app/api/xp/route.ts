import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  XP_PER_TODO,
  XP_PER_HABIT,
  STREAK_LOOKBACK_DAYS,
  MAX_STREAK_BONUS,
} from "@/lib/xp";

const toDayKey = (value: Date) => value.toISOString().slice(0, 10);

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

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const todayKey = toDayKey(startOfToday);

  const todayCompleted = await prisma.todo.count({
    where: {
      userId,
      status: "COMPLETED",
      updatedAt: { gte: startOfToday },
    },
  });
  const todayTodoXP = todayCompleted * XP_PER_TODO;

  const lookbackStart = new Date(startOfToday);
  lookbackStart.setDate(lookbackStart.getDate() - (STREAK_LOOKBACK_DAYS - 1));
  const lookbackKey = toDayKey(lookbackStart);

  const recentCompletions = await prisma.todo.findMany({
    where: {
      userId,
      status: "COMPLETED",
      updatedAt: { gte: lookbackStart },
    },
    select: { updatedAt: true },
  });

  const habitProgressEntries = await prisma.habitDailyProgress.findMany({
    where: {
      habit: {
        userId,
      },
    },
    select: {
      date: true,
      progress: true,
      habit: {
        select: {
          goalAmount: true,
        },
      },
    },
  });

  let totalHabitXP = 0;
  let todayHabitXP = 0;
  const habitCompletionDays = new Set<string>();

  habitProgressEntries.forEach((entry) => {
    const goalAmount = entry.habit.goalAmount ?? 1;
    const normalizedGoal = goalAmount > 0 ? goalAmount : 1;
    const isComplete = entry.progress >= normalizedGoal;
    const entryDayKey = toDayKey(entry.date);

    if (isComplete) {
      totalHabitXP += XP_PER_HABIT;
    }

    if (isComplete && entryDayKey === todayKey) {
      todayHabitXP += XP_PER_HABIT;
    }

    if (isComplete && entryDayKey >= lookbackKey) {
      habitCompletionDays.add(entryDayKey);
    }
  });

  const completedDays = new Set(
    recentCompletions.map((todo) => todo.updatedAt.toISOString().slice(0, 10))
  );
  habitCompletionDays.forEach((day) => completedDays.add(day));

  let streak = 0;
  const streakCursor = new Date(startOfToday);

  while (streak < STREAK_LOOKBACK_DAYS) {
    const key = streakCursor.toISOString().slice(0, 10);
    if (!completedDays.has(key)) {
      break;
    }

    streak += 1;
    streakCursor.setDate(streakCursor.getDate() - 1);
  }

  const streakBonus = Math.min(MAX_STREAK_BONUS, streak * 10);

  return NextResponse.json({
    totalXP: totalTodosXP + totalHabitXP,
    todayXP: todayTodoXP + todayHabitXP,
    streakBonus,
  });
}
