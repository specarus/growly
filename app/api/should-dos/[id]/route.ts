import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  parseShouldDoPayload,
  parseShouldDoUpdate,
} from "@/lib/actions/should-do-actions";
import { requireUserId } from "@/lib/actions/habit-actions";

const getErrorStatus = (message: string) => {
  if (message === "Unauthorized") return 401;
  if (message === "Not found") return 404;
  if (message === "Forbidden") return 403;
  return 500;
};

const mapShouldDo = (
  entry: {
    id: string;
    title: string;
    description: string | null;
    likesCount: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    user: { name: string | null } | null;
    iconKey: string | null;
    iconColor: string | null;
  },
  currentUserId: string,
  likedByCurrentUser: boolean
) => ({
  id: entry.id,
  title: entry.title,
  description: entry.description,
  likesCount: entry.likesCount,
  likedByCurrentUser,
  ownedByCurrentUser: entry.userId === currentUserId,
  userName: entry.user?.name ?? null,
  createdAt: entry.createdAt.toISOString(),
  updatedAt: entry.updatedAt.toISOString(),
  iconKey: entry.iconKey,
  iconColor: entry.iconColor,
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id } = await params;
  try {
    const userId = await requireUserId();
    const [entry, liked] = await Promise.all([
      prisma.shouldDo.findUnique({
        where: { id },
        include: { user: { select: { name: true } } },
      }),
      prisma.shouldDoLike.findFirst({
        where: { userId, shouldDoId: id },
        select: { id: true },
      }),
    ]);
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      shouldDo: mapShouldDo(entry, userId, Boolean(liked)),
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: getErrorStatus(error.message) }
      );
    }
    return NextResponse.json(
      { error: "Unable to load idea now." },
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
    const payload = await parseShouldDoUpdate(
      (await request.json()) as Record<string, unknown>
    );

    const existing = await prisma.shouldDo.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const entry = await prisma.shouldDo.update({
      where: { id },
      data: {
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(payload.description !== undefined
          ? { description: payload.description }
          : {}),
        ...(payload.iconKey !== undefined ? { iconKey: payload.iconKey } : {}),
        ...(payload.iconColor !== undefined
          ? { iconColor: payload.iconColor }
          : {}),
      },
      include: { user: { select: { name: true } } },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/habits/popular");
    revalidatePath("/dashboard/habits/posts");

    const liked = await prisma.shouldDoLike.findFirst({
      where: { userId, shouldDoId: id },
      select: { id: true },
    });

    return NextResponse.json({
      shouldDo: mapShouldDo(entry, userId, Boolean(liked)),
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: getErrorStatus(error.message) }
      );
    }
    return NextResponse.json(
      { error: "Unable to update idea now." },
      { status: 500 }
    );
  }
}
