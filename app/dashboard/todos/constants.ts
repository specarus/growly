import type { Status, Priority } from "./types";

export const statusStyles: Record<Status, string> = {
  Planned: "bg-muted text-background",
  "In Progress": "bg-yellow-soft text-background",
  Completed: "bg-green-soft text-background",
  Missed: "bg-coral text-background",
};

export const priorityDots: Record<Priority, string> = {
  Low: "bg-muted",
  Medium: "bg-yellow-soft",
  High: "bg-primary",
  Critical: "bg-primary",
};
