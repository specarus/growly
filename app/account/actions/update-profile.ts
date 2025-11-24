"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfileAction(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");

  if (!name || !email) {
    throw new Error("Name and email are required to update your profile.");
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unable to locate your account. Please sign in again.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: name.toString().trim(),
      email: email.toString().trim().toLowerCase(),
    },
  });

  revalidatePath("/account");
}
