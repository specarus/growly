"use server";

import type {
  HabitCategory,
  HabitCommitment,
  HabitTimeWindow,
} from "@prisma/client";

const categoryValues = [
  "Movement",
  "Energy",
  "Focus",
  "Recovery",
  "Mindset",
  "Health",
] as const;
type CategoryValue = (typeof categoryValues)[number];

const commitmentValues = ["Quick", "Standard", "Deep"] as const;
type CommitmentValue = (typeof commitmentValues)[number];

const timeWindowValues = [
  "Anytime",
  "Morning",
  "Workday",
  "Evening",
] as const;
type TimeWindowValue = (typeof timeWindowValues)[number];

const toOptionalString = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const parseMultiLineField = (value: unknown) => {
  if (typeof value !== "string") {
    return [];
  }
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseCategory = (value: unknown): HabitCategory => {
  if (
    typeof value === "string" &&
    (categoryValues as readonly string[]).includes(value)
  ) {
    return value as HabitCategory;
  }
  return "Movement";
};

const parseCommitment = (value: unknown): HabitCommitment => {
  if (
    typeof value === "string" &&
    (commitmentValues as readonly string[]).includes(value)
  ) {
    return value as HabitCommitment;
  }
  return "Standard";
};

const parseTimeWindow = (value: unknown): HabitTimeWindow => {
  if (
    typeof value === "string" &&
    (timeWindowValues as readonly string[]).includes(value)
  ) {
    return value as HabitTimeWindow;
  }
  return "Anytime";
};

export interface PostHabitPayload {
  habitId: string;
  title: string;
  summary: string | null;
  cadence: string;
  anchor: string | null;
  duration: string | null;
  highlight: string | null;
  category: HabitCategory;
  timeWindow: HabitTimeWindow;
  commitment: HabitCommitment;
  benefits: string[];
  steps: string[];
  guardrails: string[];
}

export const parsePostHabitPayload = async (
  payload: Record<string, unknown>
): Promise<PostHabitPayload> => {
  const habitId =
    typeof payload.habitId === "string" && payload.habitId.trim().length > 0
      ? payload.habitId.trim()
      : "";
  if (!habitId) {
    throw new Error("Habit selection is required to create a post.");
  }

  const title =
    typeof payload.title === "string" ? payload.title.trim() : "";
  if (!title) {
    throw new Error("Post title is required.");
  }

  const cadence =
    typeof payload.cadence === "string" && payload.cadence.trim().length > 0
      ? payload.cadence.trim()
      : "Daily";

  return {
    habitId,
    title,
    summary: toOptionalString(payload.summary),
    cadence,
    anchor: toOptionalString(payload.anchor),
    duration: toOptionalString(payload.duration),
    highlight: toOptionalString(payload.highlight),
    category: parseCategory(payload.category),
    timeWindow: parseTimeWindow(payload.timeWindow),
    commitment: parseCommitment(payload.commitment),
    benefits: parseMultiLineField(payload.benefits),
    steps: parseMultiLineField(payload.steps),
    guardrails: parseMultiLineField(payload.guardrails),
  };
};
