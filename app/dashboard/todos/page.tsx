export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TodosPage from "./todos-page";

export default async function Todos() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const todos = await prisma.todo.findMany({
    where: { userId: session.user.id },
    orderBy: { dueAt: "asc" },
  });

  const initialTodos = todos.map((todo) => ({
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
  }));

  return <TodosPage initialTodos={initialTodos} />;
}
