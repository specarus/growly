import type { PopularPost } from "./types";
import type { HabitFormState } from "../create/types";

const timeWindowDefaults: Record<PopularPost["timeWindow"], string> = {
  Anytime: "12:00",
  Morning: "07:00",
  Workday: "09:00",
  Evening: "19:00",
};

const normalizeCadenceValue = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("month")) {
    return "Monthly";
  }
  if (normalized.includes("week")) {
    return "Weekly";
  }
  return "Daily";
};

const buildBaseHabitData = (post: PopularPost) => {
  const cadence = normalizeCadenceValue(post.cadence);
  const timeOfDay =
    timeWindowDefaults[post.timeWindow] ?? timeWindowDefaults.Anytime;
  const today = new Date().toISOString().slice(0, 10);

  return {
    name: post.habitName ?? post.title,
    description: post.summary ?? post.highlight ?? "",
    cadence,
    startDate: today,
    timeOfDay,
    reminder: "15 minutes before",
    goalAmount: "1",
    goalUnit: "count",
    goalUnitCategory: "Quantity",
  };
};

export const buildHabitFormStateFromPost = (
  post: PopularPost
): Partial<HabitFormState> => {
  return {
    ...buildBaseHabitData(post),
  };
};

export const buildHabitPayloadFromPost = (post: PopularPost) => {
  return {
    ...buildBaseHabitData(post),
    sourcePopularPostId: post.id,
  };
};
