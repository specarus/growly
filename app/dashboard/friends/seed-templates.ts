export type SeedFriendTemplate = {
  id: string;
  name: string;
  username?: string;
  location: string;
  focus: string;
  headline: string;
  likedHabitIds: string[];
  xp: number;
  streakDays: number;
  badges: string[];
  vibe: string;
  privateAccount?: boolean;
  friendsInCommon?: number;
};

export const seedTemplates: SeedFriendTemplate[] = [
  {
    id: "seed-sofia-lane",
    name: "Sofia Lane",
    username: "sofialane12",
    location: "Portugal",
    focus: "Morning energy",
    headline: "Sunrise rituals and light cardio keep her charged.",
    likedHabitIds: [
      "sunrise-clarity-loop",
      "focused-launch-routine",
      "midday-oasis-pause",
    ],
    xp: 840,
    streakDays: 9,
    badges: ["AM crew", "Shares playbooks"],
    vibe: "Keeps teammates honest at dawn.",
  },
  {
    id: "seed-casey-ray",
    name: "Casey Ray",
    username: "caseyray07",
    location: "United States",
    focus: "Focus & recovery",
    headline: "Alternates deep work sprints with a nightly detox.",
    likedHabitIds: [
      "focused-launch-routine",
      "evening-detox-ritual",
      "weekend-reset-rhythm",
    ],
    xp: 1025,
    streakDays: 11,
    badges: ["Deep work", "Night owl"],
    vibe: "Protects calendar blocks like a hawk.",
  },
  {
    id: "seed-jordan-park",
    name: "Jordan Park",
    username: "jordanpark19",
    location: "South Korea",
    focus: "Movement & team accountability",
    headline: "Stacks micro-movement with squad step syncs.",
    likedHabitIds: [
      "micro-movement-circuit",
      "team-step-sync",
      "midday-oasis-pause",
    ],
    xp: 720,
    streakDays: 7,
    badges: ["Team builder", "Streak safe"],
    vibe: "Always brings a fresh playlist.",
  },
  {
    id: "seed-ari-woods",
    name: "Ari Woods",
    username: "ariwoods23",
    location: "Canada",
    focus: "Evening calm",
    headline: "Wind-down guardrails and gratitude journaling.",
    likedHabitIds: [
      "evening-detox-ritual",
      "sunrise-clarity-loop",
      "weekend-reset-rhythm",
    ],
    xp: 610,
    streakDays: 5,
    badges: ["Recovery", "Journals daily"],
    vibe: "Responds with calm reminders before bedtime.",
  },
];
