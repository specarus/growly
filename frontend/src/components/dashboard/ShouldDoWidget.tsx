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
    // 💡 Key Change: Added 'flex flex-col' to make the Card a column-based flex container
    // that stretches to the full height provided by its parent in DashboardPage.
    <Card className="flex flex-col xl:rounded-2xl 2xl:rounded-3xl border-none shadow-none h-full">
      {/* Widget Header - fixed height */}
      <div className="flex items-center justify-between xl:mb-2 2xl:mb-3">
        <h3 className="font-semibold xl:text-lg 2xl:text-xl">Should Do!</h3>
        <button className="xl:text-xs 2xl:text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
          View Details
        </button>
      </div>

      {/* Activity List Container - uses 'flex-1' to take all remaining vertical space */}
      <div className="flex flex-col flex-1 gap-4">
        {activities.map((activity) => (
          // Individual Activity Item - uses 'flex-1' to share the list container's height equally
          <div
            key={activity.id}
            className="flex-1 shadow-inner select-none border-[1px] border-dashed flex items-center justify-between xl:py-2 2xl:py-3 xl:px-3 2xl:px-4 xl:rounded-xl 2xl:rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 sm:gap-3">
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
