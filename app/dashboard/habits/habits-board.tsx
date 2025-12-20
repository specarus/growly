"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Plus, Search, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import PageGradient from "@/app/components/ui/page-gradient";
import PageHeading from "@/app/components/page-heading";
import { useXP } from "@/app/context/xp-context";
import HabitsCalendar from "./components/habits-calendar";
import HabitsTabs from "./components/habits-tabs";
import HabitsWeekCalendar from "./components/habits-week-calendar";
import HabitPlaybook from "./components/habit-playbook";
import HabitReflections from "./components/habit-reflections";
import HabitRow from "./components/habit-row";
import { useQuantityMenu } from "./hooks/use-quantity-menu";
import {
  fetchMonthlyProgress,
  patchHabitProgress,
  resetHabitProgress,
} from "./actions/habit-progress";
import {
  calculateHabitXpDelta,
  calculateDisplayCompletion,
  getFocusLabel,
  normalizeGoal,
  buildRecentProgressSeries,
} from "./lib/habits-board-utils";
import { calculateHabitRisk } from "./lib/habit-risk";
import { streakDefensePlaybook } from "./constants";
import type { Habit, HabitsBoardProps } from "./types";
import { formatDayKey, type ProgressByDayMap } from "@/lib/habit-progress";

const HabitsBoard: React.FC<HabitsBoardProps> = ({
  habits,
  progressByDay,
  reflections,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addXP, refreshXP, todayXP } = useXP();
  const [localHabits, setLocalHabits] = useState(habits);
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    habits[0]?.id || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [customQuantities, setCustomQuantities] = useState<
    Record<string, string>
  >({});
  const [progressMap, setProgressMap] =
    useState<ProgressByDayMap>(progressByDay);
  const [clockTick, setClockTick] = useState<number>(() => Date.now());

  const {
    openId: quantityMenuOpenId,
    menuPosition,
    menuWidth,
    toggleMenu,
    closeMenu,
    registerAnchor,
    registerMenu,
  } = useQuantityMenu();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const timer = window.setInterval(() => setClockTick(Date.now()), 60000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const refreshTodayProgress = useCallback((updatedHabits: Habit[]) => {
    if (updatedHabits.length === 0) {
      return;
    }
    const todayKey = formatDayKey(new Date());
    const sum = updatedHabits.reduce((acc, habit) => {
      const logged = habit.dailyProgress ?? 0;
      const goal = habit.goalAmount ?? 1;
      const normalizedGoal = goal > 0 ? goal : 1;
      return acc + Math.min(1, logged / normalizedGoal);
    }, 0);
    setProgressMap((prev) => ({
      ...prev,
      [todayKey]: Math.min(1, sum / updatedHabits.length),
    }));
  }, []);

  const reloadProgressMap = useCallback(async () => {
    try {
      const next = await fetchMonthlyProgress();
      setProgressMap(next);
    } catch (error) {
      console.error("Unable to reload progress map", error);
    }
  }, []);

  const awardXpDelta = useCallback(
    (
      habit: Habit | undefined,
      previousProgress: number,
      nextProgress: number
    ) => {
      const xpDelta = habit
        ? calculateHabitXpDelta(
            previousProgress,
            nextProgress,
            habit.goalAmount
          )
        : 0;
      if (xpDelta !== 0) {
        const goalAmount = normalizeGoal(habit?.goalAmount);
        const unit = habit?.goalUnit?.trim() || "goal";
        addXP(xpDelta, "habit", {
          label: habit?.name ?? "Habit progress",
          detail: `${goalAmount} ${unit}`,
        });
      }
      return xpDelta;
    },
    [addXP]
  );

  const handleAddQuantity = useCallback(
    async (habitId: string, amount: number) => {
      if (!Number.isFinite(amount) || amount <= 0) {
        return;
      }
      closeMenu();
      const targetHabit = localHabits.find((habit) => habit.id === habitId);
      const previousProgress = targetHabit?.dailyProgress ?? 0;
      setCustomQuantities((prev) => ({
        ...prev,
        [habitId]: "",
      }));

      setLocalHabits((prev) => {
        const next = prev.map((habit) =>
          habit.id === habitId
            ? {
                ...habit,
                dailyProgress: (habit.dailyProgress ?? 0) + amount,
              }
            : habit
        );
        refreshTodayProgress(next);
        return next;
      });

      try {
        const data = await patchHabitProgress(habitId, amount);

        if (typeof data.dailyProgress === "number") {
          const xpDelta = awardXpDelta(
            targetHabit,
            previousProgress,
            data.dailyProgress
          );

          setLocalHabits((prev) => {
            const next = prev.map((habit) =>
              habit.id === habitId
                ? { ...habit, dailyProgress: data.dailyProgress ?? 0 }
                : habit
            );
            refreshTodayProgress(next);
            return next;
          });
          void reloadProgressMap();
          void router.refresh();
          if (xpDelta !== 0) {
            void refreshXP();
          }
        }
      } catch (error) {
        console.error("Unable to persist habit progress", error);
      }
    },
    [
      awardXpDelta,
      closeMenu,
      localHabits,
      refreshTodayProgress,
      reloadProgressMap,
      refreshXP,
    ]
  );

  const handleReset = useCallback(
    async (habitId: string) => {
      closeMenu();
      const targetHabit = localHabits.find((habit) => habit.id === habitId);
      const previousProgress = targetHabit?.dailyProgress ?? 0;
      try {
        const data = await resetHabitProgress(habitId);

        const nextProgress =
          typeof data.dailyProgress === "number" ? data.dailyProgress : 0;

        const xpDelta = awardXpDelta(
          targetHabit,
          previousProgress,
          nextProgress
        );

        setLocalHabits((prev) => {
          const next = prev.map((habit) =>
            habit.id === habitId
              ? { ...habit, dailyProgress: nextProgress }
              : habit
          );
          refreshTodayProgress(next);
          return next;
        });
        void reloadProgressMap();
        void router.refresh();
        if (xpDelta !== 0) {
          void refreshXP();
        }
      } catch (error) {
        console.error("Unable to reset habit progress", error);
      }
    },
    [
      awardXpDelta,
      closeMenu,
      localHabits,
      refreshTodayProgress,
      reloadProgressMap,
      refreshXP,
    ]
  );

  useEffect(() => {
    setLocalHabits(habits);
  }, [habits]);

  useEffect(() => {
    setProgressMap(progressByDay);
  }, [progressByDay]);

  useEffect(() => {
    const param = searchParams.get("habitId");
    if (param && localHabits.some((habit) => habit.id === param)) {
      setSelectedHabitId(param);
    }
  }, [localHabits, searchParams]);

  const todayKey = useMemo(
    () => formatDayKey(new Date(clockTick)),
    [clockTick]
  );

  const todayCompletionPercent = useMemo(() => {
    const raw = progressMap[todayKey] ?? 0;
    const clamped = Math.max(0, Math.min(1, raw));
    return Math.round(clamped * 100);
  }, [progressMap, todayKey]);

  const completedTodayCount = useMemo(() => {
    if (localHabits.length === 0) return 0;
    return localHabits.filter(
      (habit) => calculateDisplayCompletion(habit) >= 100
    ).length;
  }, [localHabits]);

  const recentProgressSeries = useMemo(
    () => buildRecentProgressSeries(progressMap, 7, new Date(clockTick)),
    [progressMap, clockTick]
  );

  const recentProgressAverage = useMemo(() => {
    if (recentProgressSeries.length === 0) return 0;
    const sum = recentProgressSeries.reduce(
      (acc, point) => acc + point.value,
      0
    );
    return Math.round(sum / recentProgressSeries.length);
  }, [recentProgressSeries]);

  const recentProgressPeak = useMemo(
    () =>
      recentProgressSeries.reduce(
        (peak, point) => Math.max(peak, point.value),
        0
      ),
    [recentProgressSeries]
  );

  const sparklinePath = useMemo(() => {
    const width = 220;
    const height = 72;
    if (recentProgressSeries.length === 0) {
      return { line: "", area: "", width, height };
    }
    const points = recentProgressSeries.map((point, index) => {
      const x =
        recentProgressSeries.length === 1
          ? width / 2
          : (index / (recentProgressSeries.length - 1)) * width;
      const y = height - (point.value / 100) * height;
      return { x, y };
    });
    const line = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
    const area = `${line} L ${width} ${height} L 0 ${height} Z`;
    return { line, area, width, height };
  }, [recentProgressSeries]);

  const hasProgressData = recentProgressSeries.length > 0;

  const filteredHabits = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return localHabits;
    }

    return localHabits.filter((habit) => {
      const focusLabel = getFocusLabel(habit).toLowerCase();
      return (
        habit.name.toLowerCase().includes(query) || focusLabel.includes(query)
      );
    });
  }, [localHabits, searchTerm]);

  return (
    <main className="relative overflow-hidden w-full min-h-screen lg:pt-18 xl:pt-24 2xl:pt-28 text-foreground lg:pb-8 xl:pb-12 2xl:pb-16 bg-linear-to-br from-white/90 via-light-yellow/55 to-green-soft/15">
      <PageGradient />
      <div className="lg:px-4 xl:px-8 2xl:px-28 lg:space-y-6 xl:space-y-8">
        <PageHeading
          badgeLabel="Your habits"
          title="Habit board"
          description="This board shows your current rhythm, streaks, and where you spend focus time."
          titleClassName="font-bold"
        />
        <div>
          <HabitsTabs active="habits" containerClassName="lg:gap-1 2xl:gap-2" />
        </div>

        <div className="grid lg:gap-4 xl:gap-5">
          <div className="grid lg:grid-cols-3 lg:gap-4 xl:gap-5">
            <div className="lg:col-span-2 h-full">
              <div className="lg:px-4 xl:px-6 lg:pt-3 xl:pt-5 lg:pb-4 xl:pb-6 lg:space-y-3 xl:space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="lg:text-[11px] xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Active habits
                    </p>
                    <h2 className="lg:text-sm xl:text-base 2xl:text-lg font-semibold">
                      Habits and Statistics
                    </h2>
                  </div>
                  <Link
                    href="/dashboard/habits/create"
                    className="inline-flex items-center gap-2 lg:px-3 xl:px-4 lg:py-1 xl:py-2 rounded-full bg-primary text-white lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold transition hover:brightness-105 shadow-[0_5px_10px_rgba(240,144,41,0.35)] hover:shadow-none"
                  >
                    <Plus className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                    Create habit
                  </Link>
                </div>

                <div>
                  <label htmlFor="habit-search" className="sr-only">
                    Search habits
                  </label>
                  <div className="flex items-center lg:gap-1.5 xl:gap-2 rounded-2xl border border-gray-100 bg-white/80 lg:px-2 xl:px-3 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs text-muted-foreground shadow-sm">
                    <Search className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-muted-foreground" />
                    <input
                      id="habit-search"
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search habits or goals"
                      className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-muted/50">
                  <div className="grid grid-cols-6 lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[11px] xl:text-xs font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                    <span className="col-span-2">Habit</span>
                    <span>Cadence</span>
                    <span>Streak</span>
                    <span className="col-span-2">Completion</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {localHabits.length === 0 ? (
                      <div className="lg:px-3 xl:px-4 lg:py-8 xl:py-10 text-center lg:text-xs xl:text-sm 2xl:text-base text-muted-foreground space-y-4">
                        <p className="font-semibold text-foreground">
                          No habits yet
                        </p>
                        <p className="lg:text-[11px] xl:text-xs 2xl:text-sm">
                          Start tracking a rhythm and this board will show your
                          streaks, completion, and cadence.
                        </p>
                        <Link
                          href="/dashboard/habits/create"
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold text-primary hover:border-primary hover:bg-primary/5 transition"
                        >
                          <Plus className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                          Create your first habit
                        </Link>
                      </div>
                    ) : filteredHabits.length === 0 ? (
                      <div className="lg:px-3 xl:px-4 lg:py-8 xl:py-10 text-center lg:text-xs xl:text-sm 2xl:text-base text-muted-foreground space-y-4">
                        <p className="font-semibold text-foreground">
                          No habits match your search
                        </p>
                        <p className="lg:text-[11px] xl:text-xs 2xl:text-sm">
                          Try another keyword or clear the search to view
                          everything.
                        </p>
                      </div>
                    ) : (
                      filteredHabits.map((habit) => {
                        const isSelected = habit.id === selectedHabitId;
                        const streakValue = habit.streak ?? 0;
                        const focusLabel = getFocusLabel(habit);
                        const loggedAmount = habit.dailyProgress ?? 0;
                        const goalAmountValue = normalizeGoal(habit.goalAmount);
                        const displayCompletion =
                          calculateDisplayCompletion(habit);
                        const risk = calculateHabitRisk({
                          streak: habit.streak,
                          completion: displayCompletion,
                          successRate: habit.completion,
                          goalAmount: goalAmountValue,
                          loggedAmount,
                        });
                        const isComplete = displayCompletion >= 100;
                        const loggedLabel =
                          loggedAmount > 0
                            ? `+${loggedAmount}${
                                habit.goalUnit ? ` ${habit.goalUnit}` : ""
                              } logged`
                            : "Tap + to log progress";
                        return (
                          <HabitRow
                            key={habit.id}
                            habit={habit}
                            focusLabel={focusLabel}
                            streakValue={streakValue}
                            displayCompletion={displayCompletion}
                            isSelected={isSelected}
                            loggedLabel={loggedLabel}
                            isComplete={isComplete}
                            customQuantity={customQuantities[habit.id] ?? ""}
                            quantityMenuOpenId={quantityMenuOpenId}
                            menuPosition={menuPosition}
                            menuWidth={menuWidth}
                            registerAnchor={registerAnchor}
                            registerMenu={registerMenu}
                            risk={risk}
                            onHover={setSelectedHabitId}
                            onNavigate={(id) =>
                              router.push(`/dashboard/habits/${id}/edit`)
                            }
                            onToggleMenu={(id, anchor) => {
                              setSelectedHabitId(id);
                              toggleMenu(id, anchor);
                            }}
                            onCustomQuantityChange={(id, value) =>
                              setCustomQuantities((prev) => ({
                                ...prev,
                                [id]: value,
                              }))
                            }
                            onAddQuantity={handleAddQuantity}
                            onReset={handleReset}
                          />
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="relative overflow-hidden lg:mt-6 xl:mt-8 2xl:mt-10 border rounded-2xl border-gray-100 shadow-inner min-h-[220px] lg:min-h-[260px]">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[url('/path.jpg')] bg-cover bg-no-repeat bg-center bg-white"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-black/35 via-black/20 to-black/15" />
                  <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between lg:px-4 xl:px-6 2xl:px-8 lg:py-4 xl:py-6 gap-4">
                    <div className="space-y-2 text-white">
                      <p className="lg:text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                        Wayfinding
                      </p>
                      <h3 className="lg:text-lg xl:text-xl 2xl:text-2xl font-semibold leading-tight">
                        Follow the right path — it leads to the destination you
                        want.
                      </h3>
                      <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-white/80 max-w-2xl">
                        Keep logging the small steps. Today&apos;s reps shape
                        tomorrow&apos;s wins, and your streak keeps you on
                        course.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:mt-6 xl:mt-8 2xl:mt-10">
                  <HabitsWeekCalendar
                    habits={localHabits}
                    progressByDay={progressMap}
                  />
                </div>
              </div>
            </div>

            <div className="h-fit flex flex-col lg:gap-4 xl:gap-6">
              <div className="lg:max-w-5xl xl:max-w-6xl">
                <div className="lg:space-y-3 xl:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="lg:text-[11px] xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        Snapshot
                      </p>
                      <div className="flex items-center gap-2">
                        <h2 className="lg:text-sm xl:text-base 2xl:text-lg font-semibold">
                          Today&apos;s momentum
                        </h2>
                      </div>
                      <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
                        Quick view of daily completion, streak protection, and
                        XP gained.
                      </p>
                    </div>
                    <div className="w-28 text-right">
                      <p className="lg:text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Avg today
                      </p>
                      <p className="lg:text-lg xl:text-xl 2xl:text-2xl font-bold text-primary">
                        {todayCompletionPercent}%
                      </p>
                      <p className="lg:text-[9px] xl:text-[11px] text-muted-foreground">
                        7d avg {recentProgressAverage}%
                      </p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-3 xl:gap-4">
                    <div className="rounded-xl border border-gray-100 bg-white/80 shadow-inner lg:p-3 xl:p-4">
                      <p className="lg:text-[10px] xl:text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
                        Completion
                      </p>
                      <p className="lg:text-lg xl:text-xl font-bold text-foreground">
                        {todayCompletionPercent}%
                      </p>
                      <p className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
                        Average across all habits today
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white/80 shadow-inner lg:p-3 xl:p-4">
                      <p className="lg:text-[10px] xl:text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
                        Streaks
                      </p>
                      <p className="lg:text-lg xl:text-xl font-bold text-foreground">
                        {completedTodayCount}/{localHabits.length || 0}
                      </p>
                      <p className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
                        Habits hit 100% today
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white/80 shadow-inner lg:p-3 xl:p-4">
                      <p className="lg:text-[10px] xl:text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
                        XP gained
                      </p>
                      <p className="lg:text-lg xl:text-xl font-bold text-foreground">
                        {Math.max(0, todayXP ?? 0)} XP
                      </p>
                      <p className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
                        From today&apos;s habit actions
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-inner lg:p-3 xl:p-4">
                    <div className="flex items-center justify-between lg:mb-2 xl:mb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-primary" />
                        <div>
                          <p className="lg:text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                            7-day flow
                          </p>
                          <p className="lg:text-[9px] xl:text-[11px] text-muted-foreground">
                            See how daily completion has trended this week.
                          </p>
                        </div>
                      </div>
                      <div className="w-40 text-right lg:text-[9px] xl:text-[10px] text-muted-foreground font-semibold">
                        {hasProgressData
                          ? `High ${recentProgressPeak}% / Avg ${recentProgressAverage}%`
                          : "Waiting for this week's first logs"}
                      </div>
                    </div>
                    {!hasProgressData ? (
                      <p className="lg:text-[11px] xl:text-xs text-muted-foreground">
                        Log a habit to see your momentum curve.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <svg
                          viewBox={`0 0 ${sparklinePath.width} ${sparklinePath.height}`}
                          className="w-full h-24"
                          role="img"
                          aria-label="Seven day completion trend"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient
                              id="today-snapshot-fill"
                              x1="0"
                              x2="0"
                              y1="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="rgba(240,144,41,0.3)"
                              />
                              <stop
                                offset="100%"
                                stopColor="rgba(31,133,77,0.05)"
                              />
                            </linearGradient>
                          </defs>
                          <path
                            d={sparklinePath.area}
                            fill="url(#today-snapshot-fill)"
                            stroke="none"
                          />
                          <path
                            d={sparklinePath.line}
                            fill="none"
                            stroke="rgb(240,144,41)"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="grid grid-cols-7 lg:text-[9px] xl:text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.14em]">
                          {recentProgressSeries.map((point, index) => (
                            <span
                              key={`${point.label}-${index}`}
                              className="text-center"
                            >
                              {point.label.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <HabitPlaybook items={streakDefensePlaybook} />
              <HabitReflections initialReflections={reflections} />
              <div className="lg:max-w-5xl xl:max-w-6xl shadow-inner lg:rounded-2xl xl:rounded-3xl border border-gray-100 bg-white bg-linear-330 from-green-soft/30 via-primary/50 to-white">
                <div className="lg:p-4 xl:p-5 2xl:p-6 lg:space-y-3 xl:space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="lg:text-[11px] xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        Calendar
                      </p>
                      <h2 className="lg:text-sm xl:text-base 2xl:text-lg font-semibold">
                        Habit rhythm
                      </h2>
                      <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
                        Daily completion percentages help you spot where
                        momentum is building.
                      </p>
                    </div>
                  </div>
                  <HabitsCalendar progressByDay={progressMap} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HabitsBoard;
