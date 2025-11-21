"use server";

import { headers } from "next/headers";

import { auth } from "../auth";
import { prisma } from "../prisma";

type TodoPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type TodoStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "MISSED";

export interface TodoInput {
  title: string;
  description?: string;
  category?: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  date?: string | null;
  time?: string | null;
  durationMinutes?: number | null;
  location?: string;
  reminder?: string;
  recurrence?: string;
  tags?: string;
  iconName?: string;
  iconColor?: string;
}

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

const normalizePriority = (priority?: string): TodoPriority => {
  const upper = priority?.toUpperCase();
  if (
    upper === "LOW" ||
    upper === "MEDIUM" ||
    upper === "HIGH" ||
    upper === "CRITICAL"
  ) {
    return upper;
  }
  return "MEDIUM";
};

const normalizeStatus = (status?: string): TodoStatus => {
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

export async function createTodo(input: TodoInput) {
  const userId = await requireUserId();

  const dueAt = buildDueAt(input.date, input.time);
  const todo = await prisma.todo.create({
    data: {
      title: input.title,
      description: input.description || null,
      category: input.category || null,
      priority: normalizePriority(input.priority),
      status: normalizeStatus(input.status),
      dueAt,
      durationMinutes: input.durationMinutes ?? null,
      location: input.location || null,
      reminder: input.reminder || null,
      recurrence: input.recurrence || null,
    tags: input.tags || null,
    iconName: input.iconName || "Notebook",
    iconColor: input.iconColor || "#E5E7EB",
      userId,
    },
  });

  return todo;
}

export async function updateTodo(id: string, input: TodoInput) {
  const userId = await requireUserId();

  const dueAt = buildDueAt(input.date, input.time);
  const todo = await prisma.todo.update({
    where: {
      id_userId: {
        id,
        userId,
      },
    },
    data: {
      title: input.title,
      description: input.description || null,
      category: input.category || null,
      priority: normalizePriority(input.priority),
      status: normalizeStatus(input.status),
      dueAt,
      durationMinutes: input.durationMinutes ?? null,
      location: input.location || null,
      reminder: input.reminder || null,
    recurrence: input.recurrence || null,
    tags: input.tags || null,
    iconName: input.iconName || "Notebook",
    iconColor: input.iconColor || "#E5E7EB",
    },
  });

  return todo;
}

export async function deleteTodo(id: string) {
  const userId = await requireUserId();

  await prisma.todo.delete({
    where: {
      id_userId: {
        id,
        userId,
      },
    },
  });

  return { success: true };
}

export async function getTodo(id: string) {
  const userId = await requireUserId();

  const todo = await prisma.todo.findUnique({
    where: {
      id_userId: {
        id,
        userId,
      },
    },
  });

  return todo;
}

export async function listTodos(limit = 10) {
  const userId = await requireUserId();

  const todos = await prisma.todo.findMany({
    where: { userId },
    orderBy: { dueAt: "asc" },
    take: limit,
  });

  return todos;
}
