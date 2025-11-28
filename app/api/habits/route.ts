import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { parseHabitPayload, requireUserId } from "@/lib/actions/habit-actions";

const getErrorStatus = (message: string) => {
  if (message === "Unauthorized") return 401;
  if (message.includes("Habit name")) return 400;
  return 500;
};

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const payload = await parseHabitPayload(
      (await request.json()) as Record<string, unknown>
    );
    const habit = await prisma.habit.create({
      data: {
        ...payload,
        userId,
      },
    });
    revalidatePath("/dashboard/habits");
    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const status = getErrorStatus(error.message);
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "Unable to create habit. Try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const userId = await requireUserId();
    const habits = await prisma.habit.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        cadence: true,
        timeOfDay: true,
      },
    });

    return NextResponse.json({ habits });
  } catch (error) {
    if (error instanceof Error) {
      const status = getErrorStatus(error.message);
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "Unable to load habits. Try again later." },
      { status: 500 }
    );
  }
}
