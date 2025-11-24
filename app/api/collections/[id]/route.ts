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

type ParamsArg =
  | { params: Promise<{ id: string }> }
  | { params: { id: string } };

const resolveParams = async (raw: ParamsArg) => {
  const params = "params" in raw ? await raw.params : null;
  const id = params?.id;
  if (!id || typeof id !== "string") {
    throw new Error("Invalid collection id");
  }
  return { id };
};

const toPayload = (collection: {
  id: string;
  name: string;
  description: string | null;
  items: { todoId: string }[];
}) => ({
  id: collection.id,
  name: collection.name,
  description: collection.description,
  todoIds: collection.items.map((item) => item.todoId),
});

export async function PUT(request: Request, ctx: ParamsArg) {
  try {
    const userId = await requireUserId();
    const { id } = await resolveParams(ctx);
    const body = await request.json();
    const name = (body.name as string | undefined)?.trim();
    const description = (body.description as string | undefined)?.trim();
    const todoId = body.todoId as string | undefined;
    const action = (body.action as string | undefined)?.toLowerCase();

    const updates: { name?: string; description?: string | null } = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description || null;

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!collection || collection.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (todoId) {
      const ownedTodo = await prisma.todo.findUnique({
        where: { id_userId: { id: todoId, userId } },
      });
      if (!ownedTodo) {
        return NextResponse.json(
          { error: "Todo not found" },
          { status: 404 }
        );
      }

      if (action === "remove") {
        await prisma.collectionTodo.deleteMany({
          where: { collectionId: id, todoId },
        });
      } else {
        await prisma.collectionTodo.upsert({
          where: { collectionId_todoId: { collectionId: id, todoId } },
          create: { collectionId: id, todoId },
          update: {},
        });
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.collection.update({
        where: { id },
        data: updates,
      });
    }

    const refreshed = await prisma.collection.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!refreshed) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ collection: toPayload(refreshed) });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 400 }
    );
  }
}
