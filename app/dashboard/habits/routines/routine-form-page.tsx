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
import { CalendarDays, Check, Clock3, Search, Target } from "lucide-react";

import Button from "@/app/components/ui/button";
import PageGradient from "@/app/components/ui/page-gradient";
import PageHeading from "@/app/components/page-heading";
import GradientCircle from "@/app/components/ui/gradient-circle";
import { useUnsavedChangesGuard } from "@/app/hooks/use-unsaved-changes-guard";

type RoutineHabit = {
  id: string;
  name: string;
  cadence: string;
  focus: string;
};

type Mode = "create" | "edit";

type RoutineFormPageProps = {
  mode: Mode;
  habits: RoutineHabit[];
  routineId?: string;
  initialName?: string;
  initialAnchor?: string | null;
  initialNotes?: string | null;
  initialHabitIds?: string[];
};

type StatusTone = "success" | "error" | "info";

const MAX_HABITS = 9;
const timeWindows = ["Anytime", "Morning", "Workday", "Evening"];

const headingCopy: Record<
  Mode,
  {
    badgeLabel: string;
    title: string;
    description: string;
    submitLabel: string;
    successText?: string;
  }
> = {
  create: {
    badgeLabel: "Create routine",
    title: "Design a routine that keeps you steady",
    description:
      "Name the sequence, pick the anchor, and stack the habits that keep your days calm.",
    submitLabel: "Create routine",
  },
  edit: {
    badgeLabel: "Edit routine",
    title: "Refresh what this routine stands for",
    description:
      "Retune the anchor, notes, and stacked habits that keep this layout grounded.",
    submitLabel: "Save changes",
    successText: "Changes saved.",
  },
};

const getStatusClasses = (tone: StatusTone) => {
  switch (tone) {
    case "success":
      return "border-green-soft bg-green-soft/20 text-foreground";
    case "error":
      return "border-rose-200 bg-rose-200/30 text-rose-700";
    default:
      return "border-gray-200 bg-white/90 text-muted-foreground";
  }
};

const RoutineFormPage: React.FC<RoutineFormPageProps> = ({
  mode,
  habits,
  routineId,
  initialName,
  initialAnchor,
  initialNotes,
  initialHabitIds,
}) => {
  const router = useRouter();
  const pageHeading = headingCopy[mode];

  const initialFormState = useMemo(
    () => ({
      name: initialName ?? "",
      anchor: initialAnchor ?? "",
      notes: initialNotes ?? "",
    }),
    [initialName, initialAnchor, initialNotes]
  );
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    setForm(initialFormState);
  }, [initialFormState]);

  const initialHabitSelection = useMemo(
    () => initialHabitIds ?? [],
    [initialHabitIds]
  );
  const [selectedHabitIds, setSelectedHabitIds] = useState(
    initialHabitSelection
  );

  const [filter, setFilter] = useState("");
  const [timeWindow, setTimeWindow] = useState(timeWindows[0]);
  const [status, setStatus] = useState<{
    text: string;
    tone: StatusTone;
  } | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const [isDirty, setIsDirty] = useState(false);
  const markDirty = useCallback(() => setIsDirty(true), []);

  useEffect(() => {
    setSelectedHabitIds(initialHabitSelection);
    setIsDirty(false);
    setStatus(null);
  }, [initialHabitSelection]);

  useEffect(() => {
    setIsDirty(false);
    setStatus(null);
  }, [initialFormState]);

  const filteredHabits = useMemo(() => {
    if (!filter) {
      return habits;
    }
    const term = filter.toLowerCase().trim();
    return habits.filter(
      (habit) =>
        habit.name.toLowerCase().includes(term) ||
        habit.focus.toLowerCase().includes(term) ||
        habit.cadence.toLowerCase().includes(term)
    );
  }, [filter, habits]);

  const selectedHabits = useMemo(
    () => habits.filter((habit) => selectedHabitIds.includes(habit.id)),
    [habits, selectedHabitIds]
  );

  const previewFocus = selectedHabits.length
    ? selectedHabits
        .slice(0, 3)
        .map((habit) => habit.focus)
        .join(" • ")
    : "Stack habits to see a preview of your anchor";

  const toggleHabit = (habitId: string) => {
    setStatus(null);
    markDirty();
    setSelectedHabitIds((prev) => {
      if (prev.includes(habitId)) {
        return prev.filter((id) => id !== habitId);
      }
      if (prev.length >= MAX_HABITS) {
        setStatus({
          text: `Routines feel best with ${MAX_HABITS} habits or fewer.`,
          tone: "info",
        });
        return prev;
      }
      return [...prev, habitId];
    });
  };

  const handleChange =
    (field: "name" | "anchor" | "notes") =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setStatus(null);
      markDirty();
    };

  const handleTimeWindowChange = (nextWindow: string) => {
    if (nextWindow === timeWindow) {
      return;
    }
    setTimeWindow(nextWindow);
    markDirty();
  };

  const submitRoutine = useCallback(
    async ({ skipRedirect = false } = {}) => {
      setStatus(null);
      if (!form.name.trim()) {
        setStatus({
          text: "Give your routine a name to keep it grounded.",
          tone: "error",
        });
        return false;
      }
      if (selectedHabitIds.length === 0) {
        setStatus({
          text: "Add at least one habit to make the routine actionable.",
          tone: "error",
        });
        return false;
      }
      if (mode === "edit" && !routineId) {
        setStatus({
          text: "Something went wrong. Please refresh and try again.",
          tone: "error",
        });
        return false;
      }

      const endpoint =
        mode === "create" ? "/api/routines" : `/api/routines/${routineId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      try {
        const response = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            anchor: form.anchor.trim() || null,
            notes: form.notes.trim() || null,
            habitIds: selectedHabitIds,
          }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const message =
            payload?.error ||
            "We could not save that routine. Try again in a moment.";
          setStatus({ text: message, tone: "error" });
          return false;
        }
        setIsDirty(false);
        if (mode === "create" && !skipRedirect) {
          await router.push("/dashboard/habits/routines");
        }
        if (mode === "edit" && !skipRedirect) {
          setStatus({
            text: pageHeading.successText ?? "Changes saved.",
            tone: "success",
          });
        }
        return true;
      } catch (error) {
        console.error("Unable to save routine", error);
        setStatus({
          text: "Something went wrong. Please refresh and try again.",
          tone: "error",
        });
        return false;
      }
    },
    [form, selectedHabitIds, mode, routineId, router, pageHeading.successText]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      void submitRoutine();
    });
  };

  const handleGuardSave = useCallback(
    () => submitRoutine({ skipRedirect: true }),
    [submitRoutine]
  );
  const handleGuardDiscard = useCallback(() => {
    setIsDirty(false);
  }, []);
  const { guardDialog } = useUnsavedChangesGuard({
    isDirty,
    onSave: handleGuardSave,
    onDiscard: handleGuardDiscard,
  });

  return (
    <>
      {guardDialog}
      <main className="relative overflow-hidden w-full min-h-screen lg:pt-18 xl:pt-24 2xl:pt-28 text-foreground lg:pb-8 xl:pb-12 2xl:pb-16 bg-linear-to-t from-white/90 via-light-yellow/55 to-green-soft/15">
        <PageGradient />
        <div className="lg:px-4 xl:px-8 2xl:px-28 space-y-8">
          <PageHeading
            badgeLabel={pageHeading.badgeLabel}
            title={pageHeading.title}
            description={pageHeading.description}
            actions={
              <div className="flex flex-row lg:gap-2 xl:gap-3">
                <Link
                  href="/dashboard/habits/routines"
                  className="lg:px-3 xl:px-4 lg:py-1 xl:py-2 rounded-full lg:text-[11px] xl:text-xs 2xl:text-sm border border-gray-200 bg-white hover:border-primary/40 transition shadow-sm"
                >
                  Back to routines
                </Link>
              </div>
            }
          />

          <div className="grid lg:grid-cols-[1.2fr_0.8fr] lg:gap-4 xl:gap-6">
            <form
              onSubmit={handleSubmit}
              className="lg:space-y-4 xl:space-y-6 lg:rounded-2xl xl:rounded-3xl border border-white/70 bg-white/90 lg:p-4 xl:p-6 shadow-inner backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <div className="lg:space-y-3 xl:space-y-5">
                <div className="flex items-center justify-between lg:gap-2 xl:gap-3">
                  <div>
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                      Routine basics
                    </p>
                    <h2 className="lg:text-base xl:text-lg 2xl:text-xl font-semibold text-foreground">
                      Set the stage
                    </h2>
                  </div>
                </div>
                <div className="lg:space-y-3 xl:space-y-4">
                  <label className="lg:space-y-1 xl:space-y-2 block">
                    <span className="lg:text-xs xl:text-sm font-semibold flex items-center lg:gap-1.5 xl:gap-2">
                      <Target className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-primary" />
                      Routine name
                    </span>
                    <input
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder="Daily launch sequence"
                      maxLength={80}
                      className="w-full rounded-2xl border border-gray-100 bg-white lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[11px] xl:text-xs 2xl:text-sm text-foreground placeholder:text-muted-foreground shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </label>
                  <label className="lg:space-y-1 xl:space-y-2 block">
                    <span className="lg:text-xs xl:text-sm font-semibold flex items-center lg:gap-1.5 xl:gap-2">
                      <Clock3 className="lg:h-3 lg:w-3 xl:h-4 xl:w-4 text-primary" />
                      Anchor moment
                    </span>
                    <input
                      value={form.anchor}
                      onChange={handleChange("anchor")}
                      placeholder="Right after morning coffee"
                      className="w-full rounded-2xl border border-gray-100 bg-white lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[11px] xl:text-xs 2xl:text-sm text-foreground placeholder:text-muted-foreground shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                  <label className="lg:space-y-1 xl:space-y-2 block">
                    <span className="lg:text-xs xl:text-sm font-semibold flex items-center gap-2">
                      <CalendarDays className="lg:h-3 lg:w-3 xl:h-4 xl:w-4 text-primary" />
                      Why this routine matters
                    </span>
                    <textarea
                      value={form.notes}
                      onChange={handleChange("notes")}
                      rows={3}
                      placeholder="Remind future you where this momentum is headed."
                      className="w-full rounded-2xl border border-gray-100 bg-white lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[11px] xl:text-xs 2xl:text-sm text-foreground placeholder:text-muted-foreground shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </label>
                </div>
              </div>

              <div className="lg:space-y-3 xl:space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                      Focus window
                    </p>
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                      Pick when the routine should feel most alive.
                    </p>
                  </div>
                  <span className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
                    {timeWindow}
                  </span>
                </div>
                <div className="flex flex-wrap lg:gap-1.5 xl:gap-2">
                  {timeWindows.map((window) => (
                    <button
                      key={window}
                      type="button"
                      onClick={() => handleTimeWindowChange(window)}
                      className={`lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold rounded-full border transition ${
                        timeWindow === window
                          ? "bg-primary text-white border-primary"
                          : "border-gray-200 bg-white text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {window}
                    </button>
                  ))}
                </div>
              </div>

              {status ? (
                <div
                  className={`rounded-2xl border lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[11px] xl:text-xs 2xl:text-sm ${getStatusClasses(
                    status.tone
                  )}`}
                >
                  {status.text}
                </div>
              ) : null}

              <div className="lg:space-y-3 xl:space-y-4">
                <div className="flex items-center justify-between lg:gap-1.5 xl:gap-2">
                  <div>
                    <p className="lg:text-[11px] 2xl:text-sm xl:text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Habit stack
                    </p>
                    <h3 className="lg:text-base xl:text-lg 2xl:text-xl font-semibold text-foreground">
                      Pick what goes in the sequence
                    </h3>
                  </div>
                  <span className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
                    {selectedHabitIds.length} selected - {habits.length}{" "}
                    available
                  </span>
                </div>
                <div className="flex flex-wrap lg:gap-2 xl:gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 lg:h-2 lg:w-2 xl:h-3 2xl:h-4 xl:w-3 2xl:w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={filter}
                      onChange={(event) => setFilter(event.target.value)}
                      placeholder="Filter by habit name, focus, or cadence"
                      className="w-full rounded-full border border-gray-100 bg-white lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:pl-6 xl:pl-10 lg:text-[11px] xl:text-xs 2xl:text-sm text-foreground placeholder:text-muted-foreground shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFilter("")}
                    className="lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {filteredHabits.length === 0 ? (
                      <div className="col-span-2 rounded-2xl border-dashed border border-gray-200 bg-muted/40 lg:px-3 xl:px-4 lg:py-4 xl:py-5 lg:text-xs xl:text-sm text-muted-foreground">
                        No habits match that search yet. Try a different word.
                      </div>
                    ) : (
                      filteredHabits.map((habit) => {
                        const isActive = selectedHabitIds.includes(habit.id);
                        return (
                          <button
                            key={habit.id}
                            type="button"
                            onClick={() => toggleHabit(habit.id)}
                            className={`relative w-full rounded-2xl border lg:p-3 xl:p-4 text-left transition shadow-sm ${
                              isActive
                                ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30"
                                : "border-gray-100 bg-white hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-start justify-between lg:gap-1 xl:gap-2">
                              <div>
                                <p className="lg:text-xs xl:text-sm 2xl:text-base font-semibold">
                                  {habit.name}
                                </p>
                                <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
                                  {habit.cadence} - {habit.focus}
                                </p>
                              </div>
                              <span className="inline-flex items-center gap-1 rounded-full border lg:px-2 lg:py-0.5 xl:py-1 lg:text-[8px] xl:text-[10px] 2xl:text-[11px] font-semibold text-muted-foreground">
                                <Check
                                  className={`lg:h-2 lg:w-2 xl:h-3 xl:w-3 ${
                                    isActive
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                                {isActive ? "Included" : "Add"}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center lg:gap-2 xl:gap-3 lg:pt-1 xl:pt-2">
                <Button
                  type="submit"
                  className="rounded-full bg-primary lg:py-2 xl:py-3 lg:text-xs xl:text-sm 2xl:text-base font-semibold text-white shadow-[0_5px_10px_rgba(240,144,41,0.35)] transition hover:brightness-110 disabled:opacity-80"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving routine..." : pageHeading.submitLabel}
                </Button>
              </div>
            </form>

            <aside className="lg:space-y-3 xl:space-y-5">
              <div className="relative overflow-hidden lg:rounded-2xl xl:rounded-3xl border border-white/70 bg-white/90 lg:p-4 xl:p-6 shadow-inner backdrop-blur dark:border-white/10 dark:bg-white/5">
                <GradientCircle
                  size={210}
                  position={{ bottom: "-50px", right: "-50px" }}
                  color="rgba(135, 197, 161, 0.35)"
                  fadeColor="rgba(135, 197, 161, 0)"
                  className="scale-[1.2]"
                />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                      Routine preview
                    </p>
                    <h2 className="lg:text-base xl:text-lg 2xl:text-xl font-semibold text-foreground">
                      {form.name || "Untitled routine"}
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted lg:px-2 px-3 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
                    Live
                  </span>
                </div>
                <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                  {previewFocus}
                </p>
                <div className="lg:mt-4 xl:mt-5 grid grid-cols-2 lg:gap-2 xl:gap-3 lg:text-xs xl:text-sm">
                  <div className="rounded-2xl border border-gray-100 bg-muted/50 lg:px-3 xl:px-4 lg:py-2 xl:py-3">
                    <div className="lg:text-[9px] xl:text-[10px] 2xl:text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      Anchor
                    </div>
                    <p className="lg:text-xs xl:text-sm 2xl:text-base lg:mt-1 xl:mt-2 font-semibold text-foreground">
                      {form.anchor || "Not set yet"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-muted/50 lg:px-3 xl:px-4 lg:py-2 xl:py-3">
                    <div className="lg:text-[9px] xl:text-[10px] 2xl:text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      Focus window
                    </div>
                    <p className="lg:text-xs xl:text-sm 2xl:text-base lg:mt-1 xl:mt-2 font-semibold text-foreground">
                      {timeWindow}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-muted/50 lg:px-3 xl:px-4 lg:py-2 xl:py-3">
                    <div className="lg:text-[9px] xl:text-[10px] 2xl:text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      Habits stacked
                    </div>
                    <p className="lg:mt-1 xl:mt-2 xl:text-2xl 2xl:text-3xl font-semibold text-foreground">
                      {selectedHabitIds.length}
                    </p>
                    <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
                      max {MAX_HABITS}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-muted/50 lg:px-3 xl:px-4 lg:py-2 xl:py-3">
                    <div className="lg:text-[9px] xl:text-[10px] 2xl:text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      Notes
                    </div>
                    <p className="lg:mt-1 xl:mt-2 lg:text-[9px] xl:text-xs 2xl:text-sm text-foreground">
                      {form.notes || "Add something that keeps you honest."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:rounded-2xl xl:rounded-3xl border border-white/70 bg-white/90 lg:p-4 xl:p-5 shadow-inner backdrop-blur dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <p className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Habit shortlist
                  </p>
                  <span className="lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
                    {selectedHabits.length === 0
                      ? "No habits yet"
                      : `${selectedHabits.length} chosen`}
                  </span>
                </div>
                <div className="lg:mt-3 xl:mt-4 space-y-3">
                  {selectedHabits.length === 0 ? (
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                      Select habits on the left to see them build the stack.
                    </p>
                  ) : (
                    selectedHabits.map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-start justify-between lg:gap-2 xl:gap-3 rounded-2xl border border-gray-100 bg-white lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-xs xl:text-sm 2xl:text-base shadow-sm"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold">{habit.name}</p>
                          <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
                            {habit.cadence} - {habit.focus}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full border lg:px-2 lg:py-0.5 xl:py-1 lg:text-[8px] xl:text-[10px] 2xl:text-[11px] font-semibold text-primary">
                          <Check className="lg:w-2 lg:h-2 xl:h-3 xl:w-3" />
                          Included
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};

export default RoutineFormPage;
