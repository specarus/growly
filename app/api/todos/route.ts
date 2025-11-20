import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const requireUserId = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
};

const buildDueAt = (date?: string | null, time?: string | null) => {
  if (!date) return null;
  const safeTime = time && time.length > 0 ? time : "00:00";
  const iso = `${date}T${safeTime}:00`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizePriority = (priority?: string) => {
  const upper = priority?.toUpperCase();
  if (upper === "LOW" || upper === "MEDIUM" || upper === "HIGH" || upper === "CRITICAL") {
    return upper;
  }
  return "MEDIUM";
};

const normalizeStatus = (status?: string) => {
  const upper = status?.toUpperCase();
  if (
    upper === "PLANNED" ||
    upper === "IN_PROGRESS" ||
    upper === "COMPLETED" ||
    upper === "MISSED"
  ) {
    return upper;
  }
  return "PLANNED";
};

export async function GET() {
  try {
    const userId = await requireUserId();

    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { dueAt: "asc" },
    });

    return NextResponse.json({ todos });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const todo = await prisma.todo.create({
      data: {
        title: body.title,
        description: body.description || null,
        category: body.category || null,
        priority: normalizePriority(body.priority),
        status: normalizeStatus(body.status),
        dueAt: buildDueAt(body.date, body.time),
        durationMinutes: body.durationMinutes ?? null,
        location: body.location || null,
        reminder: body.reminder || null,
        recurrence: body.recurrence || null,
        tags: body.tags || null,
        userId,
      },
    });

    return NextResponse.json({ todo });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create todo" }, { status: 400 });
  }
}
