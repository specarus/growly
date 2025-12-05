"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PinOff, Trash2 } from "lucide-react";

type Props = {
  postId: string;
  isOwned: boolean;
  isLiked: boolean;
};

const PostActions = ({ postId, isOwned, isLiked }: Props) => {
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
        ? `/api/habits/posts/${postId}`
        : `/api/habits/posts/${postId}/like`;
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(
          body?.error ??
            (mode === "delete"
              ? "Unable to delete this post."
              : "Unable to unpin this post.")
        );
      }
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : mode === "delete"
          ? "Unable to delete this post."
          : "Unable to unpin this post."
      );
    } finally {
      setPending(false);
    }
  };

  const label = mode === "delete" ? "Delete" : "Unpin";
  const Icon = mode === "delete" ? Trash2 : PinOff;
  const baseClasses =
    "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
  const deleteClasses =
    "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-400";
  const unpinClasses =
    "border-gray-200 bg-white text-muted-foreground hover:border-primary/40 hover:text-primary";

  return (
    <div className="flex items-center gap-2">
      {error ? (
        <p className="text-[11px] text-rose-600" role="alert">
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
            className={`w-3 h-3 animate-spin ${
              mode === "delete" ? "text-rose-600" : "text-primary"
            }`}
          />
        ) : (
          <Icon
            className={`w-3 h-3 ${
              mode === "delete" ? "text-rose-600" : "text-primary"
            }`}
          />
        )}
        {pending ? "Working..." : label}
      </button>
    </div>
  );
};

export default PostActions;
