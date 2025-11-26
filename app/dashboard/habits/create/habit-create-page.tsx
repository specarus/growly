"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlarmCheck,
  AlarmClockCheck,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  Flame,
  Lightbulb,
  Hash,
  ListChecks,
  NotebookPen,
  Recycle,
  Sparkles,
  Target,
} from "lucide-react";

import Button from "@/app/components/ui/button";
import CalendarDropdown from "@/app/components/ui/calendar-dropdown";
import TimeInput from "@/app/components/ui/time-input";

type Cadence = "Daily" | "Weekly" | "Monthly";
type UnitCategory = "Quantity" | "Time";

interface HabitFormState {
  name: string;
  description: string;
  cadence: Cadence;
  startDate: string;
  timeOfDay: string;
  reminder: string;
  goalAmount: string;
  goalUnit: string;
  goalUnitCategory: UnitCategory;
}

interface HabitFormProps {
  mode?: "create" | "edit";
  habitId?: string;
  initialHabit?: Partial<HabitFormState>;
}

type HabitTemplate = {
  title: string;
  description: string;
  cadence: Cadence;
  trigger: string;
  goalAmount: string;
  goalUnit: string;
  goalUnitCategory: UnitCategory;
  startDate: string;
  timeOfDay: string;
  reminder: string;
};
const fieldButtonClassName =
  "w-full flex items-center justify-between rounded-2xl border border-gray-100 bg-white/90 px-4 py-3 xl:text-xs 2xl:text-sm font-medium text-foreground shadow-inner transition-all hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0";

const inputClassName =
  "w-full border-none bg-transparent px-4 py-3 xl:text-xs 2xl:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none xl:text-sm 2xl:text-base";

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

const buildTemplates = (today: string): HabitTemplate[] => [
  {
    title: "Hydrate & Thrive",
    description:
      "1.5L water before lunch keeps energy steady and reduces decision fatigue.",
    cadence: "Daily",
    trigger: "Fill two bottles in the morning",
    goalAmount: "1500",
    goalUnit: "ml",
    goalUnitCategory: "Quantity",
    startDate: today,
    timeOfDay: "08:00",
    reminder: "15 minutes before",
  },
  {
    title: "Micro mobility",
    description:
      "7 minutes of targeted mobility after waking keeps joints loose and posture upright.",
    cadence: "Daily",
    trigger: "Post-coffee stretch",
    goalAmount: "7",
    goalUnit: "minutes",
    goalUnitCategory: "Time",
    startDate: today,
    timeOfDay: "06:30",
    reminder: "5 minutes before",
  },
  {
    title: "Focus sprint",
    description:
      "60 minutes of focused work blocks each week protected from notifications.",
    cadence: "Weekly",
    trigger: "Calendar deep work block",
    goalAmount: "60",
    goalUnit: "minutes",
    goalUnitCategory: "Time",
    startDate: today,
    timeOfDay: "09:00",
    reminder: "30 minutes before",
  },
];

const HabitCreatePage: React.FC<HabitFormProps> = ({
  mode = "create",
  habitId,
  initialHabit,
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

  const templates = useMemo(() => buildTemplates(today), [today]);

  useEffect(() => {
    setForm({ ...buildDefaultForm, ...initialHabit });
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
      setSaved(false);
    };

  const handleStartDateSelect = (value: string) => {
    setForm((prev) => ({ ...prev, startDate: value }));
    setSaved(false);
    setShowStartDateDropdown(false);
  };

  const handleTimeInputChange = (value: string) => {
    setForm((prev) => ({ ...prev, timeOfDay: value }));
    setSaved(false);
  };

  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      setSaved(false);
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
          return;
        }
        setSaved(true);
        if (mode === "edit") {
          router.push("/dashboard/habits");
        } else {
          router.refresh();
        }
      } catch (error) {
        console.error("Failed to save habit", error);
      }
    });
  };

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
    <main className="w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground pb-10">
      <div className="xl:px-8 2xl:px-28 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <BadgeCheck className="w-4 h-4" />
              <span>{mode === "edit" ? "Edit habit" : "Create habit"}</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                {mode === "edit" ? "Tune this habit" : "Design a new habit"}
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Set the cadence, start small, and add the reminders that keep
                you honest.
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-2 sm:gap-3">
            <Link
              href="/dashboard/habits"
              className="px-4 py-2 rounded-full text-sm border border-gray-200 bg-white hover:border-primary/40 transition"
            >
              Back to habits
            </Link>
          </div>
        </div>

        {saved ? (
          <div className="rounded-2xl border border-green-soft/60 bg-green-soft/15 px-4 py-3 text-sm text-foreground">
            Habit saved. It is now synced to your dashboard.
          </div>
        ) : null}

        <div className="grid xl:grid-cols-[1.3fr_0.7fr] gap-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white/90 border border-gray-50 shadow-sm xl:rounded-2xl 2xl:rounded-3xl xl:p-4 2xl:p-6 space-y-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="font-semibold xl:text-lg 2xl:text-xl">
                    Habit basics
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Name the habit and define how often you want it to fire.
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Step 1</span>
            </div>

            <div className="space-y-4">
              <label className="space-y-2 block">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Hash className="w-4 h-4 text-primary" />
                  <span>Habit name</span>
                </div>
                <div className={dropdownSelectWrapperClassName}>
                  <input
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="e.g. Morning stretch"
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
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Goal value</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set the amount and the unit that counts as a win, then pick
                  whether it is a quantity or a duration.
                </p>
                <div className="flex flex-wrap gap-2">
                  {unitCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          goalUnitCategory: category,
                        }))
                      }
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
                      className={`${inputClassName} text-left`}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {goalUnitsByCategory[form.goalUnitCategory].map(
                        (unit) => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                goalUnit: unit,
                              }))
                            }
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
                        onClick={() =>
                          setForm((prev) => ({ ...prev, goalUnit: "" }))
                        }
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
                  ? "Saving habit..."
                  : mode === "edit"
                  ? "Update habit"
                  : "Create habit"}
              </Button>
              <span className="text-xs text-muted-foreground self-center">
                Habits now persist to your dashboard once the request succeeds.
              </span>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-sm px-4 py-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Habit preview</span>
                </div>
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {form.name || "Untitled habit"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {form.description ||
                    "Add a quick description so future you stays motivated."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                <div className="flex items-center gap-2">
                  <Recycle className="w-4 h-4 text-primary" />
                  <span>{form.cadence}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <span>{form.startDate || "Pick a date"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlarmClockCheck className="w-4 h-4 text-primary" />
                  <span>{form.timeOfDay || "--:--"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlarmCheck className="w-4 h-4 text-primary" />
                  <span>{form.reminder}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">
                    {form.goalAmount || "1"} {previewGoalUnit} per{" "}
                    {previewCadenceLabel}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white/70 px-4 py-3 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>First three reps</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Set a 5 minute timer and start.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Track completion in your dashboard.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Celebrate the streak, even if it is tiny.
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="px-6 pt-5 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Starter templates
                </p>
                <h2 className="text-xl font-semibold">
                  Pick a pattern and tweak
                </h2>
                <p className="text-sm text-muted-foreground">
                  Hardcoded examples to speed you up. Wire to presets when you
                  add persistence.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                <NotebookPen className="w-4 h-4" />
                Draft mode
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {templates.map((template) => (
                <div
                  key={template.title}
                  className="rounded-2xl border border-gray-100 bg-muted/50 px-4 py-3 shadow-inner space-y-2"
                >
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>{template.title}</span>
                    <span className="text-xs text-muted-foreground bg-white px-2 py-1 rounded-full border border-gray-100">
                      {template.cadence}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-primary" />
                    Trigger: {template.trigger}
                  </div>
                  <p className="text-sm text-foreground">
                    {template.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Goal: {template.goalAmount} {template.goalUnit} per{" "}
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
                      setSaved(false);
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Use as base
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HabitCreatePage;
