"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PinOff, Trash2 } from "lucide-react";

type Props = {
  ideaId: string;
  isOwned: boolean;
  isLiked: boolean;
};

const ShouldDoActions = ({ ideaId, isOwned, isLiked }: Props) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = isOwned ? "delete" : isLiked ? "unpin" : null;
  if (!mode) return null;

  const handleAction = async () => {
    setPending(true);
    setError(null);
    const endpoint =
      mode === "delete"
        ? `/api/should-dos/${ideaId}`
        : `/api/should-dos/${ideaId}/like`;
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(
          body?.error ??
            (mode === "delete"
              ? "Unable to delete this idea."
              : "Unable to unpin this idea.")
        );
      }
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : mode === "delete"
          ? "Unable to delete this idea."
          : "Unable to unpin this idea."
      );
    } finally {
      setPending(false);
    }
  };

  const label = mode === "delete" ? "Delete" : "Unpin";
  const Icon = mode === "delete" ? Trash2 : PinOff;
  const baseClasses =
    "inline-flex items-center lg:gap-1.5 xl:gap-2 rounded-full border lg:px-2 xl:px-2.5 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
  const deleteClasses =
    "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-400";
  const unpinClasses =
    "border-gray-200 bg-white text-muted-foreground hover:border-primary/40 hover:text-primary";

  return (
    <div className="flex items-center lg:gap-1.5 xl:gap-2">
      {error ? (
        <p className="lg:text-[9px] xl:text-[11px] text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleAction}
        disabled={pending}
        className={`${baseClasses} ${
          mode === "delete" ? deleteClasses : unpinClasses
        }`}
      >
        {pending ? (
          <Loader2
            className={`lg:w-2 lg:h-2 xl:w-3 xl:h-3 animate-spin ${
              mode === "delete" ? "text-rose-600" : "text-primary"
            }`}
          />
        ) : (
          <Icon
            className={`lg:w-2 lg:h-2 xl:w-3 xl:h-3 ${
              mode === "delete" ? "text-rose-600" : "text-primary"
            }`}
          />
        )}
        {pending ? "Working..." : label}
      </button>
    </div>
  );
};

export default ShouldDoActions;
