"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureUsernameForUser, normalizeUsername } from "@/lib/usernames";

const validateUsername = (username: string) => {
  const normalized = normalizeUsername(username);
  if (normalized.length < 3 || normalized.length > 24) {
    throw new Error("Username must be between 3 and 24 characters.");
  }
  if (!/^[a-z0-9_]+$/.test(normalized)) {
    throw new Error("Username can only include letters, numbers, and underscores.");
  }
  return normalized;
};

export async function updatePublicProfileAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("You need to be signed in to update your profile.");
  }

  const userId = session.user.id;
  const usernameInput = (formData.get("username") ?? "").toString();
  const focusInput = (formData.get("focus") ?? "").toString().trim();
  const headlineInput = (formData.get("headline") ?? "").toString().trim();
  const locationInput = (formData.get("location") ?? "").toString().trim();

  const data: {
    username?: string | null;
    focusArea?: string | null;
    headline?: string | null;
    location?: string | null;
  } = {};

  if (usernameInput.trim().length === 0) {
    // regenerate if missing
    data.username = await ensureUsernameForUser(userId, session.user.name ?? "user");
  } else {
    const normalized = validateUsername(usernameInput);
    const existing = await prisma.user.findFirst({
      where: { username: normalized, id: { not: userId } },
      select: { id: true },
    });
    if (existing) {
      throw new Error("That username is taken. Try another option.");
    }
    data.username = normalized;
  }

  data.focusArea = focusInput || null;
  data.headline = headlineInput || null;
  data.location = locationInput || null;

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  revalidatePath("/account");
}
