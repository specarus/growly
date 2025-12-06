"use client";

import Link from "next/link";
import Button from "@/app/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";

type GreetingWidgetProps = Record<string, never>;

const GreetingWidget: React.FC<GreetingWidgetProps> = () => {
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setCurrentDateTime(new Date());

    updateTime();

    const timerId = setInterval(updateTime, 1000);

    return () => clearInterval(timerId);
  }, []);

  const dayName: string | null = currentDateTime
    ? currentDateTime.toLocaleDateString("en-US", {
        weekday: "long",
      })
    : null;

  const formattedDate: string | null = currentDateTime
    ? currentDateTime.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const formattedTime: string | null = currentDateTime
    ? currentDateTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div>
      <div className="flex flex-col lg:gap-3 xl:gap-4 2xl:gap-6 lg:pt-2 2xl:pt-6 text-foreground">
        <div>
          <h1 className="lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold lg:mb-0.5 xl:mb-1">
            Happy {dayName ?? "Day"}
          </h1>
          <p className="lg:text-xs xl:text-sm 2xl:text-base text-muted-foreground">
            {formattedDate && formattedTime
              ? `${formattedDate}, ${formattedTime}`
              : "Loading time..."}
          </p>
        </div>

        <div className="flex flex-col lg:gap-1 xl:gap-2 2xl:gap-3">
          <Link href="/dashboard/habits/create" className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90 lg:h-8 xl:h-10 2xl:h-12 lg:text-xs xl:text-sm 2xl:text-base text-white transition-all duration-100">
              <Plus className="w-4 h-4 xl:w-5 xl:h-5 mr-2" />
              New Habits
            </Button>
          </Link>

          <Button className="border border-muted hover:text-foreground text-foreground hover:bg-muted/20 lg:h-8 xl:h-10 2xl:h-12 lg:text-xs xl:text-sm 2xl:text-base transition-all duration-100">
            <Link href="/dashboard/habits/popular">Browse Popular Habits</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GreetingWidget;
