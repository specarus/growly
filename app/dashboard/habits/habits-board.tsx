
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

import { safetyNets } from "./playbooks";

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

const iconMap = {
  ShieldCheck,
  LifeBuoy,
  CalendarClock,
};

const HabitsBoard: React.FC<Props> = ({ habits }) => {
  const searchParams = useSearchParams();
  const [selectedHabitId, setSelectedHabitId] = useState<string>(habits[0]?.id || "");

  const selectedPlaybook = useMemo(() => {
    const net = (selectedHabitId && safetyNets[selectedHabitId]) || safetyNets.default;
    const labels: PlaybookItem["label"][] = ["Prevent", "Rescue", "Review"];
    const metas = ["Before start", "If you slip", "Weekly reset"];
    const icons: PlaybookItem["icon"][] = ["ShieldCheck", "LifeBuoy", "CalendarClock"];
    const accents = ["text-green-700 bg-green-soft/25", "text-coral bg-coral/10", "text-primary bg-primary/10"];

    return net.map((detail, index) => ({
      title: detail,
      detail,
      label: labels[index % labels.length],
      meta: metas[index % metas.length],
      icon: icons[index % icons.length],
      accent: accents[index % accents.length],
    }));
  }, [selectedHabitId]);

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
    <main className="w-full min-h-screen xl:pt-20 2xl:pt-24 text-foreground pb-10">
      <div className="xl:px-8 2xl:px-28 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <BadgeCheck className="w-4 h-4" />
              <span>Your habits</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold">Habit board</h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Hardcoded board that shows your current rhythm, streaks, and where you spend focus time. Swap in live data when ready.
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-2 sm:gap-3">
            <Link
              href="/dashboard/habits/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm hover:brightness-105 transition"
            >
              <Plus className="w-4 h-4" />
              New habit
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden text-sm">
            <Link
              href="/dashboard/habits"
              className="px-4 py-2 font-semibold bg-primary text-white"
              aria-current="page"
            >
              Habits
            </Link>
            <Link
              href="/dashboard/habits/routines"
              className="px-4 py-2 font-semibold hover:text-primary transition"
            >
              Routines
            </Link>
            <Link
              href="/dashboard/habits/popular"
              className="px-4 py-2 font-semibold hover:text-primary transition"
            >
              Popular
            </Link>
          </div>
          <span className="text-xs text-muted-foreground">
            Select a habit to see its streak-saving playbook.
          </span>
        </div>

        <div className="grid gap-5">
          <div className="grid xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="px-6 pt-5 pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Active habits
                    </p>
                    <h2 className="text-xl font-semibold">Manual list with sample stats</h2>
                    <p className="text-sm text-muted-foreground">
                      Replace this table with your real habit store and detail links.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/habits/create"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:brightness-105 transition"
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
                  {habits.map((habit) => {
                    const isSelected = habit.id === selectedHabitId;
                    const streakValue = habit.streak ?? 0;
                    const completionValue = habit.completion ?? 0;
                    const focusLabel =
                      habit.description?.trim() ||
                      `${habit.goalAmount} ${habit.goalUnit ?? "count"} per ${habit.cadence.toLowerCase()}`;
                    return (
                      <button
                        key={habit.id}
                        onClick={() => setSelectedHabitId(habit.id)}
                        className={`grid w-full text-left grid-cols-5 px-4 py-3 items-center text-sm bg-white/60 hover:bg-primary/5 transition ${
                          isSelected ? "ring-2 ring-primary/30" : ""
                        }`}
                      >
                          <div className="col-span-2 space-y-1">
                            <div className="font-semibold text-foreground">{habit.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-primary" />
                              {focusLabel}
                            </div>
                          </div>
                          <div className="text-muted-foreground">{habit.cadence}</div>
                          <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{streakValue}d</span>
                          </div>
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-linear-to-r from-primary to-coral"
                                style={{ width: `${completionValue}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{completionValue}%</span>
                          </div>
                        </button>
                      );
                    })}
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
                    <h2 className="text-xl font-semibold">Protect the streaks</h2>
                    <p className="text-sm text-muted-foreground">
                      Guardrails, rescues, and weekly reviews tailored to the selected habit.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                      <Target className="w-4 h-4" />
                      Routines
                    </div>
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
                  {(selectedPlaybook || []).map((item, index) => {
                    const Icon = iconMap[item.icon];
                    return (
                      <div
                        key={`${item.title}-${index}`}
                        className="rounded-2xl border border-gray-100 bg-white px-4 py-3 space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${item.accent}`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">Move {index + 1}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-muted text-primary">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
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

          <div className="rounded-3xl border border-dashed border-primary/40 bg-light-yellow/50 px-5 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white grid place-items-center shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Wire this board to your habit data</p>
                <p className="text-sm text-muted-foreground">
                  Replace the hardcoded arrays with live queries and add detail pages.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/habits/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm hover:brightness-105 transition"
            >
              <Flame className="w-4 h-4" />
              Add another habit
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HabitsBoard;
