export const dynamic = "force-dynamic";

import type { Habit as PrismaHabit } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import RoutinesPage from "./routines-page";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RoutineHabitCard = {
  habitId: string;
  habit: PrismaHabit;
};

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

const formatGoalAmount = (value: number) => {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return value.toFixed(1).replace(/\.0$/, "");
};

const buildCalendarFocus = (habit: PrismaHabit) => {
  if (habit.timeOfDay) {
    return formatTimeOfDay(habit.timeOfDay);
  }
  if (habit.reminder) {
    return habit.reminder;
  }
  if (habit.goalUnit) {
    return `${formatGoalAmount(habit.goalAmount)} ${habit.goalUnit}`;
  }
  return habit.cadence;
};

const mapHabit = (habit: PrismaHabit) => ({
  id: habit.id,
  name: habit.name,
  cadence: habit.cadence,
  focus: buildCalendarFocus(habit),
});

export default async function Routines() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const [habits, routines] = await Promise.all([
    prisma.habit.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.routine.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      include: {
        habits: {
          include: { habit: true },
          orderBy: { position: "asc" },
        },
      },
    }),
  ]);

  const formattedRoutines = routines.map((routine) => ({
    id: routine.id,
    name: routine.name,
    anchor: routine.anchor,
    notes: routine.notes,
    habits: routine.habits
      .filter((item): item is RoutineHabitCard => Boolean(item.habit))
      .map((item) => ({ habitId: item.habitId, habit: item.habit! })),
  }));

  const assignedHabitIds = new Set(
    formattedRoutines.flatMap((routine) =>
      routine.habits.map((entry) => entry.habit.id)
    )
  );

  const backlog = habits
    .filter((habit) => !assignedHabitIds.has(habit.id))
    .map(mapHabit);

  const routinesWithHabitCards = formattedRoutines.map((routine) => ({
    id: routine.id,
    name: routine.name,
    anchor: routine.anchor,
    notes: routine.notes,
    habits: routine.habits.map((entry) => mapHabit(entry.habit)),
  }));

  return (
    <RoutinesPage
      initialBacklog={backlog}
      initialRoutines={routinesWithHabitCards}
    />
  );
}
