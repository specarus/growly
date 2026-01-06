import type { BadgeTier } from "@/lib/badges";

export type AccountBadgeStatus = {
  stage: string;
  level: number;
  label: string;
  className: string;
  achieved: boolean;
  xpNeeded: number;
  levelsAway: number;
};

export type AccountAnalytics = {
  stats: { label: string; value: string; tone: string }[];
  level: number;
  badgeCurrent: BadgeTier | null;
  badgeNext: BadgeTier | null;
  progressToNextBadge: number;
  badgeStatuses: AccountBadgeStatus[];
};
