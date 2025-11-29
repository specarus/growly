"use client";

import type { CSSProperties } from "react";

type PositionValue = number | string;

export type GradientCircleProps = {
  /** Diameter of the circle (accepts px value or raw CSS size string). */
  size?: number | string;
  /** The color used at the center of the gradient. */
  color?: string;
  /** The color used at the edge of the gradient. */
  fadeColor?: string;
  /** Additional classes for positioning or layering. */
  className?: string;
  /** Explicit inset coordinates controlling placement. */
  position?: {
    top?: PositionValue;
    right?: PositionValue;
    bottom?: PositionValue;
    left?: PositionValue;
  };
  /** Extra inline styles (e.g., zIndex, transform). */
  style?: CSSProperties;
};

const DEFAULT_SIZE = 120;
const DEFAULT_COLOR = "rgba(240,144,41,0.45)";
const DEFAULT_FADE_COLOR = "rgba(240,144,41,0)";

const resolveSize = (size?: number | string) =>
  typeof size === "number" ? `${size}px` : size?.trim() || "0px";

export default function GradientCircle({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  fadeColor = DEFAULT_FADE_COLOR,
  className = "",
  position,
  style,
}: GradientCircleProps) {
  const resolvedSize = resolveSize(size);
  const computedPosition: CSSProperties = {
    top: position?.top ?? undefined,
    right: position?.right ?? undefined,
    bottom: position?.bottom ?? undefined,
    left: position?.left ?? undefined,
  };

  return (
    <div
      className={`pointer-events-none absolute rounded-full ${className}`.trim()}
      style={{
        width: resolvedSize,
        height: resolvedSize,
        background: `radial-gradient(circle, ${color} 0%, ${fadeColor} 70%)`,
        ...computedPosition,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
