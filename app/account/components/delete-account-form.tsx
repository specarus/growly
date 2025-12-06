"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import Button from "@/app/components/ui/button";
import { deleteAccountAction } from "@/app/account/actions/delete-account";

const CONFIRMATION_TEXT = "DELETE";

export default function DeleteAccountForm() {
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canSubmit =
    confirmation.trim().toUpperCase() === CONFIRMATION_TEXT && !isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setStatus("error");
      setMessage(`Type "${CONFIRMATION_TEXT}" to confirm account deletion.`);
      return;
    }

    setStatus("idle");
    setMessage("");

    startTransition(async () => {
      try {
        await deleteAccountAction();
        router.push("/");
        router.refresh();
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to delete your account right now."
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="lg:space-y-3 xl:space-y-4">
      <div className="space-y-1">
        <p className="lg:text-[11px] xl:text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Reset for good
        </p>
      </div>

      <div className="lg:space-y-1 xl:space-y-2">
        {message && (
          <p
            className={`lg:text-[11px] xl:text-xs font-semibold ${
              status === "error"
                ? "text-destructive"
                : "text-green-soft-foreground"
            }`}
          >
            {message}
          </p>
        )}
        <label className="lg:text-[9px] xl:text-[11px] 2xl:text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
          Confirm by typing "{CONFIRMATION_TEXT}"
        </label>
        <input
          type="text"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder={CONFIRMATION_TEXT}
          className="w-full rounded-xl border border-primary/20 lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs 2xl:text-sm focus:border-destructive focus:outline-none focus:ring-2 focus:ring-destructive/30"
        />
      </div>

      <Button
        type="submit"
        disabled={!canSubmit}
        className="bg-red-400 lg:text-[11px] xl:text-xs 2xl:text-sm text-white transition lg:py-1 xl:py-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Deleting…" : "Delete my account"}
      </Button>
    </form>
  );
}
