"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";

import { updateProfileAction } from "@/app/account/actions/update-profile";

interface EditProfileFormProps {
  initialName: string;
  initialEmail: string;
}

export default function EditProfileForm({
  initialName,
  initialEmail,
}: EditProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);

    startTransition(async () => {
      try {
        await updateProfileAction(formData);
        setStatus("success");
        setMessage("Profile updated.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to save right now. Please try again later."
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col xl:gap-1 2xl:gap-2">
        <label className="xl:text-xs 2xl:text-sm uppercase tracking-[0.4em] text-muted-foreground">
          Edit profile
        </label>
        <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
          Keep your name and email current so Growly can stay aligned with your
          rituals.
        </p>
      </div>

      <div className="grid gap-3">
        {message && (
          <div
            className={`rounded-2xl border px-4 py-3 xl:text-xs 2xl:text-sm ${
              status === "success"
                ? "border-green-soft/60 bg-green-soft/15 text-foreground"
                : "border-destructive/60 bg-destructive/10 text-destructive"
            }`}
          >
            {message}
          </div>
        )}

        <label className="flex flex-col gap-1 xl:text-xs 2xl:text-sm">
          <span className="text-muted-foreground">Name</span>
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-2xl border border-muted px-4 py-2 xl:text-xs 2xl:text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        <label className="flex flex-col gap-1 xl:text-xs 2xl:text-sm">
          <span className="text-muted-foreground">Email</span>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-2xl border border-muted px-4 py-2 xl:text-xs 2xl:text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-primary px-4 py-2 xl:text-xs 2xl:text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
        {status !== "idle" && (
          <p
            className={
              status === "success"
                ? "mt-2 text-xs text-green-soft-foreground"
                : "mt-2 text-xs text-coral"
            }
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
