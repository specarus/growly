import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/habit-actions";

const getErrorStatus = (message: string) => {
  if (message === "Unauthorized") return 401;
  if (message.includes("Routine")) return 400;
  return 500;
};

const MAX_TITLE_LENGTH = 80;

const toOptionalString = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

type UpdateRoutinePayload = {
  name: string;
  anchor: string | null;
  notes: string | null;
  habitIds: string[];
};

const parseUpdateRoutinePayload = (value: unknown): UpdateRoutinePayload => {
  const entry =
    typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  if (!name) {
    throw new Error("Routine name is required.");
  }
  if (name.length > MAX_TITLE_LENGTH) {
    throw new Error("Routine name is too long.");
  }
  const rawHabitIds = Array.isArray(entry.habitIds) ? entry.habitIds : [];
  const habitIds = rawHabitIds
    .map((habitId) => (typeof habitId === "string" ? habitId : ""))
    .filter((habitId) => habitId.length > 0);
  return {
    name,
    anchor: toOptionalString(entry.anchor),
    notes: toOptionalString(entry.notes),
    habitIds,
  };
};

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id } = await params;
  try {
    const userId = await requireUserId();
    const deleted = await prisma.routine.deleteMany({
      where: {
        id,
        userId,
      },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }
    revalidatePath("/dashboard/habits/routines");
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }
    if (error instanceof Error) {
      const status = getErrorStatus(error.message);
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "Unable to delete routine. Try again later." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id } = await params;
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const payload = parseUpdateRoutinePayload(body);

    const routine = await prisma.routine.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!routine || routine.userId !== userId) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    const uniqueHabitIds = Array.from(new Set(payload.habitIds));
    const validHabits =
      uniqueHabitIds.length > 0
        ? await prisma.habit.findMany({
            where: {
              userId,
              id: { in: uniqueHabitIds },
            },
            select: { id: true },
          })
        : [];
    const allowedHabitIds = new Set(validHabits.map((habit) => habit.id));

    const filteredHabitIds: string[] = [];
    const seen = new Set<string>();
    for (const habitId of payload.habitIds) {
      if (seen.has(habitId)) {
        continue;
      }
      seen.add(habitId);
      if (allowedHabitIds.has(habitId)) {
        filteredHabitIds.push(habitId);
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.routineHabit.deleteMany({ where: { routineId: id } });
      if (filteredHabitIds.length > 0) {
        const entries = filteredHabitIds.map((habitId, index) => ({
          routineId: id,
          habitId,
          position: index,
        }));
        await tx.routineHabit.createMany({
          data: entries,
          skipDuplicates: true,
        });
      }
      await tx.routine.update({
        where: { id },
        data: {
          name: payload.name,
          anchor: payload.anchor,
          notes: payload.notes,
        },
      });
    });

    revalidatePath("/dashboard/habits/routines");
    revalidatePath(`/dashboard/habits/routines/${id}/edit`);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }
    if (error instanceof Error) {
      const status = getErrorStatus(error.message);
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "Unable to update routine. Try again later." },
      { status: 500 }
    );
  }
}
