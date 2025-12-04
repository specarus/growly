import { NextResponse } from "next/server";
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
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id: shouldDoId } = await params;

  try {
    const userId = await requireUserId();
    const existing = await prisma.shouldDo.findUnique({
      where: { id: shouldDoId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.shouldDoLike.create({
        data: {
          shouldDoId,
          userId,
        },
      }),
      prisma.shouldDo.update({
        where: { id: shouldDoId },
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
      return NextResponse.json(
        { error: error.message },
        { status: getErrorStatus(error.message) }
      );
    }
    return NextResponse.json(
      { error: "Unable to like this idea now." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id: shouldDoId } = await params;

  try {
    const userId = await requireUserId();
    const existing = await prisma.shouldDo.findUnique({
      where: { id: shouldDoId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const liked = await prisma.shouldDoLike.findFirst({
      where: { shouldDoId, userId },
      select: { id: true },
    });
    if (!liked) {
      return NextResponse.json(
        { error: "Not liked yet." },
        { status: getErrorStatus("Already liked.") }
      );
    }

    await prisma.$transaction([
      prisma.shouldDoLike.deleteMany({
        where: { shouldDoId, userId },
      }),
      prisma.shouldDo.update({
        where: { id: shouldDoId },
        data: {
          likesCount: { decrement: 1 },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: getErrorStatus(error.message) }
      );
    }
    return NextResponse.json(
      { error: "Unable to unlike this idea now." },
      { status: 500 }
    );
  }
}
