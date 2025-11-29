"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Button from "@/app/components/ui/button";
import {
  ProgressByDayMap,
  buildDayKey,
  formatDayKey,
} from "@/lib/habit-progress";

type DayName = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

const dayNames: DayName[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DayData {
  day: number;
  progress: number;
}

type Week = (DayData | null)[];

const chunkArray = <T,>(arr: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
};

const getDaysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate();

const getFirstDayOfMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex, 1).getDay();

const getMonthName = (monthIndex: number) =>
  new Date(2000, monthIndex).toLocaleString("en-US", { month: "long" });

const clamp = (value: number) => Math.min(1, Math.max(0, value));

interface HabitsCalendarProps {
  progressByDay: ProgressByDayMap;
}

const HabitsCalendar: React.FC<HabitsCalendarProps> = ({ progressByDay }) => {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const numDaysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const paddedDays: (number | null)[] = [
    ...Array(firstDayIndex).fill(null),
    ...Array.from({ length: numDaysInMonth }, (_, index) => index + 1),
  ];

  const dayWeeks = chunkArray(paddedDays, 7);

  const isSameMonthAsToday =
    currentYear === today.getFullYear() && currentMonth === today.getMonth();

  const isTodayCell = (day: number) =>
    isSameMonthAsToday && day === today.getDate();

  const getDayProgress = (day: number) => {
    const key = buildDayKey(currentYear, currentMonth, day);
    return clamp(progressByDay[key] ?? 0);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1)
    );
  };

  const todayKey = formatDayKey(today);
  const todayProgress = clamp(progressByDay[todayKey] ?? 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold xl:text-base 2xl:text-lg text-foreground">
          {getMonthName(currentMonth)}, {currentYear}
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={handlePreviousMonth}
            className="bg-white text-muted-foreground hover:text-white hover:bg-primary/90 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={handleNextMonth}
            className="bg-white text-muted-foreground hover:text-white hover:bg-primary/90 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 xl:gap-1 2xl:gap-2 xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {dayNames.map((dayName) => (
          <div key={dayName} className="text-center">
            {dayName}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {dayWeeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className="grid grid-cols-7 place-items-center xl:gap-1 2xl:gap-2"
          >
            {week.map((dayValue, dayIndex) => {
              if (dayValue === null) {
                return <div key={`empty-${weekIndex}-${dayIndex}`} />;
              }

              const progress = getDayProgress(dayValue);
              const percent = Math.round(progress * 100);
              const hasProgress = progress > 0;
              const isToday = isTodayCell(dayValue);

              return (
                <div
                  key={`day-${weekIndex}-${dayValue}`}
                  className={`relative shadow-sm shadow-primary/20 xl:w-24 2xl:w-28 xl:h-24 2xl:h-28 rounded-full grid place-items-center border border-primary/50 transition ${
                    progress >= 1 ? "bg-primary text-white" : "bg-muted/20"
                  } ${isToday ? "xl:ring-3 2xl:ring-4 ring-primary/40" : ""}`}
                  title={`${getMonthName(
                    currentMonth
                  )} ${dayValue} - ${percent}% of habits completed`}
                >
                  <div className="absolute inset-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle
                        cx="50"
                        cy="50"
                        r="48"
                        className="stroke-muted-foreground/30 stroke-[2px] fill-none"
                      />
                    </svg>
                    {hasProgress && (
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full absolute inset-0"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="48"
                          strokeDasharray={301.59}
                          strokeDashoffset={301.59 * (1 - progress)}
                          strokeLinecap="round"
                          className={`stroke-primary stroke-[4px] fill-none transition-all duration-300 ${
                            progress >= 1 ? "stroke-white" : ""
                          }`}
                        />
                      </svg>
                    )}
                  </div>
                  <div className="relative z-10 flex flex-col items-center justify-center text-center text-[10px]">
                    <span className="xl:text-lg 2xl:text-xl font-semibold leading-none">
                      {dayValue}
                    </span>
                    <span
                      className={`xl:text-xs 2xl:text-sm bg-primary/10 border border-muted shadow-sm px-2 py-1 rounded-full mt-1 ${
                        progress >= 1
                          ? "text-white/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground xl:mt-6 2xl:mt-8">
        Today {Math.round(todayProgress * 100)}% of habits completed
      </div>
    </div>
  );
};

export default HabitsCalendar;
