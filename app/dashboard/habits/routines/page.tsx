export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import RoutinesPage from "./routines-page";
import { auth } from "@/lib/auth";

export default async function Routines() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return <RoutinesPage />;
}
