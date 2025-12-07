"use client";

import { useEffect, useState } from "react";

import { useXP } from "@/app/context/xp-context";

const CELEBRATION_DURATION = 3600;

const CelebrationToast: React.FC = () => {
  const { celebration, clearCelebration } = useXP();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!celebration) {
      setVisible(false);
      setProgress(0);
      return;
    }

    setVisible(true);
    setProgress(0);
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / CELEBRATION_DURATION) * 100, 100));
    };

    const interval = window.setInterval(updateProgress, 50);
    updateProgress();

    const handler = window.setTimeout(() => {
      setProgress(100);
      setVisible(false);
      clearCelebration();
    }, CELEBRATION_DURATION);

    return () => {
      window.clearTimeout(handler);
      window.clearInterval(interval);
    };
  }, [celebration, clearCelebration]);

  if (!celebration) {
    return null;
  }

  const message =
    celebration.type === "level"
      ? `Level ${celebration.level} unlocked! +${celebration.xp} XP`
      : celebration.type === "habit"
      ? `Great work! +${celebration.xp} XP for progressing a habit.`
      : `Great work! +${celebration.xp} XP for completing a todo.`;

  const animationClass = visible
    ? "translate-y-0 opacity-100 scale-100"
    : "-translate-y-2 opacity-0 scale-95";

  return (
    <div
      role="status"
      aria-live="assertive"
      className="pointer-events-none fixed inset-x-0 lg:top-6 xl:top-8 z-50 flex justify-center"
    >
      <div
        className={`${animationClass} relative pointer-events-auto border border-muted/40 bg-card/80 lg:px-3 xl:px-4 2xl:px-5 lg:py-2 xl:py-3 2xl:py-4 rounded-sm overflow-hidden shadow-lg shadow-black/40 transition-all duration-300 origin-top`}
      >
        <div className="flex items-center">
          <p className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold text-foreground">
            {message}
          </p>
          <div
            className="absolute left-0 bottom-0 w-full h-1 bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CelebrationToast;
