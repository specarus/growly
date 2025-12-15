"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import { useTheme } from "@/app/context/theme-context";

const SNOWFLAKE_COUNT = 38;

type Snowflake = {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
  sway: number;
  opacity: number;
};

const createSnowflakes = (): Snowflake[] =>
  Array.from({ length: SNOWFLAKE_COUNT }, (_, index) => ({
    id: index,
    size: 3 + Math.random() * 5,
    left: Math.random() * 100,
    delay: -Math.random() * 15,
    duration: 10 + Math.random() * 12,
    sway: 15 + Math.random() * 70,
    opacity: 0.4 + Math.random() * 0.4,
  }));

export default function Snowfall() {
  const { theme } = useTheme();
  const [flakes, setFlakes] = useState<Snowflake[]>([]);
  const snowColor = theme === "dark" ? "#ffffff" : "#7db9ff";

  useEffect(() => {
    setFlakes(createSnowflakes());
  }, []);

  return (
    <div className="snowfall-layer" aria-hidden="true">
      {flakes.map((flake) => {
        const style: CSSProperties & {
          "--sway": string;
          "--flake-opacity": number;
        } = {
          left: `${flake.left}%`,
          width: `${flake.size}px`,
          height: `${flake.size}px`,
          animationDuration: `${flake.duration}s`,
          animationDelay: `${flake.delay}s`,
          backgroundColor: snowColor,
          boxShadow: `0 0 ${Math.max(4, flake.size)}px ${snowColor}`,
          "--sway": `${flake.sway}px`,
          "--flake-opacity": flake.opacity,
        };

        return <span key={flake.id} className="snowflake" style={style} />;
      })}
    </div>
  );
}
