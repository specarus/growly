import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { parseHabitPayload, requireUserId } from "@/lib/actions/habit-actions";

const getErrorStatus = (message: string) => {
  if (message === "Unauthorized") return 401;
  if (message.includes("Habit name")) return 400;
  return 500;
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id } = await params;
  try {
    const userId = await requireUserId();
    const payload = await parseHabitPayload(
      (await request.json()) as Record<string, unknown>
    );
    const habit = await prisma.habit.update({
      where: {
        id_userId: {
          id,
          userId,
        },
      },
      data: payload,
    });
    revalidatePath("/dashboard/habits");
    return NextResponse.json({ habit });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    if (error instanceof Error) {
      const status = getErrorStatus(error.message);
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "Unable to update habit. Try again later." },
      { status: 500 }
    );
  }
}
