import { headers } from "next/headers";
import {
  Book,
  Briefcase,
  HeartPulse,
  icons,
  Palette,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TodosWidgetClient from "./todos-widget-client";
import type { TodoItem } from "./todo";

const categoryIconKey: Record<string, string> = {
  Work: "Briefcase",
  Personal: "Book",
  Wellness: "HeartPulse",
  Errand: "ShoppingCart",
  Creative: "Palette",
};

const toTime = (dueAt?: Date | string | null) => {
  if (!dueAt) return "--:--";
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toISOString().slice(11, 16);
};

const statusMeta = (status?: string) => {
  switch (status?.toUpperCase()) {
    case "IN_PROGRESS":
      return { label: "In Progress", color: "#F59E0B" };
    case "COMPLETED":
      return { label: "Completed", color: "#10B981" };
    case "MISSED":
      return { label: "Missed", color: "#EF4444" };
    default:
      return { label: "Planned", color: "#6366F1" };
  }
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

  const todosFromDb = session?.user?.id
    ? await prisma.todo.findMany({
        where: { userId: session.user.id },
        orderBy: { dueAt: "asc" },
        take: 6,
      })
    : [];

  const todos: TodoItem[] = todosFromDb.map(
    ({
      title,
      dueAt,
      location,
      priority,
      status,
      id,
      category,
      iconName,
      iconColor,
    }) => {
      const hasCustomIcon = Boolean((icons as Record<string, unknown>)[iconName || ""]);
      const normalizedStatus = normalizeStatus(status);
      const { label, color } = statusMeta(normalizedStatus);

      return {
        id,
        title,
        time: toTime(dueAt),
        location: location || "No location",
        iconKey:
          (hasCustomIcon && iconName) ||
          categoryIconKey[category || ""] ||
          "Sparkles",
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

  const activeTodos = todos.filter(
    ({ status }) => status === "PLANNED" || status === "IN_PROGRESS"
  );

  return <TodosWidgetClient initialTodos={activeTodos} />;
};

export default TodosWidget;
