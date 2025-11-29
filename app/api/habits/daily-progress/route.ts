import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/habit-actions";
import { formatDayKey } from "@/lib/habit-progress";

const parseDateParam = (value: string | null | undefined, fallback: Date) => {
  if (!value) {
    return fallback;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }
  return parsed;
};

const getErrorStatus = (message: string) => {
  if (message === "Unauthorized") return 401;
  if (message.includes("Habit")) return 400;
  return 500;
};

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const url = new URL(request.url);
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");
    const now = new Date();
    const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

    const from = parseDateParam(fromParam, defaultFrom);
    const to = parseDateParam(toParam, defaultTo);

    const progressEntries = await prisma.habitDailyProgress.findMany({
      where: {
        date: {
          gte: from,
          lte: to,
        },
        habit: {
          userId,
        },
      },
      include: {
        habit: {
          select: {
            goalAmount: true,
          },
        },
      },
    });

    const habitCount = await prisma.habit.count({
      where: {
        userId,
      },
    });

    const rawProgressByDay: Record<string, number> = {};
    progressEntries.forEach((entry) => {
      const goalAmount = entry.habit.goalAmount ?? 1;
      const normalizedGoal = goalAmount > 0 ? goalAmount : 1;
      const ratio = Math.min(1, entry.progress / normalizedGoal);
      const key = formatDayKey(entry.date);
      rawProgressByDay[key] = (rawProgressByDay[key] ?? 0) + ratio;
    });

    const progressByDay: Record<string, number> = {};
    if (habitCount > 0) {
      Object.entries(rawProgressByDay).forEach(([date, sum]) => {
        progressByDay[date] = Math.min(1, sum / habitCount);
      });
    }

    return NextResponse.json({ progressByDay });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    if (error instanceof Error) {
      const status = getErrorStatus(error.message);
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "Unable to load habit progress. Try again later." },
      { status: 500 }
    );
  }
}
