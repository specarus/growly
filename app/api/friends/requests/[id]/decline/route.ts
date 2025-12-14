import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: { id: string };
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

  const requestRecord = await (prisma as any).friendRequest.findUnique({
    where: { id: params.id },
  });

  if (!requestRecord) {
    return NextResponse.json(
      { error: "Request not found" },
      { status: 404 }
    );
  }

  const isParticipant =
    requestRecord.toUserId === session.user.id ||
    requestRecord.fromUserId === session.user.id;

  if (!isParticipant) {
    return NextResponse.json(
      { error: "Not authorized to decline this request" },
      { status: 403 }
    );
  }

  if (requestRecord.status === "DECLINED") {
    return NextResponse.json({ ok: true, status: "DECLINED" });
  }

  await (prisma as any).friendRequest.update({
    where: { id: params.id },
    data: { status: "DECLINED" },
  });

  return NextResponse.json({ ok: true, status: "DECLINED" });
}
