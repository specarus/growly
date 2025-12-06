"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  LucideIcon,
  Sparkles,
  Users,
  icons as lucideIcons,
} from "lucide-react";

import PillButton from "@/app/components/ui/pill-button";
import { shouldDoSeeds } from "./should-do-seeds";

type ShouldDoItem = {
  id: string;
  title: string;
  description?: string | null;
  likesCount: number;
  likedByCurrentUser: boolean;
  ownedByCurrentUser: boolean;
  icon?: LucideIcon;
  iconKey?: string | null;
  iconColor?: string;
  isSeed?: boolean;
};

type ShouldDoWidgetProps = Record<string, never>;

const seedIconMap = new Map(
  shouldDoSeeds.map((seed) => [
    seed.id,
    {
      iconKey: seed.icon?.name ?? null,
      iconColor: seed.iconColor ?? null,
      icon: seed.icon,
    },
  ])
);

const mapSeeds = (): ShouldDoItem[] =>
  shouldDoSeeds.map((entry) => ({
    id: entry.id,
    title: entry.title,
    description: entry.description,
    likesCount: entry.likesCount,
    likedByCurrentUser: false,
    ownedByCurrentUser: false,
    icon: entry.icon,
    iconKey: entry.icon?.name ?? null,
    iconColor: entry.iconColor,
    isSeed: true,
  }));

const formatLikes = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\\.0$/, "")}m love this`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\\.0$/, "")}k love this`;
  }
  return `${value} love this`;
};

const resolveIcon = (key?: string | null): LucideIcon => {
  if (!key) return Heart;
  const IconComp = (lucideIcons as Record<string, LucideIcon>)[key];
  return IconComp ?? Heart;
};

const ShouldDoWidget: React.FC<ShouldDoWidgetProps> = () => {
  const [ideas, setIdeas] = useState<ShouldDoItem[]>(mapSeeds);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likingId, setLikingId] = useState<string | null>(null);

  type ShouldDoApi = {
    id: string;
    title?: string | null;
    description?: string | null;
    likesCount?: number;
    likedByCurrentUser?: boolean;
    ownedByCurrentUser?: boolean;
    iconKey?: string | null;
    iconColor?: string | null;
  };

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    fetch("/api/should-dos?limit=8")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load ideas.");
        }
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        const fetched: ShouldDoItem[] = (
          (data.shouldDos ?? []) as ShouldDoApi[]
        )
          .map((entry) => ({
            id: entry.id,
            title: entry.title ?? "Untitled idea",
            description: entry.description ?? null,
            likesCount: entry.likesCount ?? 0,
            likedByCurrentUser: Boolean(entry.likedByCurrentUser),
            ownedByCurrentUser: Boolean(entry.ownedByCurrentUser),
            iconKey:
              entry.iconKey ?? seedIconMap.get(entry.id)?.iconKey ?? null,
            icon:
              seedIconMap.get(entry.id)?.icon ??
              resolveIcon(entry.iconKey ?? seedIconMap.get(entry.id)?.iconKey),
            iconColor:
              entry.iconColor ??
              seedIconMap.get(entry.id)?.iconColor ??
              undefined,
          }))
          .filter((entry) => Boolean(entry.id));

        const seedMap = new Map(mapSeeds().map((seed) => [seed.id, seed]));
        const merged = [...seedMap.values()];
        fetched.forEach((idea) => {
          merged.push({ ...idea, isSeed: false });
        });
        setIdeas(() => merged);
      })
      .catch((fetchError: Error) => {
        if (!active) return;
        setError(fetchError.message);
        setIdeas(mapSeeds());
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const sortedIdeas = useMemo(
    () => [...ideas].sort((a, b) => b.likesCount - a.likesCount).slice(0, 3),
    [ideas]
  );

  const handleLike = async (id: string) => {
    const target = ideas.find((idea) => idea.id === id);
    if (!target || target.isSeed) {
      return;
    }
    const nextLiked = !target.likedByCurrentUser;
    const delta = nextLiked ? 1 : -1;
    setLikingId(id);
    setIdeas((current) =>
      current.map((idea) =>
        idea.id === id
          ? {
              ...idea,
              likedByCurrentUser: nextLiked,
              likesCount: Math.max(0, idea.likesCount + delta),
            }
          : idea
      )
    );
    try {
      const response = await fetch(`/api/should-dos/${id}/like`, {
        method: nextLiked ? "POST" : "DELETE",
      });
      if (!response.ok) {
        throw new Error(
          nextLiked
            ? "Unable to like this idea."
            : "Unable to unlike this idea."
        );
      }
    } catch (likeError) {
      setIdeas((current) =>
        current.map((idea) =>
          idea.id === id
            ? {
                ...idea,
                likedByCurrentUser: target.likedByCurrentUser,
                likesCount: Math.max(0, target.likesCount),
              }
            : idea
        )
      );
      console.error(likeError);
    } finally {
      setLikingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full text-foreground">
      <div className="flex items-start justify-between lg:mb-6 xl:mb-8 2xl:mb-10">
        <div className="lg:space-y-0.5 xl:space-y-1">
          <h3 className="font-semibold lg:text-base xl:text-lg 2xl:text-xl">
            Should Do!
          </h3>
          <p className="text-muted-foreground lg:text-[9px] xl:text-[11px] 2xl:text-xs">
            Wild ideas from the crew.
          </p>
        </div>
        <PillButton href="/dashboard/habits/popular#should-do" variant="ghost">
          View Details
        </PillButton>
      </div>

      <div className="flex flex-col flex-1 lg:gap-1 xl:gap-2 2xl:gap-3">
        {isLoading ? (
          <div className="rounded-xl border border-dashed border-muted bg-muted/20 lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[10px] xl:text-xs 2xl:text-sm text-muted-foreground">
            Loading ideas...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50 lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[10px] xl:text-xs 2xl:text-sm text-rose-600">
            {error}
          </div>
        ) : sortedIdeas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-muted bg-muted/20 lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[10px] 2xl:text-sm text-muted-foreground">
            No ideas yet. Be the first to post.
          </div>
        ) : (
          sortedIdeas.map((idea) => {
            const Icon = idea.icon ?? Sparkles;
            const isLiked = idea.likedByCurrentUser;
            const isSeed = idea.isSeed;
            const usesClass = (idea.iconColor ?? "").includes("text-");
            return (
              <div
                key={idea.id}
                className="flex-1 shadow-inner select-none border border-muted border-dashed bg-white flex items-center justify-between lg:py-1 xl:py-2 2xl:py-3 lg:px-3 xl:px-4 2xl:px-5 lg:rounded-xl 2xl:rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center lg:gap-2 xl:gap-3 min-w-0">
                  <span className="shrink-0">
                    <Icon
                      className={
                        usesClass
                          ? `${
                              idea.iconColor ?? "text-primary"
                            } lg:w-4 lg:h-4 xl:w-5 xl:h-5`
                          : "lg:w-4 lg:h-4 xl:w-5 xl:h-5"
                      }
                      style={
                        usesClass
                          ? undefined
                          : { color: idea.iconColor ?? "var(--primary)" }
                      }
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium xl:mb-0.5 2xl:mb-1 lg:text-xs xl:text-sm 2xl:text-base truncate">
                      {idea.title}
                    </div>
                    <div className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground flex items-center gap-2 truncate">
                      <Users className="lg:w-2 lg:h-2 xl:w-3 xl:h-3 shrink-0" />
                      <span className="truncate">
                        {formatLikes(idea.likesCount)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleLike(idea.id)}
                  disabled={likingId === idea.id || isSeed}
                  className={`group inline-flex items-center justify-center rounded-full border lg:px-1.5 xl:px-2.5 lg:py-1 xl:py-2 transition-transform duration-200 ease-out active:scale-95 hover:-translate-y-0.5 shadow-sm ${
                    isLiked
                      ? "border-primary bg-primary text-white shadow-[0_10px_30px_-16px_rgba(59,130,246,0.8)]"
                      : "border-gray-200 bg-white text-muted-foreground hover:border-primary/40 hover:shadow-[0_10px_30px_-18px_rgba(59,130,246,0.7)]"
                  } ${isSeed ? "opacity-60 cursor-not-allowed" : ""}`}
                  aria-pressed={isLiked}
                  aria-label={
                    isSeed
                      ? "Pinned idea"
                      : isLiked
                      ? "Liked"
                      : "Like this idea"
                  }
                >
                  <Heart
                    className={`lg:w-3 lg:h-3 xl:w-4 xl:h-4 transition-transform duration-200 ease-out group-hover:scale-110 ${
                      isLiked ? "text-white" : "text-primary"
                    }`}
                  />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ShouldDoWidget;
