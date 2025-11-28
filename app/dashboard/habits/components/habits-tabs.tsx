"use client";

import Link from "next/link";

export type HabitsTabKey = "habits" | "routines" | "popular";

type TabDefinition = {
  key: HabitsTabKey;
  label: string;
  href: string;
};

const tabDefinitions: TabDefinition[] = [
  { key: "habits", label: "Habits", href: "/dashboard/habits" },
  { key: "routines", label: "Routines", href: "/dashboard/habits/routines" },
  { key: "popular", label: "Popular", href: "/dashboard/habits/popular" },
];

const baseContainerClassName =
  "inline-flex items-center gap-2 p-2 rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden xl:text-xs 2xl:text-sm";
const baseTabClassName =
  "px-4 py-2 font-semibold transition whitespace-nowrap rounded-full";
const baseActiveTabClassName = "bg-primary text-white";
const baseInactiveTabClassName = "text-muted-foreground hover:text-primary";

const joinClasses = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(" ");

type HabitsTabsProps = {
  active: HabitsTabKey;
  containerClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
};

export default function HabitsTabs({
  active,
  containerClassName,
  tabClassName,
  activeTabClassName,
  inactiveTabClassName,
}: HabitsTabsProps) {
  const containerClasses = joinClasses(
    baseContainerClassName,
    containerClassName
  );

  return (
    <div className={containerClasses}>
      {tabDefinitions.map((tab) => {
        const isActive = tab.key === active;
        const tabClasses = joinClasses(
          baseTabClassName,
          tabClassName,
          isActive
            ? activeTabClassName ?? baseActiveTabClassName
            : inactiveTabClassName ?? baseInactiveTabClassName
        );

        if (isActive) {
          return (
            <span key={tab.key} className={tabClasses} aria-current="page">
              {tab.label}
            </span>
          );
        }

        return (
          <Link key={tab.key} href={tab.href} className={tabClasses}>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
