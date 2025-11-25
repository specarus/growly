import { headers } from "next/headers";
import { icons, Sparkles } from "lucide-react";

import type { TodoStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TodosWidgetClient from "./todos-widget-client";
import type { TodoItem } from "./todo";

const DISPLAY_TODOS_LIMIT = 6;
const ACTIVE_STATUSES: TodoStatus[] = ["PLANNED", "IN_PROGRESS"];

const STATUS_META: Record<TodoStatus, { label: string; color: string }> = {
  PLANNED: { label: "Planned", color: "#6366F1" },
  IN_PROGRESS: { label: "In Progress", color: "#F59E0B" },
  COMPLETED: { label: "Completed", color: "#10B981" },
  MISSED: { label: "Missed", color: "#EF4444" },
};

const toTime = (dueAt?: Date | string | null) => {
  if (!dueAt) return "--:--";
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toISOString().slice(11, 16);
};

const normalizeStatus = (status?: string): TodoItem["status"] => {
  switch (status?.toUpperCase()) {
    case "IN_PROGRESS":
      return "IN_PROGRESS";
    case "COMPLETED":
      return "COMPLETED";
    case "MISSED":
      return "MISSED";
    default:
      return "PLANNED";
  }
};

const TodosWidget = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return <TodosWidgetClient initialTodos={[]} totalActive={0} />;
  }

  const activeWhere = {
    userId: session.user.id,
    status: { in: ACTIVE_STATUSES },
  };

  const [upcomingTodos, newestTodo, totalActive] = await Promise.all([
    prisma.todo.findMany({
      where: activeWhere,
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: DISPLAY_TODOS_LIMIT,
    }),
    prisma.todo.findFirst({
      where: activeWhere,
      orderBy: { createdAt: "desc" },
    }),
    prisma.todo.count({
      where: activeWhere,
    }),
  ]);

  const prioritizedTodos = [...upcomingTodos];
  if (
    newestTodo &&
    !prioritizedTodos.some((todo) => todo.id === newestTodo.id)
  ) {
    if (prioritizedTodos.length === DISPLAY_TODOS_LIMIT) {
      prioritizedTodos.pop();
    }
    prioritizedTodos.push(newestTodo);
  }

  const todosFromDb = prioritizedTodos.slice(0, DISPLAY_TODOS_LIMIT);

  const todos: TodoItem[] = todosFromDb.map(
    ({ title, dueAt, location, priority, status, id, iconName, iconColor }) => {
      const hasCustomIcon = Boolean(
        (icons as Record<string, unknown>)[iconName || ""]
      );
      const normalizedStatus = normalizeStatus(status);
      const { label, color } =
        STATUS_META[normalizedStatus] || STATUS_META.PLANNED;

      return {
        id,
        title,
        time: toTime(dueAt),
        location: location || "No location",
        iconKey: hasCustomIcon && iconName ? iconName : "Sparkles",
        completed: normalizedStatus === "COMPLETED",
        iconColor:
          iconColor ||
          (priority?.toUpperCase() === "HIGH"
            ? "#FECACA"
            : priority?.toUpperCase() === "CRITICAL"
            ? "#FCA5A5"
            : "#E5E7EB"),
        statusLabel: label,
        statusColor: color,
        status: normalizedStatus,
      };
    }
  );

  return <TodosWidgetClient initialTodos={todos} totalActive={totalActive} />;
};

export default TodosWidget;
