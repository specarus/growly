import { Card } from "@/components/ui/card";
import { Cloud, Wind } from "lucide-react";
import weatherIllustration from "@/assets/weather-illustration.png";

const WeatherWidget = () => {
  return (
    <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0 shadow-sm bg-yellow-soft overflow-hidden relative">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div>
          <h3 className="font-semibold text-base sm:text-lg mb-2">Weather</h3>
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <Cloud className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-soft-foreground/70" />
          </div>
        </div>
        <button className="text-xs sm:text-sm text-yellow-soft-foreground/80 hover:text-yellow-soft-foreground">
          View Details
        </button>
      </div>

      <div className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">12°C</div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
        <div>
          <div className="text-xs sm:text-sm text-yellow-soft-foreground/70 mb-1">
            Wind
          </div>
          <div className="font-semibold text-xs sm:text-base flex items-center gap-1">
            <span className="whitespace-nowrap">2-4 km/h</span>
            <Wind className="w-3 h-3 sm:w-4 sm:h-4 text-green-soft flex-shrink-0" />
          </div>
        </div>
        <div>
          <div className="text-xs sm:text-sm text-yellow-soft-foreground/70 mb-1">
            Pressure
          </div>
          <div className="font-semibold text-xs sm:text-base">102m</div>
        </div>
        <div>
          <div className="text-xs sm:text-sm text-yellow-soft-foreground/70 mb-1">
            Humidity
          </div>
          <div className="font-semibold text-xs sm:text-base">42%</div>
        </div>
      </div>

      <img
        src={weatherIllustration}
        alt="Weather"
        className="absolute bottom-0 right-0 w-32 sm:w-40 md:w-48 h-auto opacity-90"
      />
    </Card>
  );
};

export default WeatherWidget;
