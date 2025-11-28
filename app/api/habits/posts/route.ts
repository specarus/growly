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
    const userId = await requireUserId();
    const [posts, liked] = await Promise.all([
      prisma.postHabit.findMany({
        orderBy: [
          { likesCount: "desc" },
          { createdAt: "desc" },
        ],
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
      }),
      prisma.postHabitLike.findMany({
        where: { userId },
        select: { postHabitId: true },
      }),
    ]);
    const likedSet = new Set(liked.map((entry) => entry.postHabitId));
    const normalized = posts.map((post) => {
      const { user, habit, ...rest } = post;
      return {
        ...rest,
        userName: user?.name ?? null,
        habitName: habit?.name ?? null,
        likesCount: post.likesCount,
        likedByCurrentUser: likedSet.has(post.id),
        isCommunityPost: true,
      };
    });
    return NextResponse.json({ posts: normalized });
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
