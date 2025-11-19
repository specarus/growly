import DetailsButton from "@/app/components/ui/DetailsButton";
import Image from "next/image";

interface WeatherWidgetProps {}

const WeatherWidget: React.FC<WeatherWidgetProps> = () => {
  const iconUrl = "/weather/sunny.png";

  return (
    <div className="xl:pt-2 2xl:pt-6 text-foreground">
      <div className="flex items-center justify-between xl:pb-2 2xl:pb-4">
        <h3 className="font-semibold xl:text-lg 2xl:text-xl">Weather</h3>
        <DetailsButton />
      </div>

      <div
        className="relative text-foreground flex flex-col justify-top select-none xl:h-64 2xl:h-80 bg-contain bg-bottom bg-[#eee9cf] bg-no-repeat xl:p-4 2xl:p-6 xl:rounded-xl 2xl:rounded-2xl"
        style={{ backgroundImage: "url('/seasons/autumn.png')" }}
      >
        <div className="absolute xl:top-3 xl:left-3 2xl:top-4 2xl:left-4 xl:rounded-xl 2xl:rounded-2xl xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 bg-white grid place-items-center">
          <Image
            src={iconUrl}
            width={100}
            height={100}
            alt="Weather"
            className="xl:w-8 xl:h-8 2xl:w-10 2xl:h-10 pointer-events-none"
          />
        </div>

        <p className="text-right xl:text-4xl 2xl:text-5xl font-bold xl:mb-4 2xl:mb-6">
          7°C
        </p>

        <div className="flex items-center gap-6">
          <div>
            <div className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/70 mb-1">
              Feels like
            </div>
            <div className="font-semibold xl:text-xs 2xl:text-base">4°C</div>
          </div>
          <div>
            <div className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/70 mb-1">
              Wind
            </div>
            <div className="font-semibold xl:text-xs 2xl:text-base flex items-center gap-1">
              <span className="whitespace-nowrap">4 km/h</span>
            </div>
          </div>
          <div>
            <div className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/70 mb-1">
              Precipitation
            </div>
            <div className="font-semibold xl:text-xs 2xl:text-base">0.1 mm</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
