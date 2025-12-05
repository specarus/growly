"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ClipboardCheck } from "lucide-react";
import Button from "@/app/components/ui/button";
import {
  buildDayKey,
  formatDayKey,
  ProgressByDayMap,
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

const getDaysInMonth = (year: number, monthIndex: number): number => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, monthIndex: number): number => {
  return new Date(year, monthIndex, 1).getDay();
};

const getMonthName = (monthIndex: number): string => {
  return new Date(2000, monthIndex).toLocaleString("en-US", { month: "long" });
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

interface CalendarWidgetProps {
  progressByDay: ProgressByDayMap;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ progressByDay }) => {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const numDaysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const getDayProgress = (day: number) => {
    const key = buildDayKey(currentYear, currentMonth, day);
    return clamp(progressByDay[key] ?? 0);
  };

  const days: DayData[] = Array.from(
    { length: numDaysInMonth },
    (_, index) => ({
      day: index + 1,
      progress: getDayProgress(index + 1),
    })
  );

  const paddedDays: (DayData | null)[] = [
    ...Array(firstDayIndex).fill(null),
    ...days,
  ];

  const dayWeeks: Week[] = chunkArray(paddedDays, 7);

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
    <div className="border-none shadow-none xl:min-h-80 2xl:min-h-96">
      <div className="flex items-center justify-between xl:mb-2 2xl:mb-4">
        <h3 className="font-semibold xl:text-lg 2xl:text-xl text-foreground">
          {getMonthName(currentMonth)}, {currentYear}
        </h3>
        <div className="flex gap-3 xl:gap-1 2xl:gap-2 items-center">
          <Button
            onClick={handlePreviousMonth}
            className="text-muted-foreground hover:text-white bg-white hover:bg-primary/90 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7"
          >
            <ChevronLeft className="xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4" />
          </Button>
          <Button
            onClick={handleNextMonth}
            className="text-muted-foreground hover:text-white bg-white hover:bg-primary/90 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7"
          >
            <ChevronRight className="xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="text-center xl:text-xs 2xl:text-sm font-medium text-muted-foreground"
          >
            {dayName}
          </div>
        ))}
      </div>

      {dayWeeks.map((week, weekIndex) => (
        <div
          key={weekIndex}
          className={`grid grid-cols-7 xl:gap-1.5 2xl:gap-2 ${
            weekIndex < dayWeeks.length - 1 ? "xl:mb-2 2xl:mb-3" : ""
          }`}
        >
          {week.map((dayObj, dayIndex) => {
            if (dayObj === null) {
              return <div key={`pad-${weekIndex}-${dayIndex}`} />;
            }

            const { day, progress } = dayObj;
            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();

            return (
              <div
                key={day}
                className={`${
                  progress === 1
                    ? "text-white bg-primary"
                    : isToday
                      ? "text-primary"
                      : ""
                } relative xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 grid place-items-center xl:text-xs 2xl:text-sm rounded-full`}
                title={`${getMonthName(currentMonth)} ${day} - ${Math.round(
                  progress * 100
                )}% of habits completed`}
              >
                {day}
                <svg
                  className="absolute w-full h-full inset-0"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    strokeDasharray={300}
                    strokeDashoffset={0}
                    className="stroke-muted-foreground/30 stroke-[2px] fill-none"
                  />
                </svg>

                <svg
                  className="absolute w-full h-full inset-0"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    strokeDasharray={300}
                    strokeDashoffset={300 * (1 - progress)}
                    className="stroke-primary stroke-[4px] fill-none transition-all duration-300"
                  />
                </svg>
              </div>
            );
          })}
        </div>
      ))}

      <div className="flex items-center xl:gap-1 2xl:gap-2 xl:mt-2 2xl:mt-3 xl:text-xs 2xl:text-sm text-emerald-500 font-medium">
        <ClipboardCheck className="xl:w-3 xl:h-3 2xl:w-4 2xl:h-4" />
        <p>Today {Math.round(todayProgress * 100)}% of habits completed</p>
      </div>
    </div>
  );
};

export default CalendarWidget;
