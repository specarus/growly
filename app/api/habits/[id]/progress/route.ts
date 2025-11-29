import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/habit-actions";

const parseAmount = (value: unknown) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }
  return numeric;
};

const getErrorStatus = (message: string) => {
  if (message === "Unauthorized") return 401;
  if (message.includes("Habit")) return 400;
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
    const payload = (await request.json()) as { amount?: unknown };
    const amount = parseAmount(payload.amount);
    if (amount === null) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const habit = await prisma.habit.update({
      where: {
        id_userId: {
          id,
          userId,
        },
      },
      data: {
        dailyProgress: {
          increment: amount,
        },
      },
      select: {
        id: true,
        dailyProgress: true,
      },
    });

    revalidatePath("/dashboard/habits");

    return NextResponse.json({ dailyProgress: habit.dailyProgress });
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
      { error: "Unable to update habit progress. Try again later." },
      { status: 500 }
    );
  }
}
