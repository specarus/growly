import { Button } from "@/components/ui/button";
import { ChevronDown, TrendingUp, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";

const AnalyticsWidget = () => {
  const habits = [
    { name: "Tennis", percentage: 40, color: "bg-green-soft" },
    { name: "Swimming", percentage: 35, color: "bg-blue-400" },
    { name: "Gym", percentage: 100, color: "bg-yellow-400" },
    { name: "Reading", percentage: 15, color: "bg-coral" },
    { name: "Study", percentage: 28, color: "bg-green-400" },
    { name: "Running", percentage: 22, color: "bg-muted" },
    { name: "Design", percentage: 30, color: "bg-primary" },
  ];

  const pastFiveDays = ["Mon 10", "Tue 11", "Wed 12", "Thu 13", "Fri 14"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [month, setMonth] = useState("November");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [selected, setSelected] = useState(1);
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Track container height for responsive scaling
  useEffect(() => {
    function updateHeight() {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const maxPercentage = Math.max(...habits.map((h) => h.percentage));

  return (
    <div className="flex gap-4 sm:gap-6">
      {/* Left side: Analytics summary */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 sm:pb-4">
          <h2 className="text-base sm:text-xl font-semibold">Analytics</h2>
        </div>

        <Card className="p-2 sm:p-4 rounded-2xl sm:rounded-3xl border-0 shadow-sm bg-gradient-to-br from-green-soft to-green-600">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-white/80 text-xs sm:text-sm">
              Positive Habits
            </span>
          </div>
          <div className="text-2xl sm:text-4xl font-bold text-white mb-1">
            +58,2%
          </div>
        </Card>

        <Card className="p-2 sm:p-4 rounded-2xl sm:rounded-3xl border-0 shadow-sm bg-analytics-dark text-analytics-dark-foreground relative overflow-hidden">
          <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-48 pointer-events-none select-none">
            <img src="/confetti.png" alt="Confetti" className="w-full h-full" />
          </div>
          <div className="relative z-10 pt-4 flex flex-col gap-4 items-center">
            <div className="select-none w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 bg-opacity-70 rounded-full flex items-center justify-center text-lg sm:text-xl">
              🎁
            </div>
            <span className="text-xs sm:text-sm opacity-80">
              Habits Wrapped
            </span>
            <div className="text-2xl sm:text-4xl font-bold">2025</div>
            <Button
              variant="secondary"
              className="w-full rounded-full bg-card hover:bg-card/90 text-card-foreground h-9 sm:h-10 text-xs sm:text-sm mt-2"
            >
              View
            </Button>
          </div>
        </Card>
      </div>

      {/* Right side: Favorite Habits */}
      <div className="space-y-4 flex-grow">
        <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0 shadow-inner">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
            <h3 className="font-semibold text-base sm:text-lg">
              Favorite Habits
            </h3>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <div className="flex gap-3 border-[1px] border-gray-50 shadow-sm rounded-full">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8 sm:h-10 sm:w-10 bg-white border-gray-100 border-[1px]"
                >
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-1 pr-4 outline-none w-24 text-sm text-muted-foreground bg-transparent rounded-full placeholder:text-muted-foreground"
                />
              </div>

              {/* Month Dropdown */}
              <div className="relative w-40" ref={dropdownRef}>
                <div
                  onClick={() => setOpen(!open)}
                  className="select-none relative z-20 rounded-full cursor-pointer flex items-center justify-between gap-2 bg-white border border-gray-50 shadow-md text-xs sm:text-sm sm:rounded-full px-4 py-2 sm:px-6"
                >
                  <p>{month}</p>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div
                  className={`absolute w-full border border-gray-50 top-5 left-0 shadow-lg overflow-y-auto bg-white rounded-b-2xl pt-2 z-10 transition-all duration-300 ease-in-out ${
                    open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {months.map((m) => (
                    <div
                      key={m}
                      onClick={() => {
                        setMonth(m);
                        setOpen(false);
                      }}
                      className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Past five days */}
          <div className="space-y-4 overflow-x-auto">
            <div className="grid grid-cols-5 gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mb-2 min-w-max sm:min-w-0">
              {pastFiveDays.map((day, index) => (
                <div
                  key={index}
                  className={`pb-2 text-center border-b-2 hover:border-muted-foreground cursor-pointer ${
                    selected === index
                      ? "border-muted-foreground"
                      : "border-white"
                  }`}
                  onClick={() => setSelected(index)}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Habit bars */}
            <div
              ref={containerRef}
              className="relative h-48 sm:h-64 flex justify-start gap-2 sm:gap-3"
            >
              {habits.map((habit) => {
                const height = containerHeight
                  ? (habit.percentage / maxPercentage) * containerHeight
                  : 0;
                return (
                  <div key={habit.name} className="flex flex-col items-center">
                    <div className="sm:text-xs mt-1 sm:mt-2 text-center truncate w-full px-1 font-medium">
                      {habit.name}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                      {habit.percentage}%
                    </div>
                    <div
                      className={`w-16 sm:w-20 ${habit.color} rounded-lg sm:rounded-xl transition-all hover:opacity-80`}
                      style={{ height: `${height}px` }}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
