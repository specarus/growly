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

type RoutineIdea = {
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

const routines: RoutineIdea[] = [
  {
    id: "sunrise-clarity-loop",
    title: "Sunrise clarity loop",
    summary:
      "Six minutes of journaling and breathing that sets the day tone before opening the inbox.",
    category: "Mindset",
    cadence: "Daily",
    timeOfDay: "Morning",
    commitment: "Quick",
    anchor: "First sip of coffee while light pours in",
    duration: "6 minutes",
    adoption: 15800,
    highlight: "Wins before notifications arrive",
    benefits: [
      "Drops mental clutter with a three-line brain dump",
      "Pairs breath work with fresh light to cue priority",
      "Short enough to lead the day without dragging",
    ],
    steps: [
      "Open your journal and jot three wins and three high-impact bets.",
      "Close your eyes, inhale for four seconds, hold two, exhale six, repeat five times.",
      "Drop a single theme for the day and close your journal before launching into work.",
    ],
    guardrails: [
      "Keep it six minutes so it never competes with urgent pings.",
      "If traveling, dictate the notes into a voice memo instead of paper.",
      "Avoid checking email before the loop is finished.",
    ],
  },
  {
    id: "focused-launch-routine",
    title: "Focused launch routine",
    summary:
      "90 minute block that closes distractions, sets a clear mission, then shields deep work.",
    category: "Focus",
    cadence: "Weekdays",
    timeOfDay: "Morning",
    commitment: "Deep",
    anchor: "After stand-up with focus playlist queued",
    duration: "90 minutes",
    adoption: 13200,
    highlight: "Blocks with highest completion at 9 AM",
    benefits: [
      "Protects prime energy before meetings multiply",
      "Short ritual lowers friction to close inbox and start work",
      "Predictable slot keeps teammates from scheduling in",
    ],
    steps: [
      "Silence notifications, close chat tabs, and set a three-metric scoreboard.",
      "Write a two-sentence game plan and start a 90 minute timer.",
      "Work in 25 minute sprints, pause for micro breath resets, then review progress.",
    ],
    guardrails: [
      "If context shifts, run a 45 minute sprint instead of skipping.",
      "Mark your calendar as busy so others respect the block.",
      "Pause and reset the timer if you get interrupted mid-session.",
    ],
  },
  {
    id: "midday-oasis-pause",
    title: "Midday oasis pause",
    summary:
      "Fifteen minute reset that pairs light movement, calm breathing, and fresh air.",
    category: "Recovery",
    cadence: "Daily",
    timeOfDay: "Workday",
    commitment: "Standard",
    anchor: "After lunch before the next meeting",
    duration: "15 minutes",
    adoption: 11120,
    highlight: "Restores energy without derailing the day",
    benefits: [
      "Shifts cortisol after lunch and before the afternoon slump",
      "Mixes movement, breath, and hydration for a fuller break",
      "Fits between two quick meetings",
    ],
    steps: [
      "Walk outside or down the stairs with intentional breath to flush the blood.",
      "Do three rounds of shoulder circles, hip openers, and gentle twists.",
      "Sip water or herbal tea while setting an intention for the afternoon.",
    ],
    guardrails: [
      "Cap it at 15 minutes so meetings don't creep back in.",
      "If weather blocks stepping out, open a window and do the breaths indoors.",
      "Avoid screens during the pause to let the nervous system settle.",
    ],
  },
  {
    id: "micro-movement-circuit",
    title: "Micro-movement circuit",
    summary:
      "Sprinkle three short strength or mobility bursts throughout the workday.",
    category: "Movement",
    cadence: "Daily",
    timeOfDay: "Workday",
    commitment: "Quick",
    anchor: "Top of the next three hours",
    duration: "3 x 8 minutes",
    adoption: 10100,
    highlight: "Builds momentum without a gym stop",
    benefits: [
      "Breaks stiffness from long screens",
      "Small bursts add up to 25 minutes of motion",
      "Easy to scale as energy ebbs and flows",
    ],
    steps: [
      "Pick two moves each hour (push-ups, rows, squat pulses).",
      "Execute one set at the top of three different hours.",
      "Log reps and add weight or reps every week.",
    ],
    guardrails: [
      "Keep resistance light so you stay consistent daily.",
      "If you miss an hour, squeeze a set into the next break.",
      "Remember mobility work before pushing through the strength sets.",
    ],
  },
  {
    id: "evening-detox-ritual",
    title: "Evening detox ritual",
    summary:
      "A screens-off routine that dims lights, records wins, and primes tomorrow.",
    category: "Recovery",
    cadence: "Daily",
    timeOfDay: "Evening",
    commitment: "Standard",
    anchor: "45 minutes before bedtime after dishes",
    duration: "20 minutes",
    adoption: 10900,
    highlight: "Members report shorter sleep latency",
    benefits: [
      "Blocks late-night work creep",
      "Makes the next day feel rehearsed",
      "Low effort ritual that signals wind-down",
    ],
    steps: [
      "Dim the lights, stash the phone, play soft music.",
      "Write two achievements and one lesson from today.",
      "Set a three-task todo for tomorrow and close the notebook.",
    ],
    guardrails: [
      "If a meeting runs late, just complete the wins write-up.",
      "Keep a physical timer so the phone stays tucked away.",
      "Avoid caffeine after 2pm to let this sink in.",
    ],
  },
  {
    id: "team-step-sync",
    title: "Team step sync",
    summary:
      "Weekly 30-minute walking huddle combines planning with daylight and movement.",
    category: "Energy",
    cadence: "Weekly",
    timeOfDay: "Workday",
    commitment: "Standard",
    anchor: "Friday planning huddle on foot",
    duration: "30 minutes",
    adoption: 8200,
    highlight: "Teams call it a creativity booster",
    benefits: [
      "Adds steps without losing face time",
      "Natural change of scenery refreshes conversations",
      "Pairs accountability with movement",
    ],
    steps: [
      "Pick an agenda of two to three topics and share it before leaving.",
      "Walk a loop near the office while keeping a notepad handy.",
      "Wrap with two takeaways and assign next steps while still outside.",
    ],
    guardrails: [
      "Avoid noisy routes; keep the voice quality clear for remote folks.",
      "If someone cannot walk, keep them looped in digitally and recap later.",
      "Respect weather - slide it indoors on storms and keep masks handy.",
    ],
  },
  {
    id: "weekend-reset-rhythm",
    title: "Weekend reset rhythm",
    summary:
      "A Saturday planning pass that maps wins, workouts, and rest before Monday.",
    category: "Focus",
    cadence: "Weekly",
    timeOfDay: "Anytime",
    commitment: "Standard",
    anchor: "Saturday morning coffee",
    duration: "25 minutes",
    adoption: 8700,
    highlight: "Members start Monday quieter and clearer",
    benefits: [
      "Clarifies three wins and prevents Monday scramble",
      "Centers workouts around energy spikes instead of obligation",
      "Surfaces blockers before they bottleneck the week",
    ],
    steps: [
      "Review the prior week and capture one lesson learned.",
      "Plan three priority outcomes and map deep work blocks.",
      "Pick two recovery anchors and parade them on the calendar.",
    ],
    guardrails: [
      "If time is tight, keep it to 10 minutes and revisit Sunday night.",
      "Skip cleaning every file; keep focus on the outcomes list.",
      "Share it with a partner to make it stick.",
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

const PopularRoutinesPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [commitment, setCommitment] = useState<Commitment | "Any">("Any");
  const [timeOfDay, setTimeOfDay] = useState<TimeWindow | "Any">("Any");
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(
    routines[0]?.id ?? ""
  );

  const filteredRoutines = useMemo(() => {
    const term = search.trim().toLowerCase();
    return routines.filter((routine) => {
      const matchesCategory =
        category === "All" || routine.category === category;
      const matchesCommitment =
        commitment === "Any" || routine.commitment === commitment;
      const matchesTime =
        timeOfDay === "Any" || routine.timeOfDay === timeOfDay;
      const matchesSearch =
        term.length === 0 ||
        routine.title.toLowerCase().includes(term) ||
        routine.summary.toLowerCase().includes(term) ||
        routine.anchor.toLowerCase().includes(term) ||
        routine.benefits.some((benefit) =>
          benefit.toLowerCase().includes(term)
        );

      return (
        matchesCategory && matchesCommitment && matchesTime && matchesSearch
      );
    });
  }, [category, commitment, search, timeOfDay]);

  useEffect(() => {
    if (filteredRoutines.length === 0) return;
    if (filteredRoutines.some((routine) => routine.id === selectedRoutineId))
      return;
    setSelectedRoutineId(filteredRoutines[0].id);
  }, [filteredRoutines, selectedRoutineId]);

  const selectedRoutine =
    filteredRoutines.find((routine) => routine.id === selectedRoutineId) ||
    filteredRoutines[0] ||
    routines[0];

  return (
    <main className="relative overflow-hidden w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground xl:pb-12 2xl:pb-16 bg-linear-to-b from-green-soft/20 via-card/70 to-primary/20">
      <PageGradient />
      <div className="xl:px-8 2xl:px-28 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <BadgeCheck className="w-4 h-4" />
              <span>Popular routines</span>
            </div>
            <div className="space-y-1">
              <h1 className="xl:text-xl 2xl:text-2xl md:text-3xl font-bold">
                Browse routines people stick with
              </h1>
              <p className="xl:text-xs 2xl:text-sm text-muted-foreground max-w-2xl">
                Pick a battle-tested routine, see the anchor and safety net,
                then fork it into your own plan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center xl:gap-1 2xl:gap-2 p-2 rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden xl:text-xs 2xl:text-sm">
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
          <span className="xl:text-xs text-muted-foreground">
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
                    {routines.length} routines
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {filteredRoutines.length === 0 ? (
                    <div className="sm:col-span-2 rounded-2xl border border-dashed border-gray-200 bg-muted/50 px-4 py-5 text-sm text-muted-foreground">
                      No matches yet. Clear filters or try another search term.
                    </div>
                  ) : (
                    filteredRoutines.map((routine) => {
                      const styles = categoryStyles[routine.category];
                      const isSelected = routine.id === selectedRoutineId;
                      return (
                        <button
                          key={routine.id}
                          type="button"
                          onClick={() => setSelectedRoutineId(routine.id)}
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
                              {routine.category}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {routine.highlight}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="font-semibold">{routine.title}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {routine.summary}
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              <Clock3 className="w-3.5 h-3.5 text-primary" />
                              {routine.duration}
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              <CalendarClock className="w-3.5 h-3.5 text-primary" />
                              {routine.cadence}
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              <HeartPulse className="w-3.5 h-3.5 text-primary" />
                              {commitmentCopy[routine.commitment]}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-primary" />
                              <span>
                                {formatNumber(routine.adoption)} teams use this
                              </span>
                            </div>
                            <span className="font-semibold text-foreground">
                              {routine.anchor}
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

                {selectedRoutine ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                        <Target className="w-4 h-4 text-primary" />
                        {selectedRoutine.timeOfDay} - {selectedRoutine.anchor}
                      </div>
                      <h3 className="text-lg font-semibold">
                        {selectedRoutine.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedRoutine.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-gray-100 bg-muted px-3 py-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <Clock3 className="w-4 h-4 text-primary" />
                          Duration
                        </div>
                        <p className="font-semibold">
                          {selectedRoutine.duration}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {commitmentCopy[selectedRoutine.commitment]}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-muted px-3 py-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <CalendarClock className="w-4 h-4 text-primary" />
                          Cadence
                        </div>
                        <p className="font-semibold">
                          {selectedRoutine.cadence}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedRoutine.highlight}
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
                        {selectedRoutine.benefits.map((benefit) => (
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
                          {selectedRoutine.steps.map((step) => (
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
                        <Link href="/dashboard/habits/routines/create">
                          Use this routine
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
                    Select a routine on the left to see its blueprint.
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

export default PopularRoutinesPage;
