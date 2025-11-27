"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Brain,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flame,
  HeartPulse,
  Layers,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import Button from "@/app/components/ui/button";
import PageGradient from "@/app/components/ui/page-gradient";

type Category =
  | "Movement"
  | "Energy"
  | "Focus"
  | "Recovery"
  | "Mindset"
  | "Health";
type Commitment = "Quick" | "Standard" | "Deep";
type TimeWindow = "Anytime" | "Morning" | "Workday" | "Evening";

type HabitIdea = {
  id: string;
  title: string;
  summary: string;
  category: Category;
  cadence: string;
  timeOfDay: TimeWindow;
  commitment: Commitment;
  anchor: string;
  duration: string;
  adoption: number;
  highlight: string;
  benefits: string[];
  steps: string[];
  guardrails: string[];
};

const categoryStyles: Record<Category, { badge: string; dot: string }> = {
  Movement: { badge: "bg-green-soft/30 text-green-soft", dot: "bg-green-soft" },
  Energy: {
    badge: "bg-yellow-soft/30 text-yellow-soft",
    dot: "bg-yellow-soft",
  },
  Focus: { badge: "bg-primary/30 text-primary", dot: "bg-primary" },
  Recovery: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  Mindset: { badge: "bg-coral/30 text-coral", dot: "bg-coral" },
  Health: {
    badge: "bg-foreground/30 text-foreground",
    dot: "bg-foreground",
  },
};

const habits: HabitIdea[] = [
  {
    id: "sunrise-mobility",
    title: "Sunrise mobility",
    summary:
      "10 minute flow to loosen joints, wake the nervous system, and cue the day to start.",
    category: "Movement",
    cadence: "Daily",
    timeOfDay: "Morning",
    commitment: "Quick",
    anchor: "Right after coffee on the mat",
    duration: "10 minutes",
    adoption: 14800,
    highlight: "Median streak 18 days",
    benefits: [
      "Gentle warmup before meetings",
      "Pairs to a fixed anchor so it is automatic",
      "Short enough to never skip",
    ],
    steps: [
      "Lay a mat out before bed with water nearby.",
      "3 rounds: cat-cow, world's greatest stretch, 10 slow squats.",
      "Finish with 5 deep breaths and a sip of water.",
    ],
    guardrails: [
      "Cap it at 10 minutes to avoid perfectionism.",
      "If late, do one round instead of skipping.",
      "Track it next to your first calendar block.",
    ],
  },
  {
    id: "hydration-anchors",
    title: "Hydration anchors",
    summary:
      "Front-load water early and place bottles where you work so you do not forget.",
    category: "Health",
    cadence: "Daily",
    timeOfDay: "Anytime",
    commitment: "Quick",
    anchor: "Night-before prep and desk bottle",
    duration: "5 minutes",
    adoption: 12100,
    highlight: "Daily completion 86 percent",
    benefits: [
      "Easy win that boosts energy",
      "Uses placement instead of willpower",
      "Works while traveling",
    ],
    steps: [
      "Fill two 1L bottles at night and leave one at your desk.",
      "Drink 500ml before noon with electrolytes on busy days.",
      "Refill after lunch; set a reminder on your calendar.",
    ],
    guardrails: [
      "Do not aim for perfection; a single refill still counts.",
      "If noon is low, drink 300ml and schedule the next.",
      "Avoid ice-cold water first thing if it slows you down.",
    ],
  },
  {
    id: "deep-work-ritual",
    title: "Deep work start ritual",
    summary:
      "90 minute focus block with a short setup ritual to get into flow faster.",
    category: "Focus",
    cadence: "Weekdays",
    timeOfDay: "Morning",
    commitment: "Deep",
    anchor: "Start of day after inbox sweep",
    duration: "90 minutes",
    adoption: 9820,
    highlight: "Members log 2.2 sessions per week",
    benefits: [
      "Protects the best energy of the day",
      "Setup ritual lowers friction to start",
      "Predictable slot keeps others aligned",
    ],
    steps: [
      "Clear inbox for 10 minutes then close mail and chat.",
      "Write a 3-line game plan on paper; start timer.",
      "Phone goes in another room; use noise canceling.",
    ],
    guardrails: [
      "If late, run a 45 minute version instead of skipping.",
      "Block your calendar as busy to prevent collisions.",
      "Pause if you get interrupted and restart with a timer.",
    ],
  },
  {
    id: "evening-winddown",
    title: "Evening wind-down",
    summary:
      "20 minute routine to lower arousal, park screens, and set up tomorrow.",
    category: "Recovery",
    cadence: "Daily",
    timeOfDay: "Evening",
    commitment: "Standard",
    anchor: "10:15pm after dishes",
    duration: "20 minutes",
    adoption: 11240,
    highlight: "Reported better sleep by day 10",
    benefits: [
      "Screens off without a fight",
      "Small plan for tomorrow lowers stress",
      "Pairs with consistent bedtime",
    ],
    steps: [
      "Dim lights, put phone in another room, start a calm playlist.",
      "Stretch or foam roll for 8-10 minutes.",
      "Write a three-line plan for tomorrow and lights out.",
    ],
    guardrails: [
      "If you are late, skip stretching and do two lines of planning.",
      "Keep a physical alarm clock so the phone stays away.",
      "Avoid caffeine after noon to make this stick.",
    ],
  },
  {
    id: "strength-microdoses",
    title: "Strength microdoses",
    summary:
      "Short strength movement spread through the day instead of a single block.",
    category: "Movement",
    cadence: "Daily",
    timeOfDay: "Workday",
    commitment: "Quick",
    anchor: "Top of each hour",
    duration: "3 x 8 minutes",
    adoption: 8740,
    highlight: "Popular with remote teams",
    benefits: [
      "Breaks desk stiffness",
      "Adds up without gym time",
      "Creates micro energy spikes",
    ],
    steps: [
      "Pick two moves per hour (push-ups, rows, goblet squat).",
      "Do one set at the top of three hours between meetings.",
      "Log reps in a note; increase slowly next week.",
    ],
    guardrails: [
      "Keep weights light so you can repeat daily.",
      "If you miss an hour, do a single set at the next one.",
      "Stretch wrists and shoulders to avoid strain.",
    ],
  },
  {
    id: "walking-meetings",
    title: "Walking meetings",
    summary:
      "Convert one or two calls into walks to get daylight and movement in.",
    category: "Energy",
    cadence: "2-3x weekly",
    timeOfDay: "Workday",
    commitment: "Standard",
    anchor: "Non-critical 1:1s and project updates",
    duration: "25-40 minutes",
    adoption: 7680,
    highlight: "Teams report higher creativity",
    benefits: [
      "Sunlight plus steps during work hours",
      "Easier focus without screens",
      "Pairs with after-lunch slump",
    ],
    steps: [
      "Pick two calls that do not need a screen.",
      "Charge headphones and pick a safe route.",
      "Join the call from your phone and walk while taking light notes.",
    ],
    guardrails: [
      "Avoid heavy rain or crowded routes that distract you.",
      "Use noise cancellation to protect call quality.",
      "If a call needs screen share, shift the walk to the next one.",
    ],
  },
  {
    id: "screen-curfew",
    title: "Screen curfew",
    summary:
      "No blue light 45 minutes before bed with a simple offline replacement.",
    category: "Mindset",
    cadence: "Daily",
    timeOfDay: "Evening",
    commitment: "Standard",
    anchor: "45 minutes before target bedtime",
    duration: "15-45 minutes",
    adoption: 10320,
    highlight: "Improves sleep onset within a week",
    benefits: [
      "Reduces late-night scrolling",
      "Creates a hard stop for work",
      "Supports deeper sleep",
    ],
    steps: [
      "Set a recurring reminder and enable night mode at the same time.",
      "Plug phone in another room; switch to a paperback or journal.",
      "Keep a dim lamp or warm light instead of overhead lights.",
    ],
    guardrails: [
      "If you must use screens, wear blue light blockers.",
      "Let friends know you are offline to reduce pings.",
      "Pair it with your wind-down plan to stay consistent.",
    ],
  },
  {
    id: "breath-reset",
    title: "Breath reset",
    summary:
      "Short breathing break to downshift between meetings instead of doomscrolling.",
    category: "Mindset",
    cadence: "Workdays",
    timeOfDay: "Anytime",
    commitment: "Quick",
    anchor: "Before joining the next meeting",
    duration: "3-5 minutes",
    adoption: 6920,
    highlight: "Used by members who reduce stress spikes",
    benefits: [
      "Lowers heart rate quickly",
      "Creates a predictable transition",
      "Works at home or in an office",
    ],
    steps: [
      "Sit tall, inhale for 4 seconds, hold for 2, exhale for 6.",
      "Repeat for 8 rounds; close your eyes if you can.",
      "Sip water and stand up once before sitting again.",
    ],
    guardrails: [
      "Skip coffee right before if it makes you jittery.",
      "Use headphones if the room is noisy.",
      "If rushed, do three rounds instead of skipping.",
    ],
  },
  {
    id: "sunday-reset",
    title: "Sunday reset",
    summary:
      "Light planning pass so Monday starts calm and the week has shape.",
    category: "Focus",
    cadence: "Weekly",
    timeOfDay: "Anytime",
    commitment: "Standard",
    anchor: "Sunday afternoon",
    duration: "25 minutes",
    adoption: 7340,
    highlight: "Cuts Monday stress for most members",
    benefits: [
      "Clarifies the three wins for the week",
      "Surfaces blockers early",
      "Aligns your habits to the calendar",
    ],
    steps: [
      "Review last week and note one lesson.",
      "Pick the three outcomes for the coming week.",
      "Place deep work blocks and workouts on the calendar.",
    ],
    guardrails: [
      "If time is tight, do a 10 minute skim instead of skipping.",
      "Keep it light; avoid cleaning every file or app.",
      "Share the plan with a partner or teammate for accountability.",
    ],
  },
];

const commitmentCopy: Record<Commitment, string> = {
  Quick: "10 minutes or less",
  Standard: "15-45 minutes",
  Deep: "60-90 minutes",
};

const timeFilters: { value: TimeWindow | "Any"; label: string }[] = [
  { value: "Any", label: "Anytime" },
  { value: "Morning", label: "Morning" },
  { value: "Workday", label: "Workday" },
  { value: "Evening", label: "Evening" },
];

const formatNumber = (value: number) => {
  if (value >= 1000) {
    const formatted = (value / 1000).toFixed(1);
    return `${formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted}k`;
  }
  return value.toString();
};

const PopularHabitsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [commitment, setCommitment] = useState<Commitment | "Any">("Any");
  const [timeOfDay, setTimeOfDay] = useState<TimeWindow | "Any">("Any");
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    habits[0]?.id ?? ""
  );

  const filteredHabits = useMemo(() => {
    const term = search.trim().toLowerCase();
    return habits.filter((habit) => {
      const matchesCategory = category === "All" || habit.category === category;
      const matchesCommitment =
        commitment === "Any" || habit.commitment === commitment;
      const matchesTime = timeOfDay === "Any" || habit.timeOfDay === timeOfDay;
      const matchesSearch =
        term.length === 0 ||
        habit.title.toLowerCase().includes(term) ||
        habit.summary.toLowerCase().includes(term) ||
        habit.anchor.toLowerCase().includes(term) ||
        habit.benefits.some((benefit) => benefit.toLowerCase().includes(term));

      return (
        matchesCategory && matchesCommitment && matchesTime && matchesSearch
      );
    });
  }, [category, commitment, search, timeOfDay]);

  useEffect(() => {
    if (filteredHabits.length === 0) return;
    if (filteredHabits.some((habit) => habit.id === selectedHabitId)) return;
    setSelectedHabitId(filteredHabits[0].id);
  }, [filteredHabits, selectedHabitId]);

  const selectedHabit =
    filteredHabits.find((habit) => habit.id === selectedHabitId) ||
    filteredHabits[0] ||
    habits[0];

  const shortlist = habits.slice(0, 3).map((habit) => ({
    title: habit.title,
    anchor: habit.anchor,
    cadence: habit.cadence,
  }));

  return (
    <main className="relative overflow-hidden w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground xl:pb-12 2xl:pb-16 bg-linear-to-b from-slate-100 via-green-soft/20 to-primary/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <PageGradient />
      <div className="xl:px-8 2xl:px-28 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <BadgeCheck className="w-4 h-4" />
              <span>Popular habits</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                Browse habits people stick with
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Pick a battle-tested habit, see the anchor and safety net, then
                fork it into your own plan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-2 rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden text-sm">
            <Link
              href="/dashboard/habits"
              className="px-4 py-2 font-semibold text-muted-foreground hover:text-primary transition rounded-full"
            >
              Habits
            </Link>
            <Link
              href="/dashboard/habits/routines"
              className="px-4 py-2 font-semibold text-muted-foreground hover:text-primary transition rounded-full"
            >
              Routines
            </Link>
            <span
              className="px-4 py-2 font-semibold bg-primary text-white rounded-full"
              aria-current="page"
            >
              Popular
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Hover a card to preview. Click to open the playbook on the right.
          </span>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-sm px-4 py-3 xl:py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative max-w-xs flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, benefit, or anchor"
                  className="w-full rounded-full border border-gray-100 bg-white px-4 py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    "All",
                    "Movement",
                    "Energy",
                    "Focus",
                    "Recovery",
                    "Mindset",
                    "Health",
                  ] as (Category | "All")[]
                ).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                      category === item
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-muted-foreground border-gray-200 hover:border-primary/40"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(
                  ["Any", "Quick", "Standard", "Deep"] as (Commitment | "Any")[]
                ).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCommitment(item)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                      commitment === item ||
                      (commitment === "Any" && item === "Any")
                        ? "bg-analytics-dark/90 text-white border-analytics-dark"
                        : "bg-white text-muted-foreground border-gray-200 hover:border-primary/40"
                    }`}
                  >
                    {item === "Any" ? "Any effort" : `${item} time`}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {timeFilters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setTimeOfDay(item.value === "Any" ? "Any" : item.value)
                    }
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                      timeOfDay === item.value ||
                      (timeOfDay === "Any" && item.value === "Any")
                        ? "bg-muted text-foreground border-gray-200"
                        : "bg-white text-muted-foreground border-gray-200 hover:border-primary/40"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setCategory("All");
                  setCommitment("Any");
                  setTimeOfDay("Any");
                  setSearch("");
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary transition"
              >
                <Layers className="w-3.5 h-3.5" />
                Reset filters
              </button>
            </div>
          </div>

          <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-5">
            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="px-5 pt-5 pb-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Browse
                    </p>
                    <h2 className="text-xl font-semibold">Popular patterns</h2>
                    <p className="text-sm text-muted-foreground">
                      Hover for anchors and safety nets. Click to see the
                      playbook details.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    {habits.length} habits
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {filteredHabits.length === 0 ? (
                    <div className="sm:col-span-2 rounded-2xl border border-dashed border-gray-200 bg-muted/50 px-4 py-5 text-sm text-muted-foreground">
                      No matches yet. Clear filters or try another search term.
                    </div>
                  ) : (
                    filteredHabits.map((habit) => {
                      const styles = categoryStyles[habit.category];
                      const isSelected = habit.id === selectedHabitId;
                      return (
                        <button
                          key={habit.id}
                          type="button"
                          onClick={() => setSelectedHabitId(habit.id)}
                          className={`relative w-full text-left rounded-2xl border px-4 py-4 transition shadow-sm hover:border-primary/40 ${
                            isSelected
                              ? "border-primary/60 ring-2 ring-primary/20 bg-primary/5"
                              : "border-gray-100 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${styles.badge}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${styles.dot}`}
                              />
                              {habit.category}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {habit.highlight}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="font-semibold">{habit.title}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {habit.summary}
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              <Clock3 className="w-3.5 h-3.5 text-primary" />
                              {habit.duration}
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              <CalendarClock className="w-3.5 h-3.5 text-primary" />
                              {habit.cadence}
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              <HeartPulse className="w-3.5 h-3.5 text-primary" />
                              {commitmentCopy[habit.commitment]}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-primary" />
                              <span>
                                {formatNumber(habit.adoption)} people use this
                              </span>
                            </div>
                            <span className="font-semibold text-foreground">
                              {habit.anchor}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-gray-100 bg-white shadow-sm h-fit">
              <div className="px-5 pt-5 pb-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Playbook
                    </p>
                    <h2 className="text-xl font-semibold">
                      Blueprint and safety net
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Lift the structure, then tweak anchors before adding to
                      your board.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    Draft
                  </div>
                </div>

                {selectedHabit ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                        <Target className="w-4 h-4 text-primary" />
                        {selectedHabit.timeOfDay} - {selectedHabit.anchor}
                      </div>
                      <h3 className="text-lg font-semibold">
                        {selectedHabit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedHabit.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-gray-100 bg-muted px-3 py-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <Clock3 className="w-4 h-4 text-primary" />
                          Duration
                        </div>
                        <p className="font-semibold">
                          {selectedHabit.duration}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {commitmentCopy[selectedHabit.commitment]}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-muted px-3 py-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <CalendarClock className="w-4 h-4 text-primary" />
                          Cadence
                        </div>
                        <p className="font-semibold">{selectedHabit.cadence}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedHabit.highlight}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">
                          Why it works
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedHabit.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-primary/5 px-4 py-4 space-y-2">
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            First three reps
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Live soon
                          </span>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {selectedHabit.steps.map((step) => (
                            <li key={step} className="flex items-start gap-2">
                              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button className="xl:h-10 2xl:h-12 xl:px-5 2xl:px-7 xl:text-sm 2xl:text-base bg-primary text-white shadow-sm hover:brightness-105 transition">
                        <Link href="/dashboard/habits/create">
                          Use this habit
                        </Link>
                      </Button>
                      <Link
                        href="/dashboard/habits/routines"
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition"
                      >
                        <CalendarClock className="w-4 h-4" />
                        Add to a routine
                      </Link>
                      <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                        <Sparkles className="w-4 h-4" />
                        Swap with your own copy after saving
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
                    Select a habit on the left to see its blueprint.
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PopularHabitsPage;
