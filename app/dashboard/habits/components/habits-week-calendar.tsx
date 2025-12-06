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
  stackIndex: number;
  groupStart: number;
  groupKey: string;
  colorStyle: EventColorStyle;
};

const DAY_START_MINUTES = 5 * 60;
const DAY_END_MINUTES = 23 * 60;
const MINUTES_RANGE = DAY_END_MINUTES - DAY_START_MINUTES;
const HOURS_RANGE = MINUTES_RANGE / 60;
const HOUR_HEIGHT = 56;
const TIMELINE_HEIGHT = HOURS_RANGE * HOUR_HEIGHT;
const GRID_TEMPLATE_COLUMNS = "60px repeat(7, 1fr)";
const HEADER_HEIGHT = 48;
const FLOATING_HEIGHT = 44;
const TIMELINE_PADDING = 20;
const SCROLL_CUTOFF_HOUR = 14;
const SCROLL_VIEW_HEIGHT =
  HEADER_HEIGHT +
  FLOATING_HEIGHT +
  (Math.min(
    Math.max(SCROLL_CUTOFF_HOUR * 60 - DAY_START_MINUTES, 0),
    MINUTES_RANGE
  ) /
    MINUTES_RANGE) *
    TIMELINE_HEIGHT;
const TIMELINE_CONTAINER_HEIGHT = SCROLL_VIEW_HEIGHT + TIMELINE_PADDING * 2;
const TIMELINE_SCROLL_HEIGHT = Math.max(
  SCROLL_VIEW_HEIGHT - HEADER_HEIGHT - FLOATING_HEIGHT,
  0
);
const EVENT_DURATION_MINUTES = 60;
const OVERLAP_OFFSET = 8;

type EventColorStyle = {
  backgroundColor: string;
  borderColor: string;
  color: string;
};

const DEFAULT_COLOR_STYLE: EventColorStyle = {
  backgroundColor: "hsl(var(--primary) / 0.85)",
  borderColor: "hsl(var(--primary) / 0.5)",
  color: "hsl(var(--primary-foreground))",
};

const buildColorStyles = (count: number): EventColorStyle[] => {
  if (count <= 0) return [];
  const styles: EventColorStyle[] = [];
  const goldenAngle = 137.508; // spreads hues evenly
  for (let index = 0; index < count; index += 1) {
    const hue = (index * goldenAngle) % 360;
    styles.push({
      backgroundColor: `hsl(${hue} 70% 72%)`,
      borderColor: `hsl(${hue} 65% 58%)`,
      color: `hsl(${hue} 32% 18%)`,
    });
  }
  return styles;
};

const colorForHabit = (
  habitId: string,
  colorsByHabit: Map<string, EventColorStyle>
) => {
  return colorsByHabit.get(habitId) ?? DEFAULT_COLOR_STYLE;
};

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
  return `${startLabel} - ${endLabel}, ${yearLabel}`;
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
  progressByDay: ProgressByDayMap,
  colorsByHabit: Map<string, EventColorStyle>
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
      const position = (clampedOffset / MINUTES_RANGE) * TIMELINE_HEIGHT;
      const colorStyle = colorForHabit(habit.id, colorsByHabit);
      const timeLabel = formatTimeLabel(minutes);
      return {
        habit,
        minutes,
        position,
        timeLabel,
        stackIndex: 0,
        colorStyle,
      };
    })
    .filter(Boolean) as TimedEvent[];

  timed.sort((a, b) => a.minutes - b.minutes);

  let groupStart = -Infinity;
  let groupIndex = -1;
  const timedWithStacks = timed.map((event) => {
    if (event.minutes - groupStart >= EVENT_DURATION_MINUTES) {
      groupStart = event.minutes;
      groupIndex = 0;
    } else {
      groupIndex += 1;
    }
    const groupKey = `${dayKey}-${groupStart}`;
    return { ...event, stackIndex: groupIndex, groupStart, groupKey };
  });

  return {
    date,
    timed: timedWithStacks,
    floating,
    progress: dayProgress,
  };
};

const hourMarkers = Array.from(
  { length: DAY_END_MINUTES / 60 - DAY_START_MINUTES / 60 + 1 },
  (_, index) => {
    const hour = DAY_START_MINUTES / 60 + index;
    const minutes = hour * 60;
    const offset =
      ((minutes - DAY_START_MINUTES) / MINUTES_RANGE) * TIMELINE_HEIGHT;
    return { hour, offset };
  }
);

const HabitsWeekCalendar: React.FC<Props> = ({ habits, progressByDay }) => {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date())
  );
  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  const timedHabitIdsThisWeek = useMemo(() => {
    const ids = new Set<string>();
    const anchor = startOfWeek(weekStart);
    const daysThisWeek = Array.from({ length: 7 }, (_, index) =>
      addDays(anchor, index)
    );
    daysThisWeek.forEach((day) => {
      habits.forEach((habit) => {
        if (
          shouldShowHabitOnDate(habit, day) &&
          parseMinutes(habit.timeOfDay) !== null
        ) {
          ids.add(habit.id);
        }
      });
    });
    return Array.from(ids).sort();
  }, [habits, weekStart]);

  const colorsByHabit = useMemo(() => {
    const styles = buildColorStyles(timedHabitIdsThisWeek.length);
    const map = new Map<string, EventColorStyle>();
    timedHabitIdsThisWeek.forEach((habitId, index) => {
      map.set(habitId, styles[index] ?? DEFAULT_COLOR_STYLE);
    });
    return map;
  }, [timedHabitIdsThisWeek]);

  const weekDays: CalendarDay[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      return buildCalendarDay(habits, date, progressByDay, colorsByHabit);
    });
  }, [colorsByHabit, habits, progressByDay, weekStart]);

  const weekRangeLabel = useMemo(
    () => formatRangeLabel(weekStart),
    [weekStart]
  );

  return (
    <div className="lg:space-y-3 xl:space-y-4">
      <div className="flex lg:gap-2 xl:gap-3 items-center justify-between">
        <div className="space-y-1">
          <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Weekly view
          </p>
          <div className="flex items-center lg:gap-1.5 xl:gap-2">
            <CalendarClock className="lg:h-3 lg:w-3 xl:h-4 xl:w-4 text-primary" />
            <h3 className="lg:text-sm xl:text-base 2xl:text-lg font-semibold text-foreground">
              7-day calendar
            </h3>
          </div>
          <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
            Habits placed by preferred time, similar to a Google Calendar week.
          </p>
        </div>
        <div className="flex items-center lg:gap-8 xl:gap-10">
          <span className="lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
            {weekRangeLabel}
          </span>
          <div className="flex flex-col items-center lg:gap-1.5 xl:gap-2">
            <Button
              onClick={() => setWeekStart((prev) => addDays(prev, -7))}
              className="bg-white text-muted-foreground hover:bg-primary/90 hover:text-white lg:py-0.5 xl:py-1"
            >
              <ChevronLeft className="lg:h-3 lg:w-3 xl:h-4 xl:w-4" />
            </Button>
            <Button
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="bg-white text-foreground hover:bg-primary hover:text-white lg:text-[10px] xl:text-xs 2xl:text-sm lg:px-2 xl:px-3 lg:py-0.5 xl:py-1"
            >
              Today
            </Button>
            <Button
              onClick={() => setWeekStart((prev) => addDays(prev, 7))}
              className="bg-white text-muted-foreground hover:bg-primary/90 hover:text-white py-1"
            >
              <ChevronRight className="lg:h-3 lg:w-3 xl:h-4 xl:w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative lg:rounded-2xl xl:rounded-3xl border border-gray-100 bg-white shadow-inner overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 shadow-inner bg-linear-to-br from-amber-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-900/40 opacity-95"
        />
        <div className="relative">
          <div
            className="grid gap-0 border-b border-gray-100 lg:p-3 xl:p-4 bg-white/90 backdrop-blur-sm"
            style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
          >
            <div className="lg:text-[9px] xl:text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground flex items-end">
              Time
            </div>
            {weekDays.map((day, dayIndex) => {
              const dateLabel = day.date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              return (
                <div
                  key={dayIndex}
                  className={`flex flex-col lg:gap-1.5 xl:gap-2 rounded-xl relative z-10`}
                  title={dateLabel}
                >
                  <div className="flex flex-col">
                    <span
                      className={`${
                        startOfDay(day.date).getTime() === today.getTime()
                          ? "text-primary"
                          : ""
                      } lg:text-[9px] xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground`}
                    >
                      {day.date.toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </span>
                    <span className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold text-foreground">
                      {day.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {day.floating.map((habit) => (
                      <span
                        key={habit.id}
                        className="rounded-full border border-muted bg-white/70 lg:px-1 xl:px-2 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[10px] 2xl:text-[11px] font-semibold text-foreground shadow-sm"
                        title={describeHabit(habit)}
                      >
                        {habit.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            className="relative overflow-y-auto"
            style={{
              height: TIMELINE_CONTAINER_HEIGHT,
              maxHeight: "70vh",
              scrollbarGutter: "stable",
            }}
          >
            <div
              className="relative lg:px-3 xl:px-4"
              style={{
                paddingTop: TIMELINE_PADDING,
                paddingBottom: TIMELINE_PADDING,
              }}
            >
              <div
                className="grid gap-0 relative"
                style={{
                  gridTemplateColumns: GRID_TEMPLATE_COLUMNS,
                  height: TIMELINE_HEIGHT,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 grid gap-0"
                  style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
                >
                  <div className="border-r border-dashed border-gray-100" />
                  {weekDays.map((_, index) => (
                    <div
                      key={index}
                      className={`border-r border-dashed border-gray-100 ${
                        index === weekDays.length - 1 ? "border-r-0" : ""
                      } `}
                    />
                  ))}
                </div>
                <div className="relative lg:text-[9px] xl:text-[11px] text-muted-foreground">
                  {hourMarkers.map((marker) => (
                    <div
                      key={marker.hour}
                      className="absolute left-0 right-0 flex items-center gap-1"
                      style={{ top: marker.offset - 6 }}
                    >
                      <Clock3 className="lg:h-2 lg:w-2 xl:h-3 xl:w-3" />
                      <span>{formatHour(marker.hour)}</span>
                    </div>
                  ))}
                </div>

                {weekDays.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`relative h-full ${
                      startOfDay(day.date).getTime() === today.getTime()
                        ? "bg-primary/10"
                        : ""
                    }`}
                    style={{ gridColumnStart: dayIndex + 2 }}
                  >
                    <div className="absolute inset-0">
                      {hourMarkers.map((marker) => (
                        <div
                          key={marker.hour}
                          className="absolute inset-x-0 border-t border-dashed border-gray-100"
                          style={{ top: marker.offset }}
                        />
                      ))}
                    </div>
                    <div
                      className="relative"
                      style={{ height: TIMELINE_HEIGHT }}
                    >
                      {day.timed.map((event) => {
                        const leftOffset = 6;
                        const rightOffset = 6;
                        const isHoveredGroup =
                          hoveredGroupKey === event.groupKey;
                        const isHoveredEvent =
                          hoveredEventId === event.habit.id;
                        const isOtherInGroup =
                          isHoveredGroup && !isHoveredEvent;
                        const top =
                          event.position + event.stackIndex * OVERLAP_OFFSET;
                        return (
                          <div
                            key={event.habit.id}
                            className={`absolute rounded-xl cursor-default border lg:px-2 lg:py-0.5 xl:py-1 transition-opacity duration-200 ease-out ${
                              isOtherInGroup
                                ? "opacity-0 pointer-events-none"
                                : ""
                            }`}
                            style={{
                              top,
                              left: `${leftOffset}%`,
                              right: `${rightOffset}%`,
                              backgroundColor: event.colorStyle.backgroundColor,
                              borderColor: event.colorStyle.borderColor,
                              color: event.colorStyle.color,
                            }}
                            title={`${event.timeLabel} - ${describeHabit(
                              event.habit
                            )}`}
                            onMouseEnter={() => {
                              setHoveredGroupKey(event.groupKey);
                              setHoveredEventId(event.habit.id);
                            }}
                            onMouseLeave={() => {
                              setHoveredGroupKey(null);
                              setHoveredEventId(null);
                            }}
                          >
                            <p className="lg:text-[9px] xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.2em] opacity-90">
                              {event.timeLabel}
                            </p>
                            <p className="lg:text-[10px] xl:text-xs 2xl:text-sm font-semibold leading-tight">
                              {event.habit.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitsWeekCalendar;
