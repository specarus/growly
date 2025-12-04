"use client";

import { useState, useTransition } from "react";

import { setStreakGoalAction } from "../actions/set-streak-goal";

type Props = {
  initialGoal?: number | null;
};

const options = [7, 14, 21, 30, 45, 60, 90, 120];

const clampGoal = (value: number) => Math.min(365, Math.max(1, value));

export default function StreakGoalForm({ initialGoal }: Props) {
  const [goal, setGoal] = useState<number>(initialGoal ?? 21);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("streakGoalDays", goal.toString());
        await setStreakGoalAction(formData);
        setMessage("Streak goal updated.");
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to save your streak goal right now."
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {options.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setGoal(value)}
            className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
              goal === value
                ? "border-primary bg-primary text-white"
                : "border-muted dark:border-muted-foreground/50 dark text-foreground hover:border-primary dark:hover:border-primary hover:text-primary"
            }`}
          >
            {value} days
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Aim for a stretch target that still feels sustainable.</span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/30 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save goal"}
        </button>
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
