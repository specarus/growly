import { Card } from "@/components/ui/card";
import { ChevronRight, Users } from "lucide-react";

const ShouldDoWidget = () => {
  const activities = [
    {
      id: 1,
      title: "We go jimmm!",
      emoji: "💪",
      likes: "4.2k love this",
    },
    {
      id: 2,
      title: "The 5am club",
      emoji: "⏰",
      likes: "5.4k love this",
    },
  ];

  return (
    <Card className="xl:p-4 2xl:p-6 xl:rounded-2xl 2xl:rounded-3xl border-[1px] border-gray-50">
      <div className="flex items-center justify-between xl:mb-3 2xl:mb-4">
        <h3 className="font-semibold xl:text-lg 2xl:text-xl">Should Do!</h3>
        <button className="xl:text-xs 2xl:text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
          View Details
        </button>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateRows: `repeat(${activities.length}, 1fr)` }}
      >
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="shadow-inner select-none border-[1px] border-dashed flex items-center justify-between xl:p-3 2xl:p-4 xl:rounded-xl 2xl:rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <span className="xl:text-2xl 2xl:text-3xl flex-shrink-0">
                {activity.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium xl:mb-0.5 2xl:mb-1 xl:text-sm 2xl:text-base truncate">
                  {activity.title}
                </div>
                <div className="xl:text-xs 2xl:text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{activity.likes}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 text-muted-foreground flex-shrink-0" />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ShouldDoWidget;
