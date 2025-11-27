import type { Habit as PrismaHabit } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import CreateRoutinePage from "./create-routine-page";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const formatTimeOfDay = (value: string) => {
  const [hourPart, minutePart] = value.split(":").map(Number);
  if (
    Number.isNaN(hourPart) ||
    Number.isNaN(minutePart) ||
    hourPart < 0 ||
    hourPart > 23 ||
    minutePart < 0 ||
    minutePart > 59
  ) {
    return value;
  }

  const timestamp = new Date();
  timestamp.setHours(hourPart, minutePart, 0, 0);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
};

const buildCalendarFocus = (habit: PrismaHabit) => {
  if (habit.timeOfDay) {
    return formatTimeOfDay(habit.timeOfDay);
  }
  if (habit.reminder) {
    return habit.reminder;
  }
  if (habit.goalUnit) {
    return `${habit.goalAmount.toFixed(1).replace(/\.0$/, "")} ${habit.goalUnit}`;
  }
  return habit.cadence;
};

type RoutineFormHabit = {
  id: string;
  name: string;
  cadence: string;
  focus: string;
};

export default async function CreateRoutine() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const formattedHabits: RoutineFormHabit[] = habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    cadence: habit.cadence,
    focus: buildCalendarFocus(habit),
  }));

  return <CreateRoutinePage habits={formattedHabits} />;
}
