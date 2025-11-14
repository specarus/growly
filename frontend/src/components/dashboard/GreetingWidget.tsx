import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";

const GreetingWidget = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const today = currentDateTime;
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = today.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-4 sm:space-y-6 pt-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1">
          Happy {dayName} 👋
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {formattedDate}, {formattedTime}
        </p>
      </div>

      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-full h-10 sm:h-12 text-sm sm:text-base">
        <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        New Habits
      </Button>

      <Button
        variant="ghost"
        className="w-full text-foreground hover:bg-muted rounded-full h-10 sm:h-12 text-sm sm:text-base"
      >
        Browse Popular Habits
      </Button>
    </div>
  );
};

export default GreetingWidget;
