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

export async function GET() {
  try {
    const userId = await requireUserId();
    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    const payload = collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      todoIds: collection.items.map((item) => item.todoId),
    }));

    return NextResponse.json({ collections: payload });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const name = (body.name as string | undefined)?.trim();
    const description = (body.description as string | undefined)?.trim();
    const todoIds = Array.isArray(body.todoIds) ? body.todoIds : [];

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const ownedTodos = await prisma.todo.findMany({
      where: { userId, id: { in: todoIds } },
      select: { id: true },
    });

    const validIds = ownedTodos.map((todo) => todo.id);

    const collection = await prisma.collection.create({
      data: {
        name,
        description: description || null,
        userId,
        items:
          validIds.length > 0
            ? {
                createMany: {
                  data: validIds.map((todoId) => ({ todoId })),
                },
              }
            : undefined,
      },
      include: { items: true },
    });

    return NextResponse.json({
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        todoIds: collection.items.map((item) => item.todoId),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 400 }
    );
  }
}
