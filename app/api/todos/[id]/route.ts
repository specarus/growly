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

type ParamsArg = { params: Promise<{ id: string }> } | { params: { id: string } };

const resolveParams = async (raw: ParamsArg) => {
  const params = "params" in raw ? await (raw as { params: { id: string } | Promise<{ id: string }> }).params : null;
  const id = params?.id;
  if (!id || typeof id !== "string") {
    throw new Error("Invalid todo id");
  }
  return { id };
};

export async function GET(_request: Request, ctx: ParamsArg) {
  try {
    const { id } = await resolveParams(ctx);
    const userId = await requireUserId();
    const todo = await prisma.todo.findUnique({
      where: {
        id_userId: {
          id,
          userId,
        },
      },
    });

    if (!todo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ todo });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request, ctx: ParamsArg) {
  try {
    const { id } = await resolveParams(ctx);
    const userId = await requireUserId();
    const body = await request.json();

    const todo = await prisma.todo.update({
      where: {
        id_userId: {
          id,
          userId,
        },
      },
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
        iconName: body.iconName || "Notebook",
        iconColor: body.iconColor || "#E5E7EB",
      },
    });

    return NextResponse.json({ todo });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update todo" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, ctx: ParamsArg) {
  try {
    const { id } = await resolveParams(ctx);
    const userId = await requireUserId();

    await prisma.todo.delete({
      where: {
        id_userId: {
          id,
          userId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 400 });
  }
}
