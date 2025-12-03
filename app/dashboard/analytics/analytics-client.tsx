"use client";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Flame,
  ListChecks,
  Lightbulb,
  Rotate3D,
  Sparkles,
  Target,
  Trophy,
  ChessQueen,
  ChartPie,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  accent?: string;
}> = ({
  front,
  back,
  accent = "from-primary/95 via-orange-400 to-amber-300 dark:from-orange-400 dark:via-amber-500 dark:to-amber-400",
}) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="group relative h-full min-h-[270px] cursor-pointer"
      style={{ perspective: 1200 }}
      onClick={() => setFlipped((prev) => !prev)}
    >
      <div
        className="relative h-full w-full transition-transform duration-700 group-hover:scale-[1.01]"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 rounded-3xl bg-white/90 border border-gray-100 shadow-lg p-4 flex flex-col gap-3"
          style={{ backfaceVisibility: "hidden" }}
        >
          {front}
        </div>
        <div
          className={`absolute inset-0 rounded-3xl bg-linear-to-br ${accent} text-white shadow-xl p-4 flex flex-col gap-4`}
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
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(820);
  const [chartHeight, setChartHeight] = useState(320);
  const marginLeft = 60;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 28;
  const innerWidth = chartWidth - marginLeft - marginRight;
  const innerHeight = chartHeight - marginTop - marginBottom;
  const yTicks = [0, 25, 50, 75, 100];
  const xLabelOffset = 18;
  const axisColor = "rgba(100,116,139,0.7)";
  const gridColor = "rgba(148,163,184,0.55)";
  const gridDashColor = "rgba(148,163,184,0.4)";

  const xPositions = useMemo(
    () =>
      trend.map(
        (_, index) =>
          marginLeft +
          (trend.length > 1
            ? (index / (trend.length - 1)) * innerWidth
            : innerWidth / 2)
      ),
    [trend, innerWidth]
  );

  const trendValues = trend.map((point) => point.value);
  const areaPath = useMemo(
    () => buildAreaPath(trendValues, innerWidth, innerHeight),
    [trendValues, innerWidth, innerHeight]
  );

  useEffect(() => {
    const updateSize = () => {
      if (chartAreaRef.current) {
        const { clientWidth, clientHeight } = chartAreaRef.current;
        setChartWidth(Math.max(320, clientWidth));
        setChartHeight(Math.max(260, clientHeight));
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => updateSize());
    const areaElement = chartAreaRef.current;
    if (areaElement) {
      resizeObserver.observe(areaElement);
    }

    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      resizeObserver.disconnect();
    };
  }, []);

  const gradientStops = ["#f8a84b", "#f7805c", "#4cd7b4"];

  const activeHabit =
    habits.find((habit) => habit.streak === summary.topStreak?.streak) ??
    habits[0];

  const todoStatusMeta: Record<
    TodoStatus,
    { label: string; color: string; subtle: string }
  > = {
    PLANNED: {
      label: "Planned",
      color: "#6366F1",
      subtle: "rgba(99,102,241,0.18)",
    },
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
    MISSED: {
      label: "Missed",
      color: "#EF4444",
      subtle: "rgba(239,68,68,0.18)",
    },
  };

  const todoTotal = Object.values(todoStatusCounts).reduce(
    (sum, count) => sum + (count ?? 0),
    0
  );

  const todoSegments = (
    ["PLANNED", "IN_PROGRESS", "COMPLETED", "MISSED"] as TodoStatus[]
  ).map((status) => {
    const count = todoStatusCounts[status] ?? 0;
    const percent = todoTotal > 0 ? (count / todoTotal) * 100 : 0;
    return { status, count, percent };
  });

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
      ? Math.round(((todoStatusCounts.COMPLETED ?? 0) / todoTotal) * 100)
      : 0;

  const statCards = [
    {
      id: "velocity",
      title: "Completion velocity",
      badge: "Momentum",
      value: `${summary.averageCompletion}%`,
      helper: `${summary.averageSuccessRate}% consistency over ${summary.lookbackLabel}`,
      accent:
        "from-primary via-orange-400 to-amber-300 dark:from-orange-400 dark:via-amber-500 dark:to-amber-400",
      icon: ArrowUpRight,
      progress: summary.averageCompletion,
      details: [
        `${summary.totalHabits} habits tracked`,
        `${summary.averageStreak} day avg streak`,
      ],
      backTitle: "Keep compounding",
      backCopy:
        "Stay above 75% weekly completion to maintain momentum. If a day slips, log a micro-rep so the velocity line never flatlines.",
    },
    {
      id: "streaks",
      title: "Streak leader",
      badge: "Consistency",
      value: summary.topStreak
        ? `${summary.topStreak.streak} days`
        : "No leader yet",
      helper: summary.topStreak
        ? `${summary.topStreak.name}`
        : "Log habits to surface a leader",
      accent:
        "from-emerald-400 via-green-500 to-green-700 dark:from-green-500 dark:via-emerald-600 dark:to-emerald-700",
      icon: Trophy,
      progress: summary.topStreak ? 100 : 40,
      details: [
        `${summary.averageStreak} day avg streak`,
        `${summary.averageCompletion}% completion base`,
      ],
      backTitle: "Protect streaks",
      backCopy:
        "Use streak freeze days strategically. Pair your leader habit with a tiny starter to keep the streak breathing on chaotic days.",
    },
    {
      id: "todos",
      title: "Todo throughput",
      badge: "Workflow",
      value: `${todoCompletionPercent}% done`,
      helper: `${todoStatusCounts.IN_PROGRESS ?? 0} in progress | ${
        todoStatusCounts.PLANNED ?? 0
      } planned`,
      accent:
        "from-indigo-400 via-blue-500 to-cyan-400 dark:from-indigo-500 dark:via-blue-600 dark:to-cyan-500",
      icon: ListChecks,
      progress: todoCompletionPercent,
      details: [
        `${todoStatusCounts.COMPLETED ?? 0} completed`,
        `${todoStatusCounts.MISSED ?? 0} missed`,
      ],
      backTitle: "Ship focus",
      backCopy:
        "Cap work-in-progress at five. Clear one planned item before adding another to keep throughput steady and visible.",
    },
  ];

  return (
    <main className="relative xl:px-8 2xl:px-28 xl:pt-24 2xl:pt-28 xl:pb-12 2xl:pb-16 min-h-screen w-full bg-linear-to-br from-white via-light-yellow/40 to-green-soft/20 text-foreground overflow-hidden">
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
      <div className="space-y-7 ">
        <PageHeading
          badgeLabel="Analytics"
          title="Momentum Observatory"
          description="Visualize streaks, momentum, and the habits that keep you moving."
          titleClassName="xl:text-2xl 2xl:text-3xl"
        />

        <section className="grid xl:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 flex items-start justify-between">
            <div className="flex flex-col justify-between h-full">
              <p className="xl:text-[11px] 2xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Active streak
              </p>
              <h3 className="xl:text-3xl 2xl:text-4xl font-bold">
                {summary.averageStreak}d
              </h3>
              <p className="text-xs text-muted-foreground">
                Avg streak across {summary.totalHabits} habits
              </p>
            </div>
            <div className="xl:h-10 xl:w-10 2xl:h-11 2xl:w-11 rounded-full bg-primary/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 flex items-start justify-between">
            <div className="flex flex-col justify-between h-full">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-green-600">
                Consistency
              </p>
              <h3 className="xl:text-3xl 2xl:text-4xl font-bold">
                {summary.averageSuccessRate}%
              </h3>
              <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                Completion across {summary.lookbackLabel}
              </p>
            </div>
            <div className="xl:h-10 xl:w-10 2xl:h-11 2xl:w-11 rounded-full bg-green-soft/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-soft" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 flex items-start justify-between">
            <div className="flex flex-col justify-between h-full">
              <p className="xl:text-[11px] 2xl:text-xs font-semibold uppercase tracking-[0.16em] text-coral">
                Completion lift
              </p>
              <h3 className="xl:text-3xl 2xl:text-4xl font-bold">
                {summary.averageCompletion}%
              </h3>
              <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                Average daily completion
              </p>
            </div>
            <div className="xl:h-10 xl:w-10 2xl:h-11 2xl:w-11 rounded-full bg-coral/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-coral" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 flex items-start justify-between">
            <div className="flex flex-col justify-between h-full">
              <p className="xl:text-[11px] 2xl:text-xs font-semibold uppercase tracking-[0.16em] text-sky-500">
                Leader
              </p>
              <h3 className="xl:text-lg 2xl:text-xl font-semibold">
                {summary.topStreak?.name ?? "Waiting for data"}
              </h3>
              <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                {summary.topStreak
                  ? `${summary.topStreak.streak} day streak`
                  : "Log habits to start a streak"}
              </p>
            </div>
            <div className="xl:h-10 xl:w-10 2xl:h-11 2xl:w-11 rounded-full bg-sky-100 flex items-center justify-center">
              <ChessQueen className="w-5 h-5 text-sky-600" />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-6 items-stretch">
          <div className="col-span-2 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="xl:text-[11px] 2xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Trend
                </p>
                <h3 className="xl:text-lg 2xl:text-xl font-semibold">
                  Momentum curve
                </h3>
                <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                  Completion over time, weighted by all habits.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <BarChart3 className="xl:w-3 xl:h-3 2xl:w-4 2xl:h-4" />
                {summary.lookbackLabel}
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-inner xl:px-6 xl:py-8 flex flex-col gap-3">
              <div ref={chartAreaRef} className="relative flex-1">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Completion trend area chart"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="trendGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={gradientStops[0]}
                        stopOpacity="0.35"
                      />
                      <stop
                        offset="50%"
                        stopColor={gradientStops[1]}
                        stopOpacity="0.22"
                      />
                      <stop
                        offset="100%"
                        stopColor={gradientStops[2]}
                        stopOpacity="0.1"
                      />
                    </linearGradient>
                    <linearGradient
                      id="strokeGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor={gradientStops[0]} />
                      <stop offset="50%" stopColor={gradientStops[1]} />
                      <stop offset="100%" stopColor={gradientStops[2]} />
                    </linearGradient>
                  </defs>

                  <line
                    x1={marginLeft}
                    y1={chartHeight - marginBottom}
                    x2={chartWidth - marginRight}
                    y2={chartHeight - marginBottom}
                    stroke={axisColor}
                    strokeWidth="2"
                  />
                  <line
                    x1={marginLeft}
                    y1={marginTop}
                    x2={marginLeft}
                    y2={chartHeight - marginBottom}
                    stroke={axisColor}
                    strokeWidth="2"
                  />
                  {xPositions.map((x, index) => (
                    <line
                      key={`${trend[index]?.label ?? index}-grid`}
                      x1={x}
                      x2={x}
                      y1={marginTop}
                      y2={chartHeight - marginBottom}
                      stroke={gridDashColor}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  ))}
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
                          stroke={gridColor}
                          strokeWidth="1.5"
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
                    const x = xPositions[index];
                    const y =
                      marginTop +
                      innerHeight -
                      (point.value / 100) * innerHeight;
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
                        <text
                          x={x}
                          y={chartHeight - marginBottom + xLabelOffset}
                          textAnchor="middle"
                          dominantBaseline="hanging"
                          className="text-[10px] fill-muted-foreground"
                        >
                          {point.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Cadence map
                  </p>
                  <h3 className="xl:text-base 2xl:text-lg font-semibold">
                    Weekday rhythm
                  </h3>
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
                      {(() => {
                        const barHeight = Math.min(
                          100,
                          Math.max(0, Math.round(day.value * 100))
                        );
                        return (
                          <div
                            className="w-full rounded-full bg-linear-to-t from-primary via-primary-400 to-amber-300"
                            style={{ height: `${barHeight}%` }}
                          />
                        );
                      })()}
                    </div>
                    <div className="xl:text-[11px] 2xl:text-xs font-semibold">
                      {day.label}
                    </div>
                    <div className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
                      {Math.round(day.value * 100)}%
                    </div>
                  </div>
                ))}
              </div>

              {activeHabit && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 py-3 px-4">
                  <p className="xl:text-[10px] 2xl:text-[11px] mb-1 font-semibold uppercase tracking-[0.16em] text-primary">
                    Spotlight
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="xl:text-sm 2xl:text-base font-semibold">
                        {activeHabit.name}
                      </p>
                      <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                        {activeHabit.successRate}% on-time |{" "}
                        {activeHabit.cadence}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-primary" />
                      <span className="xl:text-sm 2xl:text-base font-semibold">
                        {activeHabit.streak}d
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Todos overview
                  </p>
                  <h3 className="xl:text-base 2xl:text-lg font-semibold">
                    Status pie
                  </h3>
                  <p className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
                    Completion vs in-flight tasks
                  </p>
                </div>
                <div className="xl:h-9 xl:w-9 2xl:h-10 2xl:w-10 rounded-full bg-muted flex items-center justify-center">
                  <ChartPie className="xl:w-4 xl:h-4 2xl:w-5 2xl:  h-5 text-primary" />
                </div>
              </div>

              {todoTotal === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 p-6 text-center text-sm text-muted-foreground">
                  Log a few todos to see the breakdown.
                </div>
              ) : (
                <div className="flex items-center gap-6 px-6 pt-6">
                  <div className="relative h-52 w-52 shrink-0">
                    <div
                      className="h-full w-full rounded-full shadow-inner"
                      style={{
                        background: pieGradient
                          ? `conic-gradient(${pieGradient})`
                          : "radial-gradient(circle, #f4f4f5 0%, #e5e7eb 100%)",
                      }}
                    />
                    <div className="absolute inset-4 rounded-full bg-white flex flex-col items-center justify-center text-center shadow-sm">
                      <p className="xl:text-[11px] 2xl:text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Total
                      </p>
                      <p className="xl:text-xl 2xl:text-2xl font-bold">
                        {todoTotal}
                      </p>
                      <p className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
                        todos
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 flex-1">
                    {todoSegments.map((segment) => {
                      const meta = todoStatusMeta[segment.status];
                      return (
                        <div
                          key={segment.status}
                          className="flex justify-between items-center rounded-xl border border-gray-100 bg-white px-4 py-2"
                        >
                          <p className="xl:text-xs 2xl:text-sm font-semibold">
                            {meta.label}
                          </p>
                          <div className="flex">
                            <div
                              className="rounded-full flex items-center justify-center px-2 py-1 xl:text-[11px] 2xl:text-xs font-bold"
                              style={{
                                background: meta.subtle,
                                color: meta.color,
                              }}
                            >
                              {Math.round(segment.percent)}%
                            </div>
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
          <p className="xl:text-sm 2xl:text-base font-semibold uppercase tracking-[0.16em] text-primary">
            Insights
          </p>

          <div className="grid xl:grid-cols-3 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              const progress = Math.max(0, Math.min(card.progress ?? 0, 100));
              return (
                <FlipCard
                  key={card.id}
                  accent={card.accent}
                  front={
                    <div className="flex flex-col justify-between h-full space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {card.badge}
                          </span>
                          <p className="xl:text-base 2xl:text-lg font-semibold text-foreground">
                            {card.title}
                          </p>
                          <p className="xl:text-2xl 2xl:text-3xl font-bold text-foreground">
                            {card.value}
                          </p>
                          <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                            {card.helper}
                          </p>
                        </div>
                        <div
                          className={`xl:w-11 xl:h-11 2xl:h-12 2xl:w-12 rounded-2xl bg-linear-to-br ${card.accent} text-white flex items-center justify-center shadow-md`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full bg-linear-to-r ${card.accent}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {card.details.map((detail) => (
                          <div
                            key={detail}
                            className="rounded-xl border border-gray-100 bg-white/80 px-3 py-2 text-[12px] font-semibold text-foreground shadow-sm flex items-center gap-2"
                          >
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-primary" />
                        Tap to view the playbook
                      </div>
                    </div>
                  }
                  back={
                    <div className="h-full space-y-3 text-white">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                          {card.backTitle}
                        </p>
                      </div>
                      <p className="xl:text-lg 2xl:text-xl font-semibold leading-tight">
                        {card.title}
                      </p>
                      <p className="text-sm leading-relaxed opacity-90">
                        {card.backCopy}
                      </p>
                      <div className="rounded-2xl bg-white/20 px-3 py-2 xl:text-xs 2xl:text-sm font-semibold flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Tap again to flip back</span>
                      </div>
                    </div>
                  }
                />
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AnalyticsClient;
