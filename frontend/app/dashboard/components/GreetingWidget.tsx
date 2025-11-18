"use client";

import Button from "@/app/components/ui/Button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface GreetingWidgetProps {}

const GreetingWidget: React.FC<GreetingWidgetProps> = () => {
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const today: Date = currentDateTime;

  const dayName: string = today.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const formattedDate: string = today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime: string = today.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col xl:gap-4 2xl:gap-6 xl:pt-2 2xl:pt-6 text-foreground">
      <div>
        <h1 className="xl:text-3xl 2xl:text-4xl font-bold mb-1">
          Happy {dayName}
        </h1>
        <p className="xl:text-sm 2xl:text-base text-muted-foreground">
          {formattedDate}, {formattedTime}
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
