import AnalyticsWidget from "./components/analytics-widget";
import CalendarWidget from "./components/calendar-widget";
import GreetingWidget from "./components/greeting-widget";
import IntegrationWidget from "./components/integration-widget";
import ScoreWidget from "./components/score-widget";
import ShouldDoWidget from "./components/should-do-widget";
import SyncWidget from "./components/sync-widget";
import TodosWidget from "./components/todos-widget";
import WeatherWidget from "./components/weather-widget";

const Dashboard: React.FC = () => {
  return (
    <main className="relative w-full min-h-screen xl:pt-20 bg-linear-to-b from-white via-light-yellow/60 to-green-soft/10 overflow-hidden">
      <div className="pointer-events-none absolute -left-24 -top-12 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-48 h-64 w-64 rounded-full bg-green-soft/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 bottom-10 h-48 w-48 -translate-x-1/2 rounded-full bg-yellow-soft/25 blur-3xl" />
      <div className="grid grid-cols-10 gap-6 xl:px-8 2xl:px-28 pb-16">
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
            </div>
          </div>
          <AnalyticsWidget />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
