"use client";

import { useEffect, useRef, useState } from "react";
import CircularProgress from "./circular-progress";
import { useXP } from "@/app/context/xp-context";
import { MAX_STREAK_BONUS } from "@/lib/xp";

const ScoreWidget: React.FC = () => {
  const {
    totalXP,
    level,
    progress,
    xpGainedInLevel,
    xpNeededForLevelUp,
    todayXP,
    streakBonus,
    loading,
  } = useXP();
  const [pulse, setPulse] = useState(false);
  const prevTotalXPRef = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      prevTotalXPRef.current = null;
      return;
    }

    if (prevTotalXPRef.current === null) {
      prevTotalXPRef.current = totalXP;
      return;
    }

    if (prevTotalXPRef.current !== totalXP) {
      setPulse(true);
      const handler = window.setTimeout(() => setPulse(false), 900);
      prevTotalXPRef.current = totalXP;
      return () => window.clearTimeout(handler);
    }

    prevTotalXPRef.current = totalXP;
  }, [loading, totalXP]);
  if (loading) {
    return (
      <div className="text-foreground xl:p-3 2xl:p-4 rounded-2xl border border-muted/50 bg-white/70 shadow-inner">
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="flex items-center justify-between gap-3">
            <div className="h-12 w-12 rounded bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-5 rounded bg-muted" />
              <div className="h-3 w-3/4 rounded bg-muted" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-16 w-16 rounded-full border border-muted" />
            <div className="h-16 w-16 rounded-full border border-muted" />
          </div>
          <div className="h-4 rounded bg-muted" />
        </div>
      </div>
    );
  }
  const safeProgress = Math.min(100, Math.max(0, progress));
  const nextLevel = level + 1;

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const maxDailyXP = 1000;
  const maxStreakBonus = MAX_STREAK_BONUS;

  const todayXPProgress = Math.min(
    100,
    Math.floor((todayXP / maxDailyXP) * 100)
  );
  const streakBonusProgress = Math.min(
    100,
    Math.floor((streakBonus / maxStreakBonus) * 100)
  );

  const progressFillClassName = [
    "bg-green-soft",
    "h-2.5",
    "rounded-full",
    "transition-all duration-500 ease-out",
    "transform",
    "origin-left",
    pulse ? "score-widget-pulse" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="text-foreground xl:p-3 2xl:p-4 rounded-2xl shadow-none border-none">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold  uppercase tracking-wider">
          Habit Score
        </h3>
      </div>
      <div className="flex flex-col xl:gap-3 2xl:gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center xl:px-3 xl:py-2 2xl:px-4 2xl:py-3 rounded-lg bg-secondary/50 text-primary dark:text-white select-none">
            <span className="xl:text-lg 2xl:text-xl font-extrabold leading-none">
              {level}
            </span>
            <span className="xl:text-[10px] 2xl:text-xs font-medium">
              LEVEL
            </span>
          </div>
          <div className="text-right">
            <p className="xl:text-2xl 2xl:text-3xl font-bold leading-tight">
              {formatNumber(totalXP)}
            </p>
            <p className="xl:text-xs 2xl:text-sm font-medium">Total XP</p>
          </div>
        </div>

        <div className="w-full flex xl:px-8 2xl:px-10 justify-between rounded-lg">
          <div className="flex flex-col items-center gap-1 select-none">
            <CircularProgress
              progress={todayXPProgress}
              progressColor="rgb(34 197 94)"
              textColor="rgb(34 197 94)"
            >
              <span className="text-xs font-bold">
                +{formatNumber(todayXP)}
              </span>
            </CircularProgress>

            <span className="xl:text-[10px] 2xl:text-xs font-medium text-gray-500 mt-1">
              Today&apos;s XP
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 select-none">
            <CircularProgress
              progress={streakBonusProgress}
              progressColor="rgb(234 179 8)"
              textColor="rgb(234 179 8)"
            >
              <span className="text-xs font-bold">
                +{formatNumber(streakBonus)}
              </span>
            </CircularProgress>
            <span className="xl:text-[10px] 2xl:text-xs font-medium text-gray-500 mt-1">
              Streak Bonus
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-muted">
          <p className="text-xs font-semibold mb-1 flex justify-between">
            <span>XP to Level {nextLevel}:</span>
            <span className="font-extrabold text-green-soft">
              {formatNumber(xpGainedInLevel)} /{" "}
              {formatNumber(xpNeededForLevelUp)}
            </span>
          </p>
          <div className="w-full rounded-full h-2.5 bg-muted">
            <div
              className={progressFillClassName}
              style={{ width: `${safeProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreWidget;
