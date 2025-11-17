import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { WeatherData } from "@/types/weather"; // Assuming this type is available

interface WeatherWidgetProps {
  onReady?: () => void;
}

const getGeolocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation not supported"));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) =>
        reject(new Error(`Location error: ${err.code} - ${err.message}`)),
      { timeout: 5000 }
    );
  });
};

const WeatherWidget = ({ onReady }: WeatherWidgetProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let active = true;

    const loadWeather = async () => {
      let latitude = 0;
      let longitude = 0;
      let locationFound = false;

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      try {
        const location = await getGeolocation();
        latitude = location.latitude;
        longitude = location.longitude;
        locationFound = true;
      } catch (e) {
        console.warn("Geolocation failed. No weather data will be fetched.");
      }

      if (locationFound) {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=precipitation,apparent_temperature&timezone=${timezone}`;

          const response = await fetch(url);
          const data = await response.json();

          if (data.error) {
            throw new Error(data.reason || "Weather API returned an error.");
          }

          if (active) {
            const current = data.current_weather;
            const latestIndex = data.hourly.time.length - 1;

            setWeather({
              temperature: Math.round(current.temperature),
              windSpeed: Math.round(current.windspeed),
              precipitation: data.hourly.precipitation[latestIndex],
              apparentTemp: Math.round(
                data.hourly.apparent_temperature[latestIndex]
              ),
              weatherCode: current.weathercode,
            });
          }
        } catch (error) {
          console.error("Failed to fetch weather:", error);
        }
      }

      if (active) {
        onReady?.();
      }
    };

    loadWeather();

    return () => {
      active = false;
    };
  }, []);

  if (!weather)
    return (
      <Card className="border-white border-0 xl:pt-2 2xl:pt-6 shadow-none">
        <div className="flex items-center justify-center xl:h-64 2xl:h-80">
          Loading...
        </div>
      </Card>
    );

  const weatherIcons: Record<number, string> = {
    0: "/weather/sunny.png",
    1: "/weather/partly-cloudy.png",
    2: "/weather/partly-cloudy.png",
    3: "/weather/cloudy.png",
    45: "/weather/foggy.png",
    48: "/weather/foggy.png",
    51: "/weather/rain.png",
    53: "/weather/rain.png",
    55: "/weather/rain.png",
    61: "/weather/rain.png",
    63: "/weather/rain.png",
    65: "/weather/rain.png",
    71: "/weather/snow.png",
    73: "/weather/snow.png",
    75: "/weather/snow.png",
    95: "/weather/thunderstorm.png",
    99: "/weather/thunderstorm.png",
  };

  const iconUrl = weatherIcons[weather.weatherCode] || "/weather/unknown.png";

  return (
    <Card className="border-white border-0 xl:pt-2 2xl:pt-6 shadow-none">
      <div className="flex items-center justify-between xl:pb-2 2xl:pb-4">
        <h3 className="font-semibold xl:text-lg 2xl:text-xl">Weather</h3>
        <button className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/80 hover:text-yellow-soft-foreground">
          View Details
        </button>
      </div>

      <div
        className="flex flex-col justify-top select-none xl:h-64 2xl:h-80 bg-contain bg-bottom bg-[#eee9cf] bg-no-repeat shadow-none xl:p-4 2xl:p-6 xl:rounded-xl 2xl:rounded-2xl border-0 relative"
        style={{ backgroundImage: "url('/seasons/autumn.png')" }}
      >
        <div className="absolute xl:top-3 xl:left-3 2xl:top-4 2xl:left-4 xl:rounded-xl 2xl:rounded-2xl xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 bg-white grid place-items-center">
          <img
            src={iconUrl}
            alt="Weather Icon"
            className="xl:w-8 xl:h-8 2xl:w-10 2xl:h-10 pointer-events-none"
          />
        </div>

        <p className="text-right xl:text-4xl 2xl:text-5xl font-bold xl:mb-4 2xl:mb-6">
          {weather.temperature}°C
        </p>

        <div className="flex items-center gap-6">
          <div>
            <div className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/70 mb-1">
              Feels like
            </div>
            <div className="font-semibold xl:text-xs 2xl:text-base">
              {-1 * weather.apparentTemp}°C
            </div>
          </div>
          <div>
            <div className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/70 mb-1">
              Wind
            </div>
            <div className="font-semibold xl:text-xs 2xl:text-base flex items-center gap-1">
              <span className="whitespace-nowrap">
                {weather.windSpeed} km/h
              </span>
            </div>
          </div>
          <div>
            <div className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/70 mb-1">
              Precipitation
            </div>
            <div className="font-semibold xl:text-xs 2xl:text-base">
              {weather.precipitation} mm
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherWidget;
