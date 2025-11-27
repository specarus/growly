"use client";

import type React from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const padTwo = (value: number) => String(value).padStart(2, "0");

const isoFromDate = (date: Date) =>
  `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(
    date.getDate()
  )}`;

const parseIsoDate = (value?: string | null) => {
  if (!value) return null;
  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);

  if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
    return new Date(year, month, day);
  }

  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const formatMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

interface CalendarDropdownProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const CalendarDropdown: React.FC<CalendarDropdownProps> = ({
  selectedDate,
  onSelect,
  onClose,
  anchorRef,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [viewDate, setViewDate] = useState(() => {
    const parsed = parseIsoDate(selectedDate);
    return parsed ?? new Date();
  });
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [dropDirection, setDropDirection] = useState<"down" | "up">("down");

  useEffect(() => {
    const parsed = parseIsoDate(selectedDate);
    setViewDate(parsed ?? new Date());
  }, [selectedDate]);

  useLayoutEffect(() => {
    const handleDismiss = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("mousedown", handleDismiss);
    document.addEventListener("touchstart", handleDismiss);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDismiss);
      document.removeEventListener("touchstart", handleDismiss);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [anchorRef, onClose]);

  useLayoutEffect(() => {
    const updateRect = () => {
      if (!anchorRef.current) {
        setAnchorRect(null);
        return;
      }
      setAnchorRect(anchorRef.current.getBoundingClientRect());
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!anchorRect) {
      return undefined;
    }
    const update = () => {
      if (!anchorRect) {
        return;
      }
      const panelHeight = panelRef.current?.getBoundingClientRect().height ?? 0;
      const spacing = 8;
      const spaceBelow = window.innerHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;
      if (spaceBelow >= panelHeight + spacing) {
        setDropDirection("down");
      } else if (spaceAbove >= panelHeight + spacing) {
        setDropDirection("up");
      } else {
        setDropDirection("down");
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorRect]);

  const weeks = useMemo(() => {
    const matrix: Array<Array<{ date: Date; inMonth: boolean }>> = [];
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    let dayCounter = 1 - startOffset;

    for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
      const week: Array<{ date: Date; inMonth: boolean }> = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
        const current = new Date(year, month, dayCounter);
        week.push({
          date: current,
          inMonth: current.getMonth() === month,
        });
        dayCounter += 1;
      }
      matrix.push(week);
    }
    return matrix;
  }, [viewDate]);

  const today = new Date();
  const selectedDateObj = parseIsoDate(selectedDate);

  const handleSelect = (date: Date) => {
    onSelect(isoFromDate(date));
    onClose();
  };

  const isClient = typeof window !== "undefined";
  const portalTarget = isClient ? document.body : null;
  const scrollY = isClient ? window.scrollY : 0;
  const scrollX = isClient ? window.scrollX : 0;
  const minWidth = anchorRect ? Math.max(anchorRect.width, 240) : undefined;

  if (!portalTarget || !anchorRect) {
    return null;
  }

  const panelHeight = panelRef.current?.getBoundingClientRect().height ?? 0;
  const spacing = 8;
  const top =
    dropDirection === "down"
      ? anchorRect.bottom + scrollY + spacing
      : anchorRect.top + scrollY - panelHeight - spacing;
  const left = anchorRect.left + scrollX;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      className="rounded-3xl border border-gray-100 bg-white xl:px-4 2xl:px-5 xl:py-3 2xl:py-4 shadow-xl max-w-sm"
      style={{
        position: "absolute",
        zIndex: 9999,
        top,
        left,
        minWidth,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="xl:text-base 2xl:text-lg font-semibold text-foreground">
            {formatMonthLabel(viewDate)}
          </h3>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between xl:text-[11px] 2xl:text-xs text-muted-foreground">
        <div className="flex items-center xl:gap-2 2xl:gap-3">
          <button
            type="button"
            onClick={() =>
              setViewDate(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
              )
            }
            className="rounded-2xl border border-gray-200 px-3 py-1 font-medium transition hover:border-primary/60"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() =>
              setViewDate(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
              )
            }
            className="rounded-2xl border border-gray-200 px-3 py-1 font-medium transition hover:border-primary/60"
          >
            Next
          </button>
        </div>
        <button
          type="button"
          onClick={() => setViewDate(new Date())}
          className="rounded-2xl border border-gray-200 px-3 py-1 font-medium transition hover:border-primary/60"
        >
          Today
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 xl:gap-1 2xl:gap-2 xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        {WEEK_DAYS.map((day) => (
          <span key={day} className="text-center">
            {day}
          </span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 xl:gap-1 xl:text-[11px] 2xl:text-xs">
        {weeks.map((week, weekIndex) =>
          week.map(({ date, inMonth }) => {
            const iso = date.toISOString().slice(0, 10);
            const isSelected =
              selectedDateObj !== null && isSameDay(date, selectedDateObj);
            const isToday = isSameDay(date, today);
            return (
              <button
                key={`${weekIndex}-${iso}`}
                type="button"
                onClick={() => handleSelect(date)}
                className={`xl:h-7 xl:w-7 2xl:h-8 2xl:w-8 rounded-full text-center xl:text-[11px] 2xl:text-xs font-semibold transition ${
                  inMonth ? "text-foreground" : "text-muted-foreground"
                } ${
                  isSelected
                    ? "bg-primary text-white shadow-sm"
                    : "hover:bg-primary/10"
                } ${isToday ? "border border-primary/40" : ""}`}
              >
                {date.getDate()}
              </button>
            );
          })
        )}
      </div>
    </div>,
    portalTarget
  );
};

export default CalendarDropdown;
