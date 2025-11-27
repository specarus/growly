"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarClock,
  Flame,
  LifeBuoy,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import type { Habit as PrismaHabit } from "@/lib/generated/prisma/client";
import PageGradient from "@/app/components/ui/page-gradient";

type Habit = PrismaHabit & {
  streak?: number;
  completion?: number;
};

type PlaybookItem = {
  title: string;
  detail: string;
  label: "Prevent" | "Rescue" | "Review";
  meta: string;
  icon: "ShieldCheck" | "LifeBuoy" | "CalendarClock";
  accent: string;
};

type Props = {
  habits: Habit[];
};

const streakDefensePlaybook: PlaybookItem[] = [
  {
    title: "Anchor a reliable cue",
    detail:
      "Pair the habit with a fixed trigger so you start automatically and avoid the drift that breaks streaks.",
    label: "Prevent",
    meta: "Before start",
    icon: "ShieldCheck",
    accent: "text-green-soft bg-green-soft/20",
  },
  {
    title: "Rescue with the smallest win",
    detail:
      "If you miss a session, do a short reset or partial rep to keep the streak intact and rebuild momentum.",
    label: "Rescue",
    meta: "If you slip",
    icon: "LifeBuoy",
    accent: "text-coral bg-coral/20",
  },
  {
    title: "Review and adjust weekly",
    detail:
      "Reflect on what worked, tweak anchors, and plan the next week with realistic cues so streaks stay protected.",
    label: "Review",
    meta: "Weekly reset",
    icon: "CalendarClock",
    accent: "text-primary bg-primary/20",
  },
];

const iconMap = {
  ShieldCheck,
  LifeBuoy,
  CalendarClock,
};

const HabitsBoard: React.FC<Props> = ({ habits }) => {
  const searchParams = useSearchParams();
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    habits[0]?.id || ""
  );

  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === selectedHabitId),
    [habits, selectedHabitId]
  );

  useEffect(() => {
    const param = searchParams.get("habitId");
    if (param && habits.some((habit) => habit.id === param)) {
      setSelectedHabitId(param);
    }
  }, [habits, searchParams]);

  return (
    <main className="relative overflow-hidden w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground xl:pb-12 2xl:pb-16 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <PageGradient />
      <div className="xl:px-8 2xl:px-28 space-y-8">
        <div className="flex gap-4 flex-row items-center justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <BadgeCheck className="w-4 h-4" />
              <span>Your habits</span>
            </div>
            <div className="space-y-1">
              <h1 className="xl:text-2xl 2xl:text-3xl font-bold">
                Habit board
              </h1>
              <p className="xl:text-xs 2xl:text-sm text-muted-foreground max-w-2xl">
                This board shows your current rhythm, streaks, and where you
                spend focus time.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="inline-flex xl:gap-1 p-2 items-center rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden text-sm">
            <span
              className="px-4 py-2 font-semibold bg-primary text-white rounded-full cursor-pointer"
              aria-current="page"
            >
              Habits
            </span>
            <Link
              href="/dashboard/habits/routines"
              className="px-4 py-2 font-semibold hover:text-primary transition rounded-full"
            >
              Routines
            </Link>
            <Link
              href="/dashboard/habits/popular"
              className="px-4 py-2 font-semibold hover:text-primary transition rounded-full"
            >
              Popular
            </Link>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="grid xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="px-6 pt-5 pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="xl:text-[11px] 2xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Active habits
                    </p>
                    <h2 className="xl:text-lg 2xl:text-xl font-semibold">
                      Habits and Statistics
                    </h2>
                  </div>
                  <Link
                    href="/dashboard/habits/create"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white xl:text-xs 2xl:text-sm font-semibold hover:brightness-105 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Create habit
                  </Link>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-muted/50 overflow-hidden">
                  <div className="grid grid-cols-5 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                    <span className="col-span-2">Habit</span>
                    <span>Cadence</span>
                    <span>Streak</span>
                    <span className="text-right">Completion</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {habits.length === 0 ? (
                      <div className="px-4 py-10 text-center text-sm text-muted-foreground space-y-4">
                        <p className="font-semibold text-foreground">
                          No habits yet
                        </p>
                        <p>
                          Start tracking a rhythm and this board will show your
                          streaks, completion, and cadence.
                        </p>
                        <Link
                          href="/dashboard/habits/create"
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold text-primary hover:border-primary hover:bg-primary/5 transition"
                        >
                          <Plus className="w-3 h-3" />
                          Create your first habit
                        </Link>
                      </div>
                    ) : (
                      habits.map((habit) => {
                        const isSelected = habit.id === selectedHabitId;
                        const streakValue = habit.streak ?? 0;
                        const completionValue = habit.completion ?? 0;
                        const focusLabel =
                          habit.description?.trim() ||
                          `${habit.goalAmount} {
                            habit.goalUnit ?? "count"
                          } per ${habit.cadence.toLowerCase()}`;
                        return (
                          <button
                            key={habit.id}
                            onClick={() => setSelectedHabitId(habit.id)}
                            className={`grid w-full text-left grid-cols-5 px-4 py-3 items-center text-sm bg-white/60 hover:bg-primary/5 transition ${
                              isSelected ? "ring-2 ring-primary/30" : ""
                            }`}
                          >
                            <div className="col-span-2 space-y-1">
                              <div className="font-semibold text-foreground">
                                {habit.name}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-primary" />
                                {focusLabel}
                              </div>
                            </div>
                            <div className="text-muted-foreground">
                              {habit.cadence}
                            </div>
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-primary" />
                              <span className="font-semibold">
                                {streakValue}d
                              </span>
                            </div>
                            <div className="flex items-center justify-end gap-3">
                              <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-linear-to-r from-primary to-coral"
                                  style={{ width: `${completionValue}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold">
                                {completionValue}%
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="px-6 pt-5 pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Playbook
                    </p>
                    <h2 className="text-xl font-semibold">
                      Protect the streaks
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Guardrails, rescues, and weekly reviews that protect every
                      streak.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedHabit ? (
                      <Link
                        href={`/dashboard/habits/${selectedHabit.id}/edit`}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition"
                      >
                        Edit {selectedHabit.name}
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-3">
                  {streakDefensePlaybook.map((item, index) => {
                    const Icon = iconMap[item.icon];
                    return (
                      <div
                        key={`${item.title}-${index}`}
                        className="rounded-2xl border border-gray-100 bg-white px-4 py-3 space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.12em] ${item.accent}`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="space-y-1">
                            <p className="font-semibold">{item.title}</p>
                            <p className="xl:text-xs 2xl:text-sm text-muted-foreground leading-relaxed">
                              {item.detail}
                            </p>
                            <div className="inline-flex items-center gap-2 text-xs font-semibold rounded-full bg-muted px-3 py-1 text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {item.meta}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
