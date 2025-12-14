"use server";

import { auth } from "../auth";
import { headers } from "next/headers";

import { ensureUsernameForUser } from "../usernames";

export const signUp = async (email: string, password: string, name: string) => {
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      callbackURL: "/dashboard",
    },
  });

  const userId =
    (result as any)?.data?.user?.id ?? (result as any)?.data?.session?.userId;
  if (userId) {
    try {
      await ensureUsernameForUser(userId, name);
    } catch (error) {
      console.error("[auth-actions] ensure username after signup", error);
    }
  }

  return result;
};

export const signIn = async (
  email: string,
  password: string,
  rememberMe: boolean = true
) => {
  const result = await auth.api.signInEmail({
    body: {
      email,
      password,
      callbackURL: "/dashboard",
      rememberMe,
    },
  });

  return result;
};

export const signOut = async () => {
  const result = await auth.api.signOut({ headers: await headers() });

  return result;
};
