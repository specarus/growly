"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlarmCheck,
  AlarmClockCheck,
  CalendarDays,
  ChevronDown,
  Lightbulb,
  Hash,
  ListChecks,
  NotebookPen,
  Recycle,
  Target,
  Goal,
  View,
} from "lucide-react";

import Button from "@/app/components/ui/button";
import CalendarDropdown from "@/app/components/ui/calendar-dropdown";
import TimeInput from "@/app/components/ui/time-input";
import PageGradient from "@/app/components/ui/page-gradient";
import PageHeading from "@/app/components/page-heading";
import { useUnsavedChangesGuard } from "@/app/hooks/use-unsaved-changes-guard";
import { Cadence, HabitFormState, UnitCategory } from "./types";
import type { PopularPost } from "../popular/types";

import { buildTemplates } from "./templates";

interface HabitFormProps {
  mode?: "create" | "edit";
  habitId?: string;
  initialHabit?: Partial<HabitFormState>;
  popularPost?: PopularPost | null;
}

const fieldButtonClassName =
  "w-full flex items-center justify-between rounded-2xl border border-gray-100 bg-white/90 px-4 py-3 xl:text-xs 2xl:text-sm font-medium text-foreground shadow-inner transition-all hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0";

const inputClassName =
  "w-full border-none bg-transparent px-4 py-3 xl:text-xs 2xl:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none";

const countClassName =
  "w-full border-none bg-transparent xl:px-6 2xl:px-8 xl:py-4 xl:text-3xl 2xl:text-4xl text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none";

const dropdownSelectWrapperClassName =
  "relative overflow-visible rounded-2xl border border-gray-100 bg-gradient-to-br from-white/95 to-white/70 shadow-inner transition-colors hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-0";

const cadenceOptions: Cadence[] = ["Daily", "Weekly", "Monthly"];
const reminderOptions = [
  "No reminder",
  "5 minutes before",
  "15 minutes before",
  "30 minutes before",
  "1 hour before",
];
const sanitizeDropdownValue = (value: string) =>
  value.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
const cadenceDropdownOptionsId = "habit-cadence-dropdown-options";
const reminderDropdownOptionsId = "habit-reminder-dropdown-options";

const unitCategories: UnitCategory[] = ["Quantity", "Time"];
const goalUnitsByCategory: Record<UnitCategory, string[]> = {
  Quantity: ["count", "steps", "ml", "ounce", "Cal", "g", "mg", "drink"],
  Time: ["seconds", "minutes", "hours"],
};

const HabitCreatePage: React.FC<HabitFormProps> = ({
  mode = "create",
  habitId,
  initialHabit,
  popularPost,
}) => {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const buildDefaultForm = useMemo(
    () => ({
      name: "",
      description: "",
      cadence: "Daily" as Cadence,
      startDate: today,
      timeOfDay: "07:00",
      reminder: "15 minutes before",
      goalAmount: "1",
      goalUnit: "count",
      goalUnitCategory: "Quantity" as UnitCategory,
    }),
    [today]
  );

  const [form, setForm] = useState<HabitFormState>({
    ...buildDefaultForm,
    ...initialHabit,
  });
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isDeletingHabit, setIsDeletingHabit] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cadenceMenuOpen, setCadenceMenuOpen] = useState(false);
  const [reminderMenuOpen, setReminderMenuOpen] = useState(false);
  const [cadenceDropDirection, setCadenceDropDirection] = useState<
    "down" | "up"
  >("down");
  const [reminderDropDirection, setReminderDropDirection] = useState<
    "down" | "up"
  >("down");
  const cadenceToggleRef = useRef<HTMLButtonElement | null>(null);
  const cadencePanelRef = useRef<HTMLDivElement | null>(null);
  const reminderToggleRef = useRef<HTMLButtonElement | null>(null);
  const reminderPanelRef = useRef<HTMLDivElement | null>(null);
  const [showStartDateDropdown, setShowStartDateDropdown] = useState(false);
  const startDateToggleRef = useRef<HTMLButtonElement | null>(null);

  const markDirty = useCallback(() => {
    setIsDirty(true);
    setSaved(false);
  }, []);

  const templates = useMemo(() => buildTemplates(today), [today]);

  useEffect(() => {
    setForm({ ...buildDefaultForm, ...initialHabit });
    setIsDirty(false);
    setSaved(false);
  }, [buildDefaultForm, initialHabit]);

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

  useEffect(() => {
    if (!cadenceMenuOpen) return undefined;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        cadencePanelRef.current?.contains(target) ||
        cadenceToggleRef.current?.contains(target)
      ) {
        return;
      }
      setCadenceMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [cadenceMenuOpen]);

  useEffect(() => {
    if (!reminderMenuOpen) return undefined;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        reminderPanelRef.current?.contains(target) ||
        reminderToggleRef.current?.contains(target)
      ) {
        return;
      }
      setReminderMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [reminderMenuOpen]);

  useLayoutEffect(() => {
    if (!cadenceMenuOpen) {
      return undefined;
    }
    const update = () =>
      updateDropdownDirection(
        cadenceToggleRef,
        cadencePanelRef,
        setCadenceDropDirection
      );
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [cadenceMenuOpen]);

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

  const handleChange =
    (field: keyof HabitFormState) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      markDirty();
    };

  const handleStartDateSelect = (value: string) => {
    setForm((prev) => ({ ...prev, startDate: value }));
    markDirty();
    setShowStartDateDropdown(false);
  };

  const handleTimeInputChange = (value: string) => {
    setForm((prev) => ({ ...prev, timeOfDay: value }));
    markDirty();
  };

  const router = useRouter();

  const submitHabit = useCallback(
    async ({ skipRedirect = false } = {}) => {
      if (isSubmitting) {
        return false;
      }
      setIsSubmitting(true);
      const payload = {
        name: form.name,
        description: form.description,
        cadence: form.cadence,
        startDate: form.startDate,
        timeOfDay: form.timeOfDay,
        reminder: form.reminder,
        goalAmount: form.goalAmount,
        goalUnit: form.goalUnit,
        goalUnitCategory: form.goalUnitCategory,
      };
      const url =
        mode === "edit" && habitId ? `/api/habits/${habitId}` : "/api/habits";
      const method = mode === "edit" ? "PATCH" : "POST";
      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          console.error("Failed to save habit", await response.text());
          return false;
        }
        setSaved(true);
        setIsDirty(false);
        if (!skipRedirect) {
          router.push("/dashboard/habits");
        }
        return true;
      } catch (error) {
        console.error("Failed to save habit", error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, habitId, isSubmitting, mode, router]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void submitHabit();
  };

  const handleGuardSave = useCallback(
    () => submitHabit({ skipRedirect: true }),
    [submitHabit]
  );
  const handleGuardDiscard = useCallback(() => {
    setIsDirty(false);
  }, []);

  const { guardDialog } = useUnsavedChangesGuard({
    isDirty,
    onSave: handleGuardSave,
    onDiscard: handleGuardDiscard,
  });

  const handleDeleteHabit = useCallback(async () => {
    if (!habitId) {
      return;
    }
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this habit? This cannot be undone.")
    ) {
      return;
    }
    setDeleteError(null);
    setIsDeletingHabit(true);
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload && typeof payload === "object" && "error" in payload
            ? (payload as { error?: string }).error
            : null;
        throw new Error(message ?? "Unable to delete this habit.");
      }
      router.push("/dashboard/habits");
    } catch (error) {
      if (error instanceof Error) {
        setDeleteError(error.message);
      } else {
        setDeleteError("Unable to delete this habit.");
      }
    } finally {
      setIsDeletingHabit(false);
    }
  }, [habitId, router]);

  const previewGoalUnit =
    form.goalUnit || goalUnitsByCategory[form.goalUnitCategory][0] || "count";
  const previewCadenceLabel = form.cadence.toLowerCase();
  const formattedStartDate = form.startDate
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(new Date(form.startDate))
    : "Tap to pick a date";
  const startDateHelperText = form.startDate
    ? "Tap to change"
    : "Tap to pick a date";

  return (
    <>
      {guardDialog}
      <main className="xl:px-8 2xl:px-28 xl:pb-12 2xl:pb-16 relative w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground bg-linear-to-tr from-white/90 via-light-yellow/55 to-green-soft/15 overflow-hidden">
        <PageGradient />
        <div className="relative z-10">
          <div className="space-y-8">
            <PageHeading
              badgeLabel={mode === "edit" ? "Edit habit" : "Create habit"}
              title={mode === "edit" ? "Tune this habit" : "Design a new habit"}
              titleClassName="text-2xl md:text-3xl"
              description="Set the cadence, start small, and add the reminders that keep you honest."
              actions={
                <div className="flex flex-row xl:gap-2 2xl:gap-3">
                  <Link
                    href="/dashboard/habits"
                    className="px-4 py-2 rounded-full xl:text-xs 2xl:text-sm border border-gray-200 bg-white hover:border-primary/40 transition"
                  >
                    Back to habits
                  </Link>
                </div>
              }
            />

            {popularPost ? (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4 space-y-2 text-foreground shadow-inner">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
                  Importing blueprint
                </p>
                <p className="text-lg font-semibold">{popularPost.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {popularPost.summary ??
                    "No summary provided for this habit yet."}
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
                  <span className="rounded-full border border-white/30 bg-white/70 px-2 py-1">
                    {popularPost.category}
                  </span>
                  <span className="rounded-full border border-white/30 bg-white/70 px-2 py-1">
                    {popularPost.cadence}
                  </span>
                  <span className="rounded-full border border-white/30 bg-white/70 px-2 py-1">
                    {popularPost.timeWindow}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Based on {popularPost.userName ?? "a community blueprint"}{" "}
                  shared with the crew.
                </p>
              </div>
            ) : null}

            {saved ? (
              <div className="rounded-2xl border border-green-soft/60 bg-green-soft/15 px-4 py-3 xl:text-xs 2xl:text-sm text-foreground">
                Habit saved. It is now synced to your dashboard.
              </div>
            ) : null}

            <div className="grid xl:grid-cols-[1.3fr_0.7fr] gap-6">
              <form
                onSubmit={handleSubmit}
                className="bg-white/90 border border-gray-50 shadow-inner xl:rounded-2xl 2xl:rounded-3xl xl:p-4 2xl:p-6 space-y-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <div>
                      <h2 className="font-semibold xl:text-lg 2xl:text-xl">
                        Habit basics
                      </h2>
                      <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                        Name the habit and define how often you want it to fire.
                      </p>
                    </div>
                  </div>
                  <span className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
                    Step 1
                  </span>
                </div>

                <div className="space-y-4">
                  <label className="space-y-2 block">
                    <div className="flex items-center gap-2 xl:text-sm font-semibold">
                      <Hash className="w-4 h-4 text-primary" />
                      <span>Habit name</span>
                    </div>
                    <div className={dropdownSelectWrapperClassName}>
                      <input
                        value={form.name}
                        onChange={handleChange("name")}
                        placeholder="e.g. Morning stretch"
                        maxLength={80}
                        className={inputClassName}
                        required
                      />
                    </div>
                  </label>

                  <label className="space-y-2 block">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <ListChecks className="w-4 h-4 text-primary" />
                      <span>Description</span>
                    </div>
                    <div className={dropdownSelectWrapperClassName}>
                      <textarea
                        value={form.description}
                        onChange={handleChange("description")}
                        placeholder="Add a quick why, or the first steps you'll take."
                        rows={3}
                        className={`${inputClassName} resize-none leading-relaxed`}
                      />
                    </div>
                  </label>

                  <label className="space-y-3 block">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Goal className="w-4 h-4 text-primary" />
                      <span>Goal value</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Set the amount and the unit that counts as a win.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {unitCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              goalUnitCategory: category,
                            }));
                            markDirty();
                          }}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            form.goalUnitCategory === category
                              ? "border-primary bg-primary text-white shadow-sm"
                              : "border-gray-200 bg-white text-foreground hover:border-primary/40"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <div className={`${dropdownSelectWrapperClassName} pr-0`}>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={form.goalAmount}
                          onChange={handleChange("goalAmount")}
                          placeholder="1"
                          className={`${countClassName} text-left`}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {goalUnitsByCategory[form.goalUnitCategory].map(
                            (unit) => (
                              <button
                                key={unit}
                                type="button"
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    goalUnit: unit,
                                  }));
                                  markDirty();
                                }}
                                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                  form.goalUnit === unit
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-gray-200 bg-white text-foreground hover:border-primary/40"
                                }`}
                              >
                                {unit}
                              </button>
                            )
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({ ...prev, goalUnit: "" }));
                              markDirty();
                            }}
                            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-foreground transition hover:border-primary/40"
                          >
                            Custom
                          </button>
                        </div>
                        <div className={dropdownSelectWrapperClassName}>
                          <input
                            value={form.goalUnit}
                            onChange={handleChange("goalUnit")}
                            placeholder="Describe unit"
                            className={`${inputClassName} text-left`}
                          />
                        </div>
                      </div>
                    </div>
                  </label>

                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="space-y-2 block">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Recycle className="w-4 h-4 text-primary" />
                        <span>Cadence</span>
                      </div>
                      <div className={dropdownSelectWrapperClassName}>
                        <button
                          type="button"
                          ref={cadenceToggleRef}
                          onClick={() => {
                            setCadenceMenuOpen((open) => !open);
                            setReminderMenuOpen(false);
                          }}
                          aria-haspopup="listbox"
                          aria-expanded={cadenceMenuOpen}
                          aria-controls={cadenceDropdownOptionsId}
                          className={fieldButtonClassName}
                        >
                          <span className="truncate">{form.cadence}</span>
                          <ChevronDown
                            className={`xl:h-3 xl:w-3 2xl:h-4 2xl:w-4 transition-transform ${
                              cadenceMenuOpen
                                ? "rotate-180 text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                        {cadenceMenuOpen && (
                          <div
                            ref={cadencePanelRef}
                            id={cadenceDropdownOptionsId}
                            role="listbox"
                            aria-activedescendant={
                              form.cadence
                                ? `cadence-option-${sanitizeDropdownValue(
                                    form.cadence
                                  )}`
                                : undefined
                            }
                            className={`absolute left-0 right-0 z-20 max-h-60 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg ${
                              cadenceDropDirection === "down"
                                ? "top-full mt-2"
                                : "bottom-full mb-2"
                            }`}
                          >
                            {cadenceOptions.map((cadence) => {
                              const optionId = `cadence-option-${sanitizeDropdownValue(
                                cadence
                              )}`;
                              return (
                                <button
                                  key={cadence}
                                  id={optionId}
                                  type="button"
                                  role="option"
                                  aria-selected={form.cadence === cadence}
                                  onClick={() => {
                                    setForm((prev) => ({
                                      ...prev,
                                      cadence,
                                    }));
                                    markDirty();
                                    setCadenceMenuOpen(false);
                                  }}
                                  className={`w-full rounded-none border-b border-gray-100 px-4 py-3 text-left text-sm transition last:border-b-0 ${
                                    form.cadence === cadence
                                      ? "bg-primary/10 text-primary font-semibold"
                                      : "text-foreground hover:bg-primary/5"
                                  }`}
                                >
                                  {cadence}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </label>

                    <label className="space-y-2 block">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <span>Start date</span>
                      </div>
                      <div className={dropdownSelectWrapperClassName}>
                        <button
                          type="button"
                          ref={startDateToggleRef}
                          onClick={() => {
                            setShowStartDateDropdown((open) => !open);
                          }}
                          aria-haspopup="dialog"
                          aria-expanded={showStartDateDropdown}
                          className={fieldButtonClassName}
                        >
                          <span className="flex flex-col items-start gap-1 text-left">
                            <span className="xl:text-xs 2xl:text-sm font-semibold">
                              {formattedStartDate}
                            </span>
                            <span className="xl:text-[10px] 2xl:text-[11px] text-muted-foreground">
                              {startDateHelperText}
                            </span>
                          </span>
                          <ChevronDown
                            className={`xl:h-3 xl:w-3 2xl:h-4 2xl:w-4 transition-transform ${
                              showStartDateDropdown
                                ? "rotate-180 text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                        {showStartDateDropdown && (
                          <CalendarDropdown
                            selectedDate={form.startDate}
                            onSelect={handleStartDateSelect}
                            onClose={() => setShowStartDateDropdown(false)}
                            anchorRef={startDateToggleRef}
                          />
                        )}
                      </div>
                    </label>

                    <label className="space-y-2 block">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <AlarmClockCheck className="w-4 h-4 text-primary" />
                        <span>Preferred time</span>
                      </div>
                      <TimeInput
                        time={form.timeOfDay}
                        onChange={handleTimeInputChange}
                      />
                    </label>

                    <label className="space-y-2 block">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <AlarmCheck className="w-4 h-4 text-primary" />
                        <span>Reminder</span>
                      </div>
                      <div className={dropdownSelectWrapperClassName}>
                        <button
                          type="button"
                          ref={reminderToggleRef}
                          onClick={() => {
                            setReminderMenuOpen((open) => !open);
                            setCadenceMenuOpen(false);
                          }}
                          aria-haspopup="listbox"
                          aria-expanded={reminderMenuOpen}
                          aria-controls={reminderDropdownOptionsId}
                          className={fieldButtonClassName}
                        >
                          <span className="truncate">{form.reminder}</span>
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
                                ? `reminder-option-${sanitizeDropdownValue(
                                    form.reminder
                                  )}`
                                : undefined
                            }
                            className={`absolute left-0 right-0 z-20 max-h-60 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg ${
                              reminderDropDirection === "down"
                                ? "top-full mt-2"
                                : "bottom-full mb-2"
                            }`}
                          >
                            {reminderOptions.map((reminder) => {
                              const optionId = `reminder-option-${sanitizeDropdownValue(
                                reminder
                              )}`;
                              return (
                                <button
                                  key={reminder}
                                  id={optionId}
                                  type="button"
                                  role="option"
                                  aria-selected={form.reminder === reminder}
                                  onClick={() => {
                                    setForm((prev) => ({
                                      ...prev,
                                      reminder,
                                    }));
                                    markDirty();
                                    setReminderMenuOpen(false);
                                  }}
                                  className={`w-full rounded-none border-b border-gray-100 px-4 py-3 text-left xl:text-xs 2xl:text-sm transition last:border-b-0 ${
                                    form.reminder === reminder
                                      ? "bg-primary/10 text-primary font-semibold"
                                      : "text-foreground hover:bg-primary/5"
                                  }`}
                                >
                                  {reminder}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-3">
                  <Button
                    type="submit"
                    className="xl:h-10 2xl:h-12 xl:px-5 2xl:px-7 xl:text-sm 2xl:text-base bg-primary text-white shadow-sm hover:brightness-105 transition disabled:cursor-not-allowed disabled:brightness-90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : mode === "edit"
                      ? "Update habit"
                      : "Create habit"}
                  </Button>
                </div>
                {mode === "edit" && habitId ? (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 dark:bg-rose-100/50 px-4 py-4 space-y-2 text-sm text-rose-700">
                    <div className="flex items-center justify-between">
                      <p className="xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.3em] dark:text-white text-rose-600">
                        Danger zone
                      </p>
                    </div>
                    <p className="xl:text-xs dark:text-white text-rose-700">
                      Deleting this habit removes it from your board and
                      routines. All associated data will be lost.
                    </p>
                    <button
                      type="button"
                      onClick={handleDeleteHabit}
                      disabled={isDeletingHabit}
                      className="cursor-pointer inline-flex items-center justify-center w-full rounded-full border border-rose-200 bg-rose-50 px-4 py-2 xl:text-xs 2xl:text-sm font-medium text-rose-600 hover:border-rose-400 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeletingHabit ? "Deleting..." : "Delete habit"}
                    </button>
                    {deleteError ? (
                      <p className="text-[11px] text-rose-700" role="alert">
                        {deleteError}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </form>

              <aside className="space-y-4">
                <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-linear-to-br from-white/80 via-slate-50 to-slate-100 p-5 shadow-inner dark:border-white/10 dark:bg-linear-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                  <div className="pointer-events-none absolute -top-4 right-6 h-32 w-32 rounded-full bg-primary/20 blur-3xl dark:hidden" />
                  <div className="pointer-events-none absolute -bottom-10 left-6 h-36 w-36 rounded-[2.5rem] bg-green-soft/30 blur-[90px] dark:hidden" />
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold xl:text-xs 2xl:text-sm bg-primary/20 text-primary xl:px-3 2xl:px-4 py-1 rounded-full flex gap-2 items-center">
                        <View className="xl:w-4 xl:h-4 2xl:w-5 2xl:h-5" />
                        Habit preview
                      </span>
                    </div>
                    <span className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
                      Live
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="xl:text-base 2xl:text-lg font-semibold text-slate-900 dark:text-white">
                      {form.name || "Untitled habit"}
                    </h3>
                    <p className="xl:text-xs 2xl:text-sm text-muted-foreground leading-relaxed">
                      {form.description ||
                        "Add a short description so future you remembers why this matters."}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-3 xl:text-xs 2xl:text-sm sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-foreground shadow-sm transition dark:border-white/10 dark:bg-white/5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        Cadence
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-semibold">
                        <Recycle className="w-4 h-4 text-primary" />
                        <span>{form.cadence}</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-foreground shadow-sm transition dark:border-white/10 dark:bg-white/5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        Start date
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-semibold">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <span>{formattedStartDate}</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-foreground shadow-sm transition dark:border-white/10 dark:bg-white/5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        Preferred time
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-semibold">
                        <AlarmClockCheck className="w-4 h-4 text-primary" />
                        <span>{form.timeOfDay || "--:--"}</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-foreground shadow-sm transition dark:border-white/10 dark:bg-white/5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        Reminder
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-semibold">
                        <AlarmCheck className="w-4 h-4 text-primary" />
                        <span>{form.reminder}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-2xl border border-primary/30 bg-white/80 px-4 py-3 text-sm font-semibold text-foreground shadow-sm dark:border-primary/50 dark:bg-primary/10">
                    <span>
                      {form.goalAmount || "1"} {previewGoalUnit}{" "}
                      {previewCadenceLabel}
                    </span>
                  </div>
                </div>
              </aside>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white shadow-inner">
              <div className="px-6 pt-5 pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                      Starter templates
                    </p>
                    <h2 className="xl:text-lg 2xl:text-xl font-semibold">
                      Pick a pattern and tweak
                    </h2>
                    <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                      Hardcoded examples to speed you up. Wire to presets when
                      you add persistence.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
                    <NotebookPen className="xl:w-3 xl:h-3 2xl:w-4 2xl:h-4" />
                    Draft mode
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.title}
                      className="rounded-2xl border border-gray-100 bg-muted/50 px-4 py-3 shadow-inner space-y-2"
                    >
                      <div className="flex items-center justify-between xl:text-sm 2xl:text-base font-semibold">
                        <span>{template.title}</span>
                        <span className="xl:text-[11px] 2xl:text-xs text-muted-foreground bg-white px-2 py-1 rounded-full border border-gray-100">
                          {template.cadence}
                        </span>
                      </div>
                      <div className="xl:text-[11px] 2xl:text-xs text-muted-foreground flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-primary" />
                        Trigger: {template.trigger}
                      </div>
                      <p className="xl:text-xs 2xl:text-sm text-foreground">
                        {template.description}
                      </p>
                      <p className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
                        Goal: {template.goalAmount} {template.goalUnit}{" "}
                        {template.cadence.toLowerCase()}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            name: template.title,
                            description: template.description,
                            cadence: template.cadence,
                            goalAmount: template.goalAmount,
                            goalUnit: template.goalUnit,
                            goalUnitCategory: template.goalUnitCategory,
                            startDate: template.startDate,
                            timeOfDay: template.timeOfDay,
                            reminder: template.reminder,
                          }));
                          markDirty();
                        }}
                        className="xl:text-xs 2xl:text-sm font-semibold text-primary hover:underline"
                      >
                        Use as base
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default HabitCreatePage;
