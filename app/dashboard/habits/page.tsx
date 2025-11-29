export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import HabitsBoard from "./habits-board";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDayKey, ProgressByDayMap } from "@/lib/habit-progress";

export default async function HabitsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const habits = await prisma.habit.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const progressEntries = await prisma.habitDailyProgress.findMany({
    where: {
      habit: {
        userId: session.user.id,
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

  const totalHabits = habits.length;
  const rawProgressByDay: Record<string, number> = {};
  progressEntries.forEach((entry) => {
    const goalAmount = entry.habit.goalAmount ?? 1;
    const normalizedGoal = goalAmount > 0 ? goalAmount : 1;
    const ratio = Math.min(1, entry.progress / normalizedGoal);
    const dayKey = formatDayKey(entry.date);
    rawProgressByDay[dayKey] = (rawProgressByDay[dayKey] ?? 0) + ratio;
  });

  const progressByDay: ProgressByDayMap = {};
  if (totalHabits > 0) {
    Object.entries(rawProgressByDay).forEach(([date, sum]) => {
      progressByDay[date] = Math.min(1, sum / totalHabits);
    });
  }

  return <HabitsBoard habits={habits} progressByDay={progressByDay} />;
}
