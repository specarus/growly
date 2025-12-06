export type XPActivitySource = "todo" | "habit" | "level";

export interface XPActivityEntry {
  id: string;
  source: XPActivitySource;
  label: string;
  xp: number;
  timestamp: string;
  detail?: string;
}
