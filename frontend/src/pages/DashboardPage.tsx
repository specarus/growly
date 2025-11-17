import { useState, useCallback } from "react";
import Layout from "@/layout/Layout";
import WeatherWidget from "@/components/dashboard/WeatherWidget";
import TodosWidget from "@/components/dashboard/TodosWidget";
import ShouldDoWidget from "@/components/dashboard/ShouldDoWidget";
import IntegrationWidget from "@/components/dashboard/IntegrationWidget";
import GreetingWidget from "@/components/dashboard/GreetingWidget";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import SyncWidget from "@/components/dashboard/SyncWidget";
import AnalyticsWidget from "@/components/dashboard/AnalyticsWidget";
import ScoreWidget from "@/components/dashboard/ScoreWidget";

const getLevelData = (totalXP) => {
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

const DashboardPage = () => {
  const [weatherLoaded, setWeatherLoaded] = useState(false);
  const [totalXP, setTotalXP] = useState(4820);

  const levelData = getLevelData(totalXP);

  const handleWeatherReady = useCallback(() => {
    setWeatherLoaded(true);
  }, []);

  const handleHabitComplete = useCallback(
    (xpAward) => {
      setTotalXP((prevXP) => prevXP + xpAward);
      console.log(`+${xpAward} XP earned! New total XP: ${totalXP + xpAward}`);
    },
    [totalXP]
  );

  return (
    <Layout loading={!weatherLoaded}>
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
          <div className="grid grid-cols-5">
            <div className="col-span-3">
              <TodosWidget />
            </div>
            <div className="col-span-2">
              <IntegrationWidget />
            </div>
          </div>
          <AnalyticsWidget />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
