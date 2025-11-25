"use client";

import {
  ChevronDown,
  TrendingUp,
  Search,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import confettiImage from "@/public/confetti.png";
import Button from "@/app/components/ui/button";
import PillButton from "@/app/components/ui/pill-button";

interface Habit {
  name: string;
  percentage: number;
  color: string;
}

type Month =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

const AnalyticsWidget: React.FC = () => {
  const habits: Habit[] = [
    { name: "Tennis", percentage: 40, color: "bg-green-soft" },
    { name: "Swimming", percentage: 35, color: "bg-blue-400" },
    { name: "Gym", percentage: 100, color: "bg-yellow-400" },
    { name: "Reading", percentage: 15, color: "bg-coral" },
    { name: "Study", percentage: 28, color: "bg-green-400" },
    { name: "Running", percentage: 22, color: "bg-muted" },
    { name: "Design", percentage: 30, color: "bg-primary" },
    { name: "Basketball", percentage: 55, color: "bg-yellow-soft" },
  ];

  const pastFiveDays: string[] = [
    "Mon 10",
    "Tue 11",
    "Wed 12",
    "Thu 13",
    "Fri 14",
  ];
  const months: Month[] = [
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

  const [month, setMonth] = useState<Month>("November");
  const [open, setOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="flex xl:gap-4 2xl:gap-6 h-full text-foreground">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="xl:text-lg 2xl:text-xl font-semibold">Analytics</h2>
          <PillButton href="/dashboard/analytics" variant="ghost">
            <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
            Open
          </PillButton>
        </div>
        <div className="xl:py-2 px-4 2xl:py-4 xl:max-h-24 2xl:max-h-max xl:rounded-2xl 2xl:rounded-3xl border-0 shadow-md bg-linear-to-br from-green-soft to-green-600">
          <div className="flex items-center gap-2 mb-2">
            <div className="xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <TrendingUp className="xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 text-white" />
            </div>
            <span className="text-white/80 xl:text-xs 2xl:text-sm">
              Positive Habits
            </span>
          </div>
          <div className="xl:text-3xl font-bold text-white mb-1">+58,2%</div>
        </div>

        <div className="xl:py-2 px-4 2xl:py-4 xl:max-h-24 2xl:max-h-max xl:rounded-2xl 2xl:rounded-3xl border-0 shadow-md bg-linear-to-br from-blue-300 to-blue-600">
          <div className="flex items-center gap-2 mb-2">
            <div className="xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <CheckCircle className="xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 text-white" />
            </div>
            <span className="text-white/80 xl:text-xs 2xl:text-sm">
              Completion Rate
            </span>
          </div>
          <div className="xl:text-3xl font-bold text-white mb-1">85%</div>
        </div>

        <div className="h-full p-2 xl:rounded-2xl 2xl:rounded-3xl border-0 shadow-md bg-analytics-dark text-analytics-dark-foreground relative overflow-hidden">
          <div className="absolute xl:-top-2.5 2xl:-top-3 left-1/2 -translate-x-1/2 xl:w-40 2xl:w-48 pointer-events-none select-none">
            <Image
              src={confettiImage}
              width={1000}
              height={1000}
              alt="Confetti"
              className="w-full h-full"
            />
          </div>
          <div className="relative z-10 xl:pt-6 2xl:pt-2 flex flex-col justify-between h-full xl:gap-2 2xl:gap-3 items-center">
            <div className="select-none xl:w-12 xl:h-12 bg-gray-300/30 rounded-full flex items-center justify-center text-lg sm:text-xl">
              🎁
            </div>
            <span className="xl:text-sm 2xl:text-md opacity-80">
              Habits Wrapped
            </span>
            <div className="xl:text-3xl font-bold">2025</div>
            <Button className="bg-white hover:bg-card/90 text-card-foreground xl:h-9 2xl:h-10 xl:text-xs 2xl:text-sm mt-2 transition-all duration-100 inline-flex items-center justify-center px-4 rounded-full border border-gray-100 shadow-sm">
              View
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 grow w-full">
        <div className="xl:px-4 2xl:px-6 xl:pt-4 2xl:pt-6 xl:rounded-2xl 2xl:rounded-3xl bg-white border border-gray-50 shadow-inner h-full">
          <div className="flex items-center justify-between xl:mb-4 2xl:mb-6 gap-2">
            <h3 className="font-semibold xl:text-lg 2xl:text-xl">
              Favorite Habits
            </h3>

            <div className="flex items-center gap-3">
              <div className="flex gap-1 shadow-sm rounded-full">
                <Button className="xl:h-8 xl:w-8 2xl:h-10 2xl:w-10 bg-white border-muted border">
                  <Search className="xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4" />
                </Button>
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-1 pr-4 outline-none w-24 xl:text-xs 2xl:text-sm text-muted-foreground bg-transparent rounded-full placeholder:text-muted-foreground"
                />
              </div>

              <div className="relative xl:w-32 2xl:w-40" ref={dropdownRef}>
                <div
                  onClick={() => setOpen(!open)}
                  className="select-none relative xl:h-8 2xl:h-10 z-20 rounded-full cursor-pointer flex items-center justify-between gap-2 bg-white border border-gray-50 shadow-sm xl:text-xs 2xl:text-sm sm:rounded-full xl:px-4 py-2 2xl:px-6"
                >
                  <p>{month}</p>
                  <ChevronDown
                    className={`xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4 transition-transform duration-300 ease-in-out ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <div
                  className={`absolute w-full border border-gray-50 xl:top-4 2xl:top-8 left-0 shadow-lg overflow-y-auto bg-white rounded-b-2xl xl:pt-4 2xl:pt-2 z-10 transition-all duration-300 ease-in-out ${
                    open
                      ? "xl:max-h-52 2xl:max-h-60 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {months.map((m) => (
                    <div
                      key={m}
                      onClick={() => {
                        setMonth(m);
                        setOpen(false);
                      }}
                      className="px-4 py-2 xl:text-xs 2xl:text-sm hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 overflow-x-auto">
            <div className="grid grid-cols-5 xl:gap-1 2xl:gap-2 xl:text-[10px] 2xl:text-xs text-muted-foreground mb-2 min-w-max sm:min-w-0">
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

            <div
              ref={containerRef}
              className="relative xl:h-80 2xl:h-[400px] flex justify-between pb-4"
            >
              {habits.map((habit) => {
                const height = containerHeight
                  ? (habit.percentage / maxPercentage) * containerHeight
                  : 0;
                return (
                  <div key={habit.name} className="flex flex-col items-center">
                    <div className="sm:text-xs xl:mt-1 2xl:mt-2 text-center truncate w-full px-1 font-medium">
                      {habit.name}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                      {habit.percentage}%
                    </div>
                    <div
                      className={`xl:w-16 2xl:w-20 ${habit.color} shadow-md rounded-lg sm:rounded-xl transition-all hover:opacity-80`}
                      style={{ height: `${height}px` }}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
