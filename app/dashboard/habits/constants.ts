"use client";

import { CalendarClock, LifeBuoy, ShieldCheck } from "lucide-react";

import type { PlaybookItem } from "./types";

export const MENU_DEFAULT_WIDTH = 192;
export const MENU_MIN_WIDTH = 160;
export const MENU_VIEWPORT_GUTTER = 16;

export const streakDefensePlaybook: PlaybookItem[] = [
  {
    title: "Anchor a reliable cue",
    detail:
      "Pair the habit with a fixed trigger so you start automatically and avoid the drift that breaks streaks.",
    label: "Prevent",
    meta: "Before start",
    icon: "ShieldCheck",
    accent: "text-green-soft bg-green-soft/20",
  },
  {
    title: "Rescue with the smallest win",
    detail:
      "If you miss a session, do a short reset or partial rep to keep the streak intact and rebuild momentum.",
    label: "Rescue",
    meta: "If you slip",
    icon: "LifeBuoy",
    accent: "text-coral bg-coral/20",
  },
  {
    title: "Review and adjust weekly",
    detail:
      "Reflect on what worked, tweak anchors, and plan the next week with realistic cues so streaks stay protected.",
    label: "Review",
    meta: "Weekly reset",
    icon: "CalendarClock",
    accent: "text-primary bg-primary/20",
  },
];

export const iconMap = {
  ShieldCheck,
  LifeBuoy,
  CalendarClock,
};
