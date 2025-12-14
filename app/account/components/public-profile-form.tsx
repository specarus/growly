"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";

import { updatePublicProfileAction } from "@/app/account/actions/update-public-profile";

type PublicProfileFormProps = {
  initialUsername?: string;
  initialHeadline?: string;
  initialFocus?: string;
  initialLocation?: string;
};

export default function PublicProfileForm({
  initialUsername,
  initialHeadline,
  initialFocus,
  initialLocation,
}: PublicProfileFormProps) {
  const [username, setUsername] = useState(initialUsername ?? "");
  const [headline, setHeadline] = useState(initialHeadline ?? "");
  const [focus, setFocus] = useState(initialFocus ?? "");
  const [location, setLocation] = useState(initialLocation ?? "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => setUsername(initialUsername ?? ""), [initialUsername]);
  useEffect(() => setHeadline(initialHeadline ?? ""), [initialHeadline]);
  useEffect(() => setFocus(initialFocus ?? ""), [initialFocus]);
  useEffect(() => setLocation(initialLocation ?? ""), [initialLocation]);

  useEffect(() => {
    if (location.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const load = async () => {
      try {
        const response = await fetch(
          `/api/locations?query=${encodeURIComponent(location)}`,
          { signal: controller.signal }
        );
        if (!response.ok) return;
        const data = await response.json();
        setSuggestions(data.options ?? []);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("[PublicProfileForm] location lookup", error);
      }
    };

    void load();

    return () => controller.abort();
  }, [location]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.set("username", username);
    formData.set("headline", headline);
    formData.set("focus", focus);
    formData.set("location", location);

    startTransition(async () => {
      try {
        await updatePublicProfileAction(formData);
        setStatus("success");
        setMessage("Profile updated.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to save right now. Please try again."
        );
      }
    });
  };

  const handleSelectLocation = (value: string) => {
    setLocation(value);
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit} className="lg:space-y-3 xl:space-y-4">
      <div className="flex flex-col lg:gap-0.5 xl:gap-1 2xl:gap-2">
        <label className="lg:text-[11px] xl:text-xs 2xl:text-sm uppercase tracking-[0.4em] text-muted-foreground">
          Public profile
        </label>
        <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
          These details show when friends search for you.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-2xl border lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[11px] xl:text-xs 2xl:text-sm ${
            status === "success"
              ? "border-green-soft/60 bg-green-soft/15 text-foreground"
              : "border-destructive/60 bg-destructive/10 text-destructive"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid lg:gap-2 xl:gap-3">
        <label className="flex flex-col gap-1 lg:text-[11px] xl:text-xs 2xl:text-sm">
          <span className="text-muted-foreground">Username</span>
          <div className="flex items-center rounded-2xl shadow-sm border border-muted focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40">
            <span className="pl-3 text-muted-foreground lg:text-[11px] xl:text-xs 2xl:text-sm">
              @
            </span>
            <input
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="flex-1 rounded-2xl border-0 bg-transparent lg:px-2 xl:px-3 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs 2xl:text-sm focus:outline-none"
              placeholder="john01"
            />
          </div>
          <span className="text-muted-foreground lg:text-[10px] xl:text-[11px]">
            Letters, numbers, underscores. Leave blank to auto-generate.
          </span>
        </label>

        <label className="flex flex-col gap-1 lg:text-[11px] xl:text-xs 2xl:text-sm">
          <span className="text-muted-foreground">Headline</span>
          <input
            name="headline"
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            className="rounded-2xl border border-muted lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs 2xl:text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Morning energy and focus guardrails."
            maxLength={140}
          />
        </label>

        <label className="flex flex-col gap-1 lg:text-[11px] xl:text-xs 2xl:text-sm">
          <span className="text-muted-foreground">Focus</span>
          <input
            name="focus"
            value={focus}
            onChange={(event) => setFocus(event.target.value)}
            className="rounded-2xl border border-muted lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs 2xl:text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Deep work, recovery, morning energy"
            maxLength={80}
          />
        </label>

        <div className="relative">
          <label className="flex flex-col gap-1 lg:text-[11px] xl:text-xs 2xl:text-sm">
            <span className="text-muted-foreground">Location</span>
            <input
              name="location"
              value={location}
              onFocus={() => setShowSuggestions(true)}
              onChange={(event) => {
                setLocation(event.target.value);
                setShowSuggestions(true);
              }}
              className="rounded-2xl border border-muted lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs 2xl:text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Romania"
              maxLength={60}
              autoComplete="off"
            />
          </label>
          {showSuggestions && suggestions.length > 0 ? (
            <div className="absolute z-10 mt-1 w-full rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-200">
              <ul className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                {suggestions.map((option) => (
                  <li key={option}>
                    <button
                      type="button"
                      onClick={() => handleSelectLocation(option)}
                      className="w-full text-left lg:px-3 xl:px-4 lg:py-2 xl:py-2.5 lg:text-[11px] xl:text-xs 2xl:text-sm hover:bg-primary/5"
                    >
                      {option}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-primary lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save public profile"}
        </button>
        {status !== "idle" && (
          <p
            className={
              status === "success"
                ? "mt-2 lg:text-[11px] xl:text-xs text-green-soft-foreground"
                : "mt-2 lg:text-[11px] xl:text-xs text-coral"
            }
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
