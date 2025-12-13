export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import Dashboard from "./dashboard-page";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { AnalyticsWidgetData } from "./components/analytics-widget";
import {
  buildHabitAnalytics,
  HABIT_ANALYTICS_LOOKBACK_DAYS,
} from "@/lib/habit-analytics";
import {
  formatDayKey,
  getUtcDayStart,
} from "@/lib/habit-progress";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const [userRecord, habits, progressEntries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { privateAccount: true },
    }),
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
  ]);

  const { habitsWithStats, progressByDay } = buildHabitAnalytics(
    habits,
    progressEntries,
    HABIT_ANALYTICS_LOOKBACK_DAYS
  );

  const privateAccount = userRecord?.privateAccount ?? false;
  let analyticsData: AnalyticsWidgetData | null = null;

  if (!privateAccount) {
    const completionRate =
      habitsWithStats.length > 0
        ? Math.round(
            habitsWithStats.reduce(
              (sum, habit) => sum + habit.successRate,
              0
            ) / habitsWithStats.length
          )
        : 0;

    const today = getUtcDayStart(new Date());
    const averageProgressForRange = (startOffset: number, days: number) => {
      if (days <= 0) return 0;
      let total = 0;
      for (
        let offset = startOffset;
        offset < startOffset + days;
        offset += 1
      ) {
        const day = getUtcDayStart(new Date(today));
        day.setUTCDate(day.getUTCDate() - offset);
        const key = formatDayKey(day);
        total += progressByDay[key] ?? 0;
      }
      return (total / days) * 100;
    };

    const recentWindowAverage = averageProgressForRange(0, 7);
    const previousWindowAverage = averageProgressForRange(7, 7);
    const positiveDelta =
      previousWindowAverage > 0
        ? Math.round(
            ((recentWindowAverage - previousWindowAverage) /
              previousWindowAverage) *
              100
          )
        : Math.round(recentWindowAverage);

    const favoriteHabits = [...habitsWithStats]
      .sort(
        (a, b) =>
          b.successRate - a.successRate ||
          b.averageCompletion - a.averageCompletion
      )
      .slice(0, 8)
      .map((habit) => ({
        id: habit.id,
        name: habit.name,
        percentage: habit.successRate,
      }));

    const habitGoalMap = new Map<string, number>();
    habits.forEach((habit) => {
      const goal = habit.goalAmount ?? 1;
      habitGoalMap.set(habit.id, goal > 0 ? goal : 1);
    });

    const completionByDay: Record<string, Record<string, number>> = {};
    progressEntries.forEach((entry) => {
      const goal = habitGoalMap.get(entry.habitId) ?? 1;
      const ratio = Math.min(1, entry.progress / goal);
      const dayKey = formatDayKey(entry.date);
      completionByDay[dayKey] ??= {};
      completionByDay[dayKey][entry.habitId] = Math.max(
        completionByDay[dayKey][entry.habitId] ?? 0,
        ratio
      );
    });

    const recentDays = Array.from({ length: 5 }, (_, index) => {
      const day = getUtcDayStart(new Date(today));
      day.setUTCDate(day.getUTCDate() - (4 - index));
      const key = formatDayKey(day);
      return {
        key,
        label: day.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
        }),
        completion: Math.round((progressByDay[key] ?? 0) * 100),
        habits: favoriteHabits.map((habit) => ({
          ...habit,
          percentage: Math.round(
            (completionByDay[key]?.[habit.id] ?? 0) * 100
          ),
        })),
      };
    });

    analyticsData = {
      completionRate,
      positiveDelta,
      favoriteHabits,
      recentDays,
      currentYear: today.getUTCFullYear(),
    };
  }

  return (
    <Dashboard
      progressByDay={progressByDay}
      analyticsData={analyticsData}
      privateAccount={privateAccount}
    />
  );
}
