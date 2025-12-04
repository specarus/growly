"use client";

import { useMemo, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";

import Button from "@/app/components/ui/button";
import { formatDayKey, type ProgressByDayMap } from "@/lib/habit-progress";

type HabitLike = {
  id: string;
  name: string;
  cadence?: string | null;
  startDate?: string | Date | null;
  timeOfDay?: string | null;
  description?: string | null;
  goalUnit?: string | null;
  goalAmount?: number | null;
};

type Props = {
  habits: HabitLike[];
  progressByDay: ProgressByDayMap;
};

type CalendarDay = {
  date: Date;
  timed: TimedEvent[];
  floating: HabitLike[];
  progress: number;
};

type TimedEvent = {
  habit: HabitLike;
  minutes: number;
  timeLabel: string;
  position: number;
  height: number;
  colorClass: string;
};

const DAY_START_MINUTES = 5 * 60;
const DAY_END_MINUTES = 23 * 60;
const MINUTES_RANGE = DAY_END_MINUTES - DAY_START_MINUTES;
const TIMELINE_HEIGHT = 640;
const HEADER_HEIGHT = 48;
const FLOATING_HEIGHT = 44;
const TOTAL_HEIGHT = HEADER_HEIGHT + FLOATING_HEIGHT + TIMELINE_HEIGHT;
const MIN_EVENT_HEIGHT = 52;

const colorPalette = [
  "bg-primary/80 text-white border-primary/50",
  "bg-green-soft/80 text-emerald-900 border-green-soft",
  "bg-coral/80 text-white border-coral/70",
  "bg-yellow-soft text-amber-900 border-yellow-soft/60",
  "bg-blue-100 text-blue-900 border-blue-200",
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const parseMinutes = (value?: string | null): number | null => {
  if (!value) {
    return null;
  }
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number.parseInt(hoursRaw ?? "", 10);
  const minutes = Number.parseInt(minutesRaw ?? "", 10);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return hours * 60 + minutes;
};

const startOfDay = (value: Date) => {
  const copy = new Date(value);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const toDate = (value?: string | Date | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfWeek = (anchor: Date) => {
  const date = startOfDay(anchor);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  return date;
};

const addDays = (value: Date, delta: number) => {
  const copy = new Date(value);
  copy.setDate(copy.getDate() + delta);
  return copy;
};

const formatHour = (hour: number) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
  }).format(new Date(2000, 0, 1, hour, 0, 0));

const formatTimeLabel = (minutes: number) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, 0, minutes, 0));

const formatRangeLabel = (start: Date) => {
  const end = addDays(start, 6);
  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endLabel = end.toLocaleDateString("en-US", {
    month: sameYear ? undefined : "short",
    day: "numeric",
  });
  const yearLabel = sameYear
    ? start.getFullYear()
    : `${start.getFullYear()}-${end.getFullYear()}`;
  return `${startLabel} – ${endLabel}, ${yearLabel}`;
};

const shouldShowHabitOnDate = (habit: HabitLike, day: Date) => {
  const start = toDate(habit.startDate);
  const cadence = (habit.cadence ?? "Daily").toLowerCase();
  const target = startOfDay(day);

  if (start) {
    const startDay = startOfDay(start);
    if (target < startDay) {
      return false;
    }
    if (cadence.includes("week")) {
      return target.getDay() === startDay.getDay();
    }
    if (cadence.includes("month")) {
      return target.getDate() === startDay.getDate();
    }
  }

  if (cadence.includes("day")) return true;
  if (cadence.includes("week")) return true;
  if (cadence.includes("month")) return true;
  return true;
};

const describeHabit = (habit: HabitLike) => {
  if (habit.description) {
    return habit.description;
  }
  if (habit.goalAmount !== undefined && habit.goalUnit) {
    return `${habit.goalAmount} ${habit.goalUnit}`;
  }
  return "Scheduled habit";
};

const buildCalendarDay = (
  habits: HabitLike[],
  date: Date,
  progressByDay: ProgressByDayMap
): CalendarDay => {
  const dayKey = formatDayKey(date);
  const dayProgress = clamp(progressByDay[dayKey] ?? 0);

  const matchingHabits = habits.filter((habit) =>
    shouldShowHabitOnDate(habit, date)
  );

  const floating = matchingHabits.filter(
    (habit) => parseMinutes(habit.timeOfDay) === null
  );

  const timed = matchingHabits
    .map((habit, index) => {
      const minutes = parseMinutes(habit.timeOfDay);
      if (minutes === null) return null;
      const offset = minutes - DAY_START_MINUTES;
      const clampedOffset = Math.max(0, Math.min(MINUTES_RANGE, offset));
      const position =
        (clampedOffset / MINUTES_RANGE) * TIMELINE_HEIGHT +
        HEADER_HEIGHT +
        FLOATING_HEIGHT;
      const height = Math.max(
        MIN_EVENT_HEIGHT,
        (60 / MINUTES_RANGE) * TIMELINE_HEIGHT
      );
      const colorClass = colorPalette[index % colorPalette.length];
      const timeLabel = formatTimeLabel(minutes);
      return {
        habit,
        minutes,
        position,
        height,
        timeLabel,
        colorClass,
      };
    })
    .filter(Boolean) as TimedEvent[];

  timed.sort((a, b) => a.minutes - b.minutes);

  return {
    date,
    timed,
    floating,
    progress: dayProgress,
  };
};

const hourMarkers = Array.from({ length: 10 }, (_, index) => {
  const hour = 5 + index * 2;
  const minutes = hour * 60;
  const position =
    ((minutes - DAY_START_MINUTES) / MINUTES_RANGE) * TIMELINE_HEIGHT +
    HEADER_HEIGHT +
    FLOATING_HEIGHT;
  return { hour, position };
});

const HabitsWeekCalendar: React.FC<Props> = ({ habits, progressByDay }) => {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date())
  );

  const weekDays: CalendarDay[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      return buildCalendarDay(habits, date, progressByDay);
    });
  }, [habits, progressByDay, weekStart]);

  const weekRangeLabel = useMemo(
    () => formatRangeLabel(weekStart),
    [weekStart]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Weekly view
          </p>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold text-foreground md:text-lg">
              7-day calendar
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Habits placed by preferred time, similar to a Google Calendar week.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {weekRangeLabel}
          </span>
          <Button
            onClick={() => setWeekStart((prev) => addDays(prev, -7))}
            className="bg-white text-muted-foreground hover:bg-primary/90 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="bg-white text-foreground hover:bg-primary hover:text-white"
          >
            Today
          </Button>
          <Button
            onClick={() => setWeekStart((prev) => addDays(prev, 7))}
            className="bg-white text-muted-foreground hover:bg-primary/90 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className="grid grid-cols-[60px_1fr] gap-3"
        style={{ height: TOTAL_HEIGHT }}
      >
        <div
          className="relative text-[11px] text-muted-foreground"
          style={{ height: "100%" }}
        >
          {hourMarkers.map((marker) => (
            <div
              key={marker.hour}
              className="absolute left-0 right-0 flex items-center gap-1"
              style={{ top: marker.position - 6 }}
            >
              <Clock3 className="h-3 w-3" />
              <span>{formatHour(marker.hour)}</span>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-linear-to-br from-white/90 via-light-yellow/55 to-green-soft/15 shadow-inner">
          <div
            className="grid grid-cols-7 divide-x divide-gray-100"
            style={{ height: "100%" }}
          >
            {weekDays.map((day, dayIndex) => {
              const dateLabel = day.date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const progressPercent = Math.round(day.progress * 100);
              const isToday =
                startOfDay(day.date).getTime() === today.getTime();

              return (
                <div
                  key={dayIndex}
                  className={`relative ${isToday ? "bg-primary/5" : ""}`}
                  title={dateLabel}
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-[54px] border-b px-3 py-2 backdrop-blur-sm ${
                      isToday
                        ? "border-primary/50 bg-primary/10"
                        : "border-gray-100 bg-white/80"
                    }`}
                    style={{ height: HEADER_HEIGHT }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {day.date.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {day.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isToday ? (
                          <span className="rounded-full bg-primary px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
                            Today
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${
                            isToday
                              ? "border-primary/40 bg-white/70 text-primary"
                              : "border-primary/20 bg-primary/5 text-primary"
                          }`}
                        >
                          {progressPercent}% done
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute inset-x-0 px-3"
                    style={{ top: HEADER_HEIGHT, height: FLOATING_HEIGHT }}
                  >
                    <div className="flex flex-wrap gap-1">
                      {day.floating.map((habit) => (
                        <span
                          key={habit.id}
                          className="rounded-full border border-muted bg-white/70 px-2 py-1 text-[11px] font-semibold text-foreground shadow-sm"
                          title={describeHabit(habit)}
                        >
                          {habit.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className="absolute inset-x-0"
                    style={{
                      top: HEADER_HEIGHT + FLOATING_HEIGHT,
                      height: TIMELINE_HEIGHT,
                    }}
                  >
                    <div className="absolute inset-0">
                      {hourMarkers.map((marker) => (
                        <div
                          key={marker.hour}
                          className="absolute inset-x-0 border-t border-dashed border-muted/30"
                          style={{
                            top:
                              marker.position -
                              HEADER_HEIGHT -
                              FLOATING_HEIGHT,
                          }}
                        />
                      ))}
                    </div>
                    <div className="relative h-full">
                      {day.timed.map((event, eventIndex) => {
                        const lane = eventIndex % 2;
                        const leftOffset = 4 + lane * 4;
                        const rightOffset = 4;
                        return (
                          <div
                            key={event.habit.id}
                            className={`absolute rounded-xl border px-3 py-2 shadow-md shadow-primary/10 transition hover:translate-y-[-1px] ${event.colorClass}`}
                            style={{
                              top: event.position - HEADER_HEIGHT - FLOATING_HEIGHT,
                              height: event.height,
                              left: `${leftOffset}%`,
                              right: `${rightOffset}%`,
                            }}
                            title={`${event.timeLabel} — ${describeHabit(
                              event.habit
                            )}`}
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-90">
                              {event.timeLabel}
                            </p>
                            <p className="text-sm font-semibold leading-tight">
                              {event.habit.name}
                            </p>
                            <p className="text-[11px] opacity-80">
                              {describeHabit(event.habit)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitsWeekCalendar;
