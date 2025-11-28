export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
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
import PageGradient from "@/app/components/ui/page-gradient";

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const summaryCards = [
    {
      title: "Completion rate",
      value: "82%",
      helper: "214 of 260 habits done",
      change: "+6.1% vs last month",
      icon: CheckCircle2,
      accent: "from-green-soft/80 to-green-500/80",
    },
    {
      title: "Active days",
      value: "27",
      helper: "Current streak",
      change: "4 days above target",
      icon: Flame,
      accent: "from-yellow-soft/70 to-amber-400/70",
    },
    {
      title: "Focus hours",
      value: "42h",
      helper: "Avg 1h 45m / day",
      change: "+12% this week",
      icon: Timer,
      accent: "from-blue-200 to-blue-500/70",
    },
    {
      title: "Momentum score",
      value: "74",
      helper: "Out of 100 · trending up",
      change: "+9 pts after 6a starts",
      icon: Activity,
      accent: "from-primary/80 to-coral/80",
    },
  ];

  const weeklyRhythm = [
    { day: "Mon", completed: 9 },
    { day: "Tue", completed: 11 },
    { day: "Wed", completed: 7 },
    { day: "Thu", completed: 10 },
    { day: "Fri", completed: 8 },
    { day: "Sat", completed: 6 },
    { day: "Sun", completed: 5 },
  ];

  const focusBlocks = [
    { label: "Morning build (6-9a)", completion: 78, detail: "45m avg focus" },
    { label: "Deep work (9a-1p)", completion: 84, detail: "3.2h logged" },
    { label: "Reset + move (1-3p)", completion: 64, detail: "Walked 3x" },
    { label: "Evening cooldown", completion: 58, detail: "Reading + stretch" },
  ];

  const topHabits = [
    {
      name: "Strength training",
      completion: 93,
      streak: 24,
      note: "+8% vs last week",
      tone: "bg-green-soft/40 text-foreground",
    },
    {
      name: "Hydration",
      completion: 88,
      streak: 19,
      note: "Consistent after midday",
      tone: "bg-blue-100 text-foreground",
    },
    {
      name: "Reading (20m)",
      completion: 76,
      streak: 12,
      note: "Best on Tue/Thu",
      tone: "bg-yellow-soft/40 text-foreground",
    },
    {
      name: "Lights out 11p",
      completion: 69,
      streak: 8,
      note: "Up 11% with reminders",
      tone: "bg-muted text-foreground",
    },
  ];

  const experiments = [
    {
      title: "Cold start blocker",
      outcome: "Reduced friction by prepping night before",
      lift: "+6% completion",
    },
    {
      title: "10m warm-up sets",
      outcome: "Higher readiness before long sessions",
      lift: "+4 focus score",
    },
    {
      title: "No phone until first habit",
      outcome: "Streak stability improved",
      lift: "+3 days streak",
    },
  ];

  const maxWeeklyHabits = Math.max(
    ...weeklyRhythm.map((item) => item.completed)
  );

  return (
    <main className="relative w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground xl:pb-12 2xl:pb-16 bg-linear-to-tl from-white/90 via-light-yellow/55 to-green-soft/15">
      <PageGradient />
      <div className="xl:px-8 2xl:px-28 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <BadgeCheck className="w-4 h-4" />
              <span>Analytics</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                Performance overview
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Hardcoded snapshot that spotlights trends, streaks, and where
                your time is paying off. Wire up live data when ready.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm hover:border-primary/40 transition"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {summaryCards.map((card) => {
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
                        {card.change}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {card.helper}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="px-6 pt-5 pb-6 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Weekly flow
                    </p>
                    <h2 className="text-xl font-semibold">Habit momentum</h2>
                    <p className="text-sm text-muted-foreground">
                      Steady Monday/Tuesday spikes with a soft landing on
                      weekends.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Stable climb
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="flex items-end gap-3 h-40 px-2 border-b border-dashed border-muted/80 pb-4">
                      {weeklyRhythm.map((item) => (
                        <div
                          key={item.day}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div
                            className="w-full rounded-xl bg-linear-to-b from-primary/80 to-coral/80 shadow-inner"
                            style={{
                              height: `${
                                (item.completed / maxWeeklyHabits) * 100
                              }%`,
                            }}
                          />
                          <div className="text-[11px] text-muted-foreground">
                            {item.day}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                      <span>Max {maxWeeklyHabits} habits logged</span>
                      <span>Goal: 8+ per day</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-muted/60 bg-muted/40 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Gauge className="w-4 h-4 text-primary" />
                      Recovery vs output
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Recovery</span>
                          <span>72%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white overflow-hidden">
                          <div className="h-full w-[72%] bg-green-soft/80" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Output</span>
                          <span>78%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white overflow-hidden">
                          <div className="h-full w-[78%] bg-primary/80" />
                        </div>
                      </div>
                      <div className="rounded-xl border border-dashed border-primary/40 bg-white/60 px-3 py-2 text-xs flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                        Add heart rate and sleep data to tighten recovery
                        signals.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
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
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                    <Focus className="w-4 h-4" />
                    Prime windows
                  </div>
                </div>

                <div className="space-y-3">
                  {focusBlocks.map((block) => (
                    <div key={block.label} className="space-y-1">
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
                        {block.completion}% completion window
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="px-6 pt-5 pb-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Top movers
                    </p>
                    <h2 className="text-xl font-semibold">Habit leaderboard</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                    <BarChart3 className="w-4 h-4" />
                    Manual sample data
                  </div>
                </div>

                <div className="space-y-3">
                  {topHabits.map((habit) => (
                    <div
                      key={habit.name}
                      className="flex items-center justify-between rounded-2xl border border-gray-100 bg-muted/50 px-4 py-3 gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl grid place-items-center bg-white shadow-inner border border-gray-100">
                          <Flame className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{habit.name}</p>
                          <p className="text-sm text-muted-foreground">
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
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
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
                    Manual log
                  </div>
                </div>

                <div className="space-y-3">
                  {experiments.map((experiment, index) => (
                    <div
                      key={experiment.title}
                      className="rounded-2xl border border-dashed border-gray-200 bg-muted/40 px-4 py-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                          <Sparkles className="w-4 h-4" />
                          Experiment {index + 1}
                        </div>
                        <span className="text-[11px] font-semibold text-green-700 bg-green-soft/30 rounded-full px-2 py-1">
                          {experiment.lift}
                        </span>
                      </div>
                      <p className="font-semibold">{experiment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {experiment.outcome}
                      </p>
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
                <p className="font-semibold">Ready for live analytics</p>
                <p className="text-sm text-muted-foreground">
                  Wire this page to your habit data source and swap the
                  hardcoded sets.
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
