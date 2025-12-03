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
import type { TodoStatus } from "@prisma/client";

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
  todoStatusCounts: Record<TodoStatus, number>;
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
      className="relative h-full min-h-[200px]"
      style={{ perspective: 1200 }}
      onClick={() => setFlipped((prev) => !prev)}
    >
      <div
        className="relative h-full w-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl bg-white/80 border border-gray-100 shadow-lg p-3 flex flex-col gap-3"
          style={{ backfaceVisibility: "hidden" }}
        >
          {front}
        </div>
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/90 via-orange-400 to-amber-300 text-white shadow-lg p-3 flex flex-col gap-3"
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
  todoStatusCounts = {
    PLANNED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    MISSED: 0,
  },
}) => {
  const chartWidth = 820;
  const chartHeight = 320;
  const marginLeft = 60;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 28;
  const innerWidth = chartWidth - marginLeft - marginRight;
  const innerHeight = chartHeight - marginTop - marginBottom;
  const yTicks = [0, 25, 50, 75, 100];

  const trendValues = trend.map((point) => point.value);
  const areaPath = useMemo(
    () => buildAreaPath(trendValues, innerWidth, innerHeight),
    [trendValues, innerWidth, innerHeight]
  );

  const gradientStops = ["#f8a84b", "#f7805c", "#4cd7b4"];

  const activeHabit =
    habits.find((habit) => habit.streak === summary.topStreak?.streak) ??
    habits[0];

  const todoStatusMeta: Record<
    TodoStatus,
    { label: string; color: string; subtle: string }
  > = {
    PLANNED: { label: "Planned", color: "#6366F1", subtle: "rgba(99,102,241,0.18)" },
    IN_PROGRESS: {
      label: "In Progress",
      color: "#F59E0B",
      subtle: "rgba(245,158,11,0.18)",
    },
    COMPLETED: {
      label: "Completed",
      color: "#10B981",
      subtle: "rgba(16,185,129,0.18)",
    },
    MISSED: { label: "Missed", color: "#EF4444", subtle: "rgba(239,68,68,0.18)" },
  };

  const todoTotal = Object.values(todoStatusCounts).reduce(
    (sum, count) => sum + (count ?? 0),
    0
  );

  const todoSegments = (["PLANNED", "IN_PROGRESS", "COMPLETED", "MISSED"] as TodoStatus[]).map(
    (status) => {
      const count = todoStatusCounts[status] ?? 0;
      const percent = todoTotal > 0 ? (count / todoTotal) * 100 : 0;
      return { status, count, percent };
    }
  );

  let cursor = 0;
  const pieGradient = todoSegments
    .filter((segment) => segment.percent > 0)
    .map((segment) => {
      const start = cursor;
      const end = cursor + segment.percent;
      cursor = end;
      return `${todoStatusMeta[segment.status].color} ${start}% ${end}%`;
    })
    .join(", ");

  const todoCompletionPercent =
    todoTotal > 0
      ? Math.round(
          ((todoStatusCounts.COMPLETED ?? 0) / todoTotal) * 100
        )
      : 0;

  const statCards = [
    {
      id: "momentum",
      title: "Momentum lift",
      value: `${summary.averageCompletion}%`,
      helper: "Average daily completion",
      accent: "from-primary via-orange-400 to-amber-300",
      detail: `${summary.averageSuccessRate}% consistency across ${summary.lookbackLabel}.`,
    },
    {
      id: "streaks",
      title: "Streak leader",
      value: summary.topStreak?.name ?? "None yet",
      helper: summary.topStreak ? `${summary.topStreak.streak} day streak` : "Log days to begin a streak",
      accent: "from-emerald-400 via-green-500 to-green-700",
      detail: `${summary.averageStreak} day average streak across ${summary.totalHabits} habits.`,
    },
    {
      id: "todos",
      title: "Todo throughput",
      value: `${todoCompletionPercent}%`,
      helper: "Completed todos",
      accent: "from-indigo-400 via-blue-500 to-cyan-400",
      detail: `${todoStatusCounts.IN_PROGRESS ?? 0} in progress • ${todoStatusCounts.PLANNED ?? 0} planned • ${todoStatusCounts.MISSED ?? 0} missed.`,
    },
  ];

  const momentumTips = [
    "Pair your hardest habit with a tiny starter action to keep streak friction low.",
    "Schedule a weekly recovery day and log a micro-rep so momentum never fully stops.",
    "Front-load your top habit in the morning when willpower is highest.",
    "Keep a single visible trigger for each habit to avoid decision fatigue.",
    "Cap active todos to five; finish one before adding another.",
  ];

  const [activeTab, setActiveTab] = useState<"insights" | "tips">("insights");

  return (
    <main className="relative min-h-screen w-full max-w-full bg-linear-to-br from-white via-light-yellow/40 to-green-soft/20 text-foreground overflow-x-hidden">
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
      <div className="xl:px-8 2xl:px-28 py-10 space-y-7">
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
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Completion trend area chart"
                className="w-full h-[380px]"
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

                <line
                  x1={marginLeft}
                  y1={marginTop}
                  x2={marginLeft}
                  y2={chartHeight - marginBottom}
                  stroke="#E5E7EB"
                  strokeWidth="1.5"
                />
                {yTicks.map((tick) => {
                  const y =
                    marginTop + innerHeight - (tick / 100) * innerHeight;
                  return (
                    <g key={tick}>
                      <line
                        x1={marginLeft}
                        x2={chartWidth - marginRight}
                        y1={y}
                        y2={y}
                        stroke="#F1F5F9"
                        strokeWidth="1"
                      />
                      <text
                        x={marginLeft - 10}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] fill-muted-foreground"
                      >
                        {tick}%
                      </text>
                    </g>
                  );
                })}

                <g transform={`translate(${marginLeft} ${marginTop})`}>
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
                      width={innerWidth}
                      height={innerHeight}
                      fill="url(#trendGradient)"
                      opacity="0.35"
                    />
                  )}
                </g>

                {trend.map((point, index) => {
                  const x =
                    marginLeft +
                    (trend.length > 1
                      ? (index / (trend.length - 1)) * innerWidth
                      : innerWidth / 2);
                  const y =
                    marginTop + innerHeight - (point.value / 100) * innerHeight;
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

          <div className="space-y-4">
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

            <div className="rounded-3xl border border-gray-100 bg-white shadow-inner p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Todos overview
                  </p>
                  <h3 className="text-lg font-semibold">Status pie</h3>
                  <p className="text-xs text-muted-foreground">
                    Completion vs in-flight tasks
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
              </div>

              {todoTotal === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 p-6 text-center text-sm text-muted-foreground">
                  Log a few todos to see the breakdown.
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="relative h-40 w-40 shrink-0">
                    <div
                      className="h-full w-full rounded-full shadow-inner"
                      style={{
                        background: pieGradient
                          ? `conic-gradient(${pieGradient})`
                          : "radial-gradient(circle, #f4f4f5 0%, #e5e7eb 100%)",
                      }}
                    />
                    <div className="absolute inset-4 rounded-full bg-white flex flex-col items-center justify-center text-center shadow-sm">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Total
                      </p>
                      <p className="text-xl font-bold">{todoTotal}</p>
                      <p className="text-[11px] text-muted-foreground">
                        todos
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 flex-1">
                    {todoSegments.map((segment) => {
                      const meta = todoStatusMeta[segment.status];
                      return (
                        <div
                          key={segment.status}
                          className="rounded-xl border border-gray-100 bg-muted/40 p-3 flex items-center gap-3"
                        >
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              background: meta.subtle,
                              color: meta.color,
                            }}
                          >
                            {Math.round(segment.percent)}%
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              {meta.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {segment.count} todo
                              {segment.count === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Insights
              </p>
              <h3 className="text-lg font-semibold">
                Flip for deeper stats and momentum tips
              </h3>
            </div>
            <div className="inline-flex rounded-full border border-gray-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("insights")}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition ${
                  activeTab === "insights"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Stats
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tips")}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition ${
                  activeTab === "tips"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Tips
              </button>
            </div>
          </div>

          {activeTab === "tips" ? (
            <div className="rounded-3xl border border-gray-100 bg-white shadow-inner p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {momentumTips.map((tip, index) => (
                  <div
                    key={tip}
                    className="rounded-2xl border border-primary/15 bg-primary/5 p-4 flex gap-3"
                  >
                    <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-sm">
                      {index + 1}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {statCards.map((card) => (
                <FlipCard
                  key={card.id}
                  front={
                    <div className="h-full space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {card.title}
                        </p>
                        <div
                          className={`h-10 w-10 rounded-full bg-linear-to-br ${card.accent} text-white flex items-center justify-center font-bold text-sm shadow-sm`}
                        >
                          ⇆
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {card.value}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {card.helper}
                      </p>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full bg-linear-to-r ${card.accent}`}
                          style={{
                            width: card.id === "todos" ? `${todoCompletionPercent}%` : "100%",
                          }}
                        />
                      </div>
                    </div>
                  }
                  back={
                    <div className="h-full space-y-3 text-white">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                          More insight
                        </p>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-semibold leading-tight">
                        {card.title}
                      </p>
                      <p className="text-sm leading-relaxed opacity-90">
                        {card.detail}
                      </p>
                      <div className="rounded-2xl bg-white/20 px-3 py-2 text-sm font-semibold">
                        Tap again to flip back
                      </div>
                    </div>
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
