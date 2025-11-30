"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function deleteAccountAction() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unable to locate your account. Please sign in again.");
  }

  await auth.api.signOut({
    headers: requestHeaders,
  });

  // Leveraging Prisma cascades via the schema ensures every related todo, habit,
  // collection, routine, and analytic record is purged when the user is removed.
  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/account");
}
