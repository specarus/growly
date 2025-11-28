export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import CreateTodoPage from "../../create/create-todo-page";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Todo } from "@prisma/client";

interface EditTodoPageProps {
  params: {
    id: string;
  };
}

type ParamsArg =
  | EditTodoPageProps["params"]
  | Promise<EditTodoPageProps["params"]>;

const buildInitial = (todo: Todo) => ({
  id: todo.id as string,
  title: todo.title as string,
  description: todo.description as string | null,
  category: todo.category as string | null,
  priority: todo.priority as string | null,
  status: todo.status as string | null,
  dueAt: todo.dueAt ? (todo.dueAt as Date).toISOString() : null,
  durationMinutes: todo.durationMinutes as number | null,
  location: todo.location as string | null,
  reminder: todo.reminder as string | null,
  recurrence: todo.recurrence as string | null,
  tags: todo.tags as string | null,
  iconName: todo.iconName as string | null,
  iconColor: todo.iconColor as string | null,
});

export default async function EditTodoPage({ params }: { params: ParamsArg }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const resolvedParams = await params;
  const todoId =
    resolvedParams && typeof resolvedParams.id === "string"
      ? resolvedParams.id
      : null;
  if (!todoId) {
    notFound();
  }

  const todo = await prisma.todo.findUnique({
    where: {
      id_userId: {
        id: todoId,
        userId: session.user.id,
      },
    },
  });

  if (!todo) {
    notFound();
  }

  return <CreateTodoPage mode="edit" initialTodo={buildInitial(todo)} />;
}
