import { Card } from "@/components/ui/card";
import {
  ChevronRight,
  Dumbbell,
  AlarmClock,
  MapPin,
  Users,
} from "lucide-react";

const ShouldDoWidget = () => {
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
      <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-[1px] border-gray-50">
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
              className="shadow-inner select-none border-[1px] border-dashed flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <span className="text-2xl sm:text-3xl flex-shrink-0">
                  {activity.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium mb-0.5 sm:mb-1 text-sm sm:text-base truncate">
                    {activity.title}
                  </div>
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
    </div>
  );
};

export default ShouldDoWidget;
