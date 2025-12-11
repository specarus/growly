"use client";

import { useEffect, useRef } from "react";
import { Check, Flame, LifeBuoy, Plus } from "lucide-react";

import QuantityMenu from "./quantity-menu";
import type { Habit, MenuPosition, RescueWindow } from "../types";

type Props = {
  habit: Habit;
  focusLabel: string;
  streakValue: number;
  displayCompletion: number;
  isSelected: boolean;
  loggedLabel: string;
  isComplete: boolean;
  rescueWindow?: RescueWindow | null;
  quickRescueAmount: number;
  showRescueNudge: boolean;
  customQuantity: string;
  quantityMenuOpenId: string | null;
  menuPosition: MenuPosition | null;
  menuWidth: number;
  registerAnchor: (node: HTMLDivElement | null) => void;
  registerMenu: (node: HTMLDivElement | null) => void;
  onHover: (id: string) => void;
  onNavigate: (id: string) => void;
  onToggleMenu: (habitId: string, anchor: HTMLDivElement | null) => void;
  onCustomQuantityChange: (habitId: string, value: string) => void;
  onAddQuantity: (habitId: string, amount: number) => void;
  onReset: (habitId: string) => void;
};

const HabitRow: React.FC<Props> = ({
  habit,
  focusLabel,
  streakValue,
  displayCompletion,
  isSelected,
  loggedLabel,
  isComplete,
  rescueWindow,
  quickRescueAmount,
  showRescueNudge,
  customQuantity,
  quantityMenuOpenId,
  menuPosition,
  menuWidth,
  registerAnchor,
  registerMenu,
  onHover,
  onNavigate,
  onToggleMenu,
  onCustomQuantityChange,
  onAddQuantity,
  onReset,
}) => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const isMenuOpen = quantityMenuOpenId === habit.id;
  const shouldShowRescue = rescueWindow && showRescueNudge;

  useEffect(() => {
    if (isMenuOpen) {
      registerAnchor(anchorRef.current);
    }
  }, [isMenuOpen, registerAnchor]);

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => onHover(habit.id)}
      onClick={() => onNavigate(habit.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onNavigate(habit.id);
        }
      }}
      className={`grid gap-1 w-full text-left grid-cols-6 lg:px-3 xl:px-4 lg:py-2 xl:py-3 items-center lg:text-[11px] xl:text-xs 2xl:text-sm transition ${
        isSelected ? "bg-primary/5" : "bg-white/60 hover:bg-primary/5"
      }`}
    >
      <div className="col-span-2 space-y-1">
        <div className="font-semibold text-foreground">{habit.name}</div>
        <div className="space-y-1">
          <div className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
            {focusLabel}
          </div>
          <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-primary">
            {loggedLabel}
          </p>
          {shouldShowRescue && rescueWindow && (
            <button
              type="button"
              className="group inline-flex w-full flex-wrap items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 lg:px-2 xl:px-3 lg:py-1 xl:py-1.5 shadow-sm transition hover:border-primary/70 hover:bg-primary/10"
              onClick={(event) => {
                event.stopPropagation();
                onCustomQuantityChange(habit.id, quickRescueAmount.toString());
                onToggleMenu(habit.id, anchorRef.current);
              }}
            >
              <span className="inline-flex items-center gap-1.5 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-primary">
                <LifeBuoy className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                Rescue now
              </span>
              <span className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
                You often save this at {rescueWindow.label}. Want a quick win?
              </span>
            </button>
          )}
        </div>
      </div>
      <div className="text-muted-foreground">{habit.cadence}</div>
      <div className="flex items-center lg:gap-1.5 xl:gap-2">
        <Flame className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-primary" />
        <span className="font-semibold">{streakValue}d</span>
      </div>
      <div className="col-span-2 flex items-center justify-between">
        <div className="flex items-center">
          {isComplete ? (
            <span className="flex items-center gap-1 lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold text-emerald-500">
              <Check className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
              <p>Completed</p>
            </span>
          ) : (
            <div className="flex items-center lg:gap-2 lxl:gap-3">
              <div className="lg:w-16 xl:w-24 lg:h-1 xl:h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-primary to-coral"
                  style={{
                    width: `${displayCompletion}%`,
                  }}
                />
              </div>
              <span className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold">
                {displayCompletion}%
              </span>
            </div>
          )}
        </div>
        <div className="relative" ref={anchorRef}>
          <button
            type="button"
            className="flex lg:h-6 xl:h-8 lg:w-6 xl:w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-primary shadow-sm transition hover:border-primary/70"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
            onClick={(event) => {
              event.stopPropagation();
              onToggleMenu(habit.id, anchorRef.current);
            }}
          >
            <Plus className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
          </button>
          <QuantityMenu
            habitId={habit.id}
            isOpen={isMenuOpen}
            customValue={customQuantity}
            onCustomValueChange={onCustomQuantityChange}
            onAdd={onAddQuantity}
            onReset={onReset}
            menuPosition={menuPosition}
            menuWidth={menuWidth}
            registerMenu={registerMenu}
          />
        </div>
      </div>
    </div>
  );
};

export default HabitRow;
