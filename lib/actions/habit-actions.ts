"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export type UnitCategory = "Quantity" | "Time";

const MAX_TITLE_LENGTH = 80;

export interface HabitPayload {
  name: string;
  description: string | null;
  cadence: "Daily" | "Weekly" | "Monthly";
  startDate: Date;
  timeOfDay: string | null;
  reminder: string | null;
  goalAmount: number;
  goalUnit: string;
  goalUnitCategory: UnitCategory;
  sourcePopularPostId?: string | null;
}

export const requireUserId = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
};

const toOptionalString = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeCadence = (value: unknown): HabitPayload["cadence"] => {
  if (value === "Weekly") return "Weekly";
  if (value === "Monthly") return "Monthly";
  return "Daily";
};

const parseGoalAmount = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 1;
};

const parseGoalUnit = (value: unknown) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return "count";
};

const parseUnitCategory = (value: unknown): UnitCategory =>
  value === "Time" ? "Time" : "Quantity";

const parseStartDate = (value: unknown) => {
  if (typeof value === "string" && value.length > 0) {
    const parsed = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
};

const parseSourcePopularPostId = (value: unknown) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
};

export const parseHabitPayload = async (
  payload: Record<string, unknown>
): Promise<HabitPayload> => {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (!name) {
    throw new Error("Habit name is required.");
  }
  if (name.length > MAX_TITLE_LENGTH) {
    throw new Error("Habit name is too long.");
  }

  return {
    name,
    description: toOptionalString(payload.description),
    cadence: normalizeCadence(payload.cadence),
    startDate: parseStartDate(payload.startDate),
    timeOfDay: toOptionalString(payload.timeOfDay),
    reminder: toOptionalString(payload.reminder),
    goalAmount: parseGoalAmount(payload.goalAmount),
    goalUnit: parseGoalUnit(payload.goalUnit),
    goalUnitCategory: parseUnitCategory(payload.goalUnitCategory),
    sourcePopularPostId: parseSourcePopularPostId(payload.sourcePopularPostId),
  };
};
