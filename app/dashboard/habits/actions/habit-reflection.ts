"use client";

import type { HabitReflection } from "../types";

type CreateReflectionPayload = {
  note: string;
  entryDate: string;
};

export const createHabitReflection = async (
  payload: CreateReflectionPayload
): Promise<HabitReflection> => {
  const response = await fetch("/api/habits/reflections", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = (await response.json()) as { reflection: HabitReflection };
  return data.reflection;
};

export const fetchRecentHabitReflections = async (): Promise<
  HabitReflection[]
> => {
  const response = await fetch("/api/habits/reflections");

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = (await response.json()) as {
    reflections: HabitReflection[];
  };

  return data.reflections;
};
