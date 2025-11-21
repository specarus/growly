export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import HabitCreatePage from "../../create/habit-create-page";
import { auth } from "@/lib/auth";

const habitPresets: Record<
  string,
  {
    name: string;
    description: string;
    cadence: "Daily" | "Weekly" | "Monthly";
    startDate: string;
    timeOfDay: string;
    reminder: string;
  }
> = {
  "morning-mobility": {
    name: "Morning mobility",
    description: "3 rounds of mobility + 10 push-ups to unlock the day.",
    cadence: "Daily",
    startDate: "2024-01-02",
    timeOfDay: "07:00",
    reminder: "15 minutes before",
  },
  "hydrate-3l": {
    name: "Hydrate 3L",
    description: "Fill two 1L bottles at night; sip one before noon.",
    cadence: "Daily",
    startDate: "2024-01-05",
    timeOfDay: "08:00",
    reminder: "30 minutes before",
  },
  "strength-training": {
    name: "Strength training",
    description: "Full-body sets. Adjust to 20-minute minimum on busy days.",
    cadence: "Weekly",
    startDate: "2024-01-07",
    timeOfDay: "18:00",
    reminder: "1 hour before",
  },
  "reading-20m": {
    name: "Reading (20m)",
    description: "Read 20 minutes before bed; leave book on pillow.",
    cadence: "Daily",
    startDate: "2024-01-03",
    timeOfDay: "21:30",
    reminder: "30 minutes before",
  },
  "walk-after-lunch": {
    name: "Walk after lunch",
    description: "15-20 minute walk after the first bite to reset energy.",
    cadence: "Weekly",
    startDate: "2024-01-08",
    timeOfDay: "13:00",
    reminder: "15 minutes before",
  },
  "low-screen-mornings": {
    name: "Low screen mornings",
    description: "No phone until after breakfast and movement block.",
    cadence: "Daily",
    startDate: "2024-01-10",
    timeOfDay: "06:30",
    reminder: "No reminder",
  },
};

export default async function EditHabit({ params }: { params: { id: string } }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const initialHabit = habitPresets[params.id];

  return <HabitCreatePage mode="edit" initialHabit={initialHabit} />;
}
