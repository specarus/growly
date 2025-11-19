"use client";

import Button from "@/app/components/ui/Button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface GreetingWidgetProps {}

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
    <div className="flex flex-col xl:gap-4 2xl:gap-6 xl:pt-2 2xl:pt-6 text-foreground">
      <div>
        <h1 className="xl:text-3xl 2xl:text-4xl font-bold mb-1">
          Happy {dayName ?? "Day"}
        </h1>
        <p className="xl:text-sm 2xl:text-base text-muted-foreground">
          {formattedDate && formattedTime
            ? `${formattedDate}, ${formattedTime}`
            : "Loading time..."}
        </p>
      </div>

      <div className="flex flex-col gap-1 xl:gap-2 2xl:gap-3">
        <Button className="bg-primary hover:bg-primary/90 xl:h-10 2xl:h-12 xl:text-sm 2xl:text-base text-white transition-all duration-100">
          <Plus className="w-4 h-4 xl:w-5 xl:h-5 mr-2" />
          New Habits
        </Button>

        <Button className="border border-muted hover:text-foreground text-foreground hover:bg-muted/20 xl:h-10 2xl:h-12 xl:text-sm 2xl:text-base transition-all duration-100">
          Browse Popular Habits
        </Button>
      </div>
    </div>
  );
};

export default GreetingWidget;
