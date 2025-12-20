"use client";

import Portal from "./portal";
import type { MenuPosition } from "../types";

type Props = {
  habitId: string;
  isOpen: boolean;
  customValue: string;
  onCustomValueChange: (habitId: string, value: string) => void;
  onAdd: (habitId: string, amount: number) => void;
  onReset: (habitId: string) => void;
  menuPosition: MenuPosition | null;
  menuWidth: number;
  registerMenu: (node: HTMLDivElement | null) => void;
};

const QuantityMenu: React.FC<Props> = ({
  habitId,
  isOpen,
  customValue,
  onCustomValueChange,
  onAdd,
  onReset,
  menuPosition,
  menuWidth,
  registerMenu,
}) => {
  if (!isOpen || !menuPosition) {
    return null;
  }

  return (
    <Portal>
      <div
        ref={registerMenu}
        className="max-w-full lg:rounded-xl xl:rounded-2xl border border-gray-100 bg-white lg:p-2 xl:p-3 shadow-lg"
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          position: "absolute",
          top: menuPosition.top,
          left: menuPosition.left,
          width: menuWidth,
          zIndex: 1100,
        }}
      >
        <p className="lg:text-[9px] xl:text-[11px] lg:mb-0.5 xl:mb-1 font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Add quantity
        </p>
        <div className="space-y-1">
          <div className="flex items-center lg:gap-1.5 xl:gap-2">
            <input
              id={`custom-quantity-${habitId}`}
              type="number"
              min="0"
              step="0.1"
              className="w-full rounded-2xl border border-gray-100 lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[10px] xl:text-xs outline-none focus:border-primary"
              value={customValue}
              onChange={(event) => {
                event.stopPropagation();
                onCustomValueChange(habitId, event.target.value);
              }}
              onClick={(event) => event.stopPropagation()}
            />
            <button
              type="button"
              className="rounded-2xl border border-primary/60 bg-primary/5 lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[10px] xl:text-xs font-semibold text-primary transition hover:border-primary"
              onClick={(event) => {
                event.stopPropagation();
                const value = Number.parseFloat(customValue);
                if (Number.isFinite(value) && value > 0) {
                  onAdd(habitId, value);
                }
              }}
            >
              Add
            </button>
          </div>
          <button
            type="button"
            className="w-full rounded-full border border-muted/40 bg-muted/10 lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[10px] xl:text-xs font-semibold text-muted-foreground transition hover:border-muted hover:bg-white dark:border-muted/60 dark:bg-muted/20 dark:text-muted-foreground/80 dark:hover:border-muted/40 dark:hover:bg-white/10"
            onClick={(event) => {
              event.stopPropagation();
              onReset(habitId);
            }}
          >
            Reset progress
          </button>
        </div>
      </div>
    </Portal>
  );
};

export default QuantityMenu;
