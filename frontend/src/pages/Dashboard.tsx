import WeatherWidget from "@/components/dashboard/WeatherWidget";
import TodosWidget from "@/components/dashboard/TodosWidget";
import ShouldDoWidget from "@/components/dashboard/ShouldDoWidget";
import IntegrationWidget from "@/components/dashboard/IntegrationWidget";
import { Search, Bell, HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import GreetingWidget from "@/components/dashboard/GreetingWidget";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import SyncWidget from "@/components/dashboard/SyncWidget";
import AnalyticsWidget from "@/components/dashboard/AnalyticsWidget";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-50 border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1750px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm truncate">
              <span className="font-medium">Dashboard</span>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <span className="text-muted-foreground hidden sm:inline">
                Schedule
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-8 w-8 sm:h-10 sm:w-10"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-8 w-8 sm:h-10 sm:w-10"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full shadow-inner">
        <div className="max-w-[1750px] mx-auto px-3 sm:px-6 py-2 sm:py-4 grid grid-cols-1 lg:grid-cols-10 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 flex flex-col">
            <div>
              <GreetingWidget />
            </div>
            <div>
              <CalendarWidget />
            </div>
            <div>
              <SyncWidget />
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col h-full gap-4 sm:gap-6">
            <div>
              <WeatherWidget />
            </div>

            <div>
              <ShouldDoWidget />
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-5 gap-4 lg:gap-6">
                <div className="lg:col-span-3">
                  <TodosWidget />
                </div>
                <div className="lg:col-span-2">
                  <IntegrationWidget />
                </div>
              </div>

              <div>
                <AnalyticsWidget />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-32 border-t-[1px] border-gray-50">Footer</footer>
    </div>
  );
};

export default Dashboard;
