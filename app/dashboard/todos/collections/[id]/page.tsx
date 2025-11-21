export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TodosPage from "../../todos-page";

const mapTodo = (todo: {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string | null;
  dueAt: Date | null;
  durationMinutes: number | null;
  location: string | null;
  reminder: string | null;
  recurrence: string | null;
  tags: string | null;
  iconName: string | null;
  iconColor: string | null;
  collections: { collectionId: string }[];
}) => ({
  id: todo.id,
  title: todo.title,
  status: todo.status,
  priority: todo.priority,
  category: todo.category || "General",
  dueAt: todo.dueAt ? todo.dueAt.toISOString() : null,
  durationMinutes: todo.durationMinutes,
  location: todo.location || "",
  reminder: todo.reminder || "No reminder",
  recurrence: todo.recurrence || "None",
  tags: todo.tags || "",
  iconName: todo.iconName || "Notebook",
  iconColor: todo.iconColor || "#E5E7EB",
  collections: todo.collections?.map((item) => item.collectionId) || [],
});

type ParamsArg = { params: { id: string } } | { params: Promise<{ id: string }> };

const resolveParams = async (raw: ParamsArg["params"]) => {
  const candidate = raw as Promise<{ id: string } | { id?: string }>;
  const value =
    typeof (candidate as any)?.then === "function" ? await candidate : candidate;
  return { id: (value as any)?.id as string | undefined };
};

export default async function CollectionPage({ params }: ParamsArg) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const { id } = await resolveParams(params);
  if (!id) {
    notFound();
  }

  const collection = await prisma.collection.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!collection || collection.userId !== session.user.id) {
    notFound();
  }

  const todos = await prisma.todo.findMany({
    where: {
      userId: session.user.id,
      collections: { some: { collectionId: id } },
    },
    orderBy: { dueAt: "asc" },
    include: { collections: true },
  });

  const initialTodos = todos.map(mapTodo);

  const initialCollections = [
    {
      id: collection.id,
      name: collection.name,
      description: collection.description || "",
      todoIds: collection.items.map((item) => item.todoId),
    },
  ];

  return (
    <TodosPage
      initialTodos={initialTodos}
      initialCollections={initialCollections}
      collectionContext={{
        id: collection.id,
        name: collection.name,
        description: collection.description,
      }}
    />
  );
}
