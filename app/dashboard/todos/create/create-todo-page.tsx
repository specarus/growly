"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type React from "react";
import {
  type LucideIcon,
  Bell,
  CalendarDays,
  ChevronDown,
  Clock3,
  Flag,
  Group,
  Hash,
  Hourglass,
  icons,
  ListChecks,
  MapPin,
  Palette,
  Repeat,
  Sparkles,
  Target,
  Trash,
  X,
} from "lucide-react";

import Button from "@/app/components/ui/button";
import type { TodoInput } from "@/lib/actions/todo-actions";
import PlantBanner from "@/app/components/ui/plant-banner";
import CalendarDropdown from "@/app/components/ui/calendar-dropdown";
import TimeInput from "@/app/components/ui/time-input";
import PageHeading from "@/app/components/page-heading";

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
  tags: string[];
  status: StatusLabel;
  iconName: string;
  iconColor: string;
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

const inputClassName =
  "w-full border-none bg-transparent px-4 py-3 xl:text-xs 2xl:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none xl:text-sm 2xl:text-base";

const fieldButtonClassName =
  "w-full flex items-center justify-between rounded-2xl border border-gray-100 bg-white/90 px-4 py-3 xl:text-xs 2xl:text-sm font-medium text-foreground shadow-inner transition-all hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const dropdownSelectWrapperClassName =
  "relative overflow-visible rounded-2xl border border-gray-100 bg-gradient-to-br from-white/95 to-white/70 shadow-inner transition-colors hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-0";

const categoryOptions = ["Personal", "Work"];
const CATEGORY_PLACEHOLDER = "Choose a category";

const categoryDropdownOptionsId = "category-dropdown-options";
const reminderOptions = [
  "No reminder",
  "5 minutes before",
  "15 minutes before",
  "30 minutes before",
  "1 hour before",
  "1 day before",
];
const reminderDropdownOptionsId = "reminder-dropdown-options";
const recurrenceOptions: Recurrence[] = ["None", "Daily", "Weekly", "Monthly"];
const recurrenceDropdownOptionsId = "recurrence-dropdown-options";

const parseTagList = (raw?: string | null) => {
  const seen = new Set<string>();
  return (raw || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => {
      const normalized = tag.toLowerCase();
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
};

const serializeTags = (tags: string[]) =>
  tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(",");

const sanitizeDropdownValue = (value: string) =>
  value.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();

const toDropdownOptionId = (field: string, value: string) =>
  `${field}-option-${sanitizeDropdownValue(value)}`;

const toCategoryOptionId = (value: string) =>
  toDropdownOptionId("category", value);
const toReminderOptionId = (value: string) =>
  toDropdownOptionId("reminder", value);
const toRecurrenceOptionId = (value: string) =>
  toDropdownOptionId("recurrence", value);

const updateDropdownDirection = (
  toggleRef: React.RefObject<HTMLButtonElement | null>,
  panelRef: React.RefObject<HTMLDivElement | null>,
  setDirection: React.Dispatch<React.SetStateAction<"down" | "up">>
) => {
  if (typeof window === "undefined") {
    return;
  }
  const toggleRect = toggleRef.current?.getBoundingClientRect();
  if (!toggleRect) {
    return;
  }
  const panelHeight = panelRef.current?.getBoundingClientRect().height ?? 0;
  const spacing = 8;
  const spaceBelow = window.innerHeight - toggleRect.bottom;
  const spaceAbove = toggleRect.top;
  if (spaceBelow >= panelHeight + spacing) {
    setDirection("down");
  } else if (spaceAbove >= panelHeight + spacing) {
    setDirection("up");
  } else {
    setDirection("down");
  }
};

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
  if (Number.isNaN(date.getTime())) {
    return { date: "", time: "" };
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
};

const formatTimeForDisplay = (value?: string) => {
  if (!value) return "";
  const [hour, minute] = value.split(":").map((part) => parseInt(part, 10));
  const date = new Date();
  date.setHours(
    Number.isFinite(hour) ? hour : 0,
    Number.isFinite(minute) ? minute : 0
  );
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
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
    tags: parseTagList(initialTodo?.tags),
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
  const [tagInput, setTagInput] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [reminderMenuOpen, setReminderMenuOpen] = useState(false);
  const [recurrenceMenuOpen, setRecurrenceMenuOpen] = useState(false);
  const [categoryDropDirection, setCategoryDropDirection] = useState<
    "down" | "up"
  >("down");
  const [reminderDropDirection, setReminderDropDirection] = useState<
    "down" | "up"
  >("down");
  const [recurrenceDropDirection, setRecurrenceDropDirection] = useState<
    "down" | "up"
  >("down");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const categoryToggleRef = useRef<HTMLButtonElement | null>(null);
  const categoryPanelRef = useRef<HTMLDivElement | null>(null);
  const reminderToggleRef = useRef<HTMLButtonElement | null>(null);
  const reminderPanelRef = useRef<HTMLDivElement | null>(null);
  const recurrenceToggleRef = useRef<HTMLButtonElement | null>(null);
  const recurrencePanelRef = useRef<HTMLDivElement | null>(null);
  const dateToggleRef = useRef<HTMLButtonElement | null>(null);
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
    const base = buildDefaultForm(today, initialTodo);
    setForm(base);
    setTagInput("");
  }, [initialTodo, today]);

  useEffect(() => {
    if (!categoryMenuOpen) return;

    const handleOutside = (event: Event) => {
      const target = event.target as Node | null;
      if (
        categoryToggleRef.current?.contains(target) ||
        categoryPanelRef.current?.contains(target)
      ) {
        return;
      }
      setCategoryMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setCategoryMenuOpen(false);
        categoryToggleRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoryMenuOpen]);

  useEffect(() => {
    if (!reminderMenuOpen) return;

    const handleOutside = (event: Event) => {
      const target = event.target as Node | null;
      if (
        reminderToggleRef.current?.contains(target) ||
        reminderPanelRef.current?.contains(target)
      ) {
        return;
      }
      setReminderMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setReminderMenuOpen(false);
        reminderToggleRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [reminderMenuOpen]);

  useEffect(() => {
    if (!recurrenceMenuOpen) return;

    const handleOutside = (event: Event) => {
      const target = event.target as Node | null;
      if (
        recurrenceToggleRef.current?.contains(target) ||
        recurrencePanelRef.current?.contains(target)
      ) {
        return;
      }
      setRecurrenceMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setRecurrenceMenuOpen(false);
        recurrenceToggleRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [recurrenceMenuOpen]);

  useLayoutEffect(() => {
    if (!categoryMenuOpen) {
      return undefined;
    }
    const update = () =>
      updateDropdownDirection(
        categoryToggleRef,
        categoryPanelRef,
        setCategoryDropDirection
      );
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [categoryMenuOpen]);

  useLayoutEffect(() => {
    if (!reminderMenuOpen) {
      return undefined;
    }
    const update = () =>
      updateDropdownDirection(
        reminderToggleRef,
        reminderPanelRef,
        setReminderDropDirection
      );
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [reminderMenuOpen]);

  useLayoutEffect(() => {
    if (!recurrenceMenuOpen) {
      return undefined;
    }
    const update = () =>
      updateDropdownDirection(
        recurrenceToggleRef,
        recurrencePanelRef,
        setRecurrenceDropDirection
      );
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [recurrenceMenuOpen]);

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

  const handleAddTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim();

    if (!trimmedTag) {
      return;
    }

    setForm((prevForm) => {
      const existingTags = prevForm.tags || [];
      const normalizedNewTag = trimmedTag.toLowerCase();

      const isDuplicate = existingTags.some(
        (t) => t.toLowerCase() === normalizedNewTag
      );

      if (isDuplicate) {
        return prevForm;
      }

      return {
        ...prevForm,
        tags: [...existingTags, trimmedTag],
      };
    });
  }, []);

  const handleTagInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      if (!rawValue.includes(",")) {
        setTagInput(rawValue);
        return;
      }

      const parts = rawValue.split(",");
      const remainder = parts.pop() ?? "";
      parts.forEach((part) => {
        const candidate = part.trim();
        if (candidate) {
          handleAddTag(candidate);
        }
      });
      setTagInput(remainder.trimStart());
    },
    [handleAddTag]
  );

  const handleTagInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleAddTag(tagInput);
        setTagInput("");
      }
    },
    [tagInput, handleAddTag]
  );

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      tags: prevForm.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  const handleDateSelect = (value: string) => {
    setForm((prev) => ({ ...prev, date: value }));
  };

  const handleTimeSelect = (value: string) => {
    setForm((prev) => ({ ...prev, time: value }));
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
    tags: serializeTags(form.tags),
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

  const formattedStartTime = form.time
    ? formatTimeForDisplay(form.time)
    : "Pick a time";

  const summaryTitle = form.title || "Untitled todo";
  const summaryDescription =
    form.description ||
    "Add a quick description so future you knows exactly what to do.";

  const categoryLabel = form.category || CATEGORY_PLACEHOLDER;

  const primaryCtaLabel = mode === "edit" ? "Update todo" : "Add todo";

  return (
    <>
      <main className="xl:px-8 2xl:px-28 pb-16 relative w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground bg-linear-to-b from-white/90 via-light-yellow/55 to-green-soft/15 overflow-hidden">
        <div className="pointer-events-none absolute -top-16 right-10 h-64 w-64 rounded-[2.5rem] bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-12 h-56 w-56 rounded-full bg-green-soft/30 blur-3xl" />
        <div className="relative z-10">
          <div className="space-y-8">
            <PageHeading
              badgeLabel={mode === "edit" ? "Edit todo" : "Create todo"}
              title={
                mode === "edit"
                  ? "Keep this todo moving"
                  : "Bring a new todo to life"
              }
              titleClassName="xl:text-2xl 2xl:text-3xl font-bold"
              description="Capture the essentials and set a realistic schedule so you can start fast."
              actions={
                <div className="flex flex-row gap-2 sm:gap-3">
                  <Button
                    type="button"
                    onClick={() => handleSubmit("Planned")}
                    disabled={isPending}
                    className="xl:min-w-28 2xl:min-w-36 xl:h-8 2xl:h-10 xl:px-4 2xl:px-6 xl:text-sm bg-white border border-gray-200 shadow-sm hover:border-primary/40 disabled:opacity-60"
                  >
                    Save draft
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isPending}
                    className="xl:min-w-32 2xl:min-w-40 xl:h-8 2xl:h-10 xl:text-sm bg-primary text-white shadow-sm hover:brightness-105 transition disabled:opacity-60"
                  >
                    {primaryCtaLabel}
                  </Button>
                  {mode === "edit" && todoId ? (
                    <Button
                      type="button"
                      onClick={handleDelete}
                      disabled={isPending}
                      className="xl:min-w-28 2xl:min-w-36 xl:h-8 2xl:h-10 cursor-pointer inline-flex items-center gap-2 rounded-full border xl:text-sm font-medium text-destructive transition hover:border-destructive/70 hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60 border-destructive/40 bg-destructive/10"
                    >
                      <Trash className="w-4 h-4" />
                      Delete
                    </Button>
                  ) : null}
                </div>
              }
            />
          </div>

          {(feedback || error) && (
            <div
              className={`rounded-2xl border px-4 py-3 xl:text-xs 2xl:text-sm xl:mb-3 2xl:mb-4 ${
                feedback
                  ? "border-green-soft/60 bg-green-soft/15 text-foreground"
                  : "border-destructive/60 bg-destructive/10 text-destructive"
              }`}
            >
              {feedback || error}
            </div>
          )}

          <div className="grid xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-8">
              <div className="bg-white/90 border border-gray-50 shadow-sm xl:rounded-2xl 2xl:rounded-3xl xl:p-4 2xl:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Target className="xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-primary" />
                    <div>
                      <h2 className="font-semibold xl:text-lg 2xl:text-xl">
                        Todo basics
                      </h2>
                      <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
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
                      <div className={dropdownSelectWrapperClassName}>
                        <input
                          value={form.title}
                          onChange={handleChange("title")}
                          placeholder="Add a concise title"
                          className={inputClassName}
                        />
                      </div>
                    </label>

                    <label className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <ListChecks className="w-4 h-4 text-primary" />
                        <span>Description</span>
                      </div>
                      <div className={dropdownSelectWrapperClassName}>
                        <textarea
                          value={form.description}
                          onChange={handleChange("description")}
                          placeholder="Add helpful notes, links, or acceptance criteria."
                          rows={3}
                          className={`${inputClassName} resize-none leading-relaxed`}
                        />
                      </div>
                    </label>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Group className="w-4 h-4 text-primary" />
                        <span>Category</span>
                      </div>
                      <div className={dropdownSelectWrapperClassName}>
                        <button
                          type="button"
                          ref={categoryToggleRef}
                          aria-haspopup="listbox"
                          aria-expanded={categoryMenuOpen}
                          aria-controls={categoryDropdownOptionsId}
                          onClick={() => setCategoryMenuOpen((open) => !open)}
                          className="w-full flex items-center justify-between rounded-2xl border-none bg-transparent px-4 py-3 text-left text-foreground xl:text-xs 2xl:text-sm focus:outline-none focus-visible:outline-none"
                        >
                          <span className="truncate">{categoryLabel}</span>
                          <ChevronDown
                            className={`2xl:h-4 2xl:w-4 xl:h-3 xl:w-3 transition-transform ${
                              categoryMenuOpen
                                ? "rotate-180 text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                        {categoryMenuOpen && (
                          <div
                            ref={categoryPanelRef}
                            id={categoryDropdownOptionsId}
                            role="listbox"
                            aria-activedescendant={
                              form.category
                                ? toCategoryOptionId(form.category)
                                : undefined
                            }
                            className={`absolute left-0 right-0 z-20 max-h-60 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg ${
                              categoryDropDirection === "down"
                                ? "top-full mt-2"
                                : "bottom-full mb-2"
                            }`}
                          >
                            {categoryOptions.map((category) => (
                              <button
                                key={category}
                                id={toCategoryOptionId(category)}
                                role="option"
                                type="button"
                                aria-selected={form.category === category}
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    category,
                                  }));
                                  setCategoryMenuOpen(false);
                                }}
                                className={`w-full rounded-none border-b border-gray-100 px-4 py-3 text-left xl:text-xs 2xl:text-sm transition last:border-b-0 ${
                                  form.category === category
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-foreground hover:bg-primary/5"
                                }`}
                              >
                                {category}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </label>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Flag className="w-4 h-4 text-primary" />
                        <span>Priority</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(
                          [
                            "Low",
                            "Medium",
                            "High",
                            "Critical",
                          ] as PriorityLabel[]
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
                      <div className={dropdownSelectWrapperClassName}>
                        <button
                          type="button"
                          onClick={() => setShowIconPicker((open) => !open)}
                          className="w-full flex items-center justify-between rounded-2xl border border-gray-100 bg-white/90 px-4 py-3 text-left xl:text-sm 2xl:text-base shadow-inner hover:border-primary/40 transition"
                        >
                          <div className="flex items-center gap-3 truncate">
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
                        <span>Accent color</span>{" "}
                      </div>
                      <div className={dropdownSelectWrapperClassName}>
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

                  <label className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Hash className="w-4 h-4 text-primary" />
                      <span>Tags</span>
                    </div>
                    <div className={dropdownSelectWrapperClassName}>
                      <div className="space-y-2">
                        <input
                          value={tagInput}
                          onChange={handleTagInputChange}
                          onKeyDown={handleTagInputKeyDown}
                          placeholder="Type a tag and press Enter"
                          className={inputClassName}
                        />
                      </div>

                      {form.tags && form.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 m-2">
                          {form.tags.map((tag) => (
                            <span
                              key={tag}
                              className="flex items-center text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1.5 focus:outline-none hover:text-red-500 transition-colors"
                                aria-label={`Remove tag ${tag}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                </form>
              </div>

              <div className="bg-white/90 border border-gray-50 shadow-sm xl:rounded-2xl 2xl:rounded-3xl xl:p-4 2xl:p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <CalendarDays className="xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-primary" />
                    <div>
                      <h2 className="font-semibold xl:text-lg 2xl:text-xl">
                        Schedule & reminders
                      </h2>
                      <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                        Lock in when and where you will do this todo.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">Step 2</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="space-y-2 relative">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      <span>Due date</span>
                    </div>
                    <div className={dropdownSelectWrapperClassName}>
                      <button
                        type="button"
                        ref={dateToggleRef}
                        onClick={() => {
                          setShowDateDropdown((prev) => !prev);
                        }}
                        className={fieldButtonClassName}
                        aria-label="Pick a due date"
                        aria-expanded={showDateDropdown}
                      >
                        <span className="flex flex-col items-start gap-1 text-left">
                          <span className="xl:text-xs 2xl:text-sm font-semibold">
                            {formattedDate}
                          </span>
                          <span className="xl:text-[10px] 2xl:text-[11px] text-muted-foreground">
                            {form.date ? "Tap to change" : "Tap to pick a date"}
                          </span>
                        </span>
                        <ChevronDown
                          className={`xl:h-3 xl:w-3 2xl:h-4 2xl:w-4 transition-transform ${
                            showDateDropdown
                              ? "rotate-180 text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                      {showDateDropdown && (
                        <CalendarDropdown
                          selectedDate={form.date}
                          onSelect={handleDateSelect}
                          onClose={() => setShowDateDropdown(false)}
                          anchorRef={dateToggleRef}
                        />
                      )}
                    </div>
                  </label>

                  <label className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Clock3 className="w-4 h-4 text-primary" />
                      <span>Start time</span>
                    </div>
                    <div>
                      <TimeInput time={form.time} onChange={handleTimeSelect} />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <div className="flex items-center gap-2 xl:text-sm font-semibold">
                      <Bell className="w-4 h-4 text-primary" />
                      <span>Reminder</span>
                    </div>
                    <div className={dropdownSelectWrapperClassName}>
                      <button
                        type="button"
                        ref={reminderToggleRef}
                        aria-haspopup="listbox"
                        aria-expanded={reminderMenuOpen}
                        aria-controls={reminderDropdownOptionsId}
                        onClick={() => {
                          setReminderMenuOpen((open) => !open);
                          setRecurrenceMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between rounded-2xl border-none bg-transparent px-4 py-3 text-left text-foreground xl:text-xs 2xl:text-sm focus:outline-none focus-visible:outline-none"
                      >
                        <span className="truncate">
                          {form.reminder || reminderOptions[0]}
                        </span>
                        <ChevronDown
                          className={`xl:h-3 xl:w-3 2xl:h-4 2xl:w-4 transition-transform ${
                            reminderMenuOpen
                              ? "rotate-180 text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                      {reminderMenuOpen && (
                        <div
                          ref={reminderPanelRef}
                          id={reminderDropdownOptionsId}
                          role="listbox"
                          aria-activedescendant={
                            form.reminder
                              ? toReminderOptionId(form.reminder)
                              : undefined
                          }
                          className={`absolute left-0 right-0 z-20 max-h-max overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg ${
                            reminderDropDirection === "down"
                              ? "top-full mt-2"
                              : "bottom-full mb-2"
                          }`}
                        >
                          {reminderOptions.map((reminder) => (
                            <button
                              key={reminder}
                              id={toReminderOptionId(reminder)}
                              role="option"
                              type="button"
                              aria-selected={form.reminder === reminder}
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  reminder,
                                }));
                                setReminderMenuOpen(false);
                              }}
                              className={`w-full rounded-none border-b border-gray-100 px-4 py-3 text-left text-sm transition last:border-b-0 ${
                                form.reminder === reminder
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "text-foreground hover:bg-primary/5"
                              }`}
                            >
                              {reminder}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>

                  <label className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Repeat className="w-4 h-4 text-primary" />
                      <span>Repeat</span>
                    </div>
                    <div className={dropdownSelectWrapperClassName}>
                      <button
                        type="button"
                        ref={recurrenceToggleRef}
                        aria-haspopup="listbox"
                        aria-expanded={recurrenceMenuOpen}
                        aria-controls={recurrenceDropdownOptionsId}
                        onClick={() => {
                          setRecurrenceMenuOpen((open) => !open);
                          setReminderMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between rounded-2xl border-none bg-transparent px-4 py-3 text-left text-foreground xl:text-xs 2xl:text-sm focus:outline-none focus-visible:outline-none"
                      >
                        <span className="truncate">
                          {form.recurrence || recurrenceOptions[0]}
                        </span>
                        <ChevronDown
                          className={`xl:h-3 xl:w-3 2xl:h-4 2xl:w-4 transition-transform ${
                            recurrenceMenuOpen
                              ? "rotate-180 text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                      {recurrenceMenuOpen && (
                        <div
                          ref={recurrencePanelRef}
                          id={recurrenceDropdownOptionsId}
                          role="listbox"
                          aria-activedescendant={
                            form.recurrence
                              ? toRecurrenceOptionId(form.recurrence)
                              : undefined
                          }
                          className={`absolute left-0 right-0 z-20 max-h-60 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg ${
                            recurrenceDropDirection === "down"
                              ? "top-full mt-2"
                              : "bottom-full mb-2"
                          }`}
                        >
                          {recurrenceOptions.map((recurrence) => (
                            <button
                              key={recurrence}
                              id={toRecurrenceOptionId(recurrence)}
                              role="option"
                              type="button"
                              aria-selected={form.recurrence === recurrence}
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  recurrence,
                                }));
                                setRecurrenceMenuOpen(false);
                              }}
                              className={`w-full rounded-none border-b border-gray-100 px-4 py-3 text-left xl:text-xs 2xl:text-sm transition last:border-b-0 ${
                                form.recurrence === recurrence
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "text-foreground hover:bg-primary/5"
                              }`}
                            >
                              {recurrence}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>

                  <label className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Hourglass className="w-4 h-4 text-primary" />
                      <span>Duration (minutes)</span>
                    </div>
                    <div className={dropdownSelectWrapperClassName}>
                      <input
                        value={form.duration}
                        onChange={handleChange("duration")}
                        placeholder="e.g. 45"
                        className={inputClassName}
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>Location</span>
                    </div>
                    <div className={dropdownSelectWrapperClassName}>
                      <input
                        value={form.location}
                        onChange={handleChange("location")}
                        placeholder="Where you'll do it"
                        className={inputClassName}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="relative overflow-hidden xl:rounded-2xl 2xl:rounded-3xl border border-gray-50 bg-linear-to-br from-light-yellow via-white to-green-soft/20 shadow-sm xl:p-4 2xl:p-6 dark:border-gray-900 dark:bg-linear-to-br dark:from-analytics-dark/80 dark:via-analytics-dark/70 dark:to-analytics-dark/90">
                <div className="absolute -right-10 -top-10 w-36 h-36 bg-primary/10 rounded-full" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="xl:text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
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
                    <h3 className="xl:text-lg 2xl:text-xl font-semibold">
                      {summaryTitle}
                    </h3>
                    <p className="xl:text-xs 2xl:text-sm text-muted-foreground leading-relaxed">
                      {summaryDescription}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 rounded-2xl grid place-items-center border border-gray-200 shadow-sm"
                      style={{ backgroundColor: form.iconColor }}
                    >
                      <SelectedIcon className="xl:w-5 xl:h-5 text-slate-600" />
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 xl:text-xs 2xl:text-sm">
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
                        {form.location || "Add where you'll do this"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      <span className="truncate">
                        {form.reminder || "No reminder"}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-foreground text-background xl:py-1 2xl:py-2 xl:px-2 2xl:px-3 w-fit rounded-xl xl:mt-2 2xl:mt-4">
                      <Group className="w-4 h-4" />
                      <span className="truncate">{categoryLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold xl:text-sm">
                      Momentum planner
                    </h4>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Optional
                  </span>
                </div>
                <div className="space-y-3 xl:text-xs 2xl:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Recursion</span>
                    <span className="font-medium">{form.recurrence}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tags</span>
                    <span className="font-medium truncate flex gap-2">
                      {form.tags.map((tag, index) => (
                        <p
                          key={`${tag}-${index}`}
                          className="xl:text-[10px] 2xl:text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full"
                        >
                          {tag}
                        </p>
                      ))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">{form.status}</span>
                  </div>
                </div>
                <div className="text-center rounded-xl bg-muted/80 xl:py-3 border border-muted">
                  <p className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
                    {mode === "edit"
                      ? "Refine, ship, or reschedule. Progress beats perfection."
                      : "Small, clear todos are easier to start. Keep the scope tight and mark it done in one sitting."}
                  </p>
                </div>
                <Link
                  href="/dashboard/todos"
                  className="xl:text-xs 2xl:text-sm text-primary hover:underline"
                >
                  Back to all todos
                </Link>
              </div>
              <PlantBanner />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateTodoPage;
