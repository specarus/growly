import { NextRequest, NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/habit-actions";

const getErrorStatus = (message: string) => {
  if (message === "Unauthorized") return 401;
  if (message === "Not found") return 404;
  if (message === "Already liked.") return 409;
  return 500;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id: postId } = await params;
  try {
    const userId = await requireUserId();
    const post = await prisma.postHabit.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.postHabitLike.create({
        data: {
          postHabitId: postId,
          userId,
        },
      }),
      prisma.postHabit.update({
        where: { id: postId },
        data: {
          likesCount: { increment: 1 },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Already liked." },
        { status: getErrorStatus("Already liked.") }
      );
    }
    if (error instanceof Error) {
      const status = getErrorStatus(error.message);
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "Unable to like habit now." },
      { status: 500 }
    );
  }
}
