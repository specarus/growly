import Image from "next/image";

type WeatherWidgetProps = Record<string, never>;

const WeatherWidget: React.FC<WeatherWidgetProps> = () => {
  const iconUrl = "/weather/sunny.png";
  const seasonalBackgrounds: Record<string, string> = {
    spring:
      "radial-gradient(circle at 20% 20%, #e3f9e5 0, #f6fff2 25%, transparent 40%), linear-gradient(135deg, #d4f4dd 0%, #a1e5b9 50%, #7fd1ae 100%)",
    summer:
      "radial-gradient(circle at 80% 10%, #fff3c5 0, #ffe8a3 28%, transparent 45%), linear-gradient(135deg, #ffd89b 0%, #fcb69f 50%, #ff9a9e 100%)",
    autumn:
      "radial-gradient(circle at 15% 15%, #fff2db 0, #ffdfb8 30%, transparent 48%), linear-gradient(135deg, #f7c978 0%, #f78ca0 50%, #f9748f 100%)",
    winter:
      "radial-gradient(circle at 80% 20%, #d8ebff 0, #bddbff 32%, transparent 48%), linear-gradient(135deg, #8ec5fc 0%, #e0c3fc 100%)",
  };
  const activeSeason = "autumn";

  return (
    <div className="xl:pt-2 2xl:pt-6 text-foreground">
      <div className="flex items-center justify-between xl:pb-2 2xl:pb-4">
        <h3 className="font-semibold xl:text-lg 2xl:text-xl">Weather</h3>
      </div>

      <div
        className="relative text-foreground flex flex-col justify-top shadow-md xl:h-64 2xl:h-80 bg-cover bg-bottom bg-no-repeat xl:p-4 2xl:p-6 xl:rounded-xl 2xl:rounded-2xl"
        style={{ backgroundImage: seasonalBackgrounds[activeSeason] }}
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

        <div className="flex items-center xl:gap-4 2xl:gap-6">
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
