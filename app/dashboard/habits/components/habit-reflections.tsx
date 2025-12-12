"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { Loader, Loader2, NotebookPen, Sparkles } from "lucide-react";

import {
  createHabitReflection,
  fetchRecentHabitReflections,
} from "../actions/habit-reflection";
import type { HabitReflection } from "../types";

type Props = {
  initialReflections: HabitReflection[];
};

const toDateInput = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
    .toISOString()
    .split("T")[0];

const describeDate = (value: string | Date) => {
  const target = new Date(value);
  const today = new Date();
  const todayKey = toDateInput(today);
  const targetKey = toDateInput(target);

  if (targetKey === todayKey) return "Today";

  const yesterday = new Date(today);
  yesterday.setUTCDate(today.getUTCDate() - 1);
  if (targetKey === toDateInput(yesterday)) return "Yesterday";

  return target.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const HabitReflections: React.FC<Props> = ({ initialReflections }) => {
  const [reflections, setReflections] =
    useState<HabitReflection[]>(initialReflections);
  const [note, setNote] = useState("");
  const todayKey = toDateInput(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const sortedReflections = useMemo(
    () =>
      [...reflections].sort(
        (a, b) =>
          new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      ),
    [reflections]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) {
      setError("Add a quick win or highlight before saving.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const reflection = await createHabitReflection({
        note: trimmed,
        entryDate: todayKey,
      });
      setReflections((prev) => {
        const next = [reflection, ...prev];
        return next.slice(0, 30);
      });
      setNote("");
      setSuccess("Captured. Revisit it when you need motivation.");
    } catch (err) {
      console.error("Unable to save reflection", err);
      setError("Could not save right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    setError(null);
    setSuccess(null);
    try {
      const latest = await fetchRecentHabitReflections();
      setReflections(latest);
    } catch (err) {
      console.error("Unable to refresh reflections", err);
      setError("Refresh failed. Your saved notes are still loaded.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="lg:max-w-5xl xl:max-w-6xl shadow-inner lg:rounded-2xl xl:rounded-3xl border border-gray-100 bg-white bg-linear-to-br from-primary/10 via-card to-amber-50">
      <div className="lg:p-4 xl:p-5 2xl:p-6 lg:space-y-3 xl:space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="lg:text-[11px] xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Notes
            </p>
            <div className="flex items-center gap-2">
              <h2 className="lg:text-sm xl:text-base 2xl:text-lg font-semibold">
                What went well today?
              </h2>
            </div>
            <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
              Capture today&apos;s wins so you can repeat what worked tomorrow.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 lg:p-1 xl:p-1.5 lg:text-[10px] xl:text-xs font-semibold text-primary hover:border-primary/70 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <Loader2 className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 animate-spin" />
            ) : (
              <Loader className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
            )}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-100 bg-white lg:p-3 xl:p-4 2xl:p-5 lg:space-y-2 xl:space-y-3"
        >
          <div>
            <label htmlFor="reflection-note" className="sr-only">
              Reflection note
            </label>
            <textarea
              id="reflection-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Today's win, a habit tweak that helped, or a cue that worked."
              rows={3}
              maxLength={600}
              className="w-full rounded-xl border border-gray-200 bg-white lg:px-2 xl:px-3 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs text-foreground placeholder:text-muted-foreground/70 shadow-inner focus:border-primary outline-none resize-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1 lg:text-[10px] xl:text-[11px] text-muted-foreground">
              {error ? (
                <p className="text-coral font-semibold">{error}</p>
              ) : success ? (
                <p className="text-emerald-600 font-semibold">{success}</p>
              ) : (
                <p>Save a short note about what went good today.</p>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting || note.trim().length === 0}
              className="w-32 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white lg:py-1.5 xl:py-2 lg:text-[11px] xl:text-xs font-semibold shadow-[0_6px_14px_rgba(240,144,41,0.35)] transition hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && (
                <Loader2 className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 animate-spin" />
              )}
              Save note
            </button>
          </div>
        </form>

        <div className="lg:space-y-2 xl:space-y-3">
          {sortedReflections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white lg:p-3 xl:p-4 text-center lg:text-[11px] xl:text-xs text-muted-foreground">
              No reflections yet.
            </div>
          ) : (
            sortedReflections.slice(0, 8).map((reflection) => (
              <div
                key={reflection.id}
                className="rounded-2xl border border-gray-100 bg-white lg:p-3 xl:p-4 shadow-sm"
              >
                <div className="flex items-center justify-between lg:mb-1">
                  <p className="font-semibold lg:text-[12px] xl:text-sm">
                    {describeDate(reflection.entryDate)}
                  </p>
                  <span className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
                    {toDateInput(new Date(reflection.entryDate))}
                  </span>
                </div>
                <p className="lg:text-[11px] xl:text-xs text-foreground leading-relaxed">
                  {reflection.note}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitReflections;
