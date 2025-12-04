export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { TodoStatus } from "@prisma/client";

import AnalyticsClient from "./analytics-client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildHabitAnalytics,
  HABIT_ANALYTICS_LOOKBACK_DAYS,
} from "@/lib/habit-analytics";
import { formatDayKey, getUtcDayStart } from "@/lib/habit-progress";

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { streakGoalDays: true },
  });
  const streakGoalDays = userRecord?.streakGoalDays ?? null;

  const [habits, progressEntries, routines] = await Promise.all([
    prisma.habit.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.habitDailyProgress.findMany({
      where: {
        habit: {
          userId: session.user.id,
        },
      },
      select: {
        habitId: true,
        date: true,
        progress: true,
      },
    }),
    prisma.routine.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      include: {
        habits: {
          include: { habit: true },
          orderBy: { position: "asc" },
        },
      },
    }),
  ]);

  const { habitsWithStats, progressByDay, weekdayPerformance, lookbackDays } =
    buildHabitAnalytics(habits, progressEntries, HABIT_ANALYTICS_LOOKBACK_DAYS);

  const todoGroups = await prisma.todo.groupBy({
    by: ["status"],
    where: { userId: session.user.id },
    _count: true,
  });

  const todoStatusCounts: Record<TodoStatus, number> = {
    PLANNED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    MISSED: 0,
  };

  todoGroups.forEach((group) => {
    const status = group.status as TodoStatus;
    todoStatusCounts[status] = group._count;
  });

  const today = getUtcDayStart(new Date());
  const trend = [];
  for (let offset = lookbackDays - 1; offset >= 0; offset -= 1) {
    const day = getUtcDayStart(new Date(today));
    day.setUTCDate(day.getUTCDate() - offset);
    const key = formatDayKey(day);
    trend.push({
      label: key.slice(5),
      value: Math.round((progressByDay[key] ?? 0) * 100),
    });
  }

  const totalHabits = habitsWithStats.length;
  const averageStreak =
    totalHabits > 0
      ? Math.round(
          habitsWithStats.reduce((sum, habit) => sum + habit.streak, 0) /
            totalHabits
        )
      : 0;
  const averageCompletion =
    totalHabits > 0
      ? Math.round(
          habitsWithStats.reduce(
            (sum, habit) => sum + habit.averageCompletion,
            0
          ) / totalHabits
        )
      : 0;
  const averageSuccessRate =
    totalHabits > 0
      ? Math.round(
          habitsWithStats.reduce((sum, habit) => sum + habit.successRate, 0) /
            totalHabits
        )
      : 0;

  const topStreak = habitsWithStats.reduce<{
    name: string;
    streak: number;
  } | null>((leader, habit) => {
    if (!leader || habit.streak > leader.streak) {
      return { name: habit.name, streak: habit.streak };
    }
    return leader;
  }, null);

  const lookbackLabel =
    lookbackDays === 1
      ? "Last day"
      : `Last ${lookbackDays.toLocaleString()} days`;
  const bestStreak = topStreak?.streak ?? 0;
  const streakGoalProgress =
    streakGoalDays && streakGoalDays > 0
      ? Math.min(100, Math.round((bestStreak / streakGoalDays) * 100))
      : 0;
  const streakGoalGap =
    streakGoalDays && streakGoalDays > 0
      ? Math.max(0, streakGoalDays - bestStreak)
      : null;

  const habitsPayload = habitsWithStats.map((habit) => ({
    id: habit.id,
    name: habit.name,
    streak: habit.streak,
    successRate: habit.successRate,
    averageCompletion: habit.averageCompletion,
    cadence: habit.cadence,
    goal: `${habit.goalAmount} ${habit.goalUnit}`,
    description: habit.description,
  }));

  const habitStatsById = new Map(
    habitsWithStats.map((habit) => [habit.id, habit])
  );

  const routinePerformance = routines
    .map((routine) => {
      const routineHabits = routine.habits
        .map((entry) => habitStatsById.get(entry.habitId))
        .filter(Boolean);

      const completion =
        routineHabits.length > 0
          ? Math.round(
              routineHabits.reduce(
                (sum, habit) => sum + (habit?.averageCompletion ?? 0),
                0
              ) / routineHabits.length
            )
          : 0;

      return {
        id: routine.id,
        name: routine.name,
        anchor: routine.anchor,
        habitCount: routineHabits.length,
        completion,
      };
    })
    .filter((routine) => routine.habitCount > 0);

  return (
    <AnalyticsClient
      summary={{
        totalHabits,
        averageStreak,
        averageCompletion,
        averageSuccessRate,
        topStreak: topStreak ?? undefined,
        lookbackLabel,
        streakGoalDays: streakGoalDays ?? undefined,
        streakGoalProgress,
        streakGoalGap,
        bestStreak,
      }}
      trend={trend}
      weekdayPerformance={weekdayPerformance}
      habits={habitsPayload}
      todoStatusCounts={todoStatusCounts}
      routinePerformance={routinePerformance}
    />
  );
}
