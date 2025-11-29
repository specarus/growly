"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  CalendarClock,
  Check,
  Flame,
  LifeBuoy,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import type { Habit as PrismaHabit } from "@prisma/client";
import PageGradient from "@/app/components/ui/page-gradient";
import PageHeading from "@/app/components/page-heading";
import HabitsTabs from "./components/habits-tabs";
import HabitsCalendar from "./components/habits-calendar";
import GradientCircle from "@/app/components/ui/gradient-circle";
import { formatDayKey, ProgressByDayMap } from "@/lib/habit-progress";

type Habit = PrismaHabit & {
  streak?: number;
  completion?: number;
};

type PlaybookItem = {
  title: string;
  detail: string;
  label: "Prevent" | "Rescue" | "Review";
  meta: string;
  icon: "ShieldCheck" | "LifeBuoy" | "CalendarClock";
  accent: string;
};

type Props = {
  habits: Habit[];
  progressByDay: ProgressByDayMap;
};

const getFocusLabel = (habit: Habit) => {
  const description = habit.description?.trim();
  if (description) {
    return description;
  }

  const amount = habit.goalAmount ?? 0;
  const unit = habit.goalUnit ?? "count";
  const cadence = habit.cadence?.toLowerCase() ?? "";

  return `${amount} ${unit} per ${cadence}`;
};

const streakDefensePlaybook: PlaybookItem[] = [
  {
    title: "Anchor a reliable cue",
    detail:
      "Pair the habit with a fixed trigger so you start automatically and avoid the drift that breaks streaks.",
    label: "Prevent",
    meta: "Before start",
    icon: "ShieldCheck",
    accent: "text-green-soft bg-green-soft/20",
  },
  {
    title: "Rescue with the smallest win",
    detail:
      "If you miss a session, do a short reset or partial rep to keep the streak intact and rebuild momentum.",
    label: "Rescue",
    meta: "If you slip",
    icon: "LifeBuoy",
    accent: "text-coral bg-coral/20",
  },
  {
    title: "Review and adjust weekly",
    detail:
      "Reflect on what worked, tweak anchors, and plan the next week with realistic cues so streaks stay protected.",
    label: "Review",
    meta: "Weekly reset",
    icon: "CalendarClock",
    accent: "text-primary bg-primary/20",
  },
];

const iconMap = {
  ShieldCheck,
  LifeBuoy,
  CalendarClock,
};

const MENU_WIDTH = 192;

type MenuPosition = {
  top: number;
  left: number;
};

const Portal = ({ children }: { children: ReactNode }) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const node = document.createElement("div");
    document.body.appendChild(node);
    setContainer(node);

    return () => {
      document.body.removeChild(node);
    };
  }, []);

  if (!container) {
    return null;
  }

  return createPortal(children, container);
};

const HabitsBoard: React.FC<Props> = ({ habits, progressByDay }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [localHabits, setLocalHabits] = useState(habits);
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    habits[0]?.id || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [quantityMenuOpen, setQuantityMenuOpen] = useState<string | null>(null);
  const [customQuantities, setCustomQuantities] = useState<
    Record<string, string>
  >({});
  const quantityButtonRef = useRef<HTMLDivElement | null>(null);
  const quantityMenuRef = useRef<HTMLDivElement | null>(null);
  const [progressMap, setProgressMap] =
    useState<ProgressByDayMap>(progressByDay);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const updateMenuPosition = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const anchor = quantityButtonRef.current;
    if (!anchor) {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right - MENU_WIDTH + window.scrollX,
    });
  }, []);

  const refreshTodayProgress = (updatedHabits: Habit[]) => {
    if (updatedHabits.length === 0) {
      return;
    }
    const todayKey = formatDayKey(new Date());
    const sum = updatedHabits.reduce((acc, habit) => {
      const logged = habit.dailyProgress ?? 0;
      const goal = habit.goalAmount ?? 1;
      const normalizedGoal = goal > 0 ? goal : 1;
      return acc + Math.min(1, logged / normalizedGoal);
    }, 0);
    setProgressMap((prev) => ({
      ...prev,
      [todayKey]: Math.min(1, sum / updatedHabits.length),
    }));
  };

  const reloadProgressMap = async () => {
    try {
      const today = new Date();
      const from = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
      ).toISOString();
      const to = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)
      ).toISOString();
      const response = await fetch(
        `/api/habits/daily-progress?from=${from}&to=${to}`,
        { cache: "no-store" }
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as {
        progressByDay: ProgressByDayMap;
      };

      if (data.progressByDay) {
        setProgressMap(data.progressByDay);
      }
    } catch (error) {
      console.error("Unable to reload progress map", error);
    }
  };
  const handleAddQuantity = async (habitId: string, amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }
    setQuantityMenuOpen(null);
    setCustomQuantities((prev) => ({
      ...prev,
      [habitId]: "",
    }));

    setLocalHabits((prev) => {
      const next = prev.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              dailyProgress: (habit.dailyProgress ?? 0) + amount,
            }
          : habit
      );
      refreshTodayProgress(next);
      return next;
    });

    try {
      const response = await fetch(`/api/habits/${habitId}/progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();

      if (typeof data.dailyProgress === "number") {
        setLocalHabits((prev) => {
          const next = prev.map((habit) =>
            habit.id === habitId
              ? { ...habit, dailyProgress: data.dailyProgress }
              : habit
          );
          refreshTodayProgress(next);
          return next;
        });
        void reloadProgressMap();
      }
    } catch (error) {
      console.error("Unable to persist habit progress", error);
    }
  };

  const handleReset = async (habitId: string) => {
    setQuantityMenuOpen(null);
    try {
      const response = await fetch(`/api/habits/${habitId}/reset`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();

      const nextProgress =
        typeof data.dailyProgress === "number" ? data.dailyProgress : 0;

      setLocalHabits((prev) => {
        const next = prev.map((habit) =>
          habit.id === habitId
            ? { ...habit, dailyProgress: nextProgress }
            : habit
        );
        refreshTodayProgress(next);
        return next;
      });
      void reloadProgressMap();
    } catch (error) {
      console.error("Unable to reset habit progress", error);
    }
  };

  useEffect(() => {
    if (!quantityMenuOpen) {
      quantityButtonRef.current = null;
      quantityMenuRef.current = null;
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        (quantityButtonRef.current &&
          quantityButtonRef.current.contains(target)) ||
        (quantityMenuRef.current && quantityMenuRef.current.contains(target))
      ) {
        return;
      }
      setQuantityMenuOpen(null);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setQuantityMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [quantityMenuOpen]);

  useEffect(() => {
    if (!quantityMenuOpen) {
      quantityMenuRef.current = null;
      setMenuPosition(null);
      return;
    }

    updateMenuPosition();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [quantityMenuOpen, updateMenuPosition]);

  useEffect(() => {
    setLocalHabits(habits);
  }, [habits]);

  useEffect(() => {
    setProgressMap(progressByDay);
  }, [progressByDay]);

  const filteredHabits = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return localHabits;
    }

    return localHabits.filter((habit) => {
      const focusLabel = getFocusLabel(habit).toLowerCase();
      return (
        habit.name.toLowerCase().includes(query) || focusLabel.includes(query)
      );
    });
  }, [localHabits, searchTerm]);

  useEffect(() => {
    const param = searchParams.get("habitId");
    if (param && localHabits.some((habit) => habit.id === param)) {
      setSelectedHabitId(param);
    }
  }, [localHabits, searchParams]);

  return (
    <main className="relative overflow-hidden w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground xl:pb-12 2xl:pb-16 bg-linear-to-br from-white/90 via-light-yellow/55 to-green-soft/15">
      <PageGradient />
      <div className="xl:px-8 2xl:px-28 space-y-8">
        <PageHeading
          badgeLabel="Your habits"
          title="Habit board"
          description="This board shows your current rhythm, streaks, and where you spend focus time."
          titleClassName="xl:text-2xl 2xl:text-3xl"
        />
        <div>
          <HabitsTabs active="habits" containerClassName="xl:gap-1 2xl:gap-2" />
        </div>

        <div className="grid gap-5">
          <div className="grid xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="px-6 pt-5 pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Active habits
                    </p>
                    <h2 className="xl:text-base 2xl:text-lg font-semibold">
                      Habits and Statistics
                    </h2>
                  </div>
                  <Link
                    href="/dashboard/habits/create"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white xl:text-xs 2xl:text-sm font-semibold transition hover:brightness-105 shadow-[0_5px_10px_rgba(240,144,41,0.35)] hover:shadow-none"
                  >
                    <Plus className="w-4 h-4" />
                    Create habit
                  </Link>
                </div>

                <div>
                  <label htmlFor="habit-search" className="sr-only">
                    Search habits
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-3 py-2 text-xs text-muted-foreground shadow-sm">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                      id="habit-search"
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search habits or goals"
                      className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-muted/50">
                  <div className="grid grid-cols-6 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                    <span className="col-span-2">Habit</span>
                    <span>Cadence</span>
                    <span>Streak</span>
                    <span className="col-span-2">Completion</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {localHabits.length === 0 ? (
                      <div className="px-4 py-10 text-center xl:text-sm 2xl:text-base text-muted-foreground space-y-4">
                        <p className="font-semibold text-foreground">
                          No habits yet
                        </p>
                        <p className="xl:text-xs 2xl:text-sm">
                          Start tracking a rhythm and this board will show your
                          streaks, completion, and cadence.
                        </p>
                        <Link
                          href="/dashboard/habits/create"
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 px-4 py-2 xl:text-xs 2xl:text-sm font-semibold text-primary hover:border-primary hover:bg-primary/5 transition"
                        >
                          <Plus className="w-3 h-3" />
                          Create your first habit
                        </Link>
                      </div>
                    ) : filteredHabits.length === 0 ? (
                      <div className="px-4 py-10 text-center xl:text-sm 2xl:text-base text-muted-foreground space-y-4">
                        <p className="font-semibold text-foreground">
                          No habits match your search
                        </p>
                        <p className="xl:text-xs 2xl:text-sm">
                          Try another keyword or clear the search to view
                          everything.
                        </p>
                      </div>
                    ) : (
                      filteredHabits.map((habit) => {
                        const isSelected = habit.id === selectedHabitId;
                        const streakValue = habit.streak ?? 0;
                        const completionValue = habit.completion ?? 0;
                        const focusLabel = getFocusLabel(habit);
                        const loggedAmount = habit.dailyProgress ?? 0;
                        const goalAmountValue = habit.goalAmount ?? 1;
                        const additionalCompletion =
                          goalAmountValue > 0
                            ? (loggedAmount / goalAmountValue) * 100
                            : 0;
                        const displayCompletion = Math.min(
                          100,
                          Math.round(completionValue + additionalCompletion)
                        );
                        const isComplete = displayCompletion >= 100;
                        const loggedLabel =
                          loggedAmount > 0
                            ? `+${loggedAmount}${
                                habit.goalUnit ? ` ${habit.goalUnit}` : ""
                              } logged`
                            : "Tap + to log progress";
                        return (
                          <div
                            key={habit.id}
                            role="button"
                            tabIndex={0}
                            onMouseEnter={() => setSelectedHabitId(habit.id)}
                            onClick={() =>
                              router.push(`/dashboard/habits/${habit.id}/edit`)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                router.push(
                                  `/dashboard/habits/${habit.id}/edit`
                                );
                              }
                            }}
                            className={`grid gap-1 w-full text-left grid-cols-6 px-4 py-3 items-center xl:text-xs 2xl:text-sm transition ${
                              isSelected
                                ? "bg-primary/5"
                                : "bg-white/60 hover:bg-primary/5"
                            }`}
                          >
                            <div className="col-span-2 space-y-1">
                              <div className="font-semibold text-foreground">
                                {habit.name}
                              </div>
                              <div className="space-y-1">
                                <div className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
                                  {focusLabel}
                                </div>
                                <p className="xl:text-[11px] 2xl:text-xs font-semibold text-primary">
                                  {loggedLabel}
                                </p>
                              </div>
                            </div>
                            <div className="text-muted-foreground">
                              {habit.cadence}
                            </div>
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-primary" />
                              <span className="font-semibold">
                                {streakValue}d
                              </span>
                            </div>
                            <div className="col-span-2 flex items-center justify-between">
                              <div className="flex items-center">
                                {isComplete ? (
                                  <span className="flex items-center gap-1 xl:text-xs 2xl:text-sm font-semibold text-emerald-500">
                                    <Check className="w-4 h-4" />
                                    <p>Completed</p>
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                                      <div
                                        className="h-full bg-linear-to-r from-primary to-coral"
                                        style={{
                                          width: `${displayCompletion}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="xl:text-xs 2xl:text-sm font-semibold">
                                      {displayCompletion}%
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div
                                className="relative"
                                ref={(node) => {
                                  if (quantityMenuOpen === habit.id) {
                                    quantityButtonRef.current = node;
                                  }
                                }}
                              >
                                <button
                                  type="button"
                                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-primary shadow-sm transition hover:border-primary/70"
                                  aria-haspopup="true"
                                  aria-expanded={quantityMenuOpen === habit.id}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setQuantityMenuOpen((current) =>
                                      current === habit.id ? null : habit.id
                                    );
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                {quantityMenuOpen === habit.id && menuPosition && (
                                  <Portal>
                                    <div
                                      ref={quantityMenuRef}
                                      className="w-48 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg"
                                      onMouseDown={(event) =>
                                        event.stopPropagation()
                                      }
                                      style={{
                                        position: "absolute",
                                        top: menuPosition.top,
                                        left: menuPosition.left,
                                        zIndex: 1100,
                                      }}
                                    >
                                      <p className="text-[11px] mb-1 font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                        Add quantity
                                      </p>
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <input
                                            id={`custom-quantity-${habit.id}`}
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            className="w-full rounded-2xl border border-gray-100 px-3 py-1 text-xs outline-none focus:border-primary"
                                            value={
                                              customQuantities[habit.id] ?? ""
                                            }
                                            onChange={(event) => {
                                              event.stopPropagation();
                                              setCustomQuantities((prev) => ({
                                                ...prev,
                                                [habit.id]: event.target.value,
                                              }));
                                            }}
                                            onClick={(event) =>
                                              event.stopPropagation()
                                            }
                                          />
                                          <button
                                            type="button"
                                            className="rounded-2xl border border-primary/60 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary transition hover:border-primary"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              const value = Number.parseFloat(
                                                customQuantities[habit.id] ?? ""
                                              );
                                              if (
                                                Number.isFinite(value) &&
                                                value > 0
                                              ) {
                                                void handleAddQuantity(
                                                  habit.id,
                                                  value
                                                );
                                              }
                                            }}
                                          >
                                            Add
                                          </button>
                                        </div>
                                        <button
                                          type="button"
                                          className="w-full rounded-full border border-muted/40 bg-muted/10 px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:border-muted hover:bg-white"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            void handleReset(habit.id);
                                          }}
                                        >
                                          Reset progress
                                        </button>
                                      </div>
                                    </div>
                                  </Portal>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="xl:mt-16 2xl:mt-20 max-w-6xl shadow-inner rounded-3xl border border-gray-100 bg-white bg-linear-330 from-green-soft/30 via-slate-100 to-white">
                  <div className="xl:p-5 2xl:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                          Calendar
                        </p>
                        <h2 className="xl:text-base 2xl:text-lg font-semibold">
                          Habit rhythm
                        </h2>
                        <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                          Daily completion percentages help you spot where
                          momentum is building.
                        </p>
                      </div>
                    </div>
                    <HabitsCalendar progressByDay={progressMap} />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm h-fit">
              <GradientCircle
                size={210}
                position={{ bottom: "-50px", right: "-30px" }}
                color="rgba(240,144,41,0.35)"
                fadeColor="rgba(240,144,41,0)"
                className="scale-[1.2]"
              />
              <GradientCircle
                size={210}
                position={{ top: "-50px", left: "-30px" }}
                color="rgba(240,144,41,0.35)"
                fadeColor="rgba(240,144,41,0)"
                className="scale-[1.5]"
              />
              <div className="px-6 pt-5 pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Playbook
                    </p>
                    <h2 className="xl:text-lg 2xl:text-xl font-semibold">
                      Protect the streaks
                    </h2>
                    <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                      Guardrails, rescues, and weekly reviews that protect every
                      streak.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {streakDefensePlaybook.map((item, index) => {
                    const Icon = iconMap[item.icon];
                    return (
                      <div
                        key={`${item.title}-${index}`}
                        className="relative rounded-2xl border border-gray-50 bg-white px-4 py-3 space-y-2 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.12em] ${item.accent}`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="space-y-1">
                            <p className="font-semibold">{item.title}</p>
                            <p className="xl:text-xs 2xl:text-sm text-muted-foreground leading-relaxed">
                              {item.detail}
                            </p>
                            <div className="inline-flex items-center gap-2 text-xs font-semibold rounded-full bg-muted px-3 py-1 text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {item.meta}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HabitsBoard;
