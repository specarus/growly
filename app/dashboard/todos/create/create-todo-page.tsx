"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  ChevronDown,
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

const startTimeInputClassName =
  "w-full rounded-2xl border border-gray-200 bg-gradient-to-br from-white/95 to-white/80 px-4 py-3 text-foreground text-base font-medium tracking-wider shadow-inner transition focus:border-primary/60 focus:ring-2 focus:ring-primary/30 focus:ring-offset-0 appearance-none";

const fieldButtonClassName =
  "w-full flex items-center justify-between rounded-2xl border border-gray-100 bg-white/90 px-4 py-3 text-sm font-medium text-foreground shadow-inner transition-all hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const categorySelectWrapperClassName =
  "relative overflow-visible rounded-2xl border border-[#F7C7B9] bg-gradient-to-br from-white/95 to-white/70 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-colors hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-0";

const categoryOptions = ["Personal", "Work"];
const CATEGORY_PLACEHOLDER = "Choose a category";

const categoryDropdownOptionsId = "category-dropdown-options";

const toCategoryOptionId = (value: string) =>
  `category-option-${value.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`;

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

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const TIME_INTERVAL = 15;

const TIME_OPTIONS = Array.from(
  { length: (24 * 60) / TIME_INTERVAL },
  (_, index) => {
    const totalMinutes = index * TIME_INTERVAL;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
    const period = hours >= 12 ? "PM" : "AM";
    const hourLabel = hours % 12 === 0 ? 12 : hours % 12;
    return {
      value,
      label: `${hourLabel}:${String(minutes).padStart(2, "0")} ${period}`,
    };
  }
);

const formatMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

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

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const padTwo = (value: number) => String(value).padStart(2, "0");

const isoFromDate = (date: Date) =>
  `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(
    date.getDate()
  )}`;

const parseIsoDate = (value?: string | null) => {
  if (!value) return null;
  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);

  if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
    return new Date(year, month, day);
  }

  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

interface CalendarDropdownProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const CalendarDropdown: React.FC<CalendarDropdownProps> = ({
  selectedDate,
  onSelect,
  onClose,
  anchorRef,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [viewDate, setViewDate] = useState(() => {
    const parsed = parseIsoDate(selectedDate);
    return parsed ?? new Date();
  });

  useEffect(() => {
    const parsed = parseIsoDate(selectedDate);
    setViewDate(parsed ?? new Date());
  }, [selectedDate]);

  useEffect(() => {
    const handleDismiss = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("mousedown", handleDismiss);
    document.addEventListener("touchstart", handleDismiss);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDismiss);
      document.removeEventListener("touchstart", handleDismiss);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [anchorRef, onClose]);

  const weeks = useMemo(() => {
    const matrix: Array<Array<{ date: Date; inMonth: boolean }>> = [];
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    let dayCounter = 1 - startOffset;

    for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
      const week: Array<{ date: Date; inMonth: boolean }> = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
        const current = new Date(year, month, dayCounter);
        week.push({
          date: current,
          inMonth: current.getMonth() === month,
        });
        dayCounter += 1;
      }
      matrix.push(week);
    }
    return matrix;
  }, [viewDate]);

  const today = new Date();
  const selectedDateObj = parseIsoDate(selectedDate);

  const handleSelect = (date: Date) => {
    onSelect(isoFromDate(date));
    onClose();
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      className="absolute left-0 top-full z-50 mt-2 w-full min-w-60 max-w-sm rounded-3xl border border-gray-100 bg-white px-5 py-5 shadow-2xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Due date
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            {formatMonthLabel(viewDate)}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          Close
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={() =>
            setViewDate(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
            )
          }
          className="rounded-2xl border border-gray-200 px-3 py-1 font-medium transition hover:border-primary/60"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() =>
            setViewDate(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
            )
          }
          className="rounded-2xl border border-gray-200 px-3 py-1 font-medium transition hover:border-primary/60"
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => setViewDate(new Date())}
          className="rounded-2xl border border-gray-200 px-3 py-1 font-medium transition hover:border-primary/60"
        >
          Today
        </button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        {WEEK_DAYS.map((day) => (
          <span key={day} className="text-center">
            {day}
          </span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2 text-sm">
        {weeks.map((week, weekIndex) =>
          week.map(({ date, inMonth }) => {
            const iso = date.toISOString().slice(0, 10);
            const isSelected =
              selectedDateObj !== null && isSameDay(date, selectedDateObj);
            const isToday = isSameDay(date, today);
            return (
              <button
                key={`${weekIndex}-${iso}`}
                type="button"
                onClick={() => handleSelect(date)}
                className={`h-10 w-10 rounded-2xl text-center text-sm font-semibold transition ${
                  inMonth ? "text-foreground" : "text-muted-foreground"
                } ${
                  isSelected
                    ? "bg-primary text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)]"
                    : "hover:bg-primary/10"
                } ${isToday ? "border border-primary/40" : ""}`}
              >
                {date.getDate()}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

interface TimePickerDropdownProps {
  selectedTime: string;
  onSelect: (time: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const TimePickerDropdown: React.FC<TimePickerDropdownProps> = ({
  selectedTime,
  onSelect,
  onClose,
  anchorRef,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDismiss = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("mousedown", handleDismiss);
    document.addEventListener("touchstart", handleDismiss);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDismiss);
      document.removeEventListener("touchstart", handleDismiss);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [anchorRef, onClose]);

  return (
    <div
      ref={panelRef}
      role="listbox"
      aria-label="Pick a start time"
      className="absolute left-0 top-full z-50 mt-2 w-full min-w-60 max-w-sm rounded-3xl border border-gray-100 bg-white px-5 py-5 shadow-2xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Start time
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            {selectedTime
              ? formatTimeForDisplay(selectedTime)
              : "Choose a time"}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          Close
        </button>
      </div>
      <div className="mt-4 max-h-64 space-y-2 overflow-auto pr-2">
        {TIME_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onSelect(option.value);
              onClose();
            }}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition focus-visible:outline-none ${
              selectedTime === option.value
                ? "bg-primary text-white shadow-[0_12px_30px_rgba(59,130,246,0.25)]"
                : "border border-gray-100 text-foreground hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            <span>{option.label}</span>
            <span className="text-xs text-muted-foreground">
              {option.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
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
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const categoryToggleRef = useRef<HTMLButtonElement | null>(null);
  const categoryPanelRef = useRef<HTMLDivElement | null>(null);
  const dateToggleRef = useRef<HTMLButtonElement | null>(null);
  const timeToggleRef = useRef<HTMLButtonElement | null>(null);
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

  const formattedStartTime = form.time
    ? formatTimeForDisplay(form.time)
    : "Pick a time";

  const summaryTitle = form.title || "Untitled todo";
  const summaryDescription =
    form.description ||
    "Add a quick description so future you knows exactly what to do.";

  const categoryLabel = form.category || CATEGORY_PLACEHOLDER;
  const categorySummaryLabel = form.category
    ? `${form.category} category`
    : CATEGORY_PLACEHOLDER;

  const primaryCtaLabel = mode === "edit" ? "Update todo" : "Add todo";

  return (
    <>
      <main className="w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground">
        <div className="xl:px-8 2xl:px-28 pb-8 space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow select-none px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                <BadgeCheck className="w-4 h-4" />
                <span>{mode === "edit" ? "Edit todo" : "Create todo"}</span>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold">
                  {mode === "edit"
                    ? "Keep this todo moving"
                    : "Bring a new todo to life"}
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  Capture the essentials and set a realistic schedule so you can
                  start fast.
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
                      <div className={categorySelectWrapperClassName}>
                        <button
                          type="button"
                          ref={categoryToggleRef}
                          aria-haspopup="listbox"
                          aria-expanded={categoryMenuOpen}
                          aria-controls={categoryDropdownOptionsId}
                          onClick={() => setCategoryMenuOpen((open) => !open)}
                          className="w-full flex items-center justify-between rounded-2xl border-none bg-transparent px-4 py-3 text-left text-foreground xl:text-sm 2xl:text-base focus:outline-none focus-visible:outline-none"
                        >
                          <span className="truncate">{categoryLabel}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
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
                            className="absolute left-0 right-0 top-full z-20 mt-2 max-h-60 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.24)]"
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
                                className={`w-full rounded-none border-b border-gray-100 px-4 py-3 text-left text-sm transition last:border-b-0 ${
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
                  <label className="space-y-2 relative">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      <span>Due date</span>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        ref={dateToggleRef}
                        onClick={() => {
                          setShowDateDropdown((prev) => !prev);
                          setShowTimeDropdown(false);
                        }}
                        className={fieldButtonClassName}
                        aria-label="Pick a due date"
                        aria-expanded={showDateDropdown}
                      >
                        <span className="flex flex-col items-start gap-1 text-left">
                          <span className="text-sm font-semibold">
                            {formattedDate}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {form.date ? "Tap to change" : "Tap to pick a date"}
                          </span>
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform duration-150 ${
                            showDateDropdown ? "rotate-180" : "rotate-0"
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

                  <label className="space-y-2 relative">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Clock3 className="w-4 h-4 text-primary" />
                      <span>Start time</span>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        ref={timeToggleRef}
                        onClick={() => {
                          setShowTimeDropdown((prev) => !prev);
                          setShowDateDropdown(false);
                        }}
                        className={fieldButtonClassName}
                        aria-label="Pick a start time"
                        aria-expanded={showTimeDropdown}
                      >
                        <span className="flex flex-col items-start gap-1 text-left">
                          <span className="text-sm font-semibold">
                            {formattedStartTime}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {form.time ? "Tap to change" : "Tap to pick a time"}
                          </span>
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform duration-150 ${
                            showTimeDropdown ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </button>
                      {showTimeDropdown && (
                        <TimePickerDropdown
                          selectedTime={form.time}
                          onSelect={handleTimeSelect}
                          onClose={() => setShowTimeDropdown(false)}
                          anchorRef={timeToggleRef}
                        />
                      )}
                    </div>
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
    </>
  );
};

export default CreateTodoPage;
