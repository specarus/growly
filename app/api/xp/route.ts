import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  XP_PER_TODO,
  STREAK_LOOKBACK_DAYS,
  MAX_STREAK_BONUS,
} from "@/lib/xp";

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

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const todayCompleted = await prisma.todo.count({
    where: {
      userId,
      status: "COMPLETED",
      updatedAt: { gte: startOfToday },
    },
  });

  const lookbackStart = new Date(startOfToday);
  lookbackStart.setDate(lookbackStart.getDate() - (STREAK_LOOKBACK_DAYS - 1));

  const recentCompletions = await prisma.todo.findMany({
    where: {
      userId,
      status: "COMPLETED",
      updatedAt: { gte: lookbackStart },
    },
    select: { updatedAt: true },
  });

  const completedDays = new Set(
    recentCompletions.map((todo) => todo.updatedAt.toISOString().slice(0, 10))
  );

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
    totalXP: totalCompleted * XP_PER_TODO,
    todayXP: todayCompleted * XP_PER_TODO,
    streakBonus,
  });
}
