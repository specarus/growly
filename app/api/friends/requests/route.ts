import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Missing authenticated session" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const direction = url.searchParams.get("direction") ?? "incoming";
  const isIncoming = direction !== "outgoing";

  const requests = await (prisma as any).friendRequest.findMany({
    where: {
      status: "PENDING",
      ...(isIncoming
        ? { toUserId: session.user.id }
        : { fromUserId: session.user.id }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      fromUser: { select: { id: true, name: true } },
      toUser: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    requests: requests.map(
      (request: {
        id: string;
        fromUserId: string;
        toUserId: string;
        status: string;
        createdAt: Date;
        fromUser?: { id: string; name: string | null };
        toUser?: { id: string; name: string | null };
      }) => ({
        id: request.id,
        fromUserId: request.fromUserId,
        toUserId: request.toUserId,
        status: request.status,
        createdAt: request.createdAt?.toISOString?.() ?? null,
        fromName: request.fromUser?.name ?? "Unknown",
        toName: request.toUser?.name ?? "Unknown",
      })
    ),
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Missing authenticated session" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const targetUserId: unknown = body?.userId;

  if (typeof targetUserId !== "string" || targetUserId.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing target user id" },
      { status: 400 }
    );
  }

  if (targetUserId === session.user.id) {
    return NextResponse.json(
      { error: "Cannot send a friend request to yourself" },
      { status: 400 }
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await (prisma as any).friendRequest.findFirst({
    where: {
      OR: [
        { fromUserId: session.user.id, toUserId: targetUserId },
        { fromUserId: targetUserId, toUserId: session.user.id },
      ],
    },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") {
      return NextResponse.json(
        { error: "Already friends", requestId: existing.id },
        { status: 409 }
      );
    }
    if (existing.status === "PENDING") {
      return NextResponse.json(
        { error: "Request already pending", requestId: existing.id },
        { status: 409 }
      );
    }
  }

  const created = await (prisma as any).friendRequest.create({
    data: {
      fromUserId: session.user.id,
      toUserId: targetUserId,
      status: "PENDING",
    },
    select: { id: true },
  });

  return NextResponse.json({ requestId: created.id });
}
