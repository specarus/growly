export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import HabitsBoard from "./habits-board";
import { auth } from "@/lib/auth";

export default async function HabitsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const habits = [
    { id: "morning-mobility", name: "Morning mobility", cadence: "Daily", streak: 14, completion: 92, focus: "7:00a" },
    { id: "hydrate-3l", name: "Hydrate 3L", cadence: "Daily", streak: 9, completion: 85, focus: "All day" },
    { id: "strength-training", name: "Strength training", cadence: "Weekly x3", streak: 5, completion: 74, focus: "Mon/Wed/Fri" },
    { id: "reading-20m", name: "Reading (20m)", cadence: "Daily", streak: 12, completion: 79, focus: "9:30p" },
    { id: "walk-after-lunch", name: "Walk after lunch", cadence: "Weekly x5", streak: 7, completion: 68, focus: "1:00p" },
    { id: "low-screen-mornings", name: "Low screen mornings", cadence: "Daily", streak: 4, completion: 61, focus: "6:00a-8:00a" },
  ];

  return <HabitsBoard habits={habits} />;
}
