"use client";

import React, { useEffect, useRef, useState } from "react";

interface TimeInputProps {
  time: string;
  onChange: (value: string) => void;
}

const padTwo = (value: number) => String(value).padStart(2, "0");

const parseTimeParts = (value?: string | null) => {
  if (!value) {
    return { hours: 12, minutes: 0 };
  }
  const [hourText = "0", minuteText = "0"] = value.split(":");
  const parsedHour = Number.parseInt(hourText, 10);
  const parsedMinute = Number.parseInt(minuteText, 10);

  const normalize = (num: number, modulus: number) =>
    ((Math.floor(num) % modulus) + modulus) % modulus;

  const hours = Number.isFinite(parsedHour) ? normalize(parsedHour, 24) : 12;
  const minutes = Number.isFinite(parsedMinute)
    ? normalize(parsedMinute, 60)
    : 0;

  return { hours, minutes };
};

const normalizeHour24Value = (value: number) => ((value % 24) + 24) % 24;

const parseHourInputValue = (value: string) => {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed)) return null;
  return normalizeHour24Value(parsed);
};

const parseMinuteInputValue = (value: string) => {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(Math.max(parsed, 0), 59);
};

const determineMeridiemFromRawHour = (raw: number) => {
  if (!Number.isFinite(raw)) {
    return undefined;
  }
  if (raw === 0 || raw % 24 === 0) {
    return "AM";
  }
  if (raw >= 13 && raw < 24) {
    return "PM";
  }
  if (raw > 24) {
    const normalized = normalizeHour24Value(raw);
    return normalized >= 12 ? "PM" : "AM";
  }
  return undefined;
};

const buildTimeFrom24HourParts = (hour: number, minute: number) =>
  `${padTwo(hour)}:${padTwo(minute)}`;

const TimeInput: React.FC<TimeInputProps> = ({ time, onChange }) => {
  const appliedTimeRef = useRef<string | null>(null);
  const [hourInput, setHourInput] = useState("");
  const [minuteInput, setMinuteInput] = useState("");
  const [meridiem, setMeridiem] = useState<"AM" | "PM">("AM");

  useEffect(() => {
    if (appliedTimeRef.current === time) {
      return;
    }
    appliedTimeRef.current = time;

    if (!time) {
      setHourInput("");
      setMinuteInput("");
      setMeridiem("AM");
      return;
    }
    const { hours, minutes } = parseTimeParts(time);
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    setHourInput(String(hour12).padStart(2, "0"));
    setMinuteInput(String(minutes).padStart(2, "0"));
    setMeridiem(hours >= 12 ? "PM" : "AM");
  }, [time]);

  const emitIfReady = (nextHour: number | null, nextMinute: number | null) => {
    if (nextHour === null || nextMinute === null) {
      if (nextHour === null && nextMinute === null) {
        appliedTimeRef.current = "";
        onChange("");
      }
      return;
    }
    const nextTime = buildTimeFrom24HourParts(nextHour, nextMinute);
    appliedTimeRef.current = nextTime;
    onChange(nextTime);
  };

  const handleHourInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const numericValue = event.target.value.replace(/\D/g, "").slice(0, 2);
    setHourInput(numericValue);
    const parsedHour = parseHourInputValue(numericValue);
    const rawHour = Number.parseInt(numericValue, 10);
    const autoMeridiem = determineMeridiemFromRawHour(rawHour);
    if (autoMeridiem) {
      setMeridiem(autoMeridiem);
    }
    emitIfReady(parsedHour, parseMinuteInputValue(minuteInput));
  };

  const handleMinuteInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const numericValue = event.target.value.replace(/\D/g, "").slice(0, 2);
    setMinuteInput(numericValue);
    emitIfReady(
      parseHourInputValue(hourInput),
      parseMinuteInputValue(numericValue)
    );
  };

  const handleMeridiemChange = (value: "AM" | "PM") => {
    setMeridiem(value);
    const sourceTime = appliedTimeRef.current || time;
    const { hours, minutes } = parseTimeParts(sourceTime);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return;
    }
    const baseHour = hours % 12;
    const nextHour = value === "PM" ? baseHour + 12 : baseHour;
    const nextTime = buildTimeFrom24HourParts(nextHour, minutes);
    appliedTimeRef.current = nextTime;
    onChange(nextTime);
  };

  return (
    <div className="lg:space-y-1 xl:space-y-2">
      <div className="flex items-start lg:gap-2 xl:gap-3 2xl:gap-4">
        <div className="space-y-1 text-center">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={hourInput}
            onChange={handleHourInputChange}
            placeholder="--"
            aria-label="Hour"
            className="lg:h-10 lg:w-16 xl:h-12 xl:w-18 2xl:h-14 2xl:w-20 lg:rounded-lg xl:rounded-2xl border border-gray-100 shadow-inner text-center lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          />
          <p className="lg:text-[7px] xl:text-[9px] 2xl:text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Hour
          </p>
        </div>
        <span className="lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-muted-foreground lg:pt-1 xl:pt-2 2xl:pt-3">
          :
        </span>
        <div className="space-y-1 text-center">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={minuteInput}
            onChange={handleMinuteInputChange}
            placeholder="--"
            aria-label="Minute"
            className="lg:h-10 lg:w-16 xl:h-12 xl:w-18 2xl:h-14 2xl:w-20 lg:rounded-xl xl:rounded-2xl border border-gray-100 shadow-inner text-center xl:text-xl 2xl:text-2xl font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          />
          <p className="lg:text-[7px] xl:text-[9px] 2xl:text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Minute
          </p>
        </div>
        <div className="grid lg:h-10 lg:w-10 xl:h-14 xl:w-14 2xl:h-18 2xl:w-18 grid-rows-2 overflow-hidden lg:rounded-xl xl:rounded-2xl border border-gray-100 lg:text-[9px] xl:text-[11px] 2xl:text-sm font-semibold">
          {(["AM", "PM"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleMeridiemChange(option)}
              className={`flex h-full items-center justify-center uppercase tracking-[0.2em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                option === "AM" ? "border-b border-gray-200" : ""
              } ${
                meridiem === option
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeInput;
