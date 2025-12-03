"use client";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Flame,
  Rotate3D,
  Sparkles,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";

import GradientCircle from "@/app/components/ui/gradient-circle";
import PageHeading from "@/app/components/page-heading";

type TrendPoint = { label: string; value: number };

type HabitInsight = {
  id: string;
  name: string;
  streak: number;
  successRate: number;
  averageCompletion: number;
  cadence: string;
  goal: string;
  description?: string | null;
};

type Summary = {
  totalHabits: number;
  averageStreak: number;
  averageCompletion: number;
  averageSuccessRate: number;
  topStreak?: { name: string; streak: number };
  lookbackLabel: string;
};

type Props = {
  summary: Summary;
  trend: TrendPoint[];
  weekdayPerformance: TrendPoint[];
  habits: HabitInsight[];
};

const buildAreaPath = (points: number[], width = 720, height = 200) => {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    const y = height - (points[0] / 100) * height;
    return `M0,${height} L0,${y} L${width},${y} L${width},${height} Z`;
  }

  const step = width / Math.max(points.length - 1, 1);
  const coords = points.map((value, index) => {
    const x = index * step;
    const y = height - (value / 100) * height;
    return `${x},${y}`;
  });

  return `M0,${height} L${coords.join(" ")} L${width},${height} Z`;
};

const FlipCard: React.FC<{
  front: React.ReactNode;
  back: React.ReactNode;
}> = ({ front, back }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative h-full"
      style={{ perspective: 1200 }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className="relative h-full w-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl bg-white/80 border border-gray-100 shadow-lg p-4 flex flex-col gap-3"
          style={{ backfaceVisibility: "hidden" }}
        >
          {front}
        </div>
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/90 via-orange-400 to-amber-300 text-white shadow-lg p-4 flex flex-col gap-3"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
};

const AnalyticsClient: React.FC<Props> = ({
  summary,
  trend,
  weekdayPerformance,
  habits,
}) => {
  const trendValues = trend.map((point) => point.value);
  const areaPath = useMemo(
    () => buildAreaPath(trendValues, 780, 240),
    [trendValues]
  );

  const gradientStops = ["#f8a84b", "#f7805c", "#4cd7b4"];

  const activeHabit =
    habits.find((habit) => habit.streak === summary.topStreak?.streak) ??
    habits[0];

  return (
    <main className="relative min-h-screen bg-linear-to-br from-white via-light-yellow/40 to-green-soft/20 text-foreground">
      <GradientCircle
        size={260}
        position={{ top: "-70px", right: "-40px" }}
        color="rgba(240,144,41,0.25)"
        fadeColor="rgba(240,144,41,0)"
        className="scale-125"
      />
      <GradientCircle
        size={300}
        position={{ bottom: "-100px", left: "-60px" }}
        color="rgba(76,215,180,0.18)"
        fadeColor="rgba(76,215,180,0)"
        className="scale-110"
      />
      <div className="xl:px-8 2xl:px-28 py-12 space-y-8">
        <PageHeading
          badgeLabel="Analytics"
          title="Momentum Observatory"
          description="Visualize streaks, momentum, and the habits that keep you moving."
          titleClassName="xl:text-2xl 2xl:text-3xl"
        />

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Active streak
              </p>
              <h3 className="text-3xl font-bold">{summary.averageStreak}d</h3>
              <p className="text-xs text-muted-foreground">
                Avg streak across {summary.totalHabits} habits
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-green-600">
                Consistency
              </p>
              <h3 className="text-3xl font-bold">
                {summary.averageSuccessRate}%
              </h3>
              <p className="text-xs text-muted-foreground">
                Completion across {summary.lookbackLabel}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-green-soft/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-700" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-coral">
                Completion lift
              </p>
              <h3 className="text-3xl font-bold">
                {summary.averageCompletion}%
              </h3>
              <p className="text-xs text-muted-foreground">
                Average daily completion
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-coral/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-coral" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-500">
                Leader
              </p>
              <h3 className="text-lg font-semibold">
                {summary.topStreak?.name ?? "Waiting for data"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {summary.topStreak
                  ? `${summary.topStreak.streak} day streak`
                  : "Log habits to start a streak"}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-emerald-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white shadow-inner p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Trend
                </p>
                <h3 className="text-lg font-semibold">Momentum curve</h3>
                <p className="text-xs text-muted-foreground">
                  Completion over time, weighted by all habits.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
                {summary.lookbackLabel}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-primary/5 p-4">
              <svg
                viewBox="0 0 780 260"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Completion trend area chart"
                className="w-full h-64"
              >
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={gradientStops[0]} stopOpacity="0.35" />
                    <stop offset="50%" stopColor={gradientStops[1]} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={gradientStops[2]} stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={gradientStops[0]} />
                    <stop offset="50%" stopColor={gradientStops[1]} />
                    <stop offset="100%" stopColor={gradientStops[2]} />
                  </linearGradient>
                </defs>

                {areaPath ? (
                  <path
                    d={areaPath}
                    fill="url(#trendGradient)"
                    stroke="url(#strokeGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="drop-shadow-sm"
                  />
                ) : (
                  <rect
                    x="0"
                    y="0"
                    width="780"
                    height="260"
                    fill="url(#trendGradient)"
                    opacity="0.35"
                  />
                )}

                {trend.map((point, index) => {
                  const x =
                    trend.length > 1
                      ? (index / (trend.length - 1)) * 780
                      : 390;
                  const y = 260 - (point.value / 100) * 200 - 20;
                  return (
                    <g key={point.label}>
                      <circle
                        cx={x}
                        cy={y}
                        r={6}
                        fill="white"
                        stroke="url(#strokeGradient)"
                        strokeWidth="3"
                      />
                      <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        className="text-[10px] fill-muted-foreground"
                      >
                        {point.value}%
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                {trend.map((point) => (
                  <span key={point.label}>{point.label}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white shadow-inner p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Cadence map
                </p>
                <h3 className="text-lg font-semibold">Weekday rhythm</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Rotate3D className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3 mt-2">
              {weekdayPerformance.map((day) => (
                <div
                  key={day.label}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div className="h-28 w-full rounded-full bg-muted overflow-hidden border border-gray-100 flex items-end">
                    <div
                      className="w-full rounded-full bg-linear-to-t from-primary via-orange-400 to-amber-300 shadow-sm"
                      style={{ height: `${Math.round(day.value * 100)}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-semibold">{day.label}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {Math.round(day.value * 100)}%
                  </div>
                </div>
              ))}
            </div>

            {activeHabit && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Spotlight
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{activeHabit.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {activeHabit.successRate}% on-time | {activeHabit.cadence}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">
                      {activeHabit.streak}d
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Habit cards
              </p>
              <h3 className="text-lg font-semibold">
                Flip to see streak defenses and focus
              </h3>
            </div>
          </div>

          {habits.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white/70 p-8 text-center space-y-3 shadow-sm">
              <p className="text-base font-semibold text-foreground">
                No habit data yet
              </p>
              <p className="text-sm text-muted-foreground">
                Create a habit and log a few days of progress to unlock your
                analytics.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {habits.map((habit, index) => (
                <FlipCard
                  key={habit.id}
                  front={
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                            {habit.cadence}
                          </p>
                          <h4 className="text-lg font-semibold">
                            {habit.name}
                          </h4>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold">
                            {habit.streak} day streak
                          </span>
                        </div>
                        <div className="text-xs font-semibold rounded-full bg-green-soft/30 text-green-700 px-3 py-1">
                          {habit.successRate}% on time
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-primary via-orange-400 to-amber-300"
                            style={{ width: `${habit.averageCompletion}%` }}
                          />
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground flex justify-between">
                          <span>Completion</span>
                          <span>{habit.averageCompletion}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {habit.description ??
                          "Flip to see the focus and guardrails for this habit."}
                      </p>
                    </>
                  }
                  back={
                    <>
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold">
                          {habit.name}
                        </h4>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] bg-white/20 rounded-full px-3 py-1">
                          Streak {habit.streak}d
                        </div>
                      </div>
                      <p className="text-sm opacity-90">
                        Goal: {habit.goal}
                      </p>
                      <p className="text-sm opacity-90">
                        Rhythm: {habit.cadence}
                      </p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 font-semibold">
                          <Sparkles className="w-4 h-4" />
                          {habit.successRate}% on time
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 font-semibold">
                          <Activity className="w-4 h-4" />
                          {habit.averageCompletion}% complete
                        </span>
                      </div>
                      <p className="text-sm opacity-90 leading-relaxed">
                        Keep the streak alive with one small rep on tough days.
                        Anchor the habit to a reliable cue and protect your
                        cadence.
                      </p>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AnalyticsClient;
