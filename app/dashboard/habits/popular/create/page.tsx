export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import CreatePopularPostForm from "./create-post-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PopularHabitPostCreatePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      cadence: true,
    },
  });

  return <CreatePopularPostForm habits={habits} />;
}
