import { headers } from "next/headers";
import { redirect } from "next/navigation";

import HabitCreatePage from "../../create/create-habit-page";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const formatIsoDate = (value?: Date | null) =>
  value ? value.toISOString().slice(0, 10) : "";

export default async function EditHabit({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const habit = await prisma.habit.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!habit) {
    redirect("/dashboard/habits");
  }

  return (
    <HabitCreatePage
      mode="edit"
      habitId={habit.id}
      initialHabit={{
        name: habit.name,
        description: habit.description ?? "",
        cadence: habit.cadence as "Daily" | "Weekly" | "Monthly",
        startDate: formatIsoDate(habit.startDate),
        timeOfDay: habit.timeOfDay ?? "07:00",
        reminder: habit.reminder ?? "15 minutes before",
        goalAmount: habit.goalAmount?.toString() ?? "1",
        goalUnit: habit.goalUnit ?? "count",
        goalUnitCategory: habit.goalUnitCategory as "Quantity" | "Time",
      }}
    />
  );
}
