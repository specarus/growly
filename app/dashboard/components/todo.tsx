"use client";

import Link from "next/link";
import type { FC } from "react";
import { useRef } from "react";
import {
  Check,
  Clock,
  icons,
  LucideIcon,
  MapPin,
  Sparkles,
} from "lucide-react";

export interface TodoItem {
  id: string;
  title: string;
  time: string;
  location: string;
  iconKey: string;
  completed: boolean;
  iconColor: string;
  statusLabel: string;
  statusColor: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "MISSED";
}

interface TodoProps {
  todo: TodoItem;
  href?: string;
  onComplete?: (id: string, origin?: HTMLElement) => void;
  isCompleting?: boolean;
  disabled?: boolean;
}

interface CheckedBoxProps {
  checked: boolean;
  onClick?: (origin?: HTMLElement) => void;
  disabled?: boolean;
}

const CheckedBox: FC<CheckedBoxProps> = ({ checked, onClick, disabled }) => {
  const ref = useRef<HTMLButtonElement | null>(null);

  return (
    <button
      ref={ref}
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled && onClick) {
          onClick(ref.current || undefined);
        }
      }}
      disabled={disabled}
      aria-label={checked ? "Completed" : "Mark complete"}
      className={`${
        checked
          ? "bg-green-soft border-green-soft"
          : "border-primary bg-transparent"
      } border shrink-0 lg:w-4 lg:h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 rounded-full grid place-items-center transition hover:scale-105 disabled:opacity-60`}
    >
      {checked ? (
        <Check className="lg:w-2 lg:h-2 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 text-white" />
      ) : (
        <span className="sr-only">Mark complete</span>
      )}
    </button>
  );
};

const Todo: FC<TodoProps> = ({
  todo,
  href,
  onComplete,
  isCompleting,
  disabled = false,
}) => {
  return (
    <div className="relative flex items-start bg-muted/20 lg:gap-2 xl:gap-3 select-none hover:opacity-80 border border-muted-foreground/5 lg:p-2 2xl:p-3 shadow-inner hover:shadow-none transition lg:rounded-xl xl:rounded-2xl">
      <Link
        href={href || "#"}
        className="flex items-start lg:gap-2 xl:gap-3 flex-1 min-w-0 group"
      >
        <div
          className="grid place-items-center lg:w-10 lg:h-10 xl:w-12 xl:h-12 lg:rounded-sm xl:rounded-lg 2xl:rounded-xl shrink-0 border border-white shadow-sm"
          style={{ backgroundColor: todo.iconColor || "#E5E7EB" }}
        >
          {(() => {
            const IconComp =
              (icons as Record<string, LucideIcon>)[todo.iconKey] || Sparkles;
            return (
              <IconComp className="lg:w-4 xl:w-5 lg:h-4 xl:h-5 text-slate-500" />
            );
          })()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="relative mb-1">
            <div
              className={`font-medium lg:text-[11px] xl:text-[13px] 2xl:text-[15px] truncate transition-colors ${
                todo.completed || isCompleting
                  ? "text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {todo.title}
            </div>
            <span
              className={`pointer-events-none absolute left-0 right-0 top-1/2 h-0.5 origin-left rounded-full bg-muted-foreground transition-transform duration-300 ${
                todo.completed || isCompleting ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </div>

          <div className="flex items-center lg:gap-1 xl:gap-2 mb-1">
            <span
              className="inline-flex items-center gap-1 rounded-full lg:px-1 xl:px-2 xl:py-0.5 lg:text-[7px] xl:text-[10px] 2xl:text-[11px] font-semibold"
              style={{
                backgroundColor: `${todo.statusColor}20`,
                color: todo.statusColor,
              }}
            >
              <span
                className="lg:h-1 lg:w-1 xl:h-2 xl:w-2 rounded-full"
                style={{ backgroundColor: todo.statusColor }}
              />
              {todo.statusLabel}
            </span>
          </div>
          <div className="flex items-center lg:gap-1 xl:gap-2 2xl:gap-3 lg:text-[8px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
            <span className="flex items-center lg:gap-0.5 xl:gap-1 whitespace-nowrap">
              <Clock className="lg:w-2 lg:h-2 xl:w-3 xl:h-3 shrink-0 text-slate-500" />
              {todo.time}
            </span>
            <span className="flex items-center lg:gap-0.5 xl:gap-1 truncate">
              <MapPin className="lg:w-2 lg:h-2 xl:w-3 xl:h-3 shrink-0 text-red-400" />
              <span className="truncate">{todo.location}</span>
            </span>
          </div>
        </div>
      </Link>
      <CheckedBox
        checked={!!todo.completed || !!isCompleting}
        onClick={
          onComplete ? (origin) => onComplete(todo.id, origin) : undefined
        }
        disabled={disabled}
      />
      {isCompleting ? (
        <div
          className="absolute inset-0 lg:rounded-xl xl:rounded-2xl pointer-events-none"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
        />
      ) : null}
    </div>
  );
};

export default Todo;
