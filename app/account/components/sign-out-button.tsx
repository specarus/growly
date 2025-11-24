"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import Button from "@/app/components/ui/button";
import { signOut } from "@/lib/actions/auth-actions";

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      router.push("/");
      router.refresh();
    });
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isPending}
      className="w-full rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Signing out..." : "Log out"}
    </Button>
  );
}
