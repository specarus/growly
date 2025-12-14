import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_IDS = 20;

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
  const ids: unknown = body?.ids;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No notification ids provided" }, { status: 400 });
  }

  const sanitized = Array.from(
    new Set(
      ids
        .map((id) => (typeof id === "string" ? id.trim() : ""))
        .filter(Boolean)
        .slice(0, MAX_IDS)
    )
  );

  if (sanitized.length === 0) {
    return NextResponse.json({ error: "No notification ids provided" }, { status: 400 });
  }

  try {
    await (prisma as any).notificationRead.createMany({
      data: sanitized.map((notificationId: string) => ({
        userId: session.user!.id,
        notificationId,
      })),
      skipDuplicates: true,
    });
  } catch (error) {
    console.error("[Notifications] mark read", error);
    return NextResponse.json(
      { error: "Failed to store read notifications" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
