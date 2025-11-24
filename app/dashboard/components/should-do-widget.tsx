import { ChevronRight, Users } from "lucide-react";
import PillButton from "@/app/components/ui/pill-button";

interface Activity {
  id: number;
  title: string;
  emoji: string;
  likes: string;
}

type ShouldDoWidgetProps = Record<string, never>;

const ShouldDoWidget: React.FC<ShouldDoWidgetProps> = () => {
  const activities: Activity[] = [
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
    <div className="flex flex-col xl:rounded-2xl 2xl:rounded-3xl h-full text-foreground">
      <div className="flex items-center justify-between xl:mb-2 2xl:mb-3">
        <h3 className="font-semibold xl:text-lg 2xl:text-xl">Should Do!</h3>
        <PillButton href="#" variant="ghost">
          View Details
        </PillButton>
      </div>

      <div className="flex flex-col flex-1 gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex-1 shadow-inner select-none border border-muted border-dashed bg-white flex items-center justify-between xl:py-2 2xl:py-3 xl:px-3 2xl:px-4 xl:rounded-xl 2xl:rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="xl:text-2xl 2xl:text-3xl shrink-0">
                {activity.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium xl:mb-0.5 2xl:mb-1 xl:text-sm 2xl:text-base truncate">
                  {activity.title}
                </div>
                <div className="xl:text-xs 2xl:text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3 shrink-0" />
                  <span className="truncate">{activity.likes}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 text-muted-foreground shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShouldDoWidget;
