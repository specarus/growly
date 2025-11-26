export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import HabitsBoard from "./habits-board";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HabitsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const habits = await prisma.habit.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <HabitsBoard habits={habits} />;
}
