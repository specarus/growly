"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import type React from "react";
import {
  type LucideIcon,
  BadgeCheck,
  Bell,
  CalendarDays,
  CheckSquare,
  Clock3,
  Flag,
  Hash,
  icons,
  ListChecks,
  MapPin,
  Palette,
  Repeat,
  Sparkles,
  Target,
  Trash,
} from "lucide-react";

import Button from "@/app/components/ui/button";
import type { TodoInput } from "@/lib/actions/todo-actions";

type PriorityLabel = "Low" | "Medium" | "High" | "Critical";
type StatusLabel = "Planned" | "In Progress" | "Completed" | "Missed";
type Recurrence = "None" | "Daily" | "Weekly" | "Monthly";

interface FormState {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  category: string;
  priority: PriorityLabel;
  reminder: string;
  recurrence: Recurrence;
  tags: string;
  status: StatusLabel;
  iconName: string;
  iconColor: string;
}

interface ChecklistItem {
  id: number;
  label: string;
  done: boolean;
}

interface TodoFormProps {
  mode?: "create" | "edit";
  initialTodo?: {
    id?: string;
    title?: string | null;
    description?: string | null;
    category?: string | null;
    priority?: string | null;
    status?: string | null;
    dueAt?: string | null;
    durationMinutes?: number | null;
    location?: string | null;
    reminder?: string | null;
    recurrence?: string | null;
    tags?: string | null;
    iconName?: string | null;
    iconColor?: string | null;
  };
}

const badgeByPriority: Record<PriorityLabel, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-yellow-soft text-yellow-soft-foreground",
  High: "bg-coral text-white",
  Critical: "bg-primary text-white",
};

const pillByPriority: Record<PriorityLabel, string> = {
  Low: "border border-gray-200 bg-white text-muted-foreground hover:border-primary/40",
  Medium:
    "border border-yellow-soft/70 bg-yellow-soft/20 text-foreground hover:border-yellow-soft",
  High: "border border-coral/80 bg-coral/90 text-white hover:border-coral",
  Critical:
    "border border-primary/80 bg-primary text-white hover:border-primary",
};

const progressByPriority: Record<PriorityLabel, number> = {
  Low: 35,
  Medium: 55,
  High: 75,
  Critical: 90,
};

const inputClassName =
  "w-full rounded-2xl border border-gray-100 bg-white/90 px-4 py-3 xl:text-sm 2xl:text-base text-foreground placeholder:text-muted-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30";

const colorPalette = [
  { name: "Sky", value: "#BAE6FD" },
  { name: "Mint", value: "#BBF7D0" },
  { name: "Lemon", value: "#FEF9C3" },
  { name: "Coral", value: "#FECACA" },
  { name: "Lilac", value: "#E9D5FF" },
  { name: "Slate", value: "#E5E7EB" },
  { name: "Sunset", value: "#FDE68A" },
  { name: "Ocean", value: "#A5B4FC" },
];

const toPriorityLabel = (priority?: string | null): PriorityLabel => {
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

const toStatusLabel = (status?: string | null): StatusLabel => {
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

const toPriorityEnum = (priority: PriorityLabel) => priority.toUpperCase();

const toStatusEnum = (status: StatusLabel) =>
  status.replace(" ", "_").toUpperCase();

const formatDue = (dueAt?: string | null) => {
  if (!dueAt) return { date: "", time: "" };
  const date = new Date(dueAt);
  const isoDate = date.toISOString();
  return {
    date: isoDate.slice(0, 10),
    time: isoDate.slice(11, 16),
  };
};

const buildDefaultForm = (
  today: string,
  initialTodo?: TodoFormProps["initialTodo"]
): FormState => {
  const dueParts = formatDue(initialTodo?.dueAt || undefined);
  return {
    title: initialTodo?.title || "",
    description: initialTodo?.description || "",
    date: dueParts.date || "",
    time: dueParts.time || "",
    duration: initialTodo?.durationMinutes
      ? `${initialTodo.durationMinutes}`
      : "",
    location: initialTodo?.location || "",
    category: initialTodo?.category || "",
    priority: toPriorityLabel(initialTodo?.priority),
    reminder: initialTodo?.reminder || "No reminder",
    recurrence: (initialTodo?.recurrence as Recurrence) || "None",
    tags: initialTodo?.tags || "",
    status: toStatusLabel(initialTodo?.status),
    iconName: initialTodo?.iconName || "Notebook",
    iconColor: initialTodo?.iconColor || "#E5E7EB",
  };
};

const parseDurationMinutes = (raw: string) => {
  const numeric = parseInt(raw, 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

const CreateTodoPage: React.FC<TodoFormProps> = ({
  mode: modeProp = "create",
  initialTodo,
}) => {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const mode = initialTodo?.id ? "edit" : modeProp;
  const [form, setForm] = useState<FormState>(
    buildDefaultForm(today, initialTodo)
  );
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 1, label: "Define the outcome", done: true },
    { id: 2, label: "Estimate effort and duration", done: false },
    { id: 3, label: "Attach helpful context or links", done: false },
  ]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const formatIconLabel = useCallback((name: string) => {
    const withoutLeadingA =
      name.startsWith("A") && name[1] && /[A-Z]/.test(name[1])
        ? name.slice(1)
        : name;

    return withoutLeadingA
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Za-z])(\d+)/g, "$1 $2")
      .trim();
  }, []);

  const iconOptions = useMemo(
    () =>
      Object.entries(icons)
        .filter(
          ([name, component]) =>
            (typeof component === "function" ||
              typeof component === "object") &&
            component !== null &&
            /^[A-Z]/.test(name)
        )
        .map(
          ([name, component]) =>
            ({
              name,
              label: formatIconLabel(name),
              Icon: component as LucideIcon,
            } as const)
        ),
    [formatIconLabel]
  );

  const SelectedIcon = useMemo(() => {
    const candidate = (icons as Record<string, LucideIcon | undefined>)[
      form.iconName
    ];

    return candidate || Sparkles;
  }, [form.iconName]);

  useEffect(() => {
    setForm(buildDefaultForm(today, initialTodo));
  }, [initialTodo, today]);

  const handleChange =
    (field: keyof FormState) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const toggleChecklist = (id: number) => {
    setChecklist((items) =>
      items.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const buildPayload = (statusOverride?: StatusLabel): TodoInput => ({
    title: form.title || "Untitled todo",
    description: form.description,
    category: form.category,
    priority: toPriorityEnum(form.priority) as TodoInput["priority"],
    status: toStatusEnum(statusOverride || form.status) as TodoInput["status"],
    date: form.date,
    time: form.time,
    durationMinutes: parseDurationMinutes(form.duration),
    location: form.location,
    reminder: form.reminder,
    recurrence: form.recurrence,
    tags: form.tags,
    iconName: form.iconName,
    iconColor: form.iconColor,
  });

  const todoId = initialTodo?.id;

  const handleSubmit = (statusOverride?: StatusLabel) => {
    setFeedback(null);
    setError(null);

    startTransition(async () => {
      try {
        const payload = buildPayload(statusOverride);
        const endpoint =
          mode === "edit" && todoId ? `/api/todos/${todoId}` : "/api/todos";
        const method = mode === "edit" && todoId ? "PUT" : "POST";

        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        const data = await response.json();
        const id = data.todo?.id || todoId;

        if (mode === "edit") {
          setFeedback("Todo updated");
        } else if (id) {
          setFeedback("Todo created");
          router.push(`/dashboard/todos/${id}/edit`);
        }

        router.refresh();
      } catch (err) {
        console.error(err);
        setError("Something went wrong while saving this todo.");
      }
    });
  };

  const handleDelete = () => {
    if (!todoId) return;
    setFeedback(null);
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/todos/${todoId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Delete failed");
        }

        router.push("/dashboard/todos");
        router.refresh();
      } catch (err) {
        console.error(err);
        setError("Unable to delete this todo right now.");
      }
    });
  };

  const formattedDate = form.date
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(new Date(form.date))
    : "Pick a date";

  const summaryTitle = form.title || "Untitled todo";
  const summaryDescription =
    form.description ||
    "Add a quick description so future you knows exactly what to do.";

  const primaryCtaLabel = mode === "edit" ? "Update todo" : "Add todo";

  return (
    <main className="w-full min-h-screen xl:pt-20 2xl:pt-24 text-foreground">
      <div className="xl:px-8 2xl:px-28 pb-8 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <BadgeCheck className="w-4 h-4" />
              <span>{mode === "edit" ? "Edit todo" : "Create todo"}</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                {mode === "edit"
                  ? "Keep this todo moving"
                  : "Bring a new todo to life"}
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Capture the essentials, set a realistic schedule, and keep a
                quick checklist so you can start fast.
              </p>
            </div>
          </div>
          <div className="flex flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              onClick={() => handleSubmit("Planned")}
              disabled={isPending}
              className="xl:min-w-28 2xl:min-w-36 l:h-10 2xl:h-12 xl:px-4 2xl:px-6 xl:text-sm 2xl:text-base bg-white border border-gray-200 shadow-sm hover:border-primary/40 disabled:opacity-60"
            >
              Save draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isPending}
              className="xl:min-w-32 2xl:min-w-40 xl:h-10 2xl:h-12 xl:px-5 2xl:px-7 xl:text-sm 2xl:text-base bg-primary text-white shadow-sm hover:brightness-105 transition disabled:opacity-60"
            >
              {primaryCtaLabel}
            </Button>
            {mode === "edit" && todoId ? (
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="xl:h-10 2xl:h-12 xl:px-4 2xl:px-6 xl:text-sm 2xl:text-base bg-white border border-destructive text-destructive hover:bg-destructive hover:text-white transition disabled:opacity-60"
              >
                <Trash className="w-4 h-4" />
                Delete
              </Button>
            ) : null}
          </div>
        </div>

        {(feedback || error) && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedback
                ? "border-green-soft/60 bg-green-soft/15 text-foreground"
                : "border-destructive/60 bg-destructive/10 text-destructive"
            }`}
          >
            {feedback || error}
          </div>
        )}

        <div className="grid xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">
            <div className="bg-white/90 border border-gray-50 shadow-sm xl:rounded-2xl 2xl:rounded-3xl xl:p-4 2xl:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Target className="xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-primary" />
                  <div>
                    <h2 className="font-semibold xl:text-lg 2xl:text-xl">
                      Todo basics
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Name the todo and add the context you need later.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Step 1</span>
              </div>

              <form
                className="mt-6 space-y-5"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="grid gap-4">
                  <label className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Hash className="w-4 h-4 text-primary" />
                      <span>Title</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        Required
                      </span>
                    </div>
                    <input
                      value={form.title}
                      onChange={handleChange("title")}
                      placeholder="Add a concise title"
                      className={inputClassName}
                    />
                  </label>

                  <label className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <ListChecks className="w-4 h-4 text-primary" />
                      <span>Description</span>
                    </div>
                    <textarea
                      value={form.description}
                      onChange={handleChange("description")}
                      placeholder="Add helpful notes, links, or acceptance criteria."
                      rows={3}
                      className={`${inputClassName} resize-none leading-relaxed`}
                    />
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Category</span>
                    </div>
                    <select
                      value={form.category}
                      onChange={handleChange("category")}
                      className={`${inputClassName} cursor-pointer`}
                    >
                      <option value="">Choose a category</option>
                      {[
                        "Personal",
                        "Work",
                        "Wellness",
                        "Errand",
                        "Creative",
                      ].map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Flag className="w-4 h-4 text-primary" />
                      <span>Priority</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        ["Low", "Medium", "High", "Critical"] as PriorityLabel[]
                      ).map((priority) => (
                        <Button
                          key={priority}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, priority }))
                          }
                          className={`xl:h-10 2xl:h-12 xl:text-xs 2xl:text-sm transition-all ${
                            pillByPriority[priority]
                          } ${
                            form.priority === priority
                              ? "ring-2 ring-primary/50"
                              : ""
                          }`}
                        >
                          {priority}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Icon</span>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowIconPicker((open) => !open)}
                        className="w-full flex items-center justify-between rounded-2xl border border-gray-100 bg-white/90 px-4 py-3 text-left xl:text-sm 2xl:text-base shadow-inner hover:border-primary/40 transition"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="grid place-items-center w-8 h-8 rounded-xl bg-muted text-primary">
                            <SelectedIcon className="w-4 h-4" />
                          </span>
                          <div className="flex flex-col truncate">
                            <span className="font-semibold truncate">
                              {formatIconLabel(form.iconName)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Tap to browse all icons
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {showIconPicker ? "Close" : "Browse"}
                        </span>
                      </button>
                      {showIconPicker ? (
                        <div className="absolute z-20 mt-2 h-64 w-full overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-xl p-2">
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {iconOptions.map(({ name, Icon, label }) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    iconName: name,
                                  }));
                                  setShowIconPicker(false);
                                }}
                                aria-label={label}
                                className={`flex items-center justify-center rounded-xl border p-3 transition hover:border-primary/50 hover:bg-primary/5 ${
                                  form.iconName === name
                                    ? "border-primary/60 bg-primary/10"
                                    : "border-gray-100"
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                                <span className="sr-only">{label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Palette className="w-4 h-4 text-primary" />
                      <span>Accent color</span>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowColorPicker((open) => !open)}
                        className="w-full flex items-center justify-between rounded-2xl border border-gray-100 bg-white/90 px-4 py-3 text-left xl:text-sm 2xl:text-base shadow-inner hover:border-primary/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-8 h-8 rounded-xl border border-gray-100 shadow-inner"
                            style={{ backgroundColor: form.iconColor }}
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {colorPalette.find(
                                (color) => color.value === form.iconColor
                              )?.name || "Custom"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {form.iconColor}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {showColorPicker ? "Close" : "Pick"}
                        </span>
                      </button>
                      {showColorPicker ? (
                        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-gray-100 bg-white shadow-xl p-3">
                          <div className="grid grid-cols-4 gap-3">
                            {colorPalette.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    iconColor: color.value,
                                  }));
                                  setShowColorPicker(false);
                                }}
                                className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-2 text-[11px] transition hover:border-primary/50 hover:bg-primary/5 ${
                                  form.iconColor === color.value
                                    ? "border-primary/60 bg-primary/10"
                                    : "border-gray-100"
                                }`}
                              >
                                <span
                                  className="w-full h-8 rounded-lg border border-white shadow-inner"
                                  style={{ backgroundColor: color.value }}
                                />
                                <span className="font-semibold">
                                  {color.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <label className="space-y-2 block">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Hash className="w-4 h-4 text-primary" />
                    <span>Tags</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Optional
                    </span>
                  </div>
                  <input
                    value={form.tags}
                    onChange={handleChange("tags")}
                    placeholder="Add quick labels — e.g. focus, writing, deep work"
                    className={inputClassName}
                  />
                </label>
              </form>
            </div>

            <div className="bg-white/90 border border-gray-50 shadow-sm xl:rounded-2xl 2xl:rounded-3xl xl:p-4 2xl:p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-primary" />
                  <div>
                    <h2 className="font-semibold xl:text-lg 2xl:text-xl">
                      Schedule & reminders
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Lock in when and where you will do this todo.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Step 2</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span>Due date</span>
                  </div>
                  <input
                    type="date"
                    value={form.date}
                    onChange={handleChange("date")}
                    className={inputClassName}
                  />
                </label>

                <label className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Clock3 className="w-4 h-4 text-primary" />
                    <span>Start time</span>
                  </div>
                  <input
                    type="time"
                    value={form.time}
                    onChange={handleChange("time")}
                    className={inputClassName}
                  />
                </label>

                <label className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Target className="w-4 h-4 text-primary" />
                    <span>Duration (minutes)</span>
                  </div>
                  <input
                    value={form.duration}
                    onChange={handleChange("duration")}
                    placeholder="e.g. 45"
                    className={inputClassName}
                  />
                </label>

                <label className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Location</span>
                  </div>
                  <input
                    value={form.location}
                    onChange={handleChange("location")}
                    placeholder="Where you'll do it"
                    className={inputClassName}
                  />
                </label>

                <label className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Bell className="w-4 h-4 text-primary" />
                    <span>Reminder</span>
                  </div>
                  <select
                    value={form.reminder}
                    onChange={handleChange("reminder")}
                    className={`${inputClassName} cursor-pointer`}
                  >
                    {[
                      "No reminder",
                      "5 minutes before",
                      "15 minutes before",
                      "30 minutes before",
                      "1 hour before",
                      "1 day before",
                    ].map((reminder) => (
                      <option key={reminder} value={reminder}>
                        {reminder}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Repeat className="w-4 h-4 text-primary" />
                    <span>Repeat</span>
                  </div>
                  <select
                    value={form.recurrence}
                    onChange={handleChange("recurrence")}
                    className={`${inputClassName} cursor-pointer`}
                  >
                    {(
                      ["None", "Daily", "Weekly", "Monthly"] as Recurrence[]
                    ).map((recurrence) => (
                      <option key={recurrence} value={recurrence}>
                        {recurrence}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="md:col-span-2 rounded-2xl border border-dashed border-primary/30 bg-light-yellow/50 px-4 py-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">
                        Prep checklist
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Tap to toggle
                    </span>
                  </div>
                  <div className="space-y-2">
                    {checklist.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleChecklist(item.id)}
                        className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                          item.done
                            ? "bg-primary text-white"
                            : "bg-white text-foreground border border-gray-100"
                        }`}
                      >
                        <CheckSquare
                          className={`w-4 h-4 ${
                            item.done ? "text-white" : "text-primary"
                          }`}
                          fill={item.done ? "currentColor" : "none"}
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-inner space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Focus block</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Starts</span>
                      <span className="font-medium">
                        {formattedDate} · {form.time || "--:--"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">
                        {form.duration || "TBD"}m
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${progressByPriority[form.priority]}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                      <span>Energy budget</span>
                      <span>{progressByPriority[form.priority]}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="relative overflow-hidden xl:rounded-2xl 2xl:rounded-3xl border border-gray-50 bg-linear-to-br from-light-yellow via-white to-green-soft/20 shadow-sm xl:p-4 2xl:p-6">
              <div className="absolute -right-10 -top-10 w-36 h-36 bg-primary/10 rounded-full" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Live preview
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      badgeByPriority[form.priority]
                    }`}
                  >
                    {form.priority} priority
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{summaryTitle}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {summaryDescription}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className="w-12 h-12 rounded-2xl grid place-items-center border border-white/60 shadow-inner"
                    style={{ backgroundColor: form.iconColor }}
                  >
                    <SelectedIcon className="w-5 h-5 text-foreground" />
                  </span>
                  <div className="text-sm">
                    <p className="font-semibold">
                      {formatIconLabel(form.iconName)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-primary" />
                    <span>{form.time || "Pick a time"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="truncate">
                      {form.location || "Add where you&apos;ll do this"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="truncate">
                      {form.reminder || "No reminder"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${progressByPriority[form.priority]}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{form.category} category</span>
                    <span>{form.duration}m</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <CheckSquare className="w-4 h-4 text-primary" />
                    <span>First three moves</span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>
                        Prep workspace and pull any resources you&apos;ll need.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Block the {form.duration}m on your calendar.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>
                        Set a timer and honor the reminder you picked.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm">Momentum planner</h4>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Optional
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recurs</span>
                  <span className="font-medium">{form.recurrence}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tags</span>
                  <span className="font-medium truncate">{form.tags}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reminder</span>
                  <span className="font-medium">{form.reminder}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{form.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-muted px-3 py-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  {mode === "edit"
                    ? "Refine, ship, or reschedule. Progress beats perfection."
                    : "Small, clear todos are easier to start. Keep the scope tight and mark it done in one sitting."}
                </p>
              </div>
              <Link
                href="/dashboard/todos"
                className="text-sm text-primary hover:underline"
              >
                Back to all todos
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CreateTodoPage;
