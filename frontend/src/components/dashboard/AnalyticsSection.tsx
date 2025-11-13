import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Search } from "lucide-react";

const AnalyticsSection = () => {
  const habits = [
    { name: "Tennis", percentage: 24, color: "bg-green-soft" },
    { name: "Swimming", percentage: 35, color: "bg-blue-400" },
    { name: "Gym", percentage: 18, color: "bg-yellow-400" },
    { name: "Reading", percentage: 15, color: "bg-coral" },
    { name: "Study", percentage: 28, color: "bg-green-400" },
    { name: "Running", percentage: 22, color: "bg-muted" },
    { name: "Design", percentage: 30, color: "bg-primary" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-xl font-semibold">Analytics</h2>
        <button className="text-xs sm:text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
          View Details
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0 shadow-sm bg-gradient-to-br from-green-soft to-green-600">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-white/80 text-xs sm:text-sm">Positive Habits</span>
          </div>
          <div className="text-2xl sm:text-4xl font-bold text-white mb-1">+58,2%</div>
        </Card>

        <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0 shadow-sm bg-analytics-dark text-analytics-dark-foreground relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl">
                🎁
              </div>
              <span className="text-xs sm:text-sm opacity-80">Habits Wrapped</span>
            </div>
            <div className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">2023</div>
            <Button
              variant="secondary"
              className="w-full rounded-xl bg-card hover:bg-card/90 text-card-foreground h-9 sm:h-10 text-xs sm:text-sm"
            >
              View
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-coral/10 rounded-full blur-2xl"></div>
        </Card>
      </div>

      <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <h3 className="font-semibold text-base sm:text-lg">Favorite Habits</h3>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 sm:h-10 sm:w-10">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <select className="text-xs sm:text-sm border border-border rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 bg-background">
              <option>December</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 overflow-x-auto">
          <div className="grid grid-cols-5 gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mb-2 min-w-max sm:min-w-0">
            <div>Fri 11</div>
            <div>Fri 12</div>
            <div>Fri 13</div>
            <div>Fri 14</div>
            <div>Fri 15</div>
          </div>

          <div className="relative h-48 sm:h-64 min-w-[320px] sm:min-w-0">
            {habits.map((habit, index) => {
              const left = (index / habits.length) * 100;
              const height = habit.percentage * 1.5;

              return (
                <div
                  key={habit.name}
                  className="absolute bottom-0 flex flex-col items-center"
                  style={{
                    left: `${left}%`,
                    width: `${100 / habits.length}%`,
                  }}
                >
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                    {habit.percentage}%
                  </div>
                  <div
                    className={`w-8 sm:w-12 ${habit.color} rounded-t-lg sm:rounded-t-xl transition-all hover:opacity-80`}
                    style={{ height: `${height}px` }}
                  ></div>
                  <div className="text-[10px] sm:text-xs mt-1 sm:mt-2 text-center truncate w-full px-1">{habit.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsSection;
