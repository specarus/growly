import Link from "next/link";

import CelebrationToast from "../components/celebration-toast";
import GradientCircle from "../components/ui/gradient-circle";
import AnalyticsWidget from "./components/analytics-widget";
import type { AnalyticsWidgetData } from "./components/analytics-widget";
import CalendarWidget from "./components/calendar-widget";
import GreetingWidget from "./components/greeting-widget";
import IntegrationWidget from "./components/integration-widget";
import ScoreWidget from "./components/score-widget";
import ShouldDoWidget from "./components/should-do-widget";
import DailyQuoteWidget from "./components/daily-quote-widget";
import SyncWidget from "./components/sync-widget";
import TodosWidget from "./components/todos-widget";
import WeatherWidget from "./components/weather-widget";
import { ProgressByDayMap } from "@/lib/habit-progress";

interface DashboardProps {
  progressByDay: ProgressByDayMap;
  analyticsData: AnalyticsWidgetData | null;
  privateAccount: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  progressByDay,
  analyticsData,
  privateAccount,
}) => {
  return (
    <main className="relative w-full lg:pt-14 xl:pt-20 bg-linear-to-b from-white/90 via-light-yellow/55 to-green-soft/15 overflow-hidden">
      <GradientCircle
        size={210}
        position={{ top: "-50px", right: "-50px" }}
        color="rgba(135, 197, 161, 0.35)"
        fadeColor="rgba(135, 197, 161, 0)"
        className="scale-[1.2]"
      />
      <div className="pointer-events-none absolute -left-24 -top-12 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-48 h-64 w-64 rounded-full bg-green-soft/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 bottom-10 h-48 w-48 -translate-x-1/2 rounded-full bg-yellow-soft/25 blur-3xl" />
      <div className="grid lg:grid-cols-5 xl:grid-cols-10 lg:gap-5 xl:gap-6 lg:px-6 xl:px-8 2xl:px-28 lg:pb-8 xl:pb-12 2xl:pb-16">
        <div className="h-full lg:col-span-1 xl:col-span-2 grid lg:gap-3 xl:gap-4 2xl:gap-6">
          <GreetingWidget />
          <CalendarWidget progressByDay={progressByDay} />
          <SyncWidget />
        </div>

        <div className="lg:col-span-1 xl:col-span-2 flex flex-col lg:gap-2 2xl:gap-4">
          <div>
            <WeatherWidget />
          </div>
          <div>
            <ScoreWidget />
          </div>

          <div className="flex-1">
            <ShouldDoWidget />
          </div>
        </div>

        <div className="lg:col-span-3 xl:col-span-6 flex flex-col lg:gap-3 xl:gap-4 2xl:gap-6">
          <div className="grid grid-cols-5 lg:gap-3 xl:gap-4 h-fit">
            <div className="col-span-3">
              <TodosWidget />
            </div>
            <div className="col-span-2 flex flex-col">
              <div>
                <IntegrationWidget />
              </div>
              <div className="h-fit">
                <DailyQuoteWidget />
              </div>
            </div>
          </div>

          {analyticsData ? (
            <AnalyticsWidget data={analyticsData} />
          ) : (
            <div className="lg:rounded-2xl xl:rounded-3xl border border-dashed border-gray-200 bg-white/80 shadow-inner lg:p-4 xl:p-6 2xl:p-8 flex flex-col lg:gap-3 xl:gap-4 text-muted-foreground">
              <div className="space-y-2">
                <p className="lg:text-[10px] xl:text-[11px] uppercase tracking-[0.3em] text-primary font-semibold">
                  Analytics
                </p>
                <h3 className="lg:text-base xl:text-lg 2xl:text-xl font-semibold text-foreground">
                  Insights are hidden
                </h3>
                <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                  {privateAccount
                    ? "Your account is private, so the analytics widget stays tucked away."
                    : "Analytics are temporarily unavailable."}
                </p>
              </div>
              <Link
                href="/account"
                className="inline-flex items-center justify-center rounded-full bg-primary text-white lg:px-3 xl:px-4 lg:py-1.5 xl:py-2 lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold shadow-sm shadow-primary/30 hover:-translate-y-0.5 transition"
              >
                Manage privacy
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
