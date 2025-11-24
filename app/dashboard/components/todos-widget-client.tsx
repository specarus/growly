"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { FC } from "react";
import { CalendarDays, Clock3, Plus, Sparkles } from "lucide-react";
import PillButton from "@/app/components/ui/pill-button";

import Todo, { TodoItem } from "./todo";

type TodoStatus = TodoItem["status"];

interface TodosWidgetClientProps {
  initialTodos: TodoItem[];
}

const ACTIVE_STATUSES: TodoStatus[] = ["PLANNED", "IN_PROGRESS"];
const COMPLETED_STATUS = { label: "Completed", color: "#10B981" };

const TodosWidgetClient: FC<TodosWidgetClientProps> = ({ initialTodos }) => {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const activeTodos = useMemo(
    () => todos.filter((todo) => ACTIVE_STATUSES.includes(todo.status)),
    [todos]
  );

  const topTodos = activeTodos.slice(0, 3);
  const remainingCount = Math.max(activeTodos.length - topTodos.length, 0);
  const hasTodos = activeTodos.length > 0;

  const celebrate = useCallback((origin?: HTMLElement) => {
    if (typeof document === "undefined") return;

    const rect = origin?.getBoundingClientRect();
    const startX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const startY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const colors = ["#6366F1", "#F59E0B", "#10B981", "#EC4899", "#3B82F6"];

    for (let i = 0; i < 14; i++) {
      const piece = document.createElement("span");
      piece.style.position = "fixed";
      piece.style.left = `${startX}px`;
      piece.style.top = `${startY}px`;
      piece.style.width = "8px";
      piece.style.height = "12px";
      piece.style.borderRadius = "3px";
      piece.style.backgroundColor = colors[i % colors.length];
      piece.style.zIndex = "50";
      piece.style.opacity = "0.92";
      piece.style.pointerEvents = "none";
      document.body.appendChild(piece);

      const spreadX = (Math.random() - 0.5) * 260;
      const spreadY = (Math.random() - 0.8) * 200;
      const rotation = Math.random() * 720 - 360;

      piece.animate(
        [
          { transform: "translate3d(0,0,0) rotate(0deg)", opacity: 1 },
          {
            transform: `translate3d(${spreadX}px, ${
              spreadY - 40
            }px, 0) rotate(${rotation}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 850,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        }
      ).onfinish = () => piece.remove();
    }
  }, []);

  const markComplete = useCallback(
    async (id: string, origin?: HTMLElement) => {
      if (pendingId === id) return;
      const current = todos.find((todo) => todo.id === id);
      if (!current) return;

      setPendingId(id);
      setCompletingId(id);
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                completed: true,
                statusLabel: COMPLETED_STATUS.label,
                statusColor: COMPLETED_STATUS.color,
              }
            : todo
        )
      );
      celebrate(origin);

      try {
        const response = await fetch(`/api/todos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "COMPLETED" }),
        });

        if (!response.ok) {
          throw new Error("Unable to update todo status");
        }

        setTimeout(
          () => setTodos((prev) => prev.filter((todo) => todo.id !== id)),
          450
        );
      } catch (error) {
        console.error(error);
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  completed: current.completed,
                  statusLabel: current.statusLabel,
                  statusColor: current.statusColor,
                }
              : todo
          )
        );
      } finally {
        setTimeout(() => {
          setCompletingId((existing) => (existing === id ? null : existing));
        }, 500);
        setPendingId(null);
      }
    },
    [celebrate, pendingId, todos]
  );

  return (
    <div className="xl:p-2 2xl:p-6 text-foreground">
      <div className="flex items-center justify-between xl:mb-2 2xl:mb-4">
        <h3 className="font-semibold xl:text-lg 2xl:text-xl">
          Today&apos;s Todos
        </h3>
        <div className="flex items-center gap-3">
          <PillButton href="/dashboard/todos/create" variant="primary">
            <Plus className="w-3 h-3" />
            New todo
          </PillButton>
          <PillButton href="/dashboard/todos" variant="ghost">
            View Details
          </PillButton>
        </div>
      </div>

      <div className="xl:space-y-3 2xl:space-y-4 min-h-24">
        {hasTodos ? (
          topTodos.map((todo) => (
            <Todo
              key={todo.id}
              todo={todo}
              href={`/dashboard/todos/${todo.id}/edit`}
              onComplete={markComplete}
              isCompleting={completingId === todo.id}
              disabled={pendingId === todo.id}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 px-4 py-5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">No todos yet</p>
            <p>Start a new one to see it here.</p>
            <PillButton
              href="/dashboard/todos/create"
              variant="text"
              className="mt-3 gap-2"
            >
              <Sparkles className="w-3 h-3" />
              Create a todo
            </PillButton>
          </div>
        )}
      </div>

      {hasTodos && remainingCount > 0 ? (
        <div className="mt-3 text-xs text-muted-foreground">
          +{remainingCount} more waiting -{" "}
          <Link
            href="/dashboard/todos"
            className="text-primary hover:underline"
          >
            view all
          </Link>
        </div>
      ) : null}

      {hasTodos ? (
        <>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="w-3 h-3" />
            <span className="truncate">Tap a todo to edit or reschedule.</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="w-3 h-3" />
            <span className="truncate">
              Need a new one? Start fresh in seconds.
            </span>
          </div>
        </>
      ) : (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          <span className="truncate">
            Add a todo to see it on your dashboard.
          </span>
        </div>
      )}
    </div>
  );
};

export default TodosWidgetClient;
