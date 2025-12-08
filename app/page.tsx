"use client";

import { useCallback, useContext, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Flame,
  Hammer,
  Layers,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { AuthModal } from "./components/auth/auth-modal";
import Button from "./components/ui/button";
import { ModalContext } from "./context/modal-context";
import { useSession } from "./context/session-context";
import useLockBodyScroll from "./hooks/use-lock-body-scroll";

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
  useLockBodyScroll(showModal);

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
    <main className="relative min-h-screen lg:pt-16 xl:pt-24 2xl:pt-28 lg:pb-8 xl:pb-12 2xl:pb-16 bg-linear-to-b from-white/90 via-light-yellow/55 to-green-soft/15 overflow-hidden">
      {showModal && (
        <div
          onClick={handleOverlayClick}
          className="fixed inset-0 grid place-items-center z-50 bg-black/20 backdrop-blur-sm"
        >
          <AuthModal />
        </div>
      )}

      <div className="absolute -left-24 -top-12 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -right-16 top-48 h-64 w-64 rounded-full bg-green-soft/20 blur-3xl" />
      <div className="absolute left-1/2 bottom-10 h-48 w-48 -translate-x-1/2 rounded-full bg-yellow-soft/25 blur-3xl" />

      <section className="relative z-10 lg:px-4 2xl:px-28 xl:px-8">
        <div className="grid lg:grid-cols-2 lg:gap-8 xl:gap-12 items-center">
          <div className="lg:space-y-6 xl:space-y-8">
            <div className="inline-flex items-center lg:gap-1.5 xl:gap-2 rounded-full bg-white/90 lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground shadow-sm ring-1 ring-black/5">
              <span>Growly - Habit tracker for real life</span>
            </div>

            <div className="lg:space-y-3 xl:space-y-5">
              <h1 className="lg:text-4xl xl:text-5xl 2xl:text-6xl font-semibold text-foreground leading-tight">
                Build habits that survive busy days.
              </h1>
              <p className="lg:text-sm xl:text-base 2xl:text-lg text-muted-foreground max-w-2xl">
                Growly keeps your rituals small, your reminders kind, and your
                progress transparent. Less dopamine hits, more meaningful
                streaks that stick.
              </p>
            </div>

            {session ? (
              <div className="flex flex-row lg:gap-3 xl:gap-4 items-center">
                <Link
                  href="/dashboard"
                  className="lg:text-xs xl:text-sm 2xl:text-base w-auto lg:px-4 xl:px-5 2xl:px-6 lg:py-1 xl:py-2 2xl:py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2"
                >
                  Go to dashboard
                  <ArrowRight className="lg:h-3 lg:w-3 xl:h-4 xl:w-4" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-row lg:gap-3 xl:gap-4 items-center w-fit">
                <Button
                  onClick={() => setShowModal(true)}
                  className="lg:text-xs xl:text-sm 2xl:text-base lg:px-4 xl:px-5 2xl:px-6 lg:py-1 xl:py-2 2xl:py-3 bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all"
                >
                  Start a streak
                  <ArrowRight className="lg:h-3 lg:w-3 xl:h-4 xl:w-4" />
                </Button>
              </div>
            )}

            <div className="flex flex-wrap items-center lg:gap-3 xl:gap-4 lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="lg:h-3 lg:w-3 xl:h-4 xl:w-4 text-green-soft" />
                <span>No spam reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="lg:h-3 lg:w-3 xl:h-4 xl:w-4 text-primary" />
                <span>Designed for weekly rhythm</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="lg:h-3 lg:w-3 xl:h-4 xl:w-4 text-coral" />
                <span>Streak recovery built-in</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 lg:rounded-2xl xl:rounded-3xl bg-linear-to-br from-primary/15 via-white to-green-soft/20 blur-3xl" />
            <div className="relative rounded-3xl border border-white/60 bg-white/80 backdrop-blur shadow-inner shadow-black/10 lg:p-4 xl:p-6 lg:space-y-3 xl:space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                    This week
                  </p>
                  <p className="lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-foreground">
                    Momentum map
                  </p>
                </div>
                <span className="lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 rounded-full bg-coral/70 text-coral-foreground lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold">
                  +24 XP
                </span>
              </div>

              <div className="grid grid-cols-3 lg:gap-2 xl:gap-3">
                {proof.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-white/90 ring-1 ring-black/5 lg:p-3 xl:p-4"
                  >
                    <p className="lg:text-[11px] xl:text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="lg:text-lg xl:text-xl font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-analytics-dark text-white lg:p-4 xl:p-5 lg:space-y-2 xl:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center lg:gap-1.5 xl:gap-2">
                    <CalendarRange className="lg:h-3 lg:w-3 xl:h-4 xl:w-4 text-yellow-soft" />
                    <p className="lg:text-xs xl:text-sm text-white/80">
                      Monday ritual stack
                    </p>
                  </div>
                  <span className="lg:text-[11px] xl:text-xs 2xl:text-sm text-green-soft-foreground">
                    On track
                  </span>
                </div>
                <div className="flex lg:gap-1.5 xl:gap-2">
                  {["Read 10 pages", "Hydrate", "Plan tomorrow"].map(
                    (habit) => (
                      <div
                        key={habit}
                        className="flex-1 rounded-xl bg-white/10 lg:px-2 xl:px-3 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs 2xl:text-sm"
                      >
                        {habit}
                      </div>
                    )
                  )}
                </div>
                <div className="flex items-center lg:gap-1.5 xl:gap-2 lg:text-[11px] xl:text-xs 2xl:text-sm text-white/70">
                  <Flame className="lg:h-3 lg:w-3 xl:h-4 xl:w-4 text-coral" />
                  <span>3-day recovery streak - keep the flame alive</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 lg:px-4 2xl:px-28 xl:px-8 lg:mt-10 xl:mt-14 2xl:mt-16">
        <div className="flex flex-col lg:gap-8 xl:gap-10 bg-white/80 backdrop-blur border border-white/70 shadow-inner shadow-black/10 lg:rounded-2xl xl:rounded-3xl lg:p-12 xl:p-10 2xl:p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between lg:gap-3 xl:gap-4">
            <div className="lg:space-y-2 xl:space-y-3">
              <p className="lg:text-xs xl:text-sm 2xl:text-base uppercase tracking-[0.2em] text-muted-foreground">
                Why Growly
              </p>
              <h2 className="lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold text-foreground">
                Friendly structure for people who juggle a lot.
              </h2>
              <p className="text-muted-foreground lg:max-w-xl 2xl:max-w-2xl lg:text-xs xl:text-sm 2xl:text-base">
                You already know what matters. <br></br>Growly keeps it
                consistent with playful visuals, weekly pacing, and rituals that
                match your reality.
              </p>
            </div>
            <div className="inline-flex items-center lg:gap-1.5 xl:gap-2 lg:px-2 xl:px-3 lg:py-1 xl:py-2 rounded-full bg-green-soft text-card lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold">
              <Hammer className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 2xl:h-5 2xl:w-5" />
              Crafted for tiny wins
            </div>
          </div>

          <div className="grid lg:grid-cols-3 lg:gap-4 xl:gap-6">
            {highlights.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="group rounded-2xl border border-muted bg-linear-to-b from-white to-muted/30 shadow-md lg:p-4 xl:p-5 2xl:p-6 lg:space-y-2 xl:space-y-3 hover:-translate-y-1 transition-transform"
              >
                <div className="lg:h-10 lg:w-10 xl:h-11 xl:w-11 rounded-2xl bg-primary/15 text-primary grid place-items-center lg:mb-1 xl:mb-2 group-hover:scale-105 transition">
                  <Icon className="lg:h-4 lg:w-4 xl:h-5 xl:w-5" />
                </div>
                <h3 className="lg:text-base xl:text-lg 2xl:text-xl font-semibold text-foreground">
                  {title}
                </h3>
                <p className="lg:text-xs xl:text-sm 2xl:text-base text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 lg:px-4 2xl:px-28 xl:px-8 lg:mt-10 xl:mt-14 2xl:mt-16">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 xl:gap-10 items-center">
          <div className="lg:space-y-3 xl:space-y-4">
            <p className="lg:text-xs xl:text-sm 2xl:text-base uppercase tracking-[0.2em] text-muted-foreground">
              How it works
            </p>
            <h2 className="lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold text-foreground max-w-xl">
              A calm flow that respects your time.
            </h2>
            <p className="text-muted-foreground lg:max-w-xl 2xl:max-w-2xl lg:text-xs xl:text-sm 2xl:text-base">
              We focus on weekly momentum over streak anxiety.<br></br>Clear
              rituals, fewer taps, and a dashboard that shows exactly where to
              nudge.
            </p>

            <div className="grid lg:gap-2 xl:gap-4 lg:mt-4 xl:mt-6">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex lg:gap-2 xl:gap-4 lg:p-2 xl:p-4 rounded-2xl border border-muted bg-white/80 backdrop-blur shadow-sm"
                >
                  <div className="lg:h-8 xl:h-9 2xl:h-10 lg:w-8 xl:w-9 2xl:w-10 rounded-2xl bg-primary/15 text-primary font-semibold grid place-items-center">
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="lg:text-sm xl:text-base 2xl:text-lg font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                      {step.copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:rounded-2xl xl:rounded-3xl border border-white/70 bg-linear-to-br from-analytics-dark to-analytics-dark/95 text-white lg:p-4 xl:p-6 2xl:p-8 shadow-xl lg:space-y-4 xl:space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-white/70">
                  Today&apos;s focus
                </p>
                <p className="lg:text-lg xl:text-xl 2xl:text-2xl font-semibold">
                  Deep Work Ritual
                </p>
              </div>
              <span className="lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 rounded-full bg-white/10 lg:text-[11px] xl:text-xs 2xl:text-sm">
                45 min block
              </span>
            </div>

            <div className="lg:space-y-2 xl:space-y-3">
              {[
                "Set intention",
                "Silence notifications",
                "90-min focus sprint",
                "Reflect & log energy",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center lg:gap-2 xl:gap-3 lg:p-2 xl:p-3 rounded-xl bg-white/5"
                >
                  <CheckCircle2 className="xl:h-5 xl:w-5 lg:w-4 lg:h-4 text-card" />
                  <span className="lg:text-xs xl:text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 lg:gap-2 xl:gap-3">
              <div className="rounded-xl bg-white/10 lg:p-2 xl:p-3">
                <p className="text-xs text-white/70">Energy</p>
                <p className="lg:text-base xl:text-lg 2xl:text-xl font-semibold">
                  Balanced
                </p>
              </div>
              <div className="rounded-xl bg-white/10 lg:p-2 xl:p-3">
                <p className="lg:text-[11px] xl:text-xs text-white/70">
                  Streak
                </p>
                <p className="lg:text-base xl:text-lg 2xl:text-xl font-semibold">
                  Day 8
                </p>
              </div>
              <div className="rounded-xl bg-white/10 lg:p-2 xl:p-3">
                <p className="lg:text-[11px] xl:text-xs text-white/70">
                  Recovery
                </p>
                <p className="lg:text-base xl:text-lg 2xl:text-xl font-semibold">
                  Enabled
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 lg:px-4 2xl:px-28 xl:px-8 lg:mt-10 xl:mt-14 2xl:mt-16">
        <div className="rounded-3xl bg-white/90 backdrop-blur border border-white/70 shadow-inner shadow-black/10 lg:p-4 xl:p-6 2xl:p-8 flex items-center justify-between lg:gap-4 xl:gap-6">
          <div className="lg:space-y-2 xl:space-y-3">
            <p className="lg:text-xs xl:text-sm 2xl:text-base uppercase tracking-[0.2em] text-muted-foreground">
              Ready when you are
            </p>
            <h3 className="lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold text-foreground max-w-xl">
              Let&apos;s make the tiny wins add up.
            </h3>
            <p className="text-muted-foreground lg:max-w-xl 2xl:max-w-2xl lg:text-[11px] xl:text-xs 2xl:text-sm">
              Join a calm space to design your rituals, protect your focus, and
              keep your streaks honest.
            </p>
          </div>
          <div className="flex flex-row lg:gap-2 xl:gap-3 w-auto">
            <Button
              onClick={() => setShowModal(true)}
              className="lg:text-xs xl:text-sm 2xl:text-base sm:w-auto lg:px-4 xl:px-5 2xl:px-6 lg:py-1 xl:py-2 2xl:py-3 bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all"
            >
              Create my routine
              <ArrowRight className="lg:w-3 lg:h-3 xl:h-4 xl:w-4" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
