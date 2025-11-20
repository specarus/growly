"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  ListChecks,
  MapPin,
  Plus,
  Sparkles,
  Timer,
} from "lucide-react";

import Button from "@/app/components/ui/button";

type Status = "Planned" | "In Progress" | "Completed" | "Missed";
type Priority = "Low" | "Medium" | "High" | "Critical";

interface TodoRow {
  id: string;
  title: string;
  status: Status;
  category: string;
  priority: Priority;
  dueDate: string;
  dueTime: string;
  location: string;
  reminder: string;
  progress: number;
}

interface TodosPageProps {
  initialTodos?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    category: string;
    dueAt: string | null;
    durationMinutes: number | null;
    location: string;
    reminder: string;
    recurrence: string;
    tags: string;
  }>;
}

const statusStyles: Record<Status, string> = {
  Planned: "bg-muted text-muted-foreground",
  "In Progress": "bg-yellow-soft text-yellow-soft-foreground",
  Completed: "bg-green-soft text-green-soft-foreground",
  Missed: "bg-coral text-white",
};

const priorityDots: Record<Priority, string> = {
  Low: "bg-muted",
  Medium: "bg-yellow-soft",
  High: "bg-primary",
  Critical: "bg-primary",
};

const buttonBase =
  "w-full rounded-full flex items-center justify-center select-none gap-2 cursor-pointer";

const formatStatus = (status: string): Status => {
  switch (status?.toUpperCase()) {
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "MISSED":
      return "Missed";
    default:
      return "Planned";
  }
};

const formatPriority = (priority: string): Priority => {
  switch (priority?.toUpperCase()) {
    case "LOW":
      return "Low";
    case "HIGH":
      return "High";
    case "CRITICAL":
      return "Critical";
    default:
      return "Medium";
  }
};

const formatDueParts = (dueAt?: string | null) => {
  if (!dueAt) return { dueDate: "No date", dueTime: "--:--" };
  const dateObj = new Date(dueAt);
  if (Number.isNaN(dateObj.getTime()))
    return { dueDate: "No date", dueTime: "--:--" };
  return {
    dueDate: dateObj.toISOString().slice(0, 10),
    dueTime: dateObj.toISOString().slice(11, 16),
  };
};

const deriveProgress = (status: Status) => {
  if (status === "Completed") return 100;
  if (status === "In Progress") return 65;
  if (status === "Missed") return 35;
  return 10;
};

const mapToRow = (todo: TodosPageProps["initialTodos"][number]): TodoRow => {
  const status = formatStatus(todo.status);
  const { dueDate, dueTime } = formatDueParts(todo.dueAt);

  return {
    id: todo.id,
    title: todo.title,
    status,
    category: todo.category,
    priority: formatPriority(todo.priority),
    dueDate,
    dueTime,
    location: todo.location || "No location",
    reminder: todo.reminder || "No reminder",
    progress: deriveProgress(status),
  };
};

const TodosPage: React.FC<TodosPageProps> = ({ initialTodos = [] }) => {
  const [todos, setTodos] = useState<TodoRow[]>(() =>
    initialTodos.map(mapToRow)
  );
  const [filter, setFilter] = useState<Status | "All">("All");

  useEffect(() => {
    setTodos(initialTodos.map(mapToRow));
  }, [initialTodos]);

  const filtered = useMemo(
    () =>
      filter === "All" ? todos : todos.filter((todo) => todo.status === filter),
    [filter, todos]
  );

  const totals = useMemo(() => {
    const completed = todos.filter(
      (todo) => todo.status === "Completed"
    ).length;
    const active = todos.filter(
      (todo) => todo.status === "In Progress" || todo.status === "Planned"
    ).length;
    const focus =
      todos.length === 0
        ? 0
        : Math.round(
            todos.reduce((sum, todo) => sum + todo.progress, 0) / todos.length
          );

    return { completed, active, focus };
  }, [todos]);

  return (
    <main className="w-full min-h-screen xl:pt-20 text-foreground">
      <div className="xl:px-8 2xl:px-28 pb-10 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <BadgeCheck className="w-4 h-4" />
              <span>Todos overview</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold">Your todos</h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Track all todos in one place, filter by status, and jump into a
                detailed view before you start.
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-2 sm:gap-3">
            <Link
              href="/dashboard/todos/create"
              className={`${buttonBase} xl:h-10 2xl:h-12 xl:px-4 2xl:px-6 xl:text-sm 2xl:text-base bg-white border border-gray-200 shadow-sm hover:border-primary/40`}
            >
              <Plus className="w-4 h-4" />
              New todo
            </Link>
            <Button className="xl:h-10 2xl:h-12 xl:px-5 2xl:px-7 xl:text-sm 2xl:text-base bg-primary text-white shadow-sm hover:brightness-105 transition">
              Start focus mode
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-50 bg-white/90 shadow-sm xl:p-4 2xl:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-semibold">{totals.completed}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-50 bg-white/90 shadow-sm xl:p-4 2xl:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-soft/30 flex items-center justify-center">
              <Timer className="w-5 h-5 text-yellow-soft-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-xl font-semibold">{totals.active}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-50 bg-white/90 shadow-sm xl:p-4 2xl:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-soft/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-green-soft-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Focus score</p>
              <p className="text-xl font-semibold">{totals.focus}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 border border-gray-50 shadow-sm xl:rounded-2xl 2xl:rounded-3xl xl:p-4 2xl:p-6 space-y-4">
          {todos.length === 0 && (
            <div className="border border-dashed border-gray-200 rounded-2xl bg-white px-4 py-6 text-center space-y-2">
              <p className="font-semibold">No todos yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first todo to see it here and in the dashboard widget.
              </p>
              <Link
                href="/dashboard/todos/create"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm hover:brightness-105 transition"
              >
                <Plus className="w-4 h-4" />
                Create a todo
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" />
              <h2 className="font-semibold xl:text-lg 2xl:text-xl">
                Todo board
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "All",
                  "Planned",
                  "In Progress",
                  "Completed",
                  "Missed",
                ] as const
              ).map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`px-3 py-2 rounded-full text-sm transition border ${
                    filter === option
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-muted-foreground border-gray-100 hover:border-primary/30"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[720px] grid grid-cols-8 xl:text-xs 2xl:text-sm text-muted-foreground px-3 pb-2 border-b border-gray-100">
              <div className="col-span-3">Todo</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Due</div>
              <div className="text-center">Reminder</div>
              <div className="text-center">Progress</div>
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.map((todo) => (
                <Link
                  key={todo.id}
                  href={`/dashboard/todos/${todo.id}/edit`}
                  className="block min-w-[720px] hover:bg-gray-50 transition"
                >
                  <div className="grid grid-cols-8 items-center xl:py-3 2xl:py-4 px-3">
                    <div className="col-span-3 space-y-1">
                      <div className="font-semibold xl:text-sm 2xl:text-base">
                        {todo.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {todo.dueDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock3 className="w-3 h-3" />
                          {todo.dueTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {todo.location}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-semibold ${
                          statusStyles[todo.status]
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full bg-white/70" />
                        {todo.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          priorityDots[todo.priority]
                        }`}
                      />
                      <span className="text-sm">{todo.priority}</span>
                    </div>

                    <div className="text-sm">
                      {todo.dueDate} · {todo.dueTime}
                    </div>

                    <div className="text-center text-sm">{todo.reminder}</div>

                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${todo.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {todo.progress}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-gray-50 bg-white/90 shadow-sm xl:p-4 2xl:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock3 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold xl:text-lg 2xl:text-xl">
                  Next up
                </h3>
              </div>
              <Link
                href="/dashboard/todos/create"
                className="text-sm text-primary hover:underline"
              >
                Add another
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {filtered.slice(0, 4).map((todo) => (
                <Link
                  key={todo.id}
                  href={`/dashboard/todos/${todo.id}/edit`}
                  className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 shadow-inner space-y-2 hover:border-primary/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          priorityDots[todo.priority]
                        }`}
                      />
                      <p className="font-semibold text-sm">{todo.title}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                        statusStyles[todo.status]
                      }`}
                    >
                      {todo.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {todo.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 className="w-3 h-3" />
                      {todo.dueTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {todo.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      {todo.reminder}
                    </span>
                  </div>
                  <div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${todo.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                      <span>{todo.category}</span>
                      <span>{todo.progress}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-50 bg-white/90 shadow-sm xl:p-4 2xl:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-primary" />
              <h3 className="font-semibold xl:text-lg 2xl:text-xl">
                Progress pulse
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">On track</span>
                <span className="font-medium">
                  {totals.completed} completed
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active focus</span>
                <span className="font-medium">{totals.active} in motion</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Focus score</span>
                <span className="font-medium">{totals.focus}%</span>
              </div>
            </div>
            <div className="rounded-2xl bg-muted px-4 py-3 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                Keep todos small and specific. Done feels better than perfect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TodosPage;
