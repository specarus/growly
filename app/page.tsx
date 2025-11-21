"use client";

import { useCallback, useContext, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Flame,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { AuthModal } from "./components/auth/auth-modal";
import Button from "./components/ui/button";
import { ModalContext } from "./context/modal-context";
import { useSession } from "./context/session-context";

const highlights = [
  {
    title: "Habit stacking made easy",
    description:
      "Bundle routines into friendly stacks so you always know what to do next.",
    icon: Layers,
  },
  {
    title: "Time-blocked rituals",
    description:
      "Smart reminders hold space for the moments you choose, not noisy nudges.",
    icon: Clock3,
  },
  {
    title: "Progress that feels real",
    description:
      "Celebrate streaks, weekly momentum, and the small wins that compound.",
    icon: TrendingUp,
  },
];

const steps = [
  {
    title: "Set a tiny anchor",
    copy: "Pick the one habit that makes the rest easier. We keep it lightweight so you start fast.",
  },
  {
    title: "Build frictionless rituals",
    copy: "Stack habits, add gentle reminders, and capture context so your future self is prepared.",
  },
  {
    title: "Track the energy, not just boxes",
    copy: "See streaks, recovery days, and how your effort trends across the week.",
  },
];

const proof = [
  { label: "Avg. streak boost", value: "12 days" },
  { label: "Weekly completion", value: "87%" },
  { label: "Users who stay", value: "9/10" },
];

const noop = () => {};

export default function LandingPage() {
  const context = useContext(ModalContext);
  const { session } = useSession();
  const showModal = context?.showModal ?? false;
  const setShowModal = context?.setShowModal ?? noop;

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        setShowModal(false);
      }
    },
    [setShowModal]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showModal) {
        event.stopPropagation();

        setShowModal(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal, setShowModal]);

  return (
    <main className="relative min-h-screen xl:pt-20 2xl:pt-24 pb-16 bg-linear-to-b from-white via-light-yellow/60 to-green-soft/10 overflow-hidden">
      {showModal && (
        <div
          onClick={handleOverlayClick}
          className="fixed inset-0 grid place-items-center z-50 bg-black/20"
        >
          <AuthModal />
        </div>
      )}

      <div className="absolute -left-24 -top-12 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -right-16 top-48 h-64 w-64 rounded-full bg-green-soft/20 blur-3xl" />
      <div className="absolute left-1/2 bottom-10 h-48 w-48 -translate-x-1/2 rounded-full bg-yellow-soft/25 blur-3xl" />

      <section className="relative z-10 2xl:px-28 xl:px-8 px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm text-muted-foreground shadow-sm ring-1 ring-black/5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Growly - Habit tracker for real life</span>
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl sm:text-5xl 2xl:text-6xl font-semibold text-foreground leading-tight">
                Build habits that survive busy days.
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Growly keeps your rituals small, your reminders kind, and your
                progress transparent. Less dopamine hits, more meaningful
                streaks that stick.
              </p>
            </div>

            {session ? (
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <Link
                  href="/dashboard"
                  className="sm:w-auto px-6 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2"
                >
                  Go to dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <Button
                  onClick={() => setShowModal(true)}
                  className="sm:w-auto px-6 py-3 bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all"
                >
                  Start a streak
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Link
                  href="/dashboard"
                  className="sm:w-auto px-6 py-3 rounded-full border border-muted text-foreground font-semibold hover:border-primary hover:text-primary transition-all bg-white/80 backdrop-blur"
                >
                  Peek at the dashboard
                </Link>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-soft" />
                <span>No spam reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Designed for weekly rhythm</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-coral" />
                <span>Streak recovery built-in</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-primary/15 via-white to-green-soft/20 blur-3xl" />
            <div className="relative rounded-3xl border border-white/60 bg-white/80 backdrop-blur shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">This week</p>
                  <p className="text-2xl font-semibold text-foreground">
                    Momentum map
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-coral/15 text-coral-foreground text-sm font-semibold">
                  +24 XP
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {proof.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-4"
                  >
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-xl font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-analytics-dark text-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="h-4 w-4 text-yellow-soft-foreground" />
                    <p className="text-sm text-white/80">Monday ritual stack</p>
                  </div>
                  <span className="text-sm text-green-soft-foreground">
                    On track
                  </span>
                </div>
                <div className="flex gap-2">
                  {["Read 10 pages", "Hydrate", "Plan tomorrow"].map(
                    (habit) => (
                      <div
                        key={habit}
                        className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm"
                      >
                        {habit}
                      </div>
                    )
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Flame className="h-4 w-4 text-coral" />
                  <span>3-day recovery streak - keep the flame alive</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 2xl:px-28 xl:px-8 px-6 mt-16">
        <div className="flex flex-col gap-10 bg-white/80 backdrop-blur border border-white/70 shadow-lg rounded-3xl p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Why Growly
              </p>
              <h2 className="text-3xl font-semibold text-foreground">
                Friendly structure for people who juggle a lot.
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                You already know what matters. Growly keeps it consistent with
                playful visuals, weekly pacing, and rituals that match your
                reality.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-green-soft/15 text-green-soft-foreground text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Crafted for tiny wins
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {highlights.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="group rounded-2xl border border-muted bg-linear-to-b from-white to-muted/30 shadow-md p-6 space-y-3 hover:-translate-y-1 transition-transform"
              >
                <div className="h-11 w-11 rounded-2xl bg-primary/15 text-primary grid place-items-center mb-2 group-hover:scale-105 transition">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 2xl:px-28 xl:px-8 px-6 mt-16">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              How it works
            </p>
            <h2 className="text-3xl font-semibold text-foreground max-w-xl">
              A calm flow that respects your time.
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              We focus on weekly momentum over streak anxiety. Clear rituals,
              fewer taps, and a dashboard that shows exactly where to nudge.
            </p>

            <div className="grid gap-4 mt-6">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 p-4 rounded-2xl border border-muted bg-white/80 backdrop-blur shadow-sm"
                >
                  <div className="h-10 w-10 rounded-2xl bg-primary/15 text-primary font-semibold grid place-items-center">
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="text-muted-foreground">{step.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-linear-to-br from-analytics-dark to-analytics-dark/95 text-white p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-white/70">Today&apos;s focus</p>
                <p className="text-2xl font-semibold">Deep Work Ritual</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs">
                45 min block
              </span>
            </div>

            <div className="space-y-3">
              {[
                "Set intention",
                "Silence notifications",
                "90-min focus sprint",
                "Reflect & log energy",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-soft-foreground" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-xs text-white/70">Energy</p>
                <p className="text-xl font-semibold">Balanced</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-xs text-white/70">Streak</p>
                <p className="text-xl font-semibold">Day 8</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-xs text-white/70">Recovery</p>
                <p className="text-xl font-semibold">Enabled</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 2xl:px-28 xl:px-8 px-6 mt-16">
        <div className="rounded-3xl bg-white/90 backdrop-blur border border-white/70 shadow-lg p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Ready when you are
            </p>
            <h3 className="text-2xl sm:text-3xl font-semibold text-foreground max-w-xl">
              Let&apos;s make the tiny wins add up.
            </h3>
            <p className="text-muted-foreground max-w-2xl">
              Join a calm space to design your rituals, protect your focus, and
              keep your streaks honest.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setShowModal(true)}
              className="sm:w-auto px-6 py-3 bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all"
            >
              Create my routine
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link
              href="/dashboard/todos"
              className="sm:w-auto px-6 py-3 rounded-full border border-muted text-foreground font-semibold hover:border-primary hover:text-primary transition-all bg-white/80 backdrop-blur"
            >
              See how tasks flow
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
