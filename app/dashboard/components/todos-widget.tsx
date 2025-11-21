import Link from "next/link";
import { headers } from "next/headers";
import {
  Book,
  Briefcase,
  CalendarDays,
  Clock3,
  HeartPulse,
  icons,
  LucideIcon,
  Palette,
  Plus,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import DetailsButton from "@/app/components/ui/details-button";
import Todo from "./todo";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface TodoItem {
  id: string;
  title: string;
  time: string;
  location: string;
  icon: LucideIcon;
  completed: boolean;
  iconColor: string;
  statusLabel: string;
  statusColor: string;
}

const categoryIcon: Record<string, LucideIcon> = {
  Work: Briefcase,
  Personal: Book,
  Wellness: HeartPulse,
  Errand: ShoppingCart,
  Creative: Palette,
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

  const hasTodos = todosFromDb.length > 0;

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
      const customIcon =
        (icons as Record<string, LucideIcon>)[iconName || ""] || null;
      const { label, color } = statusMeta(status);

      return {
        id,
        title,
        time: toTime(dueAt),
        location: location || "No location",
        icon: customIcon || categoryIcon[category || ""] || Sparkles,
        completed: status?.toUpperCase() === "COMPLETED",
        iconColor:
          iconColor ||
          (priority?.toUpperCase() === "HIGH"
            ? "#FECACA"
            : priority?.toUpperCase() === "CRITICAL"
            ? "#FCA5A5"
            : "#E5E7EB"),
        statusLabel: label,
        statusColor: color,
      };
    }
  );

  const topTodos = todos.slice(0, 3);
  const remainingCount = Math.max(todos.length - topTodos.length, 0);

  return (
    <div className="xl:p-2 2xl:p-6 text-foreground">
      <div className="flex items-center justify-between xl:mb-4 2xl:mb-6">
        <h3 className="font-semibold xl:text-lg 2xl:text-xl">
          Today&apos;s Todos
        </h3>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/todos/create"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            <Plus className="w-3 h-3" />
            New todo
          </Link>
          <DetailsButton href="/dashboard/todos" />
        </div>
      </div>

      <div className="xl:space-y-3 2xl:space-y-4">
        {hasTodos ? (
          topTodos.map((todo) => (
            <Link
              key={todo.id}
              href={`/dashboard/todos/${todo.id}/edit`}
              className="block hover:opacity-90 transition"
            >
              <Todo todo={todo} />
            </Link>
          ))
        ) : (
          <div className="border border-dashed border-gray-200 rounded-2xl bg-white px-4 py-5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">No todos yet</p>
            <p>Start a new one to see it here.</p>
            <Link
              href="/dashboard/todos/create"
              className="mt-3 inline-flex items-center gap-2 text-xs text-primary hover:underline"
            >
              <Sparkles className="w-3 h-3" />
              Create a todo
            </Link>
          </div>
        )}
      </div>

      {hasTodos && remainingCount > 0 ? (
        <div className="mt-3 text-xs text-muted-foreground">
          +{remainingCount} more waiting —{" "}
          <Link
            href="/dashboard/todos"
            className="text-primary hover:underline"
          >
            view all
          </Link>
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="w-3 h-3" />
        <span className="truncate">
          {hasTodos
            ? "Tap a todo to edit or reschedule."
            : "No todos yet — start by creating one."}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        <Clock3 className="w-3 h-3" />
        <span className="truncate">
          {hasTodos
            ? "Need a new one? Start fresh in seconds."
            : "Click the link above to open the create flow."}
        </span>
      </div>
    </div>
  );
};

export default TodosWidget;
