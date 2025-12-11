import { formatDayKey, type ProgressByDayMap } from "@/lib/habit-progress";

export type HabitLike = {
  id: string;
  name: string;
  cadence?: string | null;
  startDate?: string | Date | null;
  timeOfDay?: string | null;
  description?: string | null;
  goalUnit?: string | null;
  goalAmount?: number | null;
};

export type EventColorStyle = {
  backgroundColor: string;
  borderColor: string;
  color: string;
};

export type TimedEvent = {
  habit: HabitLike;
  minutes: number;
  timeLabel: string;
  position: number;
  stackIndex: number;
  groupStart: number;
  groupKey: string;
  colorStyle: EventColorStyle;
};

export type CalendarDay = {
  date: Date;
  timed: TimedEvent[];
  floating: HabitLike[];
  progress: number;
};

export const DAY_START_MINUTES = 5 * 60;
export const DAY_END_MINUTES = 23 * 60;
export const MINUTES_RANGE = DAY_END_MINUTES - DAY_START_MINUTES;
export const HOURS_RANGE = MINUTES_RANGE / 60;
export const HOUR_HEIGHT = 56;
export const TIMELINE_HEIGHT = HOURS_RANGE * HOUR_HEIGHT;
export const GRID_TEMPLATE_COLUMNS = "60px repeat(7, 1fr)";
export const HEADER_HEIGHT = 48;
export const FLOATING_HEIGHT = 44;
export const TIMELINE_PADDING = 20;
export const SCROLL_CUTOFF_HOUR = 14;
export const SCROLL_VIEW_HEIGHT =
  HEADER_HEIGHT +
  FLOATING_HEIGHT +
  (Math.min(
    Math.max(SCROLL_CUTOFF_HOUR * 60 - DAY_START_MINUTES, 0),
    MINUTES_RANGE
  ) /
    MINUTES_RANGE) *
    TIMELINE_HEIGHT;
export const TIMELINE_CONTAINER_HEIGHT = SCROLL_VIEW_HEIGHT + TIMELINE_PADDING * 2;
export const TIMELINE_SCROLL_HEIGHT = Math.max(
  SCROLL_VIEW_HEIGHT - HEADER_HEIGHT - FLOATING_HEIGHT,
  0
);
export const EVENT_DURATION_MINUTES = 60;
export const OVERLAP_OFFSET = 8;

export const DEFAULT_COLOR_STYLE: EventColorStyle = {
  backgroundColor: "hsl(var(--primary) / 0.85)",
  borderColor: "hsl(var(--primary) / 0.5)",
  color: "hsl(var(--primary-foreground))",
};

export const buildColorStyles = (count: number): EventColorStyle[] => {
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

export const colorForHabit = (
  habitId: string,
  colorsByHabit: Map<string, EventColorStyle>
) => {
  return colorsByHabit.get(habitId) ?? DEFAULT_COLOR_STYLE;
};

export const clamp = (value: number) => Math.max(0, Math.min(1, value));

export const parseMinutes = (value?: string | null): number | null => {
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

export const startOfDay = (value: Date) => {
  const copy = new Date(value);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const toDate = (value?: string | Date | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const startOfWeek = (anchor: Date) => {
  const date = startOfDay(anchor);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  return date;
};

export const addDays = (value: Date, delta: number) => {
  const copy = new Date(value);
  copy.setDate(copy.getDate() + delta);
  return copy;
};

export const formatHour = (hour: number) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
  }).format(new Date(2000, 0, 1, hour, 0, 0));

export const formatTimeLabel = (minutes: number) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, 0, minutes, 0));

export const formatRangeLabel = (start: Date) => {
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

export const shouldShowHabitOnDate = (habit: HabitLike, day: Date) => {
  const start = toDate(habit.startDate);
  const cadence = (habit.cadence ?? "").toLowerCase();
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

  if (!cadence.trim()) return true; // unknown cadence? show it.
  if (cadence.includes("day")) return true;
  if (cadence.includes("daily")) return true;
  if (cadence.includes("week")) return true; // no anchor day? show across the week.
  if (cadence.includes("month")) return true; // no anchor date? show across the month.
  return true; // default to visible so habits are not hidden due to wording.
};

export const describeHabit = (habit: HabitLike) => {
  if (habit.description) {
    return habit.description;
  }
  if (habit.goalAmount !== undefined && habit.goalUnit) {
    return `${habit.goalAmount} ${habit.goalUnit}`;
  }
  return "Scheduled habit";
};

export const buildCalendarDay = (
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
    .map((habit) => {
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

export const buildHourMarkers = () =>
  Array.from(
    { length: DAY_END_MINUTES / 60 - DAY_START_MINUTES / 60 + 1 },
    (_, index) => {
      const hour = DAY_START_MINUTES / 60 + index;
      const minutes = hour * 60;
      const offset =
        ((minutes - DAY_START_MINUTES) / MINUTES_RANGE) * TIMELINE_HEIGHT;
      return { hour, offset };
    }
  );
