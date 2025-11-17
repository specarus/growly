import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import WeatherWidget from "@/components/dashboard/WeatherWidget";
import TodosWidget from "@/components/dashboard/TodosWidget";
import ShouldDoWidget from "@/components/dashboard/ShouldDoWidget";
import IntegrationWidget from "@/components/dashboard/IntegrationWidget";
import GreetingWidget from "@/components/dashboard/GreetingWidget";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import SyncWidget from "@/components/dashboard/SyncWidget";
import AnalyticsWidget from "@/components/dashboard/AnalyticsWidget";
import ScoreWidget from "@/components/dashboard/ScoreWidget";

const DashboardPage = () => {
  const [weatherLoaded, setWeatherLoaded] = useState(false);

  const handleWeatherReady = useCallback(() => {
    setWeatherLoaded(true);
  }, []);

  return (
    <Layout loading={!weatherLoaded}>
      <div className="grid grid-cols-10 gap-6">
        <div className="h-full col-span-2 grid xl:gap-4 2xl:gap-6">
          <GreetingWidget />
          <CalendarWidget />
          <SyncWidget />
        </div>

        <div className="col-span-2 flex flex-col xl:gap-4 2xl:gap-6">
          <WeatherWidget onReady={handleWeatherReady} />
          <ScoreWidget />
          <ShouldDoWidget />
        </div>

        <div className="col-span-6 grid grid-rows-auto xl:gap-4 2xl:gap-6">
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
