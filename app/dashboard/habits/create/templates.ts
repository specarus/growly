import { Cadence, UnitCategory } from "./types";

type HabitTemplate = {
  title: string;
  description: string;
  cadence: Cadence;
  trigger: string;
  goalAmount: string;
  goalUnit: string;
  goalUnitCategory: UnitCategory;
  startDate: string;
  timeOfDay: string;
  reminder: string;
};

export const buildTemplates = (today: string): HabitTemplate[] => [
  {
    title: "Hydrate & Thrive",
    description:
      "1.5L water before lunch keeps energy steady and reduces decision fatigue.",
    cadence: "Daily",
    trigger: "Fill two bottles in the morning",
    goalAmount: "1500",
    goalUnit: "ml",
    goalUnitCategory: "Quantity",
    startDate: today,
    timeOfDay: "08:00",
    reminder: "15 minutes before",
  },
  {
    title: "Micro mobility",
    description:
      "7 minutes of targeted mobility after waking keeps joints loose and posture upright.",
    cadence: "Daily",
    trigger: "Post-coffee stretch",
    goalAmount: "7",
    goalUnit: "minutes",
    goalUnitCategory: "Time",
    startDate: today,
    timeOfDay: "06:30",
    reminder: "5 minutes before",
  },
  {
    title: "Focus sprint",
    description:
      "60 minutes of focused work blocks each week protected from notifications.",
    cadence: "Weekly",
    trigger: "Calendar deep work block",
    goalAmount: "60",
    goalUnit: "minutes",
    goalUnitCategory: "Time",
    startDate: today,
    timeOfDay: "09:00",
    reminder: "30 minutes before",
  },
];
