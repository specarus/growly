"use client";

import type { PlaybookItem } from "../types";
import { iconMap } from "../constants";

type Props = {
  items: PlaybookItem[];
};

const HabitPlaybook: React.FC<Props> = ({ items }) => {
  return (
    <div className="relative lg:space-y-4 xl:space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="lg:text-[11px] xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Playbook
          </p>
          <h2 className="lg:text-base xl:text-lg 2xl:text-xl font-semibold">
            Protect the streaks
          </h2>
          <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
            Guardrails, rescues, and weekly reviews that protect every streak.
          </p>
        </div>
      </div>

      <div className="lg:space-y-2 xl:space-y-3">
        {items.map((item, index) => {
          const Icon = iconMap[item.icon];
          return (
            <div
              key={`${item.title}-${index}`}
              className="relative lg:rounded-xl xl:rounded-2xl border border-gray-50 bg-white lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:space-y-1 xl:space-y-2 shadow-inner shadow-black/10"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`inline-flex items-center lg:gap-1.5 xl:gap-2 rounded-full lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[8px] xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.12em] ${item.accent}`}
                >
                  <Icon className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                  <span>{item.label}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="space-y-1">
                  <p className="font-semibold lg:text-sm xl:text-base">
                    {item.title}
                  </p>
                  <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground leading-relaxed">
                    {item.detail}
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold rounded-full bg-muted lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 text-muted-foreground">
                    <span className="lg:h-1 lg:w-1 xl:h-1.5 xl:w-1.5 rounded-full bg-primary" />
                    {item.meta}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitPlaybook;
