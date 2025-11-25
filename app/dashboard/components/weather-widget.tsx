"use client";

import Image from "next/image";
import { useEffect, useState, type FC } from "react";
import { useTheme } from "@/app/context/theme-context";

type Location = {
  name: string;
  latitude: number;
  longitude: number;
};

const DEFAULT_LOCATION: Location = {
  name: "Seattle, WA",
  latitude: 47.608013,
  longitude: -122.335167,
};

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

const seasonalBackgroundsDark: Record<string, string> = {
  spring:
    "radial-gradient(circle at 20% 20%, #0d3d1e 0, #123527 25%, transparent 40%), linear-gradient(135deg, #0b2f1a 0%, #0f3922 50%, #163e2c 100%)",
  summer:
    "radial-gradient(circle at 80% 10%, #312100 0, #4f3200 28%, transparent 45%), linear-gradient(135deg, #4f3200 0%, #593900 50%, #6c4500 100%)",
  autumn:
    "radial-gradient(circle at 15% 15%, #29170f 0, #3d2414 30%, transparent 48%), linear-gradient(135deg, #3c2414 0%, #4a2816 50%, #5b2f1c 100%)",
  winter:
    "radial-gradient(circle at 80% 20%, #081121 0, #1a2740 32%, transparent 48%), linear-gradient(135deg, #1a2a45 0%, #2e3b5c 100%)",
};

const DEGREE_SYMBOL = "\u00B0";

const formatTemperature = (value: number) =>
  `${Math.round(value)}${DEGREE_SYMBOL}C`;

type WeatherApiResponse = {
  current_weather: {
    is_day: number;
    temperature: number;
    windspeed: number;
    weathercode: number;
    time: string;
  };
  hourly?: {
    time: string[];
    precipitation?: number[];
  };
};

type WeatherState = {
  temperature: number;
  windspeed: number;
  feelsLike: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  time: string;
};

const getSeason = (month: number) => {
  if (month >= 2 && month <= 4) {
    return "spring";
  }
  if (month >= 5 && month <= 7) {
    return "summer";
  }
  if (month >= 8 && month <= 10) {
    return "autumn";
  }
  return "winter";
};

const getWeatherIcon = (code: number, isDay: boolean) => {
  if (!isDay) {
    return "/weather/night.png";
  }

  if (code === 0) {
    return "/weather/sunny.png";
  }

  if ([1, 2, 3, 51, 53, 55, 61, 63, 65, 66, 67].includes(code)) {
    return "/weather/partly-cloudy.png";
  }

  if ([45, 48].includes(code)) {
    return "/weather/foggy.png";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "/weather/snow.png";
  }

  if ([95, 96, 99].includes(code)) {
    return "/weather/thunderstorm.png";
  }

  return "/weather/sunny.png";
};

const getWeatherLabel = (code: number) => {
  if (code === 0) {
    return "Clear skies";
  }

  if ([1, 2, 3].includes(code)) {
    return "Partly cloudy";
  }

  if ([45, 48].includes(code)) {
    return "Foggy";
  }

  if ([51, 53, 55, 61, 63, 65, 66, 67].includes(code)) {
    return "Light showers";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "Snow";
  }

  if ([95, 96, 99].includes(code)) {
    return "Thunderstorm";
  }

  return "Changing conditions";
};

const fetchWeatherData = async (
  loc: Location,
  signal: AbortSignal
): Promise<WeatherState> => {
  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true&hourly=precipitation&timezone=auto`;
  const response = await fetch(endpoint, { signal });

  if (!response.ok) {
    throw new Error("Weather endpoint returned an error");
  }

  const payload: WeatherApiResponse = await response.json();
  const current = payload.current_weather;
  const hourly = payload.hourly;
  const currentIndex =
    hourly?.time?.findIndex((time) => time === current.time) ?? -1;
  const precipitation =
    currentIndex >= 0 && hourly?.precipitation
      ? hourly.precipitation[currentIndex]
      : 0;
  const feelsLike = current.temperature - current.windspeed * 0.13;

  return {
    temperature: current.temperature,
    windspeed: current.windspeed,
    feelsLike,
    weatherCode: current.weathercode,
    isDay: current.is_day === 1,
    precipitation,
    time: current.time,
  };
};

const WeatherWidget: FC = () => {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [locationStatus, setLocationStatus] = useState<
    "default" | "pending" | "resolved" | "error" | "disabled"
  >("default");
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationStatus("disabled");
      return;
    }

    setLocationStatus("pending");

    const handleSuccess = (position: GeolocationPosition) => {
      setLocation({
        name: "Your location",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setLocationStatus("resolved");
    };

    const handleError = () => {
      setLocationStatus("error");
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 5 * 60 * 1000,
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadWeather = async () => {
      setStatus("loading");
      setError(null);

      try {
        const weatherState = await fetchWeatherData(
          location,
          controller.signal
        );
        if (controller.signal.aborted) {
          return;
        }

        setWeather(weatherState);
        setStatus("idle");
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setStatus("error");
        setError("Unable to load weather right now.");
      }
    };

    loadWeather();
    return () => controller.abort();
  }, [location]);

  const activeSeason = getSeason(new Date().getMonth());
  const backgroundImage =
    theme === "dark"
      ? seasonalBackgroundsDark[activeSeason]
      : seasonalBackgrounds[activeSeason];
  const iconUrl = weather
    ? getWeatherIcon(weather.weatherCode, weather.isDay)
    : "/weather/sunny.png";
  const weatherLabel = error
    ? "Weather unavailable"
    : weather
    ? getWeatherLabel(weather.weatherCode)
    : "Fetching current conditions...";
  const temperatureDisplay = weather
    ? formatTemperature(weather.temperature)
    : `--${DEGREE_SYMBOL}C`;
  const feelsLikeDisplay = weather
    ? formatTemperature(weather.feelsLike)
    : `--${DEGREE_SYMBOL}C`;
  const precipitationDisplay = weather
    ? `${weather.precipitation.toFixed(1)} mm`
    : "--";
  const windDisplay = weather
    ? `${Math.round(weather.windspeed)} km/h`
    : "-- km/h";

  return (
    <div className="xl:pt-2 2xl:pt-6 text-foreground">
      <div className="flex items-center justify-between xl:pb-3 2xl:pb-4">
        <div>
          <h3 className="font-semibold xl:text-lg 2xl:text-xl">Weather</h3>
        </div>
      </div>
      <div
        className="relative text-foreground flex flex-col justify-top shadow-md xl:h-64 2xl:h-80 bg-cover bg-bottom bg-no-repeat xl:p-4 2xl:p-6 xl:rounded-xl 2xl:rounded-2xl"
        style={{ backgroundImage }}
      >
        {status === "loading" && !weather && (
          <div className="absolute inset-0 rounded-xl bg-card/90 flex flex-col items-center justify-center gap-2">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-primary" />
            <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/80">
              Loading weather
            </p>
          </div>
        )}
        <div className="absolute selecet-none pointer-events-none xl:top-3 xl:left-3 2xl:top-4 2xl:left-4 xl:rounded-xl 2xl:rounded-2xl xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 bg-card grid place-items-center">
          <Image
            src={iconUrl}
            width={100}
            height={100}
            alt={weatherLabel}
            className="xl:w-8 xl:h-8 2xl:w-10 2xl:h-10 pointer-events-none"
          />
        </div>

        <p className="text-right xl:text-4xl 2xl:text-5xl font-bold xl:mb-3">
          {temperatureDisplay}
        </p>
        <p className="text-right xl:text-sm 2xl:text-base uppercase tracking-[0.5em] text-muted-foreground/70">
          {weatherLabel}
        </p>
        {error && (
          <p className="text-right text-xs text-red-500/90 mt-1">{error}</p>
        )}

        <div className="flex items-center xl:gap-4 2xl:gap-6 mt-auto">
          <div>
            <div className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/70 mb-1">
              Feels like
            </div>
            <div className="font-semibold xl:text-xs 2xl:text-base">
              {feelsLikeDisplay}
            </div>
          </div>
          <div>
            <div className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/70 mb-1">
              Wind
            </div>
            <div className="font-semibold xl:text-xs 2xl:text-base flex items-center gap-1">
              <span className="whitespace-nowrap">{windDisplay}</span>
            </div>
          </div>
          <div>
            <div className="xl:text-xs 2xl:text-sm text-yellow-soft-foreground/70 mb-1">
              Precipitation
            </div>
            <div className="font-semibold xl:text-xs 2xl:text-base">
              {precipitationDisplay}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
