import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import mascotImage from "@/assets/mascot.png";

const GreetingSection = () => {
  const today = new Date();
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

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const selectedDays = [1, 5, 9, 10, 16, 17, 20, 22, 28, 30];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1">
          Happy {dayName} 👋
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {formattedDate}, {formattedTime}
        </p>
      </div>

      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 sm:h-12 text-sm sm:text-base">
        <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        New Habits
      </Button>

      <Button
        variant="ghost"
        className="w-full text-foreground hover:bg-muted rounded-xl h-10 sm:h-12 text-sm sm:text-base"
      >
        Browse Popular Habits
      </Button>

      <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0 shadow-sm">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-semibold text-base sm:text-lg">December, 2023</h3>
          <Button
            size="icon"
            className="rounded-full bg-primary hover:bg-primary/90 w-7 h-7 sm:w-8 sm:h-8"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {days.slice(0, 7).map((day) => (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center text-xs sm:text-sm rounded-full ${
                selectedDays.includes(day)
                  ? day === 30
                    ? "bg-primary text-primary-foreground font-medium"
                    : "border-2 border-primary text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {days.slice(7, 14).map((day) => (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center text-xs sm:text-sm rounded-full ${
                selectedDays.includes(day)
                  ? "border-2 border-primary text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {days.slice(14, 21).map((day) => (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center text-xs sm:text-sm rounded-full ${
                selectedDays.includes(day)
                  ? "border-2 border-primary text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {days.slice(21, 28).map((day) => (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center text-xs sm:text-sm rounded-full ${
                selectedDays.includes(day)
                  ? day === 28
                    ? "border-2 border-primary text-foreground font-medium"
                    : "border-2 border-primary text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.slice(28, 31).map((day) => (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center text-xs sm:text-sm rounded-full ${
                selectedDays.includes(day)
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {day}
            </div>
          ))}
          <div className="aspect-square flex items-center justify-center text-xs sm:text-sm rounded-full text-muted-foreground">
            31
          </div>
        </div>

        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-accent font-medium">
          +3,2% from last month
        </div>
      </Card>

      <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0 shadow-sm text-center">
        <img
          src={mascotImage}
          alt="Mascot"
          className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4"
        />
        <h3 className="font-semibold text-base sm:text-lg mb-1">
          Sync anywhere with <br /> Hebats Mobile App
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
          Download now, sync later!
        </p>
        <Button className="w-full rounded-xl bg-foreground hover:bg-foreground/90 text-background h-10 sm:h-11 text-sm sm:text-base">
          Download App
        </Button>
      </Card>
    </div>
  );
};

export default GreetingSection;
