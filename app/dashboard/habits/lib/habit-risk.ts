"use client";

import type { HabitRiskLevel } from "../types";
import { normalizeGoal } from "./habits-board-utils";

export type { HabitRiskLevel } from "../types";

export type HabitRisk = {
  score: number;
  level: HabitRiskLevel;
  reasons: string[];
  adjustedGoal: number;
  goalDelta: number;
  suggestedLogAmount: number;
  label: string;
};

export type HabitRiskInput = {
  streak?: number | null;
  completion?: number | null; // 0-100
  averageCompletion?: number | null; // 0-100
  successRate?: number | null; // 0-100
  goalAmount?: number | null;
  loggedAmount?: number | null;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const toPercent = (value?: number | null, fallback: null): number | null;
const toPercent = (value?: number | null, fallback?: number): number;
const toPercent = (value?: number | null, fallback: number | null = 0) => {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(100, value));
};

export const calculateHabitRisk = (input: HabitRiskInput): HabitRisk => {
  const streak = Math.max(0, input.streak ?? 0);
  const completion =
    toPercent(input.completion, null) ??
    toPercent(input.averageCompletion, null) ??
    0;
  const successRate = toPercent(input.successRate, completion);
  const goalAmount = normalizeGoal(input.goalAmount);
  const loggedAmount = Math.max(0, input.loggedAmount ?? 0);

  let score = 0.4; // start neutral (medium)
  const reasons: string[] = [];

  if (successRate >= 85) {
    score -= 0.2;
    reasons.push("High consistency lately");
  } else if (successRate <= 60) {
    score += 0.2;
    reasons.push("Recent consistency is slipping");
  }

  if (completion >= 90) {
    score -= 0.15;
    reasons.push("Today looks on-track");
  } else if (completion <= 60) {
    score += 0.12;
    reasons.push("Today is trending below target");
  }

  if (streak >= 10) {
    score -= 0.1;
    reasons.push("Long streak momentum");
  } else if (streak <= 3) {
    score += 0.1;
    reasons.push("New/fragile streak");
  }

  const remainingRatio = goalAmount > 0 ? loggedAmount / goalAmount : 0;
  if (remainingRatio < 0.45) {
    score += 0.08;
    reasons.push("Less than half logged for the day");
  } else if (remainingRatio >= 1) {
    score -= 0.1;
    reasons.push("Goal already met today");
  }

  score = clamp01(score);

  const level: HabitRiskLevel =
    score >= 0.66 ? "high" : score >= 0.33 ? "medium" : "low";

  const adjustment =
    level === "high" ? -0.25 : level === "medium" ? -0.12 : 0.08;

  const adjustedGoal = Math.max(
    0.25,
    Math.round(goalAmount * (1 + adjustment) * 10) / 10
  );
  const goalDelta = Math.round((adjustedGoal - goalAmount) * 10) / 10;

  const remaining = Math.max(adjustedGoal - loggedAmount, 0);
  const suggestedLogAmount = Math.max(
    0.1,
    Math.round(
      (remaining > 0 ? remaining : adjustedGoal * 0.5 > 0 ? adjustedGoal * 0.5 : adjustedGoal) *
        10
    ) / 10
  );

  return {
    score,
    level,
    reasons,
    adjustedGoal,
    goalDelta,
    suggestedLogAmount,
    label:
      level === "high"
        ? "High streak risk"
        : level === "medium"
        ? "Moderate streak risk"
        : "Low streak risk",
  };
};
