"use client";

import { useMemo, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";

import Button from "@/app/components/ui/button";
import type { ProgressByDayMap } from "@/lib/habit-progress";
import {
  addDays,
  buildCalendarDay,
  buildColorStyles,
  buildHourMarkers,
  CalendarDay,
  DEFAULT_COLOR_STYLE,
  describeHabit,
  EventColorStyle,
  formatHour,
  formatRangeLabel,
  GRID_TEMPLATE_COLUMNS,
  HabitLike,
  OVERLAP_OFFSET,
  parseMinutes,
  shouldShowHabitOnDate,
  startOfDay,
  startOfWeek,
  TIMELINE_CONTAINER_HEIGHT,
  TIMELINE_HEIGHT,
  TIMELINE_PADDING,
} from "./habits-week-utils";

type Props = {
  habits: HabitLike[];
  progressByDay: ProgressByDayMap;
};

const hourMarkers = buildHourMarkers();

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
                  className="flex flex-col lg:gap-1.5 xl:gap-2 rounded-xl relative z-10"
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
