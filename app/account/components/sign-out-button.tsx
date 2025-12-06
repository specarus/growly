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
      className="w-full rounded-full border border-primary lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold text-primary bg-card/90 hover:bg-card/70 dark:bg-card/80 dark:hover:bg-card/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Signing out..." : "Log out"}
    </Button>
  );
}
