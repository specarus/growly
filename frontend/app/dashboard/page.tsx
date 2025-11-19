import AnalyticsWidget from "./components/AnalyticsWidget";
import CalendarWidget from "./components/CalendarWidget";
import GreetingWidget from "./components/GreetingWidget";
import IntegrationWidget from "./components/IntegrationWidget";
import ScoreWidget from "./components/ScoreWidget";
import ShouldDoWidget from "./components/ShouldDoWidget";
import SyncWidget from "./components/SyncWidget";
import TodosWidget from "./components/TodosWidget";
import WeatherWidget from "./components/WeatherWidget";

const DashboardPage: React.FC = () => {
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
            <WeatherWidget />
          </div>
          <div>
            <ScoreWidget
              level={3}
              totalXP={4820}
              xpGainedInLevel={1820}
              xpNeededForLevelUp={3000}
              progress={60}
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
              <div className="w-full grow border border-gray-50 shadow-sm rounded-2xl"></div>
            </div>
          </div>
          <AnalyticsWidget />
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
