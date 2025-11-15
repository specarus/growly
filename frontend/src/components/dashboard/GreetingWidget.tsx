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
    <div className="flex flex-col gap-2 xl:gap-4 2xl:gap-6 xl:pt-2 2xl:pt-6">
      <div>
        <h1 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold text-foreground mb-1">
          Happy {dayName} {/*👋*/}
        </h1>
        <p className="text-xs xl:text-sm 2xl:text-base text-muted-foreground">
          {formattedDate}, {formattedTime}
        </p>
      </div>

      <div className="flex flex-col gap-1 xl:gap-2 2xl:gap-3">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-full xl:h-10 2xl:h-12 xl:text-sm 2xl:text-base">
          <Plus className="w-4 h-4 xl:w-5 xl:h-5 mr-2" />
          New Habits
        </Button>

        <Button
          variant="ghost"
          className="border-[1px] border-muted w-full hover:text-foreground text-foreground hover:bg-muted/30 rounded-full xl:h-10 2xl:h-12 xl:text-sm 2xl:text-base"
        >
          Browse Popular Habits
        </Button>
      </div>
    </div>
  );
};

export default GreetingWidget;
