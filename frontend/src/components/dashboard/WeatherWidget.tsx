import { Card } from "@/components/ui/card";
import { Wind } from "lucide-react";

const WeatherWidget = () => {
  return (
    <Card className="border-white border-0 pt-4 sm:pt-6 shadow-none">
      <div className="flex items-center justify-between pb-2">
        <h3 className="font-semibold text-base sm:text-lg mb-2">Weather</h3>
        <button className="text-xs sm:text-sm text-yellow-soft-foreground/80 hover:text-yellow-soft-foreground">
          View Details
        </button>
      </div>

      <div
        className="select-none h-72 bg-cover bg-center bg-no-repeat  shadow-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0  overflow-hidden relative"
        style={{ backgroundImage: "url('/autumn.jpg')" }}
      >
        <div className="text-right text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">
          12°C
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-white bg-opacity-70 shadow-lg rounded-2xl p-3">
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
      </div>
    </Card>
  );
};

export default WeatherWidget;
