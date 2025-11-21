"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
  MapPin,
  Plus,
  BarChart3,
  LayoutPanelLeft,
  Sparkles,
  TableProperties,
  Timer,
  Search,
} from "lucide-react";

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
  dueAtIso: string | null;
  location: string;
  reminder: string;
  progress: number;
  tags: string[];
  collectionIds: string[];
}

interface Collection {
  id: string;
  name: string;
  description: string;
  todoIds: string[];
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
    collections?: string[];
  }>;
  initialCollections?: Collection[];
  collectionContext?: {
    id: string;
    name: string;
    description?: string | null;
  };
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

const statusLanes: Status[] = ["Planned", "In Progress", "Completed", "Missed"];

const statusToApi: Record<Status, string> = {
  Planned: "PLANNED",
  "In Progress": "IN_PROGRESS",
  Completed: "COMPLETED",
  Missed: "MISSED",
};

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

const toTagList = (raw: string) =>
  raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const normalizeCollection = (payload: any): Collection => ({
  id: payload?.id as string,
  name: (payload?.name as string) || "Untitled",
  description: payload?.description || "",
  todoIds: Array.isArray(payload?.todoIds) ? payload.todoIds : [],
});

const mapToRow = (
  todo: NonNullable<TodosPageProps["initialTodos"]>[number]
): TodoRow => {
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
    dueAtIso: todo.dueAt,
    location: todo.location || "No location",
    reminder: todo.reminder || "No reminder",
    progress: deriveProgress(status),
    tags: toTagList(todo.tags || ""),
    collectionIds: todo.collections || [],
  };
};

type TabKey = "board" | "list" | "analytics";

const TodosPage: React.FC<TodosPageProps> = ({
  initialTodos = [],
  initialCollections = [],
  collectionContext,
}) => {
  const [todos, setTodos] = useState<TodoRow[]>(() =>
    initialTodos.map(mapToRow)
  );
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("board");
  const [collections, setCollections] = useState<Collection[]>(
    initialCollections.map(normalizeCollection)
  );
  const [newCollection, setNewCollection] = useState<{
    name: string;
    description: string;
    todoIds: string[];
  }>({ name: "", description: "", todoIds: [] });
  const [collectionMessage, setCollectionMessage] = useState<string | null>(
    null
  );
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [collectionPending, setCollectionPending] = useState(false);
  const [assignmentPending, setAssignmentPending] = useState(false);
  const [pickerOpenId, setPickerOpenId] = useState<string | null>(null);
  const [collectionAssignSearch, setCollectionAssignSearch] = useState("");
  const [newCollectionSearch, setNewCollectionSearch] = useState("");
  const isCollectionView = Boolean(collectionContext);

  const tabs: Array<{
    id: TabKey;
    label: string;
    Icon: typeof LayoutPanelLeft;
  }> = useMemo(() => {
    const shared = [
      { id: "board", label: "Board", Icon: LayoutPanelLeft },
      { id: "list", label: "List", Icon: TableProperties },
      { id: "analytics", label: "Analytics", Icon: BarChart3 },
    ] as const;

    return shared;
  }, []);

  useEffect(() => {
    setTodos(initialTodos.map(mapToRow));
  }, [initialTodos]);

  useEffect(() => {
    setCollections(initialCollections.map(normalizeCollection));
  }, [initialCollections]);

  const availableTodos = useMemo(
    () => todos.filter((todo) => todo.collectionIds.length === 0),
    [todos]
  );

  const visibleTodos = useMemo(() => {
    if (isCollectionView && collectionContext) {
      return todos.filter((todo) =>
        todo.collectionIds.includes(collectionContext.id)
      );
    }
    return availableTodos;
  }, [availableTodos, collectionContext, isCollectionView, todos]);

  const filtered = useMemo(() => {
    if (tagFilter.length === 0) return visibleTodos;
    const targets = tagFilter.map((tag) => tag.toLowerCase());
    return visibleTodos.filter((todo) =>
      todo.tags.some((tag) => targets.includes(tag.toLowerCase()))
    );
  }, [tagFilter, visibleTodos]);

  const grouped = useMemo(
    () =>
      statusLanes.map((status) => ({
        status,
        items: filtered.filter((todo) => todo.status === status),
      })),
    [filtered]
  );

  const uniqueTags = useMemo(() => {
    const all = visibleTodos.flatMap((todo) => todo.tags);
    return Array.from(new Set(all));
  }, [visibleTodos]);

  const totals = useMemo(() => {
    const completed = visibleTodos.filter(
      (todo) => todo.status === "Completed"
    ).length;
    const active = visibleTodos.filter(
      (todo) => todo.status === "In Progress" || todo.status === "Planned"
    ).length;
    const focus =
      visibleTodos.length === 0
        ? 0
        : Math.round(
            visibleTodos.reduce((sum, todo) => sum + todo.progress, 0) /
              visibleTodos.length
          );

    return { completed, active, focus };
  }, [visibleTodos]);

  const handleDrop = async (event: React.DragEvent, targetStatus: Status) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/todo-id");
    setDraggingId(null);
    setShowTagPicker(false);

    if (!id) return;
    const current = todos.find((todo) => todo.id === id);
    if (!current || current.status === targetStatus) return;

    const previousStatus = current.status;
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, status: targetStatus } : todo
      )
    );

    try {
      setUpdatingId(id);
      await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusToApi[targetStatus] }),
      });
    } catch (error) {
      console.error(error);
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, status: previousStatus } : todo
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const listColumns = [
    { key: "title", label: "Title" },
    { key: "status", label: "Status" },
    { key: "priority", label: "Priority" },
    { key: "date", label: "Due" },
    { key: "reminder", label: "Reminder" },
    { key: "recurrence", label: "Recurrence" },
    { key: "location", label: "Location" },
    { key: "tags", label: "Tags" },
  ];

  const upcoming = filtered
    .filter((todo) => todo.dueAtIso)
    .sort((a, b) => {
      const first = a.dueAtIso ? new Date(a.dueAtIso).getTime() : Infinity;
      const second = b.dueAtIso ? new Date(b.dueAtIso).getTime() : Infinity;
      return first - second;
    })
    .slice(0, 5);

  const statusBreakdown = statusLanes.map((status) => ({
    status,
    count: visibleTodos.filter((todo) => todo.status === status).length,
  }));

  const tagCounts = filtered.reduce<Record<string, number>>((acc, todo) => {
    todo.tags.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const filteredCreationTodos = useMemo(() => {
    const term = newCollectionSearch.trim().toLowerCase();
    if (!term) return availableTodos;
    return availableTodos.filter((todo) => {
      if (todo.title.toLowerCase().includes(term)) return true;
      return todo.tags.some((tag) => tag.toLowerCase().includes(term));
    });
  }, [availableTodos, newCollectionSearch]);

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) return;
    setCollectionMessage(null);
    setCollectionError(null);
    setCollectionPending(true);

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCollection.name.trim(),
          description: newCollection.description,
          todoIds: newCollection.todoIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create collection");
      }

      const data = await response.json();
      const saved = normalizeCollection(data.collection);

      setCollections((prev) => [...prev, saved]);
      setTodos((prev) =>
        prev.map((todo) =>
          saved.todoIds.includes(todo.id)
            ? {
                ...todo,
                collectionIds: Array.from(
                  new Set([...(todo.collectionIds || []), saved.id])
                ),
              }
            : todo
        )
      );
      setNewCollection({ name: "", description: "", todoIds: [] });
      setNewCollectionSearch("");
      setCollectionMessage("Collection saved");
    } catch (error) {
      console.error(error);
      setCollectionError("Unable to save the collection right now.");
    } finally {
      setCollectionPending(false);
    }
  };

  const toggleCollectionTodo = (todoId: string) => {
    setNewCollection((prev) => {
      const exists = prev.todoIds.includes(todoId);
      return {
        ...prev,
        todoIds: exists
          ? prev.todoIds.filter((id) => id !== todoId)
          : [...prev.todoIds, todoId],
      };
    });
  };

  const addTodoToExistingCollection = async (
    todoId: string,
    collectionId: string
  ) => {
    setCollectionMessage(null);
    setCollectionError(null);
    setAssignmentPending(true);
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todoId, action: "add" }),
      });

      if (!response.ok) {
        throw new Error("Update failed");
      }

      const data = await response.json();
      const updated = normalizeCollection(data.collection);
      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === collectionId ? updated : collection
        )
      );
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId
            ? {
                ...todo,
                collectionIds: Array.from(
                  new Set([...(todo.collectionIds || []), collectionId])
                ),
              }
            : todo
        )
      );
      setCollectionMessage("Todo added to collection");
      setPickerOpenId(null);
      setCollectionAssignSearch("");
    } catch (error) {
      console.error(error);
      setCollectionError("Unable to update the collection right now.");
    } finally {
      setAssignmentPending(false);
    }
  };

  return (
    <main className="w-full min-h-screen xl:pt-20 2xl:pt-24 text-foreground pb-8">
      <div className="xl:px-8 2xl:px-28 pb-10 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <BadgeCheck className="w-4 h-4" />
              <span>
                {isCollectionView ? "Collection overview" : "Todos overview"}
              </span>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                {isCollectionView
                  ? `${collectionContext?.name || "Collection"} todos`
                  : "Your todos"}
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                {isCollectionView
                  ? collectionContext?.description ||
                    "Manage the todos that live inside this collection. Items you assign here stay out of the main list."
                  : "Unassigned todos live here. Drag them between statuses, then drop them into a collection when you're ready to move them off the main board."}
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-2 sm:gap-3">
            {isCollectionView ? (
              <Link
                href="/dashboard/todos"
                className={`${buttonBase} xl:h-10 2xl:h-12 xl:px-4 2xl:px-6 xl:text-sm 2xl:text-base bg-white border border-gray-200 shadow-sm hover:border-primary/40`}
              >
                Back to all todos
              </Link>
            ) : null}
            <Link
              href="/dashboard/todos/create"
              className={`${buttonBase} xl:h-10 2xl:h-12 xl:px-4 2xl:px-6 xl:text-sm 2xl:text-base bg-white border border-gray-200 shadow-sm hover:border-primary/40`}
            >
              <Plus className="w-4 h-4" />
              New todo
            </Link>
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
      </div>
      <div className="w-full h-auto xl:px-8 2xl:px-28">
        <div className="bg-white/90 border border-gray-50 shadow-sm xl:rounded-2xl 2xl:rounded-3xl xl:p-4 2xl:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" />
              <h2 className="font-semibold xl:text-lg 2xl:text-xl">
                Todo views
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-full bg-muted/70 p-1 shadow-inner">
                {tabs.map(({ id, label, Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? "bg-white text-foreground shadow-sm border border-gray-100"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowTagPicker((open) => !open)}
                  className="px-3 py-2 rounded-full text-sm transition border bg-white text-muted-foreground border-gray-100 hover:border-primary/30 flex items-center gap-2"
                  type="button"
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>
                    {tagFilter.length === 0
                      ? "All tags"
                      : `Tags: ${tagFilter.join(", ")}`}
                  </span>
                </button>
                {showTagPicker ? (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-100 bg-white shadow-xl p-3 z-10">
                    <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                      <span>Select tags</span>
                      <button
                        type="button"
                        className="hover:text-primary"
                        onClick={() => setTagFilter([])}
                      >
                        Clear
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {uniqueTags.length === 0 ? (
                        <div className="col-span-2 text-xs text-muted-foreground px-2 py-1">
                          No tags yet
                        </div>
                      ) : (
                        uniqueTags.map((tag) => {
                          const active = tagFilter.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setTagFilter((prev) =>
                                  prev.includes(tag)
                                    ? prev.filter((t) => t !== tag)
                                    : [...prev, tag]
                                );
                              }}
                              className={`w-full px-3 py-2 rounded-xl border transition text-left ${
                                active
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white text-foreground border-gray-100 hover:border-primary/40"
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {activeTab === "board" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {grouped.map(({ status, items }) => (
                <div
                  key={status}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, status)}
                  className={`rounded-2xl border border-gray-100 bg-white/80 shadow-sm xl:p-4 2xl:p-5 min-h-[240px] transition ${
                    draggingId ? "ring-1 ring-primary/40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span className="font-semibold text-sm">{status}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {items.length} {items.length === 1 ? "todo" : "todos"}
                    </span>
                  </div>

                  <div className="pt-3 space-y-3">
                    {items.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-muted/50 px-3 py-4 text-xs text-muted-foreground text-center">
                        Drop a todo here
                      </div>
                    ) : (
                      items.map((todo) => (
                        <Link
                          key={todo.id}
                          href={`/dashboard/todos/${todo.id}/edit`}
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData("text/todo-id", todo.id);
                            event.dataTransfer.effectAllowed = "move";
                            setDraggingId(todo.id);
                          }}
                          onDragEnd={() => setDraggingId(null)}
                          className={`block rounded-xl border border-gray-100 bg-white px-3 py-3 shadow-sm hover:border-primary/40 hover:shadow transition ${
                            draggingId === todo.id ? "opacity-70" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="font-semibold text-sm leading-tight">
                                {todo.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3" />
                                  {todo.dueDate}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock3 className="w-3 h-3" />
                                  {todo.dueTime}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {todo.location}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-[11px] font-semibold ${
                                statusStyles[todo.status]
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                              {todo.status}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                  priorityDots[todo.priority]
                                }`}
                              />
                              <span className="text-xs">{todo.priority}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${todo.progress}%` }}
                                />
                              </div>
                              <span>{todo.progress}%</span>
                            </div>
                          </div>
                          {updatingId === todo.id ? (
                            <p className="mt-2 text-[11px] text-primary">
                              Updating status...
                            </p>
                          ) : null}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "list" ? (
            <div className="rounded-2xl border border-gray-100 bg-white/80 shadow-sm overflow-hidden">
              <div className="grid grid-cols-8 bg-muted/50 px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                {listColumns.map((column) => (
                  <span key={column.key} className="truncate">
                    {column.label}
                  </span>
                ))}
              </div>
              <div className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-muted-foreground">
                    No todos match these tags.
                  </div>
                ) : (
                  filtered.map((todo) => (
                    <Link
                      key={todo.id}
                      href={`/dashboard/todos/${todo.id}/edit`}
                      className="grid grid-cols-8 px-4 py-4 text-sm items-center hover:bg-primary/5 transition"
                    >
                      <span className="truncate font-semibold">
                        {todo.title}
                      </span>
                      <span className="truncate">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${
                            statusStyles[todo.status]
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                          {todo.status}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 text-xs">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            priorityDots[todo.priority]
                          }`}
                        />
                        {todo.priority}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{todo.dueDate}</span>
                          <span>{todo.dueTime}</span>
                        </div>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {todo.reminder}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {/* Recurrence lives in reminder for now; placeholder for future */}
                        {initialTodos.find((t) => t.id === todo.id)
                          ?.recurrence || "None"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {todo.location}
                      </span>
                      <span className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                        {todo.tags.length === 0 ? (
                          <span className="text-muted-foreground/70">—</span>
                        ) : (
                          todo.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))
                        )}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {activeTab === "analytics" ? (
            <div className="grid gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white/80 shadow-sm xl:col-span-2">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">
                      Upcoming schedule
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Soonest first
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {upcoming.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground">
                      No upcoming todos with dates yet.
                    </div>
                  ) : (
                    upcoming.map((todo) => (
                      <Link
                        key={todo.id}
                        href={`/dashboard/todos/${todo.id}/edit`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                          <div className="space-y-0.5">
                            <p className="font-semibold text-sm">
                              {todo.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {todo.dueDate}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="w-3 h-3" />
                                {todo.dueTime}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {todo.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-[11px] font-semibold ${
                            statusStyles[todo.status]
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                          {todo.status}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white/80 shadow-sm space-y-4 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Status breakdown</h3>
                </div>
                <div className="space-y-3">
                  {statusBreakdown.map(({ status, count }) => (
                    <div
                      key={status}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span>{status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${
                                visibleTodos.length
                                  ? (count / visibleTodos.length) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ListChecks className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Tag highlights</h3>
                  </div>
                  {sortedTags.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Add tags to see focus areas here.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {sortedTags.map(([tag, count]) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                        >
                          {tag}
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white border border-gray-100">
                            {count}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {!isCollectionView ? (
            <div className="rounded-3xl border border-gray-50 bg-linear-to-r from-primary/5 via-white to-green-soft/10 shadow-inner p-6 space-y-6 mt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary shadow-sm border border-primary/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Collections</span>
                  </div>
                  <h3 className="text-xl font-semibold">
                    Collections overview
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    Unassigned todos live in the views above. Drop one into a
                    collection to move it there and keep this main board
                    focused.
                  </p>
                </div>
                <Link
                  href="/dashboard/todos/create"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add a todo first
                </Link>
              </div>

              {(collectionMessage || collectionError) && (
                <div
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    collectionMessage
                      ? "border-green-soft/50 bg-green-soft/10 text-foreground"
                      : "border-destructive/60 bg-destructive/10 text-destructive"
                  }`}
                >
                  {collectionMessage || collectionError}
                </div>
              )}

              <div className="grid xl:grid-cols-3 gap-4">
                <div className="xl:col-span-1 rounded-2xl border border-gray-100 bg-white/80 shadow-sm p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-sm">
                      Create a collection
                    </h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <label className="space-y-1 block">
                      <span className="text-muted-foreground text-xs font-semibold">
                        Name
                      </span>
                      <input
                        value={newCollection.name}
                        onChange={(e) =>
                          setNewCollection((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g. Product Launch"
                        className="w-full rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </label>
                    <label className="space-y-1 block">
                      <span className="text-muted-foreground text-xs font-semibold">
                        Description
                      </span>
                      <textarea
                        value={newCollection.description}
                        onChange={(e) =>
                          setNewCollection((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="What ties these todos together?"
                        className="w-full rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      />
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Add todos
                        </p>
                        <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-1.5 shadow-inner text-xs text-muted-foreground w-full">
                          <Search className="w-3.5 h-3.5 shrink-0" />
                          <input
                            value={newCollectionSearch}
                            onChange={(e) =>
                              setNewCollectionSearch(e.target.value)
                            }
                            placeholder="Search available todos"
                            className="w-full bg-transparent focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-44 overflow-auto space-y-2 pr-1">
                        {availableTodos.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            No todos yet. Create one to add.
                          </p>
                        ) : filteredCreationTodos.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            No todos match that search.
                          </p>
                        ) : (
                          filteredCreationTodos.map((todo) => {
                            const checked = newCollection.todoIds.includes(
                              todo.id
                            );
                            return (
                              <label
                                key={todo.id}
                                className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm hover:border-primary/40 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleCollectionTodo(todo.id)}
                                />
                                <span className="truncate">{todo.title}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateCollection}
                      className="w-full rounded-full bg-primary text-white px-4 py-2 text-sm font-semibold shadow-sm hover:brightness-105 transition disabled:opacity-50"
                      disabled={!newCollection.name.trim() || collectionPending}
                    >
                      {collectionPending ? "Saving..." : "Save collection"}
                    </button>
                  </div>
                </div>

                <div className="xl:col-span-2 grid md:grid-cols-2 gap-3">
                  {collections.length === 0 ? (
                    <div className="md:col-span-2 rounded-2xl border border-dashed border-gray-200 bg-white/60 px-4 py-6 text-sm text-muted-foreground">
                      No collections yet. Add a name, description, and select
                      todos to start grouping.
                    </div>
                  ) : (
                    collections.map((collection) => {
                      const searchTerm = collectionAssignSearch
                        .trim()
                        .toLowerCase();
                      const selectableTodos = availableTodos.filter((todo) => {
                        if (!searchTerm) return true;
                        const inTitle = todo.title
                          .toLowerCase()
                          .includes(searchTerm);
                        const inTags = todo.tags.some((tag) =>
                          tag.toLowerCase().includes(searchTerm)
                        );
                        return inTitle || inTags;
                      });
                      const isPickerOpen = pickerOpenId === collection.id;
                      const assignedCount = collection.todoIds.length;
                      return (
                        <div
                          key={collection.id}
                          className="relative rounded-2xl border border-gray-100 bg-white shadow-sm p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                                Collection
                              </p>
                              <Link
                                href={`/dashboard/todos/collections/${collection.id}`}
                                className="block text-lg font-semibold hover:text-primary transition"
                              >
                                {collection.name}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {collection.description ||
                                  "No description yet."}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-semibold">
                                {assignedCount} todo
                                {assignedCount === 1 ? "" : "s"}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setPickerOpenId((prev) =>
                                    prev === collection.id
                                      ? null
                                      : collection.id
                                  );
                                  setCollectionAssignSearch("");
                                }}
                                className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-white px-2.5 py-2 text-primary shadow-sm hover:border-primary/60 transition disabled:opacity-50"
                                disabled={assignmentPending}
                                aria-label="Add todo to collection"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              <Sparkles className="w-3 h-3" />
                              Opens its own board
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              {availableTodos.length} unassigned left
                            </span>
                          </div>

                          {isPickerOpen ? (
                            <div className="absolute right-0 top-14 z-20 w-full rounded-2xl border border-gray-100 bg-white shadow-2xl">
                              <div className="p-3 border-b border-gray-100">
                                <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-inner text-xs text-muted-foreground">
                                  <Search className="w-3.5 h-3.5" />
                                  <input
                                    value={collectionAssignSearch}
                                    onChange={(e) =>
                                      setCollectionAssignSearch(e.target.value)
                                    }
                                    autoFocus
                                    placeholder="Search todos by title or tag"
                                    className="w-full bg-transparent focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div className="max-h-64 overflow-auto divide-y divide-gray-50">
                                {selectableTodos.length === 0 ? (
                                  <div className="px-3 py-3 text-xs text-muted-foreground">
                                    No matching todos
                                  </div>
                                ) : (
                                  selectableTodos.map((todo) => (
                                    <button
                                      key={todo.id}
                                      type="button"
                                      onClick={() =>
                                        addTodoToExistingCollection(
                                          todo.id,
                                          collection.id
                                        )
                                      }
                                      className="w-full text-left px-3 py-3 hover:bg-primary/5 transition"
                                      disabled={assignmentPending}
                                    >
                                      <p className="font-semibold text-sm truncate">
                                        {todo.title}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1">
                                          <CalendarDays className="w-3 h-3" />
                                          {todo.dueDate}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                          <Clock3 className="w-3 h-3" />
                                          {todo.dueTime}
                                        </span>
                                      </p>
                                      <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                                        {todo.tags.map((tag) => (
                                          <span
                                            key={tag}
                                            className="px-2 py-0.5 rounded-full bg-muted"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          ) : null}

                          <div className="text-xs text-muted-foreground">
                            Assigned todos move off the main board and appear
                            here.
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default TodosPage;
