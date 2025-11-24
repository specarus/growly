import type { Status, Priority } from "./types";

export const statusColors: Record<Status, string> = {
  Planned: "#6366F1",
  "In Progress": "#F59E0B",
  Completed: "#10B981",
  Missed: "#EF4444",
};

export const priorityDots: Record<Priority, string> = {
  Low: "bg-muted",
  Medium: "bg-yellow-soft",
  High: "bg-primary",
  Critical: "bg-primary",
};
