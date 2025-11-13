import { Card } from "@/components/ui/card";
import { ChevronRight, Dumbbell, AlarmClock, MapPin, Users } from "lucide-react";

const ShouldDoSection = () => {
  const activities = [
    {
      id: 1,
      title: "We go jimmm!",
      emoji: "💪",
      likes: "4.2k love this",
      icon: Dumbbell,
    },
    {
      id: 2,
      title: "The 5am club",
      emoji: "⏰",
      likes: "5.4k love this",
      icon: AlarmClock,
    },
  ];

  const competition = {
    title: "Running Competition",
    date: "31 Dec",
    distance: "20miles",
    time: "09:00",
    icon: MapPin,
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0 shadow-sm">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-semibold text-base sm:text-lg">Should Do!</h3>
          <button className="text-xs sm:text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
            View Details
          </button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-xl sm:rounded-2xl hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <span className="text-2xl sm:text-3xl flex-shrink-0">{activity.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium mb-0.5 sm:mb-1 text-sm sm:text-base truncate">{activity.title}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{activity.likes}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0 shadow-sm">
        <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Running Competition</h3>

        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <AlarmClock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
            <span>{competition.date}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
            <span>{competition.distance}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <AlarmClock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
            <span>{competition.time}</span>
          </div>
        </div>

        <div className="relative h-28 sm:h-32 bg-gradient-to-br from-blue-100 to-yellow-100 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-card px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
            Starting Point
          </div>
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base">
            2
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ShouldDoSection;
