import GreetingSection from "@/components/dashboard/GreetingSection";
import WeatherWidget from "@/components/dashboard/WeatherWidget";
import TodosList from "@/components/dashboard/TodosList";
import ShouldDoSection from "@/components/dashboard/ShouldDoSection";
import IntegrationCards from "@/components/dashboard/IntegrationCards";
import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import { Search, Bell, HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm truncate">
              <span className="font-medium">Dashboard</span>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <span className="text-muted-foreground hidden sm:inline">Schedule</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 sm:h-10 sm:w-10">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 sm:h-10 sm:w-10">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            <GreetingSection />
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <WeatherWidget />
            <ShouldDoSection />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <TodosList />
            <IntegrationCards />
            <AnalyticsSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
