"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";

import Button from "@/app/components/ui/button";
import PageGradient from "@/app/components/ui/page-gradient";

import {
  Category,
  Commitment,
  TimeWindow,
  categories,
  commitmentCopy,
} from "../types";

interface HabitOption {
  id: string;
  name: string;
  description: string | null;
}

interface CreatePopularPostFormProps {
  habits: HabitOption[];
}

const inputClassName =
  "w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
const textareaClassName =
  "w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none";
const selectClassName =
  "w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

const commitmentOptions: Commitment[] = ["Quick", "Standard", "Deep"];
const timeWindowOptions: { value: TimeWindow; label: string }[] = [
  { value: "Anytime", label: "Anytime" },
  { value: "Morning", label: "Morning" },
  { value: "Workday", label: "Workday" },
  { value: "Evening", label: "Evening" },
];

const buildFormState = (habits: HabitOption[]) => ({
  habitId: habits[0]?.id ?? "",
  title: "",
  summary: "",
  highlight: "",
  anchor: "",
  duration: "",
  cadence: "Daily",
  category: categories[0],
  timeWindow: timeWindowOptions[0]?.value ?? "Anytime",
  commitment: "Standard" as Commitment,
  benefits: "",
  steps: "",
  guardrails: "",
});

const CreatePopularPostForm: React.FC<CreatePopularPostFormProps> = ({
  habits,
}) => {
  const [form, setForm] = useState(buildFormState(habits));
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const router = useRouter();

  const selectedHabit = habits.find((habit) => habit.id === form.habitId);

  const handleChange =
    (field: keyof typeof form) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.habitId) {
      setServerError("Choose a habit to anchor this post.");
      return;
    }

    startTransition(async () => {
      try {
        setServerError(null);
        const response = await fetch("/api/habits/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to create post.");
        }
        router.push("/dashboard/habits/popular");
      } catch (error) {
        setServerError(
          error instanceof Error ? error.message : "Unable to create post."
        );
      }
    });
  };

  return (
    <main className="relative overflow-hidden w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground xl:pb-12 2xl:pb-16 bg-linear-to-tr from-white/90 via-light-yellow/55 to-green-soft/15">
      <PageGradient />
      <div className="relative z-10 xl:px-8 2xl:px-28 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <BadgeCheck className="w-4 h-4" />
              <span>Create a post</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-xl md:text-3xl font-bold">
                Share a habit you love
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Pick one of your habits, fill in the missing storytelling bits,
                and share the playbook with the crew.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/habits/popular"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Back to popular habits
          </Link>
        </div>

        {habits.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm px-6 py-8 space-y-3 text-sm text-muted-foreground">
            <p>You'll need to create a habit before you can publish a post.</p>
            <Link
              href="/dashboard/habits/create"
              className="font-semibold text-primary hover:underline"
            >
              Create a habit first
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm px-6 py-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Habit to share</label>
                <select
                  value={form.habitId}
                  onChange={handleChange("habitId")}
                  className={selectClassName}
                  required
                >
                  {habits.map((habit) => (
                    <option key={habit.id} value={habit.id}>
                      {habit.name}
                    </option>
                  ))}
                </select>
                {selectedHabit?.description ? (
                  <p className="text-xs text-muted-foreground">
                    {selectedHabit.description}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Post title</label>
                <input
                  value={form.title}
                  onChange={handleChange("title")}
                  placeholder="e.g. Sunrise energy loop"
                  className={inputClassName}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Why it matters</label>
                <textarea
                  value={form.summary}
                  onChange={handleChange("summary")}
                  rows={3}
                  placeholder="Share what keeps you showing up."
                  className={textareaClassName}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Highlight</label>
                  <input
                    value={form.highlight}
                    onChange={handleChange("highlight")}
                    placeholder="What gets your teammates curious?"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Anchor</label>
                  <input
                    value={form.anchor}
                    onChange={handleChange("anchor")}
                    placeholder="Pair it with a trigger, e.g. after lunch"
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Duration</label>
                  <input
                    value={form.duration}
                    onChange={handleChange("duration")}
                    placeholder="e.g. 12 minutes"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Cadence</label>
                  <input
                    value={form.cadence}
                    onChange={handleChange("cadence")}
                    placeholder="Daily / Weekly"
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Category</label>
                  <select
                    value={form.category}
                    onChange={handleChange("category")}
                    className={selectClassName}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Time window</label>
                  <select
                    value={form.timeWindow}
                    onChange={handleChange("timeWindow")}
                    className={selectClassName}
                  >
                    {timeWindowOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Commitment</label>
                  <select
                    value={form.commitment}
                    onChange={handleChange("commitment")}
                    className={selectClassName}
                  >
                    {commitmentOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {commitmentCopy[form.commitment]}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Why it works</label>
                <textarea
                  value={form.benefits}
                  onChange={handleChange("benefits")}
                  rows={3}
                  placeholder="One benefit per line"
                  className={textareaClassName}
                />
                <p className="text-xs text-muted-foreground">
                  List each reason on its own line.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Steps</label>
                <textarea
                  value={form.steps}
                  onChange={handleChange("steps")}
                  rows={3}
                  placeholder="One step per line"
                  className={textareaClassName}
                />
                <p className="text-xs text-muted-foreground">
                  Short, actionable steps keep it repeatable.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Guardrails</label>
                <textarea
                  value={form.guardrails}
                  onChange={handleChange("guardrails")}
                  rows={3}
                  placeholder="One guardrail per line"
                  className={textareaClassName}
                />
                <p className="text-xs text-muted-foreground">
                  Share hard boundaries or conditions that protect the habit.
                </p>
              </div>

              {serverError ? (
                <div className="rounded-2xl border border-rose-400 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                  {serverError}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.habitId}
                  className="xl:h-10 2xl:h-12 xl:px-5 2xl:px-7 xl:text-sm 2xl:text-base bg-primary text-white shadow-sm hover:brightness-105 transition disabled:cursor-not-allowed disabled:brightness-90"
                >
                  {isSubmitting ? "Sharing post..." : "Share this habit"}
                </Button>
                <Link
                  href="/dashboard/habits/popular"
                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:underline"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default CreatePopularPostForm;
