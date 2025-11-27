"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Clock3,
  GripVertical,
  ListPlus,
  Sparkles,
  Target,
} from "lucide-react";

import Button from "@/app/components/ui/button";
import PageGradient from "@/app/components/ui/page-gradient";

type Habit = {
  id: string;
  name: string;
  cadence: string;
  focus: string;
};

type Routine = {
  id: string;
  name: string;
  anchor: string | null;
  notes: string | null;
  habits: Habit[];
};

type RoutinesPageProps = {
  initialBacklog: Habit[];
  initialRoutines: Routine[];
};

const tabClasses =
  "px-4 py-2 font-semibold transition whitespace-nowrap rounded-full border border-transparent";

const dropClasses =
  "rounded-2xl border border-dashed transition shadow-sm bg-white/70 hover:border-primary/60";

const RoutinesPage: React.FC<RoutinesPageProps> = ({
  initialBacklog,
  initialRoutines,
}) => {
  const [backlog, setBacklog] = useState<Habit[]>(initialBacklog);
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const hasMountedRef = useRef(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);

  const moveHabit = (habitId: string, source: string, target: string) => {
    if (!habitId || source === target) return;

    let pulled: Habit | null = null;

    if (source === "backlog") {
      setBacklog((prev) => {
        const next = prev.filter((habit) => {
          if (habit.id === habitId) {
            pulled = habit;
            return false;
          }
          return true;
        });
        return next;
      });
    } else {
      setRoutines((prev) =>
        prev.map((routine) => {
          if (routine.id !== source) return routine;
          const remaining = routine.habits.filter((habit) => {
            if (habit.id === habitId) {
              pulled = habit;
              return false;
            }
            return true;
          });
          return remaining.length === routine.habits.length
            ? routine
            : { ...routine, habits: remaining };
        })
      );
    }

    requestAnimationFrame(() => {
      if (!pulled) return;
      if (target === "backlog") {
        setBacklog((prev) => {
          if (prev.find((habit) => habit.id === pulled!.id)) return prev;
          return [...prev, pulled!];
        });
        return;
      }

      setRoutines((prev) =>
        prev.map((routine) => {
          if (routine.id !== target) return routine;
          if (routine.habits.find((habit) => habit.id === pulled!.id))
            return routine;
          return { ...routine, habits: [...routine.habits, pulled!] };
        })
      );
    });
  };

  const handleDrop =
    (target: string) =>
    (event: React.DragEvent<HTMLDivElement | HTMLButtonElement>) => {
      event.preventDefault();
      const habitId = event.dataTransfer.getData("habitId");
      const source = event.dataTransfer.getData("source");
      setHoverTarget(null);
      moveHabit(habitId, source, target);
    };

  const handleDragStart =
    (habitId: string, source: string) =>
    (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("habitId", habitId);
      event.dataTransfer.setData("source", source);
    };

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }

    persistTimerRef.current = setTimeout(() => {
      const payload = {
        routines: routines.map((routine) => ({
          id: routine.id,
          habitIds: routine.habits.map((habit) => habit.id),
        })),
      };

      (async () => {
        try {
          const response = await fetch("/api/routines", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            console.error("Failed to persist routines", await response.text());
          }
        } catch (error) {
          console.error("Failed to persist routines", error);
        }
      })();
    }, 450);

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
    };
  }, [routines, backlog]);

  return (
    <main className="relative overflow-hidden w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground xl:pb-12 2xl:pb-16 bg-linear-to-br from-primary/30 via-slate-50 to-green-soft/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <PageGradient />
      <div className="xl:px-8 2xl:px-28 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <BadgeCheck className="w-4 h-4" />
              <span>Routines</span>
            </div>
            <div className="space-y-1">
              <h1 className="xl:text-2xl 2xl:text-3xl font-bold">
                Group habits into routines
              </h1>
              <p className="xl:text-xs 2xl:text-sm text-muted-foreground max-w-2xl">
                Drag habits into the routines that keep you steady. Changes now
                sync directly to your saved layouts.
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-3">
            <Link
              href="/dashboard/habits/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white xl:text-xs 2xl:text-sm hover:brightness-105 transition"
            >
              <ListPlus className="w-4 h-4" />
              Create habit
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex gap-1 items-center p-2 rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden xl:text-xs 2xl:text-sm">
            <Link
              href="/dashboard/habits"
              className={`${tabClasses} text-muted-foreground hover:text-primary rounded-full`}
            >
              Habits
            </Link>
            <span
              className={`${tabClasses} bg-primary text-white rounded-full cursor-pointer`}
              aria-current="page"
            >
              Routines
            </span>
            <Link
              href="/dashboard/habits/popular"
              className={`${tabClasses} text-muted-foreground hover:text-primary rounded-full`}
            >
              Popular
            </Link>
          </div>
          <span className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
            Move habits between the backlog and your routines.
          </span>
        </div>

        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-5">
          <div
            className={`${dropClasses} ${
              hoverTarget === "backlog"
                ? "border-primary/80 bg-primary/5"
                : "border-gray-100 bg-white/80"
            } p-5 h-full`}
            onDragOver={(event) => event.preventDefault()}
            onDragEnter={() => setHoverTarget("backlog")}
            onDragLeave={() => setHoverTarget(null)}
            onDrop={handleDrop("backlog")}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Unassigned
                </p>
                <h2 className="text-lg font-semibold">Habit backlog</h2>
                <p className="text-sm text-muted-foreground">
                  Drop habits here to pull them out of a routine.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {backlog.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  No loose habits. Drag one back from a routine to stash it
                  here.
                </div>
              ) : (
                backlog.map((habit) => (
                  <div
                    key={habit.id}
                    draggable
                    onDragStart={handleDragStart(habit.id, "backlog")}
                    className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm flex items-center justify-between gap-3 hover:border-primary/50 cursor-grab"
                  >
                    <div>
                      <p className="font-semibold">{habit.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {habit.cadence} · {habit.focus}
                      </p>
                    </div>
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className={`${dropClasses} ${
                  hoverTarget === routine.id
                    ? "border-primary/80 bg-primary/5"
                    : "border-gray-100 bg-white/80"
                } xl:p-4 2xl:p-5 flex flex-col gap-4`}
                onDragOver={(event) => event.preventDefault()}
                onDragEnter={() => setHoverTarget(routine.id)}
                onDragLeave={() => setHoverTarget(null)}
                onDrop={handleDrop(routine.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 xl:mb-2 2xl:mb-3 rounded-full bg-muted px-3 xl:py-1 2xl:py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <Target className="w-4 h-4 text-primary" />
                      Routine
                    </div>
                    <h3 className="xl:text-base 2xl:text-lg font-semibold leading-tight">
                      {routine.name}
                    </h3>
                    <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                      {routine.notes ||
                        "No notes yet. This is a great spot to describe why this routine matters."}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock3 className="w-4 h-4 text-primary" />
                      <span>{routine.anchor ?? "Not set"}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center xl:text-[11px] 2xl:text-xs xl:w-32 2xl:w-36 font-semibold text-primary bg-primary/10 py-1 rounded-full">
                    Drop habits here
                  </div>
                </div>

                <div className="space-y-3">
                  {routine.habits.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      Empty slot. Drag a habit from the backlog to start this
                      routine.
                    </div>
                  ) : (
                    routine.habits.map((habit) => (
                      <div
                        key={habit.id}
                        draggable
                        onDragStart={handleDragStart(habit.id, routine.id)}
                        className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm flex items-center justify-between gap-3 hover:border-primary/50 cursor-grab"
                      >
                        <div>
                          <p className="font-semibold">{habit.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {habit.cadence} · {habit.focus}
                          </p>
                        </div>
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default RoutinesPage;
