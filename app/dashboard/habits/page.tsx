export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  Flame,
  HeartPulse,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { auth } from "@/lib/auth";

export default async function HabitsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const snapshot = [
    {
      title: "Completion rate",
      value: "78%",
      helper: "62 of 80 logs this week",
      trend: "+5.4%",
      icon: CheckCircle2,
      accent: "from-green-soft/70 to-green-500/70",
    },
    {
      title: "Longest streak",
      value: "18 days",
      helper: "Lights out by 11:00p",
      trend: "+3 days",
      icon: Flame,
      accent: "from-yellow-soft/60 to-amber-400/80",
    },
    {
      title: "Active habits",
      value: "9",
      helper: "3 on deck · 2 paused",
      trend: "Balanced",
      icon: HeartPulse,
      accent: "from-blue-200 to-blue-500/70",
    },
    {
      title: "Momentum score",
      value: "72",
      helper: "Tracked daily · trending up",
      trend: "+7 pts",
      icon: TrendingUp,
      accent: "from-primary/80 to-coral/80",
    },
  ];

  const habits = [
    { name: "Morning mobility", cadence: "Daily", streak: 14, completion: 92, focus: "7:00a" },
    { name: "Hydrate 3L", cadence: "Daily", streak: 9, completion: 85, focus: "All day" },
    { name: "Strength training", cadence: "Weekly · 3x", streak: 5, completion: 74, focus: "Mon/Wed/Fri" },
    { name: "Reading (20m)", cadence: "Daily", streak: 12, completion: 79, focus: "9:30p" },
    { name: "Walk after lunch", cadence: "Weekly · 5x", streak: 7, completion: 68, focus: "1:00p" },
    { name: "Low screen mornings", cadence: "Daily", streak: 4, completion: 61, focus: "6:00a-8:00a" },
  ];

  const playbook = [
    {
      title: "Habit stack",
      detail: "Hydrate → stretch → 10 push-ups before phone unlocked.",
    },
    {
      title: "If/then rescue",
      detail: "If schedule slips, trade strength for 20m walk within 2h.",
    },
    {
      title: "Friday review",
      detail: "Tag misses with a quick note and reset caps for next week.",
    },
  ];

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

        <div className="grid gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {snapshot.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden"
                >
                  <div
                    className={`bg-linear-to-br ${card.accent} px-4 py-3 text-xs font-semibold tracking-[0.08em] uppercase text-foreground/80 flex items-center gap-2`}
                  >
                    <Icon className="w-4 h-4" />
                    {card.title}
                  </div>
                  <div className="px-4 py-4 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold">{card.value}</span>
                      <span className="text-xs text-green-700 bg-green-soft/30 rounded-full px-3 py-1 font-semibold">
                        {card.trend}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{card.helper}</p>
                  </div>
                </div>
              );
            })}
          </div>

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
                    {habits.map((habit) => (
                      <div
                        key={habit.name}
                        className="grid grid-cols-5 px-4 py-3 items-center text-sm bg-white/60"
                      >
                        <div className="col-span-2 space-y-1">
                          <div className="font-semibold text-foreground">{habit.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-primary" />
                            {habit.focus}
                          </div>
                        </div>
                        <div className="text-muted-foreground">{habit.cadence}</div>
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{habit.streak}d</span>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-primary to-coral"
                              style={{ width: `${habit.completion}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{habit.completion}%</span>
                        </div>
                      </div>
                    ))}
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
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                    <Target className="w-4 h-4" />
                    Routines
                  </div>
                </div>

                <div className="space-y-3">
                  {playbook.map((item, index) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-dashed border-gray-200 bg-muted/40 px-4 py-3 space-y-1"
                    >
                      <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">
                        <Sparkles className="w-4 h-4" />
                        Move {index + 1}
                      </div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
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
}
