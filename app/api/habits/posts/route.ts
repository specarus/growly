import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { parsePostHabitPayload } from "@/lib/actions/post-habit-actions";
import { requireUserId } from "@/lib/actions/habit-actions";

const getErrorStatus = (message: string) => {
  if (message === "Unauthorized") return 401;
  if (message.includes("Habit")) return 400;
  return 500;
};

export async function GET() {
  try {
    const posts = await prisma.postHabit.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        habit: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return NextResponse.json({ posts });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: getErrorStatus(error.message) }
      );
    }
    return NextResponse.json(
      { error: "Unable to load posts. Try again later." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const payload = await parsePostHabitPayload(
      (await request.json()) as Record<string, unknown>
    );
    const habitBelongsToUser = await prisma.habit.findFirst({
      where: {
        id: payload.habitId,
        userId,
      },
      select: {
        id: true,
      },
    });
    if (!habitBelongsToUser) {
      return NextResponse.json(
        { error: "Cannot post a habit that you do not own." },
        { status: 404 }
      );
    }

    const post = await prisma.postHabit.create({
      data: {
        ...payload,
        userId,
      },
    });

    revalidatePath("/dashboard/habits/popular");

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const status = getErrorStatus(error.message);
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "Unable to create post. Try again later." },
      { status: 500 }
    );
  }
}
