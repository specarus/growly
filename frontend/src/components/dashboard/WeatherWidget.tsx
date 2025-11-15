import { Card } from "@/components/ui/card";

const WeatherWidget = () => {
  return (
    <Card className="border-white border-0 xl:pt-2 2xl:pt-6 shadow-none">
      <div className="flex items-center justify-between xl:pb-2 2xl:pb-4">
        <h3 className="font-semibold xl:text-lg 2xl:text-xl">Weather</h3>
        <button className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/80 hover:text-yellow-soft-foreground">
          View Details
        </button>
      </div>

      <div
        className="flex flex-col justify-top select-none xl:h-64 2xl:h-80 bg-contain bg-bottom bg-[#eee9cf] bg-no-repeat shadow-md xl:p-4 2xl:p-6 xl:rounded-xl 2xl:rounded-2xl border-0 relative"
        style={{ backgroundImage: "url('/seasons/autumn.png')" }}
      >
        <div className="absolute xl:top-3 xl:left-3 2xl:top-4 2xl:left-4 xl:rounded-xl 2xl:rounded-2xl xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 bg-white grid place-items-center">
          <img
            src="/weather/rain.png"
            alt="Weather Icon"
            className="xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 pointer-events-none"
          />
        </div>

        <p className="text-right xl:text-4xl 2xl:text-5xl font-bold xl:mb-4 2xl:mb-6">
          12°C
        </p>

        <div className="grid grid-cols-3 xl:gap-2 2xl:gap-4">
          <div>
            <div className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/70 mb-1">
              Wind
            </div>
            <div className="font-semibold xl:text-xs 2xl:text-base flex items-center gap-1">
              <span className="whitespace-nowrap">2-4 km/h</span>
            </div>
          </div>
          <div>
            <div className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/70 mb-1">
              Pressure
            </div>
            <div className="font-semibold xl:text-xs 2xl:text-base">102 m</div>
          </div>
          <div>
            <div className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/70 mb-1">
              Humidity
            </div>
            <div className="font-semibold xl:text-xs 2xl:text-base">42%</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherWidget;
