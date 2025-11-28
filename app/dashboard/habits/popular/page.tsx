export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import PopularRoutinesPage from "./popular-habits-page";
import { auth } from "@/lib/auth";

export default async function PopularHabits() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return <PopularRoutinesPage />;
}
