"use client";

import type { ReactNode } from "react";
import type { Habit as PrismaHabit } from "@prisma/client";

import type { ProgressByDayMap } from "@/lib/habit-progress";

export type Habit = Omit<PrismaHabit, "dailyProgress"> & {
  dailyProgress?: number | null;
  streak?: number;
  completion?: number;
};

export type PlaybookItem = {
  title: string;
  detail: string;
  label: "Prevent" | "Rescue" | "Review";
  meta: string;
  icon: "ShieldCheck" | "LifeBuoy" | "CalendarClock";
  accent: string;
};

export type RescueWindow = {
  startHour: number;
  endHour: number;
  label: string;
  sampleSize: number;
  confidence: "low" | "medium" | "high";
};

export type MenuPosition = {
  top: number;
  left: number;
};

export type HabitsBoardProps = {
  habits: Habit[];
  progressByDay: ProgressByDayMap;
};

export type PortalProps = {
  children: ReactNode;
};
