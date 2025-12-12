export type BadgeTier = {
  level: number;
  stage: string;
  label: string;
  className: string;
};

export const BADGE_TIERS: BadgeTier[] = [
  {
    level: 200,
    stage: "Ascendant",
    label: "Ascendant Wayfinder",
    className:
      "bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 text-white",
  },
  {
    level: 150,
    stage: "Celestial",
    label: "Celestial Voyager",
    className:
      "bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 text-white",
  },
  {
    level: 100,
    stage: "Legend",
    label: "Legendary Explorer",
    className:
      "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-white",
  },
  {
    level: 75,
    stage: "Mythic",
    label: "Mythic Navigator",
    className:
      "bg-gradient-to-r from-fuchsia-400 via-fuchsia-500 to-fuchsia-600 text-white",
  },
  {
    level: 50,
    stage: "Diamond",
    label: "Diamond Pathmaker",
    className:
      "bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-white",
  },
  {
    level: 25,
    stage: "Gold",
    label: "Gold Trailblazer",
    className:
      "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white",
  },
  {
    level: 10,
    stage: "Silver",
    label: "Silver Strider",
    className: "bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900",
  },
  {
    level: 5,
    stage: "Bronze",
    label: "Bronze Beginner",
    className: "bg-gradient-to-r from-amber-200 to-amber-300 text-amber-900",
  },
];
