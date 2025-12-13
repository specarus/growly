"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const parseBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "on"].includes(normalized)) return true;
    if (["false", "0", "off"].includes(normalized)) return false;
  }
  return null;
};

export const setPrivacyAction = async (formData: FormData) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const nextValue = parseBoolean(formData.get("privateAccount"));

  if (nextValue === null) {
    throw new Error("Please choose whether your account should be private.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { privateAccount: nextValue },
  });

  revalidatePath("/account");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/analytics");

  return { privateAccount: nextValue };
};
