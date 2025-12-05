import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/habit-actions";

const getErrorStatus = (message: string) => {
  if (message === "Unauthorized") return 401;
  if (message === "Not found") return 404;
  if (message === "Forbidden") return 403;
  return 500;
};

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id } = await params;

  try {
    const userId = await requireUserId();
    const existing = await prisma.postHabit.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.postHabit.delete({ where: { id } });
    revalidatePath("/dashboard/habits/posts");
    revalidatePath("/dashboard/habits/popular");

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: getErrorStatus(error.message) }
      );
    }
    return NextResponse.json(
      { error: "Unable to delete this post right now." },
      { status: 500 }
    );
  }
}
