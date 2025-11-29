import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/habit-actions";
import { getUtcDayStart } from "@/lib/habit-progress";

const getErrorStatus = (message: string) => {
  if (message === "Unauthorized") return 401;
  if (message.includes("Habit")) return 400;
  return 500;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id } = await params;

  try {
    const userId = await requireUserId();

    const progressDate = getUtcDayStart(new Date());

    await prisma.habitDailyProgress.upsert({
      where: {
        habitId_date: {
          habitId: id,
          date: progressDate,
        },
      },
      update: {
        progress: 0,
      },
      create: {
        habitId: id,
        date: progressDate,
        progress: 0,
      },
    });

    await prisma.habit.update({
      where: {
        id_userId: {
          id,
          userId,
        },
      },
      data: {
        dailyProgress: 0,
      },
    });

    revalidatePath("/dashboard/habits");
    revalidatePath("/dashboard");

    return NextResponse.json({ dailyProgress: 0 });
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
      { error: "Unable to reset habit progress. Try again later." },
      { status: 500 }
    );
  }
}
