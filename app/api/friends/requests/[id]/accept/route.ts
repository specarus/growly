import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Missing authenticated session" },
      { status: 401 }
    );
  }

  const { id: requestId } = await params;

  if (!requestId) {
    return NextResponse.json(
      { error: "Missing friend request id" },
      { status: 400 }
    );
  }

  const requestRecord = await (prisma as any).friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!requestRecord) {
    return NextResponse.json(
      { error: "Request not found" },
      { status: 404 }
    );
  }

  if (requestRecord.toUserId !== session.user.id) {
    return NextResponse.json(
      { error: "Not authorized to accept this request" },
      { status: 403 }
    );
  }

  if (requestRecord.status === "ACCEPTED") {
    return NextResponse.json({ ok: true, status: "ACCEPTED" });
  }

  if (requestRecord.status !== "PENDING") {
    return NextResponse.json(
      { error: "Request is not pending" },
      { status: 400 }
    );
  }

  await (prisma as any).friendRequest.update({
    where: { id: requestId },
    data: { status: "ACCEPTED" },
  });

  return NextResponse.json({ ok: true, status: "ACCEPTED" });
}
