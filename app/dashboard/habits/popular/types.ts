export type Category =
  | "Movement"
  | "Energy"
  | "Focus"
  | "Recovery"
  | "Mindset"
  | "Health";

export type Commitment = "Quick" | "Standard" | "Deep";
export type TimeWindow = "Anytime" | "Morning" | "Workday" | "Evening";

export type PopularPost = {
  id: string;
  title: string;
  summary: string | null;
  category: Category;
  cadence: string;
  timeWindow: TimeWindow;
  commitment: Commitment;
  anchor: string;
  duration: string;
  highlight: string;
  benefits: string[];
  steps: string[];
  guardrails: string[];
  createdAt: string;
  userName: string | null;
  habitName: string | null;
  likesCount: number;
  likedByCurrentUser: boolean;
  isCommunityPost: boolean;
};

export const categories: Category[] = [
  "Movement",
  "Energy",
  "Focus",
  "Recovery",
  "Mindset",
  "Health",
];

export const timeFilters: { value: TimeWindow | "Any"; label: string }[] = [
  { value: "Any", label: "Anytime" },
  { value: "Morning", label: "Morning" },
  { value: "Workday", label: "Workday" },
  { value: "Evening", label: "Evening" },
];

export const commitmentCopy: Record<Commitment, string> = {
  Quick: "10 minutes or less",
  Standard: "15-45 minutes",
  Deep: "60-90 minutes",
};
