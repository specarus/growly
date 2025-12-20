"use client";

import { BarChart3, CheckCircle, Search, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import Button from "@/app/components/ui/button";
import PillButton from "@/app/components/ui/pill-button";
import confettiImage from "@/public/confetti.png";

export type FavoriteHabitStat = {
  id: string;
  name: string;
  percentage: number;
};

export type AnalyticsWidgetData = {
  completionRate: number;
  positiveDelta: number;
  favoriteHabits: FavoriteHabitStat[];
  recentDays: {
    key: string;
    label: string;
    completion: number;
    habits: FavoriteHabitStat[];
  }[];
  currentYear: number;
};

type Props = {
  data: AnalyticsWidgetData;
};

const barColors = [
  "bg-primary",
  "bg-green-soft",
  "bg-coral",
  "bg-yellow-400",
  "bg-blue-400",
  "bg-emerald-500",
  "bg-indigo-400",
  "bg-muted",
];

const AnalyticsWidget: React.FC<Props> = ({ data }) => {
  const {
    completionRate,
    positiveDelta,
    favoriteHabits,
    recentDays,

    currentYear,
  } = data;

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() =>
    Math.max(0, recentDays.length - 1)
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (recentDays.length === 0) {
      setSelectedDayIndex(0);
      return;
    }
    setSelectedDayIndex((current) => Math.min(current, recentDays.length - 1));
  }, [recentDays.length]);

  const selectedDay = useMemo(() => {
    if (recentDays.length === 0) {
      return null;
    }
    return (
      recentDays[selectedDayIndex] ?? recentDays[recentDays.length - 1] ?? null
    );
  }, [recentDays, selectedDayIndex]);

  const baseHabits =
    selectedDay && selectedDay.habits.length > 0
      ? selectedDay.habits
      : favoriteHabits;

  const baseHabitCount = Math.max(1, baseHabits.length);

  const filteredHabits = useMemo(() => {
    if (!searchQuery.trim()) {
      return baseHabits;
    }
    const term = searchQuery.trim().toLowerCase();
    return baseHabits.filter((habit) =>
      habit.name.toLowerCase().includes(term)
    );
  }, [baseHabits, searchQuery]);

  const habitsWithColors = filteredHabits.map((habit, index) => ({
    ...habit,
    color: barColors[index % barColors.length],
  }));

  const formattedDelta = `${
    positiveDelta >= 0 ? "+" : ""
  }${Math.round(positiveDelta)}%`;
  const formattedCompletionRate = `${Math.round(completionRate)}%`;

  return (
    <div className="flex lg:gap-2 xl:gap-4 2xl:gap-6 h-fit text-foreground">
      <div className="flex flex-col lg:gap-2 xl:gap-3">
        <div className="flex items-center justify-between lg:gap-3 xl:gap-4">
          <h2 className="lg:text-base xl:text-lg 2xl:text-xl font-semibold">
            Analytics
          </h2>
          <PillButton href="/dashboard/analytics" variant="ghost">
            <BarChart3 className="lg:w-2.5 lg:h-2.5 xl:w-3.5 xl:h-3.5 text-muted-foreground" />
            Open
          </PillButton>
        </div>
        <div className="lg:py-2 lg:px-2 xl:px-4 2xl:py-4 xl:max-h-max lg:rounded-2xl 2xl:rounded-3xl border-0 shadow-md bg-linear-to-br from-green-soft to-green-600 dark:from-green-soft/70 dark:to-emerald-600">
          <div className="flex items-center lg:gap-1 xl:gap-2 lg:mb-1 xl:mb-2">
            <div className="lg:w-5 lg:h-5 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <TrendingUp className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 text-white" />
            </div>
            <span className="text-white/80 lg:text-[11px] xl:text-xs 2xl:text-sm">
              Positive Habits
            </span>
          </div>
          <div className="lg:text-2xl xl:text-3xl font-bold text-white xl:mb-1">
            {formattedDelta}
          </div>
          <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-white/70">
            vs previous week
          </p>
        </div>

        <div className="lg:py-2 lg:px-2 xl:px-4 2xl:py-4 xl:max-h-max lg:rounded-2xl 2xl:rounded-3xl border-0 shadow-md bg-linear-to-br from-blue-300 to-blue-600 dark:from-slate-900 dark:to-blue-700">
          <div className="flex items-center lg:gap-1 xl:gap-2 lg:mb-1 xl:mb-2">
            <div className="lg:w-5 lg:h-5 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <CheckCircle className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 text-white" />
            </div>
            <span className="text-white/80 lg:text-[11px] xl:text-xs 2xl:text-sm">
              Completion Rate
            </span>
          </div>
          <div className="lg:text-2xl xl:text-3xl font-bold text-white xl:mb-1">
            {formattedCompletionRate}
          </div>
          <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-white/70">
            Average goal success across habits
          </p>
        </div>

        <div className="h-full lg:p-1 xl:p-2 lg:rounded-2xl 2xl:rounded-3xl border-0 shadow-md bg-analytics-dark text-analytics-dark-foreground relative overflow-hidden">
          <div className="absolute lg:-top-1 xl:-top-2 left-1/2 -translate-x-1/2 lg:w-36 xl:w-48 2xl:w-56 pointer-events-none select-none">
            <Image
              src={confettiImage}
              width={1000}
              height={1000}
              alt="Confetti"
              className="w-full h-full"
            />
          </div>
          <div className="relative z-10 lg:pt-6 2xl:pt-2 flex flex-col justify-between h-full lg:gap-1 xl:gap-2 2xl:gap-3 items-center">
            <div className="select-none lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-gray-300/30 rounded-full flex items-center justify-center lg:text-base xl:text-lg font-semibold">
              🎁
            </div>
            <span className="lg:text-xs xl:text-sm 2xl:text-md opacity-80">
              Habits Wrapped
            </span>
            <div className="lg:text-2xl xl:text-3xl font-bold">
              {currentYear}
            </div>
            <Button className="bg-white hover:bg-card/90 text-card-foreground lg:h-7 xl:h-9 2xl:h-10 lg:text-[10px] xl:text-xs 2xl:text-sm lg:mt-1 xl:mt-2 transition-all duration-100 inline-flex items-center justify-center px-4 rounded-full border border-gray-100 shadow-sm dark:bg-card dark:text-card-foreground dark:hover:bg-card/80 dark:border-border">
              View
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 grow w-full h-full">
        <div className="lg:px-3 lg:pt-2 xl:px-4 2xl:px-6 xl:pt-4 2xl:pt-6 lg:rounded-xl xl:rounded-2xl 2xl:rounded-3xl bg-white border border-gray-50 shadow-inner shadow-black/10 h-full dark:bg-card dark:border-border">
          <div className="flex items-center justify-between lg:mb-2 xl:mb-4 2xl:mb-6 lg:gap-1 xl:gap-2">
            <div className="lg:space-y-0.5 xl:space-y-1">
              <h3 className="font-semibold lg:text-base xl:text-lg 2xl:text-xl">
                Favorite Habits
              </h3>
              {selectedDay ? (
                <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
                  {selectedDay.label} - {selectedDay.completion}% of daily goals
                  completed
                </p>
              ) : (
                <p className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
                  No recent check-ins yet
                </p>
              )}
            </div>

            <div className="flex items-center lg:gap-2 xl:gap-3">
              <div className="flex gap-1 shadow-sm rounded-full">
                <Button className="lg:h-6 lg:w-6 xl:h-8 xl:w-8 2xl:h-10 2xl:w-10 bg-white border-muted border dark:bg-card dark:border-border dark:text-foreground">
                  <Search className="lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4" />
                </Button>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-1 pr-4 outline-none lg:w-20 xl:w-28 lg:text-[10px] xl:text-xs 2xl:text-sm text-muted-foreground bg-transparent rounded-full placeholder:text-muted-foreground dark:placeholder:text-muted-foreground/80"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 overflow-x-auto flex flex-col h-full">
            <div className="grid grid-cols-5 xl:gap-1 2xl:gap-2 lg:text-[8px] xl:text-[10px] 2xl:text-xs text-muted-foreground dark:text-muted-foreground/70 mb-2 min-w-max sm:min-w-0 flex-none">
              {recentDays.length === 0 ? (
                <div className="col-span-5 text-muted-foreground text-center py-2">
                  No recent days to show
                </div>
              ) : (
                recentDays.map((day, index) => (
                  <div
                    key={day.key}
                    className={`lg:pb-1 xl:pb-2 text-center border-b-2 hover:border-muted-foreground cursor-pointer ${
                      selectedDayIndex === index
                        ? "border-muted-foreground"
                        : "border-white"
                    }`}
                    onClick={() => setSelectedDayIndex(index)}
                    title={`${day.completion}% complete`}
                  >
                    {day.label}
                  </div>
                ))
              )}
            </div>

            {habitsWithColors.length === 0 ? (
              <div className="flex-1 grid place-items-center lg:rounded-xl xl:rounded-2xl border border-dashed border-muted/60 bg-muted/10 text-muted-foreground lg:text-[10px] xl:text-xs 2xl:text-sm">
                Log habit progress to see who is leading.
              </div>
            ) : (
              <div className="relative flex flex-1 overflow-hidden justify-start">
                {habitsWithColors.map((habit) => {
                  const heightPercent = Math.max(
                    0,
                    Math.min(100, habit.percentage)
                  );
                  const barWidthPercent = `${100 / baseHabitCount}%`;
                  return (
                    <div
                      key={habit.id}
                      className="group h-10/12 relative flex flex-col items-center justify-between lg:p-1 xl:p-2 transition hover:bg-primary/20"
                      style={{
                        flex: `0 0 ${barWidthPercent}`,
                        maxWidth: barWidthPercent,
                      }}
                    >
                      <div className="flex flex-col items-center gap-1 text-center lg:min-h-12 xl:min-h-16">
                        <div className="lg:text-[11px] xl:text-xs text-wrap xl:mt-1 2xl:mt-2 truncate w-full font-medium">
                          {habit.name}
                        </div>
                        <div className="lg:text-[7px] xl:text-[9px] 2xl:text-[10px] sm:text-xs text-muted-foreground lg:mb-0.5 xl:mb-1">
                          {habit.percentage}%
                        </div>
                      </div>
                      <div className="flex-1 w-full flex items-start">
                        <div
                          className={`w-full ${habit.color} shadow-md rounded-lg sm:rounded-xl transition-all hover:opacity-80`}
                          style={{
                            height: `${heightPercent}%`,
                            maxHeight: "100%",
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
