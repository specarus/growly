"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const normalizeGoal = (value: unknown) => {
  const parsed =
    typeof value === "string" || typeof value === "number"
      ? Number.parseInt(String(value), 10)
      : Number.NaN;
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.min(365, Math.max(1, parsed));
};

export const setStreakGoalAction = async (formData: FormData) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const goal = normalizeGoal(formData.get("streakGoalDays"));
  if (!goal) {
    throw new Error("Please provide a valid streak goal between 1 and 365 days.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { streakGoalDays: goal },
  });

  revalidatePath("/account");
  revalidatePath("/dashboard/analytics");

  return { goal };
};
