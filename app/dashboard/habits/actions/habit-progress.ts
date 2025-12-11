"use client";

import type { ProgressByDayMap } from "@/lib/habit-progress";

export const patchHabitProgress = async (
  habitId: string,
  amount: number
): Promise<{ dailyProgress?: number }> => {
  const response = await fetch(`/api/habits/${habitId}/progress`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

export const resetHabitProgress = async (
  habitId: string
): Promise<{ dailyProgress?: number }> => {
  const response = await fetch(`/api/habits/${habitId}/reset`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

export const fetchMonthlyProgress = async (): Promise<ProgressByDayMap> => {
  const today = new Date();
  const from = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
  ).toISOString();
  const to = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)
  ).toISOString();

  const response = await fetch(
    `/api/habits/daily-progress?from=${from}&to=${to}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = (await response.json()) as {
    progressByDay: ProgressByDayMap;
  };

  return data.progressByDay;
};
