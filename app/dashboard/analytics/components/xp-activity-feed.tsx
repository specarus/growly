"use client";

import {
  ChevronDown,
  Flame,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useXP } from "@/app/context/xp-context";
import type { XPActivitySource } from "@/types/xp";

const iconMeta: Record<
  XPActivitySource,
  { Icon: LucideIcon; color: string; bg: string }
> = {
  todo: {
    Icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  habit: {
    Icon: Flame,
    color: "text-amber-500",
    bg: "bg-orange-100",
  },
  level: {
    Icon: Trophy,
    color: "text-amber-500",
    bg: "bg-amber-100",
  },
};

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const XPActivityFeed: React.FC = () => {
  const { activityLog } = useXP();
  const [open, setOpen] = useState(false);

  const entries = useMemo(
    () =>
      activityLog.map((entry) => ({
        ...entry,
        xpLabel: entry.xp >= 0 ? `+${entry.xp}` : `${entry.xp}`,
        timestampLabel: formatTimestamp(entry.timestamp),
      })),
    [activityLog]
  );

  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-inner p-3">
      <button
        type="button"
        className="flex items-center justify-between w-full gap-3 text-left"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-primary">
            XP log
          </p>
          <h3 className="text-base font-semibold leading-tight">Recent gains</h3>
          <p className="text-[10px] text-muted-foreground">
            Todos, habits, and level-ups powering your score.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`mt-3 space-y-2 transition-all duration-200 ease-out overflow-hidden ${
          open ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-muted/60 bg-muted/10 px-3 py-3 text-[11px] text-muted-foreground text-center">
            Complete a todo or habit to seed this log.
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const meta = iconMeta[entry.source] ?? iconMeta.todo;
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-2 py-2 text-sm"
                >
                  <div
                    className={`${meta.bg} h-8 w-8 flex items-center justify-center rounded-xl border border-gray-100`}
                  >
                    <meta.Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {entry.label}
                    </p>
                    {entry.detail ? (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {entry.detail}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-0.5 min-w-[58px] text-[10px]">
                    <p
                      className={`font-semibold text-xs ${
                        entry.xp >= 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {entry.xpLabel}
                    </p>
                    <p className="text-muted-foreground">
                      {entry.timestampLabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default XPActivityFeed;
