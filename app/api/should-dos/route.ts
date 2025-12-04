import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  parseShouldDoPayload,
  ShouldDoPayload,
} from "@/lib/actions/should-do-actions";
import { requireUserId } from "@/lib/actions/habit-actions";

type ShouldDoResponse = ShouldDoPayload & {
  id: string;
  likesCount: number;
  likedByCurrentUser: boolean;
  ownedByCurrentUser: boolean;
  userName: string | null;
  createdAt: string;
  updatedAt: string;
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
  },
  currentUserId: string,
  likedSet: Set<string>
): ShouldDoResponse => ({
  id: entry.id,
  title: entry.title,
  description: entry.description,
  likesCount: entry.likesCount,
  likedByCurrentUser: likedSet.has(entry.id),
  ownedByCurrentUser: entry.userId === currentUserId,
  userName: entry.user?.name ?? null,
  createdAt: entry.createdAt.toISOString(),
  updatedAt: entry.updatedAt.toISOString(),
});

const parseLimit = (value: string | null) => {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.min(parsed, 50);
  }
  return undefined;
};

const getErrorStatus = (message: string) => {
  if (message === "Unauthorized") return 401;
  if (message === "Not found") return 404;
  return 500;
};

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const url = new URL(request.url);
    const limit = parseLimit(url.searchParams.get("limit"));

    const [entries, liked] = await Promise.all([
      prisma.shouldDo.findMany({
        orderBy: [
          { likesCount: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        include: {
          user: { select: { name: true } },
        },
      }),
      prisma.shouldDoLike.findMany({
        where: { userId },
        select: { shouldDoId: true },
      }),
    ]);

    const likedSet = new Set(liked.map((entry) => entry.shouldDoId));
    const data = entries.map((entry) => mapShouldDo(entry, userId, likedSet));

    return NextResponse.json({ shouldDos: data });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: getErrorStatus(error.message) }
      );
    }
    return NextResponse.json(
        { error: "Unable to load ideas right now." },
        { status: 500 }
      );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const payload = await parseShouldDoPayload(
      (await request.json()) as Record<string, unknown>
    );

    const entry = await prisma.shouldDo.create({
      data: {
        ...payload,
        userId,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/habits/popular");

    return NextResponse.json(
      {
        shouldDo: mapShouldDo(entry, userId, new Set()),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: getErrorStatus(error.message) }
      );
    }
    return NextResponse.json(
      { error: "Unable to create idea now." },
      { status: 500 }
    );
  }
}
