export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Flame,
  Focus,
  Gauge,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PageGradient from "@/app/components/ui/page-gradient";
import PageHeading from "@/app/components/page-heading";
import { formatDayKey, getUtcDayStart } from "@/lib/habit-progress";

const ANALYSIS_WINDOW_DAYS = 28;
const STREAK_THRESHOLD = 0.5;

const focusBucketDefinitions = [
  { key: "morning", label: "Morning build (5-9a)", from: 5, to: 9 },
  { key: "deep", label: "Deep work (9a-1p)", from: 9, to: 13 },
  { key: "reset", label: "Reset + move (1-4p)", from: 13, to: 16 },
  { key: "evening", label: "Evening cooldown (4-9p)", from: 16, to: 22 },
] as const;

type FocusBucketKey = (typeof focusBucketDefinitions)[number]["key"];

const parseTimeFraction = (value?: string | null) => {
  if (!value) return null;
  const [hourPart, minutePart] = value.split(":").map(Number);
  if (
    Number.isNaN(hourPart) ||
    Number.isNaN(minutePart) ||
    hourPart < 0 ||
    hourPart > 23 ||
    minutePart < 0 ||
    minutePart > 59
  ) {
    return null;
  }
  return hourPart + minutePart / 60;
};

const getFocusBucketKey = (value?: string | null): FocusBucketKey => {
  const decimal = parseTimeFraction(value);
  if (decimal === null) {
    return "evening";
  }
  for (const bucket of focusBucketDefinitions) {
    if (decimal >= bucket.from && decimal < bucket.to) {
      return bucket.key;
    }
  }
  return "evening";
};

const createFocusTotals = (): Record<FocusBucketKey, number> =>
  focusBucketDefinitions.reduce((acc, bucket) => {
    acc[bucket.key] = 0;
    return acc;
  }, {} as Record<FocusBucketKey, number>);

const createFocusDaySets = (): Record<FocusBucketKey, Set<string>> =>
  focusBucketDefinitions.reduce((acc, bucket) => {
    acc[bucket.key] = new Set<string>();
    return acc;
  }, {} as Record<FocusBucketKey, Set<string>>);

const getHabitTone = (value: number) => {
  if (value >= 0.85) return "bg-green-soft/40 text-foreground";
  if (value >= 0.65) return "bg-blue-100 text-foreground";
  if (value >= 0.45) return "bg-yellow-soft/40 text-foreground";
  return "bg-muted text-foreground";
};

const formatNoteDate = (value: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    value
  );

const getDayKeyFromOffset = (reference: Date, offset: number) => {
  const date = new Date(reference);
  date.setUTCDate(date.getUTCDate() - offset);
  return formatDayKey(date);
};

const formatPercentDelta = (value: number) => {
  const percent = Math.round(value * 100);
  return `${percent >= 0 ? "+" : ""}${percent}% vs prior week`;
};

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC",
});

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const today = getUtcDayStart(new Date());
  const windowStart = new Date(today);
  windowStart.setUTCDate(windowStart.getUTCDate() - (ANALYSIS_WINDOW_DAYS - 1));

  const [habits, progressEntries] = await Promise.all([
    prisma.habit.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        cadence: true,
        timeOfDay: true,
        reminder: true,
        goalAmount: true,
      },
    }),
    prisma.habitDailyProgress.findMany({
      where: {
        date: {
          gte: windowStart,
          lte: today,
        },
        habit: {
          userId: session.user.id,
        },
      },
      include: {
        habit: {
          select: {
            id: true,
            name: true,
            timeOfDay: true,
            goalAmount: true,
          },
        },
      },
    }),
  ]);

  const habitCount = habits.length;
  const rawProgressByDay: Record<string, number> = {};
  const habitProgressMap = new Map<
    string,
    { dayKey: string; ratio: number; date: Date }[]
  >();
  const focusTotals = createFocusTotals();
  const focusDays = createFocusDaySets();

  progressEntries.forEach((entry) => {
    const goalAmount = entry.habit.goalAmount ?? 1;
    const normalizedGoal = goalAmount > 0 ? goalAmount : 1;
    const ratio = Math.min(1, entry.progress / normalizedGoal);
    const dayKey = formatDayKey(entry.date);
    rawProgressByDay[dayKey] = (rawProgressByDay[dayKey] ?? 0) + ratio;

    const existing = habitProgressMap.get(entry.habitId) ?? [];
    existing.push({ dayKey, ratio, date: entry.date });
    habitProgressMap.set(entry.habitId, existing);

    const bucketKey = getFocusBucketKey(entry.habit.timeOfDay);
    focusTotals[bucketKey] += ratio;
    focusDays[bucketKey].add(dayKey);
  });

  const progressByDay: Record<string, number> = {};
  if (habitCount > 0) {
    Object.entries(rawProgressByDay).forEach(([day, sum]) => {
      progressByDay[day] = Math.min(1, sum / habitCount);
    });
  }

  const trackedDays = Object.keys(progressByDay).length;
  const activeDays = Object.values(progressByDay).filter(
    (value) => value > 0
  ).length;

  const getDayKey = (offset: number) => getDayKeyFromOffset(today, offset);

  const weeklyRhythm = [];
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - offset);
    const dayKey = formatDayKey(date);
    weeklyRhythm.push({
      day: weekdayFormatter.format(date),
      completed: progressByDay[dayKey] ?? 0,
    });
  }

  const maxWeeklyCompletion = Math.max(
    0,
    ...weeklyRhythm.map((item) => item.completed)
  );
  const safeMaxWeeklyCompletion = Math.max(1, maxWeeklyCompletion);
  const weeklyProgress = Array.from({ length: 7 }, (_, index) => {
    return progressByDay[getDayKey(index)] ?? 0;
  });
  const weeklyAveragePercent = Math.round(
    (weeklyProgress.reduce((sum, value) => sum + value, 0) /
      Math.max(weeklyProgress.length, 1)) *
      100
  );
  const activeDaysThisWeek = weeklyProgress.filter(
    (value) => value >= STREAK_THRESHOLD
  ).length;
  const recoveryPercent = Math.round(
    ((weeklyProgress.length - activeDaysThisWeek) /
      Math.max(weeklyProgress.length, 1)) *
      100
  );

  const averageForRange = (start: number, end: number) => {
    let sum = 0;
    for (let offset = start; offset <= end; offset++) {
      sum += progressByDay[getDayKey(offset)] ?? 0;
    }
    return sum / (end - start + 1);
  };

  const lastWeekAvg = averageForRange(0, 6);
  const prevWeekAvg = averageForRange(7, 13);
  const momentumDelta = lastWeekAvg - prevWeekAvg;
  const momentumScore = Math.round(lastWeekAvg * 100);
  const completionPercent = Math.round(
    (progressByDay[getDayKey(0)] ?? 0) * 100
  );
  const weeklyTrendLabel =
    momentumDelta > 0.05
      ? "Building momentum"
      : momentumDelta < -0.05
      ? "Pullback week"
      : "Stable climb";
  const prevWeekPercent = Math.round(prevWeekAvg * 100);
  const sevenDayAvgPercent = Math.round(lastWeekAvg * 100);

  let currentStreak = 0;
  for (let offset = 0; offset < ANALYSIS_WINDOW_DAYS; offset++) {
    const key = getDayKey(offset);
    if ((progressByDay[key] ?? 0) >= STREAK_THRESHOLD) {
      currentStreak++;
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let streakTracker = 0;
  for (let offset = ANALYSIS_WINDOW_DAYS - 1; offset >= 0; offset--) {
    const key = getDayKey(offset);
    if ((progressByDay[key] ?? 0) >= STREAK_THRESHOLD) {
      streakTracker++;
      longestStreak = Math.max(longestStreak, streakTracker);
    } else {
      streakTracker = 0;
    }
  }

  const targetActiveDays = Math.max(12, Math.round(ANALYSIS_WINDOW_DAYS * 0.6));
  const activeDelta = activeDays - targetActiveDays;
  const activeChange =
    activeDelta >= 0
      ? `${activeDelta} days above target`
      : `${Math.abs(activeDelta)} days below target`;

  const completionChange = formatPercentDelta(momentumDelta);
  const trackedRange = `${ANALYSIS_WINDOW_DAYS}-day window`;
  const consistencyCoverage = trackedDays
    ? Math.round((activeDays / Math.max(trackedDays, 1)) * 100)
    : 0;

  const focusBlockTotals = Object.values(focusTotals).reduce(
    (sum, value) => sum + value,
    0
  );
  const maxFocusTotal = Math.max(1, ...Object.values(focusTotals));

  const focusBlocks = focusBucketDefinitions.map((bucket) => {
    const total = focusTotals[bucket.key];
    const days = focusDays[bucket.key].size;
    const completion =
      maxFocusTotal > 0 ? Math.round((total / maxFocusTotal) * 100) : 0;
    return {
      key: bucket.key,
      label: bucket.label,
      completion,
      detail: days > 0 ? `${days} logged days` : "No logs yet",
      total,
      days,
    };
  });

  const focusLeader =
    focusBlocks.reduce(
      (prev, block) => (block.total > prev.total ? block : prev),
      focusBlocks[0]
    ) ?? focusBlocks[0];
  const focusCoveragePercent = focusBlockTotals
    ? Math.round((focusLeader.total / focusBlockTotals) * 100)
    : 0;
  const focusSpread = focusBlocks.length
    ? Math.round(
        (focusBlocks.filter((block) => block.days > 0).length /
          focusBlocks.length) *
          100
      )
    : 0;

  const summaryCards = [
    {
      title: "Completion rate",
      value: `${completionPercent}%`,
      helper: "Today's goal coverage",
      change: completionChange,
      icon: CheckCircle2,
      accent: "from-green-soft/80 to-green-500/80",
      backTitle: "Execution signals",
      bullets: [
        `7-day avg ${sevenDayAvgPercent}%`,
        `${habitCount} habits tracked`,
        `${trackedDays} logged days`,
      ],
      badge: "Live",
    },
    {
      title: "Active days",
      value: `${activeDays}`,
      helper: `${ANALYSIS_WINDOW_DAYS} day window`,
      change: activeChange,
      icon: Flame,
      accent: "from-yellow-soft/70 to-amber-400/70",
      backTitle: "Consistency map",
      bullets: [
        `Target ${targetActiveDays}/${ANALYSIS_WINDOW_DAYS}`,
        `${consistencyCoverage}% of tracked days`,
        `${focusSpread}% focus windows covered`,
      ],
      badge: "Cadence",
    },
    {
      title: "Consistent streak",
      value: `${currentStreak}`,
      helper: "Days >=50% coverage",
      change: `Longest ${longestStreak} day run`,
      icon: Timer,
      accent: "from-blue-200 to-blue-500/70",
      backTitle: "Streak dynamics",
      bullets: [
        `Current ${currentStreak}-day streak`,
        `Longest ${longestStreak}-day run`,
        `Threshold >=${Math.round(STREAK_THRESHOLD * 100)}% per day`,
      ],
      badge: "Streaks",
    },
    {
      title: "Momentum score",
      value: `${momentumScore}`,
      helper: "Last 7-day average",
      change: `Prev ${prevWeekPercent}%`,
      icon: Activity,
      accent: "from-primary/80 to-coral/80",
      backTitle: "Week-over-week",
      bullets: [
        formatPercentDelta(momentumDelta),
        `Prev week ${prevWeekPercent}%`,
        `Prime window ${focusLeader.label.split(" (")[0]}`,
      ],
      badge: "Trend",
    },
  ];

  const habitStats = habits.map((habit) => {
    const entries = habitProgressMap.get(habit.id) ?? [];
    const entryMap: Record<string, number> = {};
    entries.forEach((entry) => {
      entryMap[entry.dayKey] = Math.max(
        entryMap[entry.dayKey] ?? 0,
        entry.ratio
      );
    });
    const avgCompletion =
      entries.length > 0
        ? entries.reduce((sum, entry) => sum + entry.ratio, 0) / entries.length
        : 0;
    let lastEntry: Date | null = null;
    entries.forEach((entry) => {
      if (!lastEntry || entry.date > lastEntry) {
        lastEntry = entry.date;
      }
    });
    let streak = 0;
    for (let offset = 0; offset < ANALYSIS_WINDOW_DAYS; offset++) {
      const dayKey = getDayKey(offset);
      if ((entryMap[dayKey] ?? 0) >= STREAK_THRESHOLD) {
        streak++;
      } else {
        break;
      }
    }
    return {
      id: habit.id,
      name: habit.name,
      completion: Math.round(avgCompletion * 100),
      streak,
      tone: getHabitTone(avgCompletion),
      note:
        entries.length > 0
          ? `${entries.length} days logged - Last ${formatNoteDate(
              lastEntry ?? today
            )}`
          : "No logs yet",
    };
  });

  const sortedHabits = [...habitStats].sort(
    (a, b) => b.completion - a.completion
  );
  const topHabits = sortedHabits.slice(0, 4);
  const topHabit = sortedHabits[0];

  const experiments = [
    {
      title: "Consistency pulses",
      outcome: trackedDays
        ? `${activeDays} active days documented`
        : "No logs yet",
      lift: trackedDays
        ? `${consistencyCoverage}% coverage of recorded days`
        : "Log habits to start capturing heat",
    },
    {
      title: `Focus window: ${focusLeader.label.split(" (")[0]}`,
      outcome: focusLeader.total
        ? `${focusCoveragePercent}% of tracked progress flows here`
        : "Start logging to highlight prime windows",
      lift: focusLeader.detail,
    },
    {
      title: topHabit ? `${topHabit.name} momentum` : "Add a streak",
      outcome: topHabit
        ? `${topHabit.completion}% average completion`
        : "Habits appear here once you log progress",
      lift: topHabit
        ? `${topHabit.streak}-day streak`
        : "Log a day to build streak",
    },
  ];

  const headingDescription =
    habitCount > 0
      ? `Live insights from ${habitCount} habits and ${trackedDays} logged days across the last ${trackedRange}.`
      : "Track habits to unlock live analytics for your routines.";

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden xl:pt-24 2xl:pt-28 text-foreground xl:pb-12 2xl:pb-16 bg-linear-to-tl from-white/90 via-light-yellow/55 to-green-soft/15 dark:bg-linear-to-tl dark:from-analytics-dark dark:via-analytics-dark/90 dark:to-black/70 dark:text-white">
      <PageGradient />
      <div className="xl:px-8 2xl:px-28 space-y-8">
        <PageHeading
          badgeLabel="Analytics"
          title="Performance overview"
          titleClassName="xl:text-2xl 2xl:text-3xl"
          description={headingDescription}
          actions={
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 xl:text-xs 2xl:text-sm hover:border-primary/40 transition dark:bg-analytics-dark/70 dark:border-white/10 dark:hover:border-primary/60 dark:text-white"
            >
              Back to dashboard
            </Link>
          }
        />

        <div className="grid gap-5">
          <div className="grid xl:grid-cols-4 xl:gap-3 2xl:gap-4 overflow-x-hidden">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group relative h-full min-h-[200px] perspective-[1600px] bg-transparent py-3 cursor-default"
                  style={{ overflow: "hidden" }}
                >
                  <div className="relative h-full w-full transition-transform duration-700 transform-3d group-hover:transform-[rotateY(180deg)] will-change-transform">
                    <div className="absolute inset-0 flex flex-col rounded-2xl bg-white border border-gray-100 backface-hidden dark:bg-analytics-dark/70 dark:border-white/10 dark:shadow-black/30">
                      <div
                        className={`bg-linear-to-br ${card.accent} px-4 py-3 xl:text-xs 2xl:text-sm font-semibold tracking-[0.08em] uppercase text-foreground/80 flex items-center gap-2 rounded-t-2xl dark:text-white`}
                      >
                        <Icon className="w-4 h-4" />
                        {card.title}
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold text-gray-700 dark:bg-white/20 dark:text-white">
                          {card.badge}
                        </span>
                      </div>
                      <div className="flex flex-col h-full justify-between px-6 py-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="xl:text-5xl 2xl:text-6xl font-bold">
                            {card.value}
                          </span>
                          <span className="xl:text-[10px] 2xl:text-[11px] text-green-700 bg-green-soft/50 rounded-full px-3 py-1 font-semibold border border-green-soft/70 dark:text-white dark:bg-green-soft/30 dark:border-green-soft/50">
                            {card.change}
                          </span>
                        </div>
                        <p className="xl:text-xs 2xl:text-sm text-muted-foreground dark:text-white/80">
                          {card.helper}
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex flex-col px-6 py-4 pb-8 rounded-2xl bg-white text-foreground border border-gray-100 transform-[rotateY(180deg)] backface-hidden dark:bg-analytics-dark dark:text-white dark:shadow-[0_10px_30px_rgba(0,0,0,0.14)] dark:border-white/10">
                      <div className="pb-1 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-white/70">
                          {card.backTitle}
                        </div>
                        <span className="xl:text-[10px] 2xl:text-[11px] font-semibold bg-gray-100 border border-gray-200 text-gray-700 rounded-full px-2 py-1 dark:bg-white/10 dark:border-white/10 dark:text-white">
                          Flip insight
                        </span>
                      </div>
                      <div className="space-y-2 flex flex-col h-full justify-between">
                        <p className="xl:text-base 2xl:text-lg font-semibold text-gray-900 dark:text-white">
                          {card.title}
                        </p>
                        <ul className="space-y-1 xl:text-xs 2xl:text-sm text-gray-700 dark:text-white/75">
                          {card.bullets.map((line) => (
                            <li key={line} className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-coral" />
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-analytics-dark/70 dark:shadow-black/20">
              <div className="px-6 pt-5 pb-6 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                      Weekly flow
                    </p>
                    <h2 className="xl:text-lg 2xl:text-xl font-semibold">
                      Habit momentum
                    </h2>
                    <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                      Focused bars of how much progress you logged each day.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground dark:bg-white/5 dark:text-white/70">
                    <TrendingUp className="w-4 h-4" />
                    {weeklyTrendLabel}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="flex items-end gap-3 h-40 px-2 border-b border-dashed border-muted/80 pb-4 dark:border-white/10">
                      {weeklyRhythm.map((item) => (
                        <div
                          key={item.day}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div
                            className="w-full rounded-xl bg-linear-to-b from-primary/80 to-coral/80 shadow-inner"
                            style={{
                              height: `${
                                safeMaxWeeklyCompletion
                                  ? (item.completed / safeMaxWeeklyCompletion) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                          <div className="text-[11px] text-muted-foreground">
                            {item.day}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 dark:text-white/60">
                      <span>
                        Peak day{" "}
                        {Math.round(
                          maxWeeklyCompletion > 0 ? maxWeeklyCompletion * 100 : 0
                        )}
                        % coverage
                      </span>
                      <span>Goal: 100% per day</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-muted/60 bg-muted/40 p-4 space-y-3 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Gauge className="w-4 h-4 text-primary" />
                      Recovery vs output
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Recovery</span>
                          <span>{recoveryPercent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white overflow-hidden dark:bg-white/10">
                          <div
                            className="h-full bg-green-soft/80 dark:bg-green-soft/60"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, recoveryPercent)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Output</span>
                          <span>{weeklyAveragePercent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white overflow-hidden dark:bg-white/10">
                          <div
                            className="h-full bg-primary/80 dark:bg-primary/70"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, weeklyAveragePercent)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="rounded-xl border border-dashed border-primary/40 bg-white/60 px-3 py-2 text-xs flex items-start gap-2 dark:bg-white/5 dark:border-white/10">
                        <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                        {activeDaysThisWeek > 0
                          ? `${activeDaysThisWeek}/7 days hit the streak threshold this week. Keep logging to lift output.`
                          : "Log a few days to chart how recovery and output balance."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-analytics-dark/70 dark:shadow-black/20">
              <div className="px-6 pt-5 pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Focus
                    </p>
                    <h2 className="text-xl font-semibold">
                      Where time converts
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground dark:bg-white/5 dark:text-white/70">
                    <Focus className="w-4 h-4" />
                    Prime windows
                  </div>
                </div>

                <div className="space-y-3">
                  {focusBlocks.map((block) => (
                    <div key={block.key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>{block.label}</span>
                        <span className="text-muted-foreground">
                          {block.detail}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-primary to-coral"
                          style={{ width: `${block.completion}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {block.completion}% of the leading window
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-analytics-dark/70 dark:shadow-black/20">
              <div className="px-6 pt-5 pb-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Top movers
                    </p>
                    <h2 className="text-xl font-semibold">Habit leaderboard</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground dark:bg-white/5 dark:text-white/70">
                    <BarChart3 className="w-4 h-4" />
                    Dynamic signal
                  </div>
                </div>

                <div className="space-y-3">
                  {topHabits.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Add and log habits to see them climb the leaderboard.
                    </p>
                  ) : (
                    topHabits.map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between rounded-2xl border border-gray-100 bg-muted/50 px-4 py-3 gap-3 dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl grid place-items-center bg-white shadow-inner border border-gray-100 dark:bg-analytics-dark/80 dark:border-white/10 dark:shadow-black/30">
                            <Flame className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{habit.name}</p>
                            <p className="text-sm text-muted-foreground dark:text-white/70">
                              {habit.note}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-semibold">
                              {habit.completion}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {habit.streak}-day streak
                            </p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-[11px] font-semibold ${habit.tone}`}
                          >
                            Ahead
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-analytics-dark/70 dark:shadow-black/20">
              <div className="px-6 pt-5 pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Experiments
                    </p>
                    <h2 className="text-xl font-semibold">
                      What moved the needle
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                    <ArrowUpRight className="w-4 h-4" />
                    Data log
                  </div>
                </div>

                <div className="space-y-3">
                  {experiments.map((experiment, index) => (
                    <div
                      key={experiment.title}
                      className="rounded-2xl border border-dashed border-gray-200 bg-muted/40 px-4 py-3 space-y-1 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                          <Sparkles className="w-4 h-4" />
                          Experiment {index + 1}
                        </div>
                        <span className="text-[11px] font-semibold text-green-700 bg-green-soft/30 rounded-full px-2 py-1 dark:text-white dark:bg-green-soft/30">
                          {experiment.lift}
                        </span>
                      </div>
                      <p className="font-semibold">{experiment.title}</p>
                      <p className="text-sm text-muted-foreground dark:text-white/70">
                        {experiment.outcome}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-primary/40 bg-light-yellow/50 px-5 py-5 flex flex-col md:flex-row items-center justify-between gap-3 dark:bg-analytics-dark/60 dark:border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white grid place-items-center shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Ready for live analytics</p>
                <p className="text-sm text-muted-foreground dark:text-white/70">
                  {habitCount
                    ? `You are tracking ${habitCount} habits with ${trackedDays} logged days. Keep logging for deeper insights.`
                    : "Add habits to start streaming live signals here."}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/todos"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm hover:brightness-105 transition"
            >
              <BarChart3 className="w-4 h-4" />
              Back to workboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
