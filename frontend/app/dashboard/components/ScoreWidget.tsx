import CircularProgress from "./CircularProgress";

interface ScoreWidgetProps {
  totalXP: number;
  level: number;
  progress: number;
  xpGainedInLevel: number;
  xpNeededForLevelUp: number;
  todayXP: number;
  streakBonus: number;
}

const ScoreWidget: React.FC<ScoreWidgetProps> = ({
  totalXP,
  level,
  progress,
  xpGainedInLevel,
  xpNeededForLevelUp,
  todayXP,
  streakBonus,
}) => {
  const safeProgress = Math.min(100, Math.max(0, progress));
  const nextLevel = level + 1;

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const maxDailyXP = 1000;
  const maxStreakBonus = 200;

  const todayXPProgress = Math.min(
    100,
    Math.floor((todayXP / maxDailyXP) * 100)
  );
  const streakBonusProgress = Math.min(
    100,
    Math.floor((streakBonus / maxStreakBonus) * 100)
  );

  return (
    <div className="text-foreground bg-white xl:p-3 2xl:p-4 rounded-2xl shadow-none border-none">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold  uppercase tracking-wider">
          Habit Score
        </h3>
      </div>
      <div className="flex flex-col xl:gap-3 2xl:gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center xl:px-3 xl:py-2 2xl:px-4 2xl:py-3 rounded-lg bg-secondary/50 text-primary select-none">
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
              Today's XP
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
              className="bg-green-soft h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${safeProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreWidget;
