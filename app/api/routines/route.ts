import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/habit-actions";

type RoutinePayload = {
  id: string;
  habitIds: string[];
};

const parseRoutinePayloads = (value: unknown): RoutinePayload[] => {
  if (!value || !Array.isArray(value)) {
    return [];
  }

  const routines: RoutinePayload[] = [];

  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const entry = item as Record<string, unknown>;
    const id = typeof entry.id === "string" ? entry.id : "";
    if (!id) {
      continue;
    }
    const rawHabitIds = Array.isArray(entry.habitIds) ? entry.habitIds : [];
    const habitIds = rawHabitIds
      .map((habitId) => (typeof habitId === "string" ? habitId : ""))
      .filter((habitId) => habitId.length > 0);
    routines.push({ id, habitIds });
  }

  return routines;
};

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const payload = parseRoutinePayloads(body?.routines);

    const userRoutines = await prisma.routine.findMany({
      where: { userId },
    });
    const routineIds = userRoutines.map((routine) => routine.id);

    const habitIdsFromPayload = new Set<string>();
    for (const routine of payload) {
      for (const habitId of routine.habitIds) {
        habitIdsFromPayload.add(habitId);
      }
    }

    const validHabits = await prisma.habit.findMany({
      where: {
        userId,
        id: { in: Array.from(habitIdsFromPayload) },
      },
      select: { id: true },
    });
    const allowedHabitIds = new Set(validHabits.map((habit) => habit.id));

    const entries: { routineId: string; habitId: string; position: number }[] =
      [];
    const assignedHabitIds = new Set<string>();

    for (const routine of payload) {
      if (!routineIds.includes(routine.id)) {
        continue;
      }
      routine.habitIds.forEach((habitId, index) => {
        if (!allowedHabitIds.has(habitId)) {
          return;
        }
        if (assignedHabitIds.has(habitId)) {
          return;
        }
        assignedHabitIds.add(habitId);
        entries.push({
          routineId: routine.id,
          habitId,
          position: index,
        });
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.routineHabit.deleteMany({
        where: { routineId: { in: routineIds } },
      });
      if (entries.length > 0) {
        await tx.routineHabit.createMany({
          data: entries,
          skipDuplicates: true,
        });
      }
    });

    revalidatePath("/dashboard/habits/routines");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unable to update routines", error);
    return NextResponse.json(
      { error: "Unable to update routines" },
      { status: 400 }
    );
  }
}
