"use client";

import { useEffect, useMemo, useState } from "react";
import type { AccountBadgeStatus } from "../types";

const ROTATION_DELAY_MS = 6000;

type LevelBadgeCarouselProps = {
  badges: AccountBadgeStatus[];
  level: number;
  progressToNextBadge: number;
  nextBadgeStage: string | null;
  nextBadgeLevel: number | null;
};

export default function LevelBadgeCarousel({
  badges,
  level,
  progressToNextBadge,
  nextBadgeStage,
  nextBadgeLevel,
}: LevelBadgeCarouselProps) {
  const defaultIndex = useMemo(() => {
    if (badges.length === 0) {
      return 0;
    }
    const firstLockedIndex = badges.findIndex((tier) => !tier.achieved);
    if (firstLockedIndex >= 0) {
      return firstLockedIndex;
    }
    return badges.length - 1;
  }, [badges]);

  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [rotationProgress, setRotationProgress] = useState(0);

  useEffect(() => {
    setActiveIndex(defaultIndex);
  }, [defaultIndex]);

  useEffect(() => {
    if (badges.length < 2) {
      return;
    }
    const handle = window.setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % badges.length);
    }, ROTATION_DELAY_MS);
    return () => window.clearInterval(handle);
  }, [badges.length]);

  useEffect(() => {
    if (badges.length === 0) {
      setRotationProgress(0);
      return;
    }

    setRotationProgress(0);
    let frame: number | null = null;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }
      const elapsed = timestamp - startTime;
      const progressRatio = Math.min(1, elapsed / ROTATION_DELAY_MS);
      setRotationProgress(Math.round(progressRatio * 100));

      if (elapsed < ROTATION_DELAY_MS) {
        frame = window.requestAnimationFrame(step);
      }
    };

    frame = window.requestAnimationFrame(step);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [activeIndex, badges.length]);

  const formatter = useMemo(() => new Intl.NumberFormat("en-US"), []);

  if (badges.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-muted/50 p-4 text-xs text-muted-foreground">
        Badge data is not available.
      </div>
    );
  }

  const activeBadge = badges[activeIndex] ?? badges[0];
  const xpHint = activeBadge.achieved
    ? "Already unlocked — keep that momentum."
    : `${formatter.format(activeBadge.xpNeeded)} XP to unlock`;

  return (
    <div className="rounded-3xl border border-gray-100 bg-linear-to-br from-card/70 to-card/80 p-5 shadow-inner backdrop-blur">
      <div className="flex flex-col gap-2">
        <div className="rounded-2xl border border-white/20 bg-white/90 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-[11px] font-semibold tracking-[0.25em] ${activeBadge.className}`}
              >
                {activeBadge.stage}
              </div>
              <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                Lv {activeBadge.level}
              </span>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {activeBadge.achieved
                ? "Unlocked"
                : `${activeBadge.levelsAway} levels away`}
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {activeBadge.label}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{xpHint}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            <span>Progress to next badge</span>
            <span className="font-semibold text-foreground">
              {progressToNextBadge}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/30">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-coral transition-[width]"
              style={{ width: `${progressToNextBadge}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {nextBadgeStage
              ? `Next badge: ${nextBadgeStage}${
                  nextBadgeLevel ? ` (Lv ${nextBadgeLevel})` : ""
                }`
              : "You have unlocked every badge for now."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          {badges.map((badge, index) => (
            <button
              key={`${badge.stage}-${badge.level}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative overflow-hidden h-2.5 rounded-full transition-[width] duration-300 border border-gray-300 bg-gray-200 shadow-[0_0_0_2px_rgba(15,23,42,0.08)] dark:border-gray-600 dark:bg-gray-800 ${
                activeIndex === index ? "w-12" : "w-6"
              }`}
              aria-label={`Show ${badge.stage} badge`}
              aria-pressed={activeIndex === index}
            >
              <span
                className="absolute inset-0 rounded-full bg-gray-200/70 dark:bg-gray-800/70"
                aria-hidden="true"
              />
              {activeIndex === index && (
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  style={{ width: `${rotationProgress}%` }}
                  aria-hidden="true"
                />
              )}
              <span className="sr-only">{badge.stage}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
