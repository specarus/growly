import { headers } from "next/headers";
import { redirect } from "next/navigation";

import HabitCreatePage from "./habit-create-page";
import { auth } from "@/lib/auth";

export default async function CreateHabit() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return <HabitCreatePage />;
}
