"use client";

import { useState, useCallback } from "react";
import AnalyticsWidget from "./components/AnalyticsWidget";
import CalendarWidget from "./components/CalendarWidget";
import GreetingWidget from "./components/GreetingWidget";
import IntegrationWidget from "./components/IntegrationWidget";
import ScoreWidget from "./components/ScoreWidget";
import ShouldDoWidget from "./components/ShouldDoWidget";
import SyncWidget from "./components/SyncWidget";
import TodosWidget from "./components/TodosWidget";
import WeatherWidget from "./components/WeatherWidget";

interface LevelData {
  level: number;
  totalXP: number;
  xpGainedInLevel: number;
  xpNeededForLevelUp: number;
  progress: number;
}

const getLevelData = (totalXP: number): LevelData => {
  const levelThresholds = [0, 1000, 3000, 6000, 10000];

  let currentLevel = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = levelThresholds[1] || Infinity;

  for (let i = 0; i < levelThresholds.length; i++) {
    if (totalXP >= levelThresholds[i]) {
      currentLevel = i + 1;
      xpForCurrentLevel = levelThresholds[i];
      xpForNextLevel = levelThresholds[i + 1] || Infinity;
    } else {
      break;
    }
  }

  const xpGainedInLevel = totalXP - xpForCurrentLevel;
  const xpNeededForLevelUp = xpForNextLevel - xpForCurrentLevel;
  const progress =
    xpNeededForLevelUp === 0 || xpNeededForLevelUp === Infinity
      ? 0
      : Math.min(100, Math.floor((xpGainedInLevel / xpNeededForLevelUp) * 100));

  return {
    level: currentLevel,
    totalXP: totalXP,
    xpGainedInLevel,
    xpNeededForLevelUp,
    progress,
  };
};

const DashboardPage: React.FC = () => {
  const [weatherLoaded, setWeatherLoaded] = useState<boolean>(false);
  const [totalXP, setTotalXP] = useState<number>(4820);

  const levelData: LevelData = getLevelData(totalXP);

  const handleWeatherReady = useCallback(() => {
    setWeatherLoaded(true);
  }, []);

  const handleHabitComplete = useCallback(
    (xpAward: number) => {
      setTotalXP((prevXP) => prevXP + xpAward);
      console.log(`+${xpAward} XP earned! New total XP: ${totalXP + xpAward}`);
    },
    [totalXP]
  );

  return (
    <main className="w-full min-h-screen">
      <div className="grid grid-cols-10 gap-6 xl:px-8 2xl:px-28 pb-6 xl:pt-2 2xl:pt-6">
        <div className="h-full col-span-2 grid xl:gap-4 2xl:gap-6">
          <GreetingWidget />
          <CalendarWidget />
          <SyncWidget />
        </div>

        <div className="col-span-2 flex flex-col xl:gap-2 2xl:gap-4">
          <div>
            <WeatherWidget onReady={handleWeatherReady} />
          </div>
          <div>
            <ScoreWidget
              level={levelData.level}
              totalXP={levelData.totalXP}
              xpGainedInLevel={levelData.xpGainedInLevel}
              xpNeededForLevelUp={levelData.xpNeededForLevelUp}
              progress={levelData.progress}
              todayXP={450}
              streakBonus={100}
            />
          </div>

          <div className="flex-1">
            <ShouldDoWidget />
          </div>
        </div>

        <div className="col-span-6 flex flex-col xl:gap-4 2xl:gap-6">
          <div className="grid grid-cols-5 xl:gap-4">
            <div className="col-span-3">
              <TodosWidget />
            </div>
            <div className="col-span-2 flex flex-col">
              <div>
                <IntegrationWidget />
              </div>
              <div className="w-full grow border border-gray-50 shadow-sm rounded-2xl bg-red-500">
                <p>Extra</p>
              </div>
            </div>
          </div>
          <AnalyticsWidget />
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
