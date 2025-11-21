"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlarmCheck,
  AlarmClockCheck,
  BadgeCheck,
  CalendarDays,
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

type Cadence = "Daily" | "Weekly" | "Monthly";

interface HabitFormState {
  name: string;
  description: string;
  cadence: Cadence;
  startDate: string;
  timeOfDay: string;
  reminder: string;
}

const inputClassName =
  "w-full rounded-2xl border border-gray-100 bg-white/90 px-4 py-3 xl:text-sm 2xl:text-base text-foreground placeholder:text-muted-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30";

const HabitCreatePage: React.FC = () => {
  const [form, setForm] = useState<HabitFormState>({
    name: "",
    description: "",
    cadence: "Daily",
    startDate: new Date().toISOString().slice(0, 10),
    timeOfDay: "07:00",
    reminder: "15 minutes before",
  });
  const [saved, setSaved] = useState(false);

  const templates = [
    {
      title: "AM movement",
      cadence: "Daily · 10m",
      trigger: "After coffee",
      notes: "3 rounds mobility + 10 push-ups",
    },
    {
      title: "Focus block",
      cadence: "Weekly · 4x",
      trigger: "Start at 9:00a",
      notes: "90m no-phone deep work",
    },
    {
      title: "Sleep wind-down",
      cadence: "Daily · 20m",
      trigger: "10:30p",
      notes: "Stretch + journal, lights out 11:00p",
    },
  ];

  const safeguards = [
    "Cap to one tiny win on busy days instead of skipping.",
    "Prep gear the night before to protect the cue.",
    "Pair with an existing routine so it is hard to miss.",
  ];

  const handleChange =
    (field: keyof HabitFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setSaved(false);
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <main className="w-full min-h-screen xl:pt-20 2xl:pt-24 text-foreground pb-10">
      <div className="xl:px-8 2xl:px-28 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <BadgeCheck className="w-4 h-4" />
              <span>Create habit</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold">Design a new habit</h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Set the cadence, start small, and add the reminders that keep you honest.
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
            Draft saved locally. Hook this form up to your API to persist it.
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
                  <h2 className="font-semibold xl:text-lg 2xl:text-xl">Habit basics</h2>
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
                <input
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="e.g. Morning stretch"
                  className={inputClassName}
                  required
                />
              </label>

              <label className="space-y-2 block">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ListChecks className="w-4 h-4 text-primary" />
                  <span>Description</span>
                </div>
                <textarea
                  value={form.description}
                  onChange={handleChange("description")}
                  placeholder="Add a quick why, or the first steps you'll take."
                  rows={3}
                  className={`${inputClassName} resize-none leading-relaxed`}
                />
              </label>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="space-y-2 block">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Recycle className="w-4 h-4 text-primary" />
                    <span>Cadence</span>
                  </div>
                  <select
                    value={form.cadence}
                    onChange={handleChange("cadence")}
                    className={`${inputClassName} cursor-pointer`}
                  >
                    {(["Daily", "Weekly", "Monthly"] as Cadence[]).map((cadence) => (
                      <option key={cadence} value={cadence}>
                        {cadence}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 block">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span>Start date</span>
                  </div>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={handleChange("startDate")}
                    className={inputClassName}
                  />
                </label>

                <label className="space-y-2 block">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <AlarmClockCheck className="w-4 h-4 text-primary" />
                    <span>Preferred time</span>
                  </div>
                  <input
                    type="time"
                    value={form.timeOfDay}
                    onChange={handleChange("timeOfDay")}
                    className={inputClassName}
                  />
                </label>

                <label className="space-y-2 block">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <AlarmCheck className="w-4 h-4 text-primary" />
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
                    ].map((reminder) => (
                      <option key={reminder} value={reminder}>
                        {reminder}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-3">
              <Button
                type="submit"
                className="xl:h-10 2xl:h-12 xl:px-5 2xl:px-7 xl:text-sm 2xl:text-base bg-primary text-white shadow-sm hover:brightness-105 transition"
              >
                Save habit draft
              </Button>
              <span className="text-xs text-muted-foreground self-center">
                This currently saves locally. Connect to your backend to persist.
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
                  {form.description || "Add a quick description so future you stays motivated."}
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

        <div className="grid xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="px-6 pt-5 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Starter templates
                  </p>
                  <h2 className="text-xl font-semibold">Pick a pattern and tweak</h2>
                  <p className="text-sm text-muted-foreground">
                    Hardcoded examples to speed you up. Wire to presets when you add persistence.
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
                    <p className="text-sm text-foreground">{template.notes}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          name: template.title,
                          description: template.notes,
                          cadence: template.cadence.startsWith("Weekly") ? "Weekly" : "Daily",
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

          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="px-6 pt-5 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Safety net
                  </p>
                  <h2 className="text-xl font-semibold">Keep it slipping-proof</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                  <Flame className="w-4 h-4 text-primary" />
                  Streak care
                </div>
              </div>

              <div className="space-y-3">
                {safeguards.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-dashed border-gray-200 bg-muted/40 px-4 py-3 space-y-1"
                  >
                    <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">
                      <Sparkles className="w-4 h-4" />
                      Guardrail {index + 1}
                    </div>
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HabitCreatePage;
