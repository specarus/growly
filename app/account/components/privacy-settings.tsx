"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Shield, ShieldOff } from "lucide-react";

import { setPrivacyAction } from "../actions/set-privacy";

type Props = {
  initialPrivate: boolean;
};

export default function PrivacySettings({ initialPrivate }: Props) {
  const [isPrivate, setIsPrivate] = useState(initialPrivate);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const previous = isPrivate;
    const next = !previous;
    setIsPrivate(next);
    setStatus("idle");
    setMessage(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("privateAccount", String(next));
        await setPrivacyAction(formData);
        setStatus("success");
        setMessage(
          next
            ? "Your analytics are hidden while privacy is on."
            : "Analytics visibility restored."
        );
      } catch (error) {
        setIsPrivate(previous);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to update privacy right now."
        );
      }
    });
  };

  return (
    <div className="lg:space-y-3 xl:space-y-4">
      <div className="flex items-start justify-between lg:gap-3">
        <div className="lg:space-y-1 xl:space-y-1.5">
          <p className="lg:text-[11px] xl:text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Privacy
          </p>
          <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
            Hide analytics across your account when you want a quieter space.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPrivate}
          onClick={handleToggle}
          disabled={isPending}
          className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${
            isPrivate ? "bg-primary/90 border-primary" : "bg-muted border-muted"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
              isPrivate ? "translate-x-5" : "translate-x-1"
            }`}
          >
            {isPrivate ? (
              <Shield className="h-3 w-3 text-primary" />
            ) : (
              <ShieldOff className="h-3 w-3 text-muted-foreground" />
            )}
          </span>
        </button>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-muted/40 lg:px-3 xl:px-4 lg:py-2 xl:py-3">
        <div className="lg:space-y-0.5">
          <p className="lg:text-[11px] xl:text-xs font-semibold text-foreground">
            {isPrivate ? "Private mode enabled" : "Analytics visible"}
          </p>
          <p className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
            {isPrivate
              ? "Analytics pages and widgets stay hidden."
              : "Dashboards and insights will be visible."}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/80 lg:px-2.5 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[10px] xl:text-[11px] font-semibold text-muted-foreground">
          {isPrivate ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
          {isPrivate ? "Hidden" : "On"}
        </span>
      </div>

      {message && (
        <p
          className={`lg:text-[10px] xl:text-[11px] 2xl:text-sm ${
            status === "error"
              ? "text-destructive"
              : "text-green-soft-foreground"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
