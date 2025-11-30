"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
  MapPin,
  BarChart3,
  LayoutPanelLeft,
  Sparkles,
  Target,
  TableProperties,
  Timer,
  Trash2,
  Search,
  Plus,
} from "lucide-react";

import CollectionCard from "./components/collection-card";
import type { Collection, Priority, Status, TodoRow } from "./types";
import { priorityDots, statusColors } from "./constants";
import MainButton from "@/app/components/ui/main-button";
import { useXP } from "@/app/context/xp-context";
import { XP_PER_TODO } from "@/lib/xp";
import PageHeading from "@/app/components/page-heading";

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

const buttonBase =
  "w-full rounded-full flex items-center justify-center select-none gap-2 cursor-pointer";

const statusLanes: Status[] = ["Planned", "In Progress", "Completed", "Missed"];

const statusToApi: Record<Status, string> = {
  Planned: "PLANNED",
  "In Progress": "IN_PROGRESS",
  Completed: "COMPLETED",
  Missed: "MISSED",
};

const getStatusColor = (status: Status) =>
  statusColors[status] || statusColors.Planned;

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
    tags: toTagList(todo.tags || ""),
    collectionIds: todo.collections || [],
  };
};

type TabKey = "board" | "list" | "analytics" | "focus";

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
  const [collectionDeletingId, setCollectionDeletingId] = useState<
    string | null
  >(null);
  const [assignmentPending, setAssignmentPending] = useState(false);
  const [deleteCompletedPending, setDeleteCompletedPending] = useState(false);
  const [deleteCompletedMessage, setDeleteCompletedMessage] = useState<
    string | null
  >(null);
  const [deleteCompletedError, setDeleteCompletedError] = useState<
    string | null
  >(null);
  const [pickerOpenId, setPickerOpenId] = useState<string | null>(null);
  const [dropTargetCollectionId, setDropTargetCollectionId] = useState<
    string | null
  >(null);
  const [collectionAssignSearch, setCollectionAssignSearch] = useState("");
  const [newCollectionSearch, setNewCollectionSearch] = useState("");
  const isCollectionView = Boolean(collectionContext);
  const router = useRouter();
  const { addXP } = useXP();

  const heroDescriptionHtml = isCollectionView
    ? (
        collectionContext?.description ??
        "Manage the todos that live inside this collection. Items you assign here stay out of the main list."
      ).replace(/\./g, ".<br/>")
    : "Unassigned todos live here. Drag them between statuses, then drop them into a collection when you're ready to move them off the main list.".replace(
        /\./g,
        ".<br/>"
      );

  const handleNewTodo = () => {
    router.push("/dashboard/todos/create");
  };

  const tabs: ReadonlyArray<{
    id: TabKey;
    label: string;
    Icon: typeof LayoutPanelLeft;
  }> = useMemo(() => {
    const shared = [
      { id: "board", label: "Board", Icon: LayoutPanelLeft },
      { id: "list", label: "List", Icon: TableProperties },
      { id: "analytics", label: "Analytics", Icon: BarChart3 },
      { id: "focus", label: "Focus", Icon: Target },
    ] as const;

    return shared;
  }, []);

  useEffect(() => {
    setTodos(initialTodos.map(mapToRow));
  }, [initialTodos]);

  useEffect(() => {
    setCollections(initialCollections.map(normalizeCollection));
  }, [initialCollections]);

  useEffect(() => {
    setDeleteCompletedMessage(null);
    setDeleteCompletedError(null);
  }, [collectionContext?.id, isCollectionView]);

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

    return { completed, active };
  }, [visibleTodos]);

  const visibleCompletedIds = useMemo(
    () =>
      visibleTodos
        .filter((todo) => todo.status === "Completed")
        .map((todo) => todo.id),
    [visibleTodos]
  );

  const handleDrop = async (event: React.DragEvent, targetStatus: Status) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/todo-id");
    setDraggingId(null);
    setShowTagPicker(false);

    if (!id) return;
    const current = todos.find((todo) => todo.id === id);
    if (!current || current.status === targetStatus) return;

    const statusPayload = statusToApi[targetStatus];
    if (!statusPayload) return;

    const previousStatus = current.status;
    const reopenedFromCompleted =
      previousStatus === "Completed" && targetStatus === "In Progress";
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, status: targetStatus } : todo
      )
    );

    try {
      setUpdatingId(id);
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusPayload }),
        credentials: "include",
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          payload?.error || "Failed to update todo status, please try again"
        );
      }

      const confirmedStatus = formatStatus(
        payload?.todo?.status ?? statusPayload
      );
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, status: confirmedStatus } : todo
        )
      );

      if (reopenedFromCompleted) {
        addXP(-XP_PER_TODO);
      }
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

  const handleDeleteCompleted = async () => {
    const targetIds = visibleCompletedIds.slice();
    if (targetIds.length === 0) {
      setDeleteCompletedMessage("No completed todos to delete.");
      setDeleteCompletedError(null);
      return;
    }

    setDeleteCompletedPending(true);
    setDeleteCompletedMessage(null);
    setDeleteCompletedError(null);

    try {
      const params = new URLSearchParams();
      if (isCollectionView && collectionContext?.id) {
        params.set("collectionId", collectionContext.id);
      }

      const query = params.toString();
      const response = await fetch(`/api/todos${query ? `?${query}` : ""}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete completed todos");
      }

      const deletedCount =
        typeof payload?.deleted === "number"
          ? payload.deleted
          : targetIds.length;

      if (deletedCount > 0) {
        setTodos((prev) => prev.filter((todo) => !targetIds.includes(todo.id)));
        setCollections((prev) =>
          prev.map((collection) => ({
            ...collection,
            todoIds: collection.todoIds.filter((id) => !targetIds.includes(id)),
          }))
        );
      }

      setDeleteCompletedMessage(
        deletedCount > 0
          ? `${deletedCount} completed ${
              deletedCount === 1 ? "todo" : "todos"
            } deleted.`
          : "No completed todos were deleted."
      );
    } catch (error) {
      console.error(error);
      setDeleteCompletedError(
        error instanceof Error
          ? error.message
          : "Unable to delete completed todos right now."
      );
    } finally {
      setDeleteCompletedPending(false);
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

  const focusStats = useMemo(() => {
    const completed = visibleTodos.filter(
      (todo) => todo.status === "Completed"
    ).length;
    const missed = visibleTodos.filter(
      (todo) => todo.status === "Missed"
    ).length;
    const total = completed + missed;
    const focusScore = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { completed, missed, total, focusScore };
  }, [visibleTodos]);

  const focusMessage = useMemo(() => {
    if (focusStats.total === 0) {
      return "Complete or miss at least one todo to unlock this score.";
    }

    if (focusStats.focusScore >= 80) {
      return "You are maintaining strong focus.";
    }

    if (focusStats.focusScore >= 50) {
      return "You are keeping a steady pace.";
    }

    return "Wrap up more todos before they slip.";
  }, [focusStats.total, focusStats.focusScore]);

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

  const handleDeleteCollection = async (collectionId: string) => {
    setCollectionMessage(null);
    setCollectionError(null);
    setCollectionDeletingId(collectionId);

    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete collection");
      }

      setCollections((prev) =>
        prev.filter((collection) => collection.id !== collectionId)
      );
      setTodos((prev) =>
        prev.map((todo) => ({
          ...todo,
          collectionIds: todo.collectionIds.filter((id) => id !== collectionId),
        }))
      );
      setPickerOpenId((prev) => (prev === collectionId ? null : prev));
      setCollectionMessage("Collection deleted.");
    } catch (error) {
      console.error(error);
      setCollectionError(
        error instanceof Error
          ? error.message
          : "Unable to delete collection right now."
      );
    } finally {
      setCollectionDeletingId(null);
    }
  };

  const handleCollectionDrop = (todoId: string, collectionId: string) => {
    setDropTargetCollectionId((prev) => (prev === collectionId ? null : prev));
    if (!todoId) return;
    addTodoToExistingCollection(todoId, collectionId);
  };

  return (
    <>
      <main className="relative w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground pb-16 overflow-hidden bg-linear-to-b from-green-soft/20 via-card/70 to-primary/20">
        <div className="pointer-events-none absolute -top-16 right-10 h-64 w-64 rounded-[2.5rem] bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-6 left-12 h-56 w-56 rounded-full bg-green-soft/20 blur-3xl" />
        <div className="relative z-10">
          <div className="xl:px-8 2xl:px-28 pb-8 space-y-8">
            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white/90 px-6 py-6 shadow-sm space-y-6">
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 left-6 h-48 w-48 rounded-full bg-green-soft/30 blur-3xl" />
              <div className="relative z-10 space-y-6">
                <PageHeading
                  badgeLabel={
                    isCollectionView ? "Collection overview" : "Todos overview"
                  }
                  title={
                    isCollectionView
                      ? `${collectionContext?.name || "Collection"} todos`
                      : "Your todos"
                  }
                  titleClassName="xl:text-xl 2xl:text-2xl font-bold"
                  description={
                    <span
                      dangerouslySetInnerHTML={{ __html: heroDescriptionHtml }}
                    />
                  }
                  descriptionClassName="xl:text-xs 2xl:text-sm text-muted-foreground max-w-4xl"
                  actions={
                    isCollectionView ? (
                      <Link
                        href="/dashboard/todos"
                        className={`${buttonBase} xl:h-8 2xl:h-10 xl:px-4 2xl:px-6 xl:text-xs 2xl:text-sm bg-white border border-gray-200 shadow-sm hover:border-primary/40`}
                      >
                        Back to all todos
                      </Link>
                    ) : (
                      <MainButton
                        label="New Todo"
                        icon={
                          <Plus className="xl:w-3 xl:h-3 2xl:w-4 2xl:h-4" />
                        }
                        className="xl:text-xs 2xl:text-sm xl:h-8 2xl:h-10"
                        onClick={handleNewTodo}
                      />
                    )
                  }
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gray-50 bg-white/90 shadow-lg xl:p-3 2xl:p-5 flex items-center gap-3">
                  <div className="xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                    <CheckCircle2 className="xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                      Completed
                    </p>
                    <p className="xl:text-lg 2xl:text-xl font-semibold">
                      {totals.completed}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-50 bg-white/90 shadow-lg xl:p-3 2xl:p-5 flex items-center gap-3">
                  <div className="xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                    <Timer className="xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                      Active
                    </p>
                    <p className="xl:text-lg 2xl:text-xl font-semibold">
                      {totals.active}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-50 bg-white/90 shadow-lg xl:p-3 2xl:p-5 flex items-center gap-3">
                  <div className="xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                    <Target className="xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                      Focus score
                    </p>
                    <p className="xl:text-lg 2xl:text-xl font-semibold">
                      {focusStats.focusScore}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  disabled={
                    deleteCompletedPending || visibleCompletedIds.length === 0
                  }
                  onClick={handleDeleteCompleted}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-full border px-4 py-2 xl:text-xs 2xl:text-sm font-medium text-destructive transition hover:border-destructive/70 hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60 border-destructive/40 bg-destructive/10"
                >
                  <Trash2 className="xl:w-3 xl:h-3 2xl:w-4 2xl:h-4" />
                  Delete completed
                </button>
                {(deleteCompletedMessage || deleteCompletedError) && (
                  <div
                    className={`rounded-2xl border px-3 py-2 text-sm ${
                      deleteCompletedError
                        ? "border-destructive/60 bg-destructive/10 text-destructive"
                        : "border-green-soft/50 bg-green-soft/10 text-foreground"
                    }`}
                  >
                    {deleteCompletedError ?? deleteCompletedMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="w-full h-auto xl:px-8 2xl:px-28">
            <div className="bg-white/90 border border-gray-50 shadow-sm rounded-3xl xl:p-4 2xl:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold xl:text-lg 2xl:text-xl">
                    Todo views
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowTagPicker((open) => !open)}
                      className="px-4 py-2 xl:rounded-xl xl:text-xs 2xl:text-sm transition border bg-white text-muted-foreground border-gray-100 hover:border-muted-foreground/30 flex items-center gap-2"
                      type="button"
                    >
                      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                      <span>
                        {tagFilter.length === 0
                          ? "All tags"
                          : `Tags: ${tagFilter.join(", ")}`}
                      </span>
                    </button>
                    {showTagPicker ? (
                      <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-100 bg-white shadow-xl p-3 z-10">
                        <div className="flex items-center justify-between mb-2 xl:text-[10px] 2xl:text-xs text-muted-foreground">
                          <span>Select tags</span>
                          <button
                            type="button"
                            className="hover:text-primary"
                            onClick={() => setTagFilter([])}
                          >
                            Clear
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 xl:text-xs 2xl:text-sm">
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
                                      ? "bg-muted-foreground/50 text-white border-white"
                                      : "bg-white text-foreground border-gray-100 hover:border-muted-foreground/40"
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
                </div>
              </div>

              {activeTab === "board" ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {grouped.map(({ status, items }) => {
                    const laneStatusColor = getStatusColor(status);
                    return (
                      <div
                        key={status}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDrop(event, status)}
                        className={`rounded-2xl border border-gray-100 bg-white/80 shadow-sm xl:p-4 2xl:p-5 min-h-60 transition ${
                          draggingId ? "ring-1 ring-primary/40" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div
                            className="select-none flex items-center gap-2 px-4 rounded-full py-1"
                            style={{
                              backgroundColor: `${laneStatusColor}22`,
                              color: laneStatusColor,
                            }}
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: laneStatusColor }}
                            />
                            <span className="font-semibold xl:text-xs 2xl:text-sm">
                              {status}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {items.length}{" "}
                            {items.length === 1 ? "todo" : "todos"}
                          </span>
                        </div>

                        <div className="pt-3 space-y-3">
                          {items.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-muted/50 px-3 py-4 text-xs text-muted-foreground text-center">
                              Drop a todo here
                            </div>
                          ) : (
                            items.map((todo) => {
                              const statusColor = getStatusColor(todo.status);
                              return (
                                <Link
                                  key={todo.id}
                                  href={`/dashboard/todos/${todo.id}/edit`}
                                  draggable
                                  onDragStart={(event) => {
                                    event.dataTransfer.setData(
                                      "text/todo-id",
                                      todo.id
                                    );
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
                                  </div>
                                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`h-2.5 w-2.5 rounded-full ${
                                          priorityDots[todo.priority]
                                        }`}
                                      />
                                      <span className="text-xs">
                                        {todo.priority}
                                      </span>
                                    </div>
                                    <span
                                      className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-[11px] font-semibold"
                                      style={{
                                        backgroundColor: `${statusColor}22`,
                                        color: statusColor,
                                      }}
                                    >
                                      <span
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{
                                          backgroundColor: statusColor,
                                        }}
                                      />
                                      {todo.status}
                                    </span>
                                  </div>
                                  {updatingId === todo.id ? (
                                    <p className="mt-2 text-[11px] text-primary">
                                      Updating status...
                                    </p>
                                  ) : null}
                                </Link>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {activeTab === "list" ? (
                <div className="rounded-2xl border border-gray-100 bg-white/80 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-8 gap-4 bg-muted/50 px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
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
                      filtered.map((todo) => {
                        const statusColor = getStatusColor(todo.status);
                        return (
                          <Link
                            key={todo.id}
                            href={`/dashboard/todos/${todo.id}/edit`}
                            className="grid grid-cols-8 px-4 py-4 gap-4 text-sm items-center hover:bg-primary/5 transition"
                          >
                            <span className="truncate font-medium">
                              {todo.title}
                            </span>
                            <span className="truncate">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold"
                                style={{
                                  backgroundColor: `${statusColor}22`,
                                  color: statusColor,
                                }}
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: statusColor }}
                                />
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
                              {initialTodos.find((t) => t.id === todo.id)
                                ?.recurrence || "None"}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {todo.location}
                            </span>
                            <span className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                              {todo.tags.length === 0 ? (
                                <span className="text-muted-foreground/70">
                                  —
                                </span>
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
                        );
                      })
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
                        <span className="font-semibold xl:text-xs 2xl:text-sm">
                          Upcoming schedule
                        </span>
                      </div>
                      <span className="xl:text-[10px] 2xl:text-[11px] text-muted-foreground">
                        Soonest first
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {upcoming.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-muted-foreground">
                          No upcoming todos with dates yet.
                        </div>
                      ) : (
                        upcoming.map((todo) => {
                          const statusColor = getStatusColor(todo.status);
                          return (
                            <Link
                              key={todo.id}
                              href={`/dashboard/todos/${todo.id}/edit`}
                              className="flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition"
                            >
                              <div className="flex items-center gap-3">
                                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                                <div className="space-y-0.5">
                                  <p className="font-medium xl:text-[13px] 2xl:text-sm">
                                    {todo.title}
                                  </p>
                                  <div className="flex items-center gap-2 xl:text-[11px] 2xl:text-xs text-muted-foreground">
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
                                className="inline-flex items-center gap-2 px-2 py-1 rounded-full xl:text-[10px] 2xl:text-[11px] font-semibold"
                                style={{
                                  backgroundColor: `${statusColor}22`,
                                  color: statusColor,
                                }}
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: statusColor }}
                                />
                                {todo.status}
                              </span>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white/80 shadow-sm space-y-4 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold xl:text-xs 2xl:text-sm">
                        Status breakdown
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {statusBreakdown.map(({ status, count }) => (
                        <div
                          key={status}
                          className="flex items-center justify-between xl:text-xs 2xl:text-sm"
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
                            <span className="text-muted-foreground">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <ListChecks className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold xl:text-xs 2xl:text-sm">
                          Tag highlights
                        </h3>
                      </div>
                      {sortedTags.length === 0 ? (
                        <p className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
                          Add tags to see focus areas here.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {sortedTags.map(([tag, count]) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-2 pl-3 pr-1 py-1 rounded-full bg-muted xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground"
                            >
                              {tag}
                              <span className="xl:text-[9px] 2xl:text-[10px] px-1.5 p-0.5 rounded-full bg-white border border-gray-100">
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

              {activeTab === "focus" ? (
                <div className="grid gap-4 xl:grid-cols-3">
                  <div className="xl:col-span-2 rounded-2xl border border-gray-100 bg-white/80 shadow-sm p-6 space-y-6">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm text-muted-foreground">
                        Focus score
                      </span>
                    </div>
                    <div className="flex items-end justify-between gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="text-5xl font-semibold text-foreground">
                          {focusStats.focusScore}
                        </p>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        <p className="whitespace-nowrap">
                          {focusStats.completed} completed • {focusStats.missed}{" "}
                          missed
                        </p>
                        <p className="mt-1">{focusMessage}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded-full bg-muted/40">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${focusStats.focusScore}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {focusStats.total === 0
                          ? "No completed or missed todos tracked yet."
                          : `${focusStats.total} todos influence this score.`}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white/80 shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm">Focus breakdown</h3>
                    </div>
                    {[
                      {
                        label: "Completed",
                        value: focusStats.completed,
                        color: "bg-primary",
                      },
                      {
                        label: "Missed",
                        value: focusStats.missed,
                        color: "bg-destructive/60",
                      },
                    ].map(({ label, value, color }) => {
                      const ratio = focusStats.total
                        ? (value / focusStats.total) * 100
                        : 0;
                      return (
                        <div key={label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{label}</span>
                            <span className="font-semibold">{value}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted/30">
                            <div
                              className={`${color} h-full rounded-full`}
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className="border-t border-gray-100 pt-3 text-[11px] text-muted-foreground">
                      {focusStats.total} tracked todo
                      {focusStats.total === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
              ) : null}

              {!isCollectionView ? (
                <div className="rounded-3xl border border-gray-50 bg-linear-to-br from-primary/30 via-slate-200 to-green-soft/30 shadow-inner p-6 space-y-6 mt-6">
                  <div className="flex flex-row items-center justify-between gap-3">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.2em] text-primary shadow-sm border border-primary/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Collections</span>
                      </div>
                      <h3 className="xl:text-lg 2xl:text-xl font-semibold xl:pt-2 2xl:pt-4">
                        Collections overview
                      </h3>
                      <p className="xl:text-xs 2xl:text-sm text-muted-foreground max-w-2xl">
                        Unassigned todos live in the views above.<br></br>Drop
                        one into a collection to move it there and keep this
                        main board focused.
                      </p>
                    </div>
                  </div>

                  {(collectionMessage || collectionError) && (
                    <div
                      className={`rounded-xl border px-3 py-2 xl:text-xs 2xl:text-sm ${
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
                        <h4 className="font-semibold xl:text-sm">
                          Create a collection
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <label className="space-y-2 block xl:text-xs 2xl:text-sm">
                          <span className="text-muted-foreground xl:text-xs font-semibold">
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
                        <label className="space-y-2 block xl:text-xs 2xl:text-sm">
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
                          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-1.5 shadow-inner xl:text-[11px] 2xl:text-xs text-muted-foreground w-full">
                            <Search className="w-3.5 h-3.5 shrink-0" />
                            <input
                              value={newCollectionSearch}
                              onChange={(e) =>
                                setNewCollectionSearch(e.target.value)
                              }
                              placeholder="Search available todos"
                              className="w-full bg-transparent focus:outline-none py-1"
                            />
                          </div>
                          <div className="max-h-44 overflow-auto space-y-2 pr-1">
                            {availableTodos.length === 0 ? (
                              <p className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
                                No todos yet. Create one to add.
                              </p>
                            ) : filteredCreationTodos.length === 0 ? (
                              <p className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
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
                                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2 xl:text-xs 2xl:text-sm hover:border-primary/40 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        toggleCollectionTodo(todo.id)
                                      }
                                      className="appearance-none h-4 w-4 border-2 border-primary rounded-full checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 cursor-pointer"
                                    />
                                    <span className="truncate">
                                      {todo.title}
                                    </span>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCreateCollection}
                          className="w-full rounded-full bg-primary text-white px-4 py-2 xl:text-xs 2xl:text-sm font-semibold shadow-sm hover:brightness-105 transition disabled:opacity-50"
                          disabled={
                            !newCollection.name.trim() || collectionPending
                          }
                        >
                          {collectionPending ? "Saving..." : "Save collection"}
                        </button>
                      </div>
                    </div>

                    <div className="xl:col-span-2">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
                        {collections.length === 0 ? (
                          <div className="sm:col-span-2 lg:col-span-3 2xl:col-span-4 rounded-2xl border border-dashed border-gray-200 bg-white/60 px-4 py-6 xl:text-xs 2xl:text-sm text-muted-foreground">
                            No collections yet.<br></br>Add a name, description,
                            and select todos to start grouping.
                          </div>
                        ) : (
                          collections.map((collection) => {
                            const searchTerm = collectionAssignSearch
                              .trim()
                              .toLowerCase();
                            const selectableTodos = availableTodos.filter(
                              (todo) => {
                                if (!searchTerm) return true;
                                const inTitle = todo.title
                                  .toLowerCase()
                                  .includes(searchTerm);
                                const inTags = todo.tags.some((tag) =>
                                  tag.toLowerCase().includes(searchTerm)
                                );
                                return inTitle || inTags;
                              }
                            );
                            const isPickerOpen = pickerOpenId === collection.id;
                            const collectionTodos = todos.filter((todo) =>
                              todo.collectionIds.includes(collection.id)
                            );
                            const assignedCount = Math.max(
                              collection.todoIds.length,
                              collectionTodos.length
                            );

                            return (
                              <CollectionCard
                                key={collection.id}
                                collection={collection}
                                assignedCount={assignedCount}
                                selectableTodos={selectableTodos}
                                isPickerOpen={isPickerOpen}
                                assignmentPending={assignmentPending}
                                collectionAssignSearch={collectionAssignSearch}
                                onCollectionAssignSearch={(value) =>
                                  setCollectionAssignSearch(value)
                                }
                                onTogglePicker={() => {
                                  setPickerOpenId((prev) =>
                                    prev === collection.id
                                      ? null
                                      : collection.id
                                  );
                                  setCollectionAssignSearch("");
                                }}
                                onAddTodo={(todoId) =>
                                  addTodoToExistingCollection(
                                    todoId,
                                    collection.id
                                  )
                                }
                                onDelete={() =>
                                  handleDeleteCollection(collection.id)
                                }
                                deleting={
                                  collectionDeletingId === collection.id
                                }
                                isDropTarget={
                                  dropTargetCollectionId === collection.id
                                }
                                onDragEnter={() =>
                                  setDropTargetCollectionId(collection.id)
                                }
                                onDragLeave={() =>
                                  setDropTargetCollectionId((prev) =>
                                    prev === collection.id ? null : prev
                                  )
                                }
                                onDropTodo={(todoId) =>
                                  handleCollectionDrop(todoId, collection.id)
                                }
                              />
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default TodosPage;
