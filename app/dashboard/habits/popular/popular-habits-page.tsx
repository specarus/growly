"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Brain,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Heart,
  HeartPulse,
  icons as lucideIcons,
  LucideIcon,
  Pencil,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/button";
import PageGradient from "@/app/components/ui/page-gradient";
import PageHeading from "@/app/components/page-heading";
import HabitsTabs from "../components/habits-tabs";

import {
  Category,
  Commitment,
  PopularPost,
  categories,
  commitmentCopy,
  timeFilters,
  TimeWindow,
} from "./types";
import { buildHabitPayloadFromPost } from "./import-habit-utils";
import { popularHabits } from "./popular-habits-data";
import { shouldDoSeeds } from "@/app/dashboard/components/should-do-seeds";

const categoryStyles: Record<Category, { badge: string; dot: string }> = {
  Movement: { badge: "bg-green-soft/30 text-green-soft", dot: "bg-green-soft" },
  Energy: {
    badge: "bg-yellow-soft/30 text-yellow-soft",
    dot: "bg-yellow-soft",
  },
  Focus: { badge: "bg-primary/30 text-primary", dot: "bg-primary" },
  Recovery: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  Mindset: { badge: "bg-coral/30 text-coral", dot: "bg-coral" },
  Health: {
    badge: "bg-foreground/30 text-foreground",
    dot: "bg-foreground",
  },
};

const formatPostedDate = (value: string) => {
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return value;
  }
};

const fallbackPosts = popularHabits;

const mergePosts = (communityPosts: PopularPost[]) => {
  const seen = new Set<string>();
  const joined: PopularPost[] = [];
  communityPosts.forEach((post) => {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      joined.push(post);
    }
  });
  fallbackPosts.forEach((post) => {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      joined.push(post);
    }
  });
  return joined;
};

type ShouldDoEntry = {
  id: string;
  title: string;
  description: string | null;
  likesCount: number;
  likedByCurrentUser: boolean;
  ownedByCurrentUser: boolean;
  createdAt?: string;
  isSeed?: boolean;
  iconKey?: string | null;
  iconColor?: string | null;
  icon?: LucideIcon;
};

const seedShouldDos: ShouldDoEntry[] = shouldDoSeeds.map((seed) => ({
  id: seed.id,
  title: seed.title,
  description: seed.description ?? null,
  likesCount: seed.likesCount,
  likedByCurrentUser: false,
  ownedByCurrentUser: false,
  isSeed: true,
  iconKey: seed.icon?.name ?? null,
  iconColor: seed.iconColor ?? null,
  icon: seed.icon,
}));
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

const formatLikes = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\\.0$/, "")}m`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\\.0$/, "")}k`;
  }
  return `${value}`;
};

const PopularHabitsPage: React.FC = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<PopularPost[]>(fallbackPosts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [commitment, setCommitment] = useState<Commitment | "Any">("Any");
  const [timeWindow, setTimeWindow] = useState<TimeWindow | "Any">("Any");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [likingPostId, setLikingPostId] = useState<string | null>(null);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [addingPostId, setAddingPostId] = useState<string | null>(null);
  const [justAddedPostId, setJustAddedPostId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [importedPostIds, setImportedPostIds] = useState<Set<string>>(
    new Set()
  );
  const [shouldDos, setShouldDos] = useState<ShouldDoEntry[]>(seedShouldDos);
  const [shouldDoLoading, setShouldDoLoading] = useState(true);
  const [shouldDoError, setShouldDoError] = useState<string | null>(null);
  const iconOptions = [
    { key: "Flame", label: "Fire" },
    { key: "Dumbbell", label: "Strength" },
    { key: "HeartPulse", label: "Health" },
    { key: "Brain", label: "Mind" },
    { key: "MoonStar", label: "Night" },
    { key: "Mountain", label: "Outdoors" },
    { key: "Droplets", label: "Cold plunge" },
    { key: "Target", label: "Focus" },
  ];
  const iconPalette: Record<string, string> = {
    Flame: "#f97316",
    Dumbbell: "#22c55e",
    HeartPulse: "#ef4444",
    Brain: "#6366f1",
    MoonStar: "#c084fc",
    Mountain: "#0ea5e9",
    Droplets: "#06b6d4",
    Target: "#f59e0b",
  };
  const defaultIconKey = iconOptions[0]?.key ?? "Sparkles";
  const resolveIcon = (key?: string | null): LucideIcon => {
    if (!key) return Heart;
    const IconComp = (lucideIcons as Record<string, LucideIcon>)[key];
    return IconComp ?? Heart;
  };

  const [shouldDoForm, setShouldDoForm] = useState({
    title: "",
    description: "",
    iconKey: defaultIconKey,
  });
  const [editingShouldDoId, setEditingShouldDoId] = useState<string | null>(
    null
  );
  const [savingShouldDo, setSavingShouldDo] = useState(false);
  const [shouldDoSubmitError, setShouldDoSubmitError] = useState<string | null>(
    null
  );
  const [likingShouldDoId, setLikingShouldDoId] = useState<string | null>(null);
  const [shouldDoSearch, setShouldDoSearch] = useState("");

  type ShouldDoApi = {
    id: string;
    title?: string | null;
    description?: string | null;
    likesCount?: number;
    likedByCurrentUser?: boolean;
    ownedByCurrentUser?: boolean;
    createdAt?: string;
    iconKey?: string | null;
    iconColor?: string | null;
  };

  const normalizeShouldDo = useCallback(
    (entry: ShouldDoApi): ShouldDoEntry => ({
      id: entry.id,
      title: entry.title ?? "Untitled idea",
      description: entry.description ?? null,
      likesCount: entry.likesCount ?? 0,
      likedByCurrentUser: Boolean(entry.likedByCurrentUser),
      ownedByCurrentUser: Boolean(entry.ownedByCurrentUser),
      createdAt: entry.createdAt,
      isSeed: false,
      iconKey: entry.iconKey ?? seedIconMap.get(entry.id)?.iconKey ?? null,
      iconColor:
        entry.iconColor ?? seedIconMap.get(entry.id)?.iconColor ?? null,
      icon: seedIconMap.get(entry.id)?.icon,
    }),
    []
  );

  const handleLike = async (postId: string) => {
    setLikeError(null);
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost || targetPost.likedByCurrentUser) {
      return;
    }
    setLikingPostId(postId);
    try {
      const response = await fetch(`/api/habits/posts/${postId}/like`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          errorBody && typeof errorBody === "object" && "error" in errorBody
            ? (errorBody as { error?: string }).error
            : null;
        throw new Error(message ?? "Unable to save your like.");
      }
      setPosts((current) =>
        current.map((entry) =>
          entry.id === postId
            ? {
                ...entry,
                likesCount: entry.likesCount + 1,
                likedByCurrentUser: true,
              }
            : entry
        )
      );
      setLikedPostIds((current) => {
        const next = new Set(current);
        next.add(postId);
        return next;
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Already liked.") {
          setPosts((current) =>
            current.map((entry) =>
              entry.id === postId
                ? { ...entry, likedByCurrentUser: true }
                : entry
            )
          );
          setLikedPostIds((current) => {
            const next = new Set(current);
            next.add(postId);
            return next;
          });
          return;
        }
        setLikeError(error.message);
      } else {
        setLikeError("Unable to save your like. Try again later.");
      }
    } finally {
      setLikingPostId(null);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch("/api/habits")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load habits.");
        }
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        type HabitApi = { sourcePopularPostId?: string | null };
        const ids = new Set<string>();
        const habits = (data.habits ?? []) as HabitApi[];
        habits.forEach((habit) => {
          const sourceId = habit.sourcePopularPostId;
          if (typeof sourceId === "string") {
            ids.add(sourceId);
          }
        });
        setImportedPostIds(ids);
      })
      .catch(() => {
        if (!active) return;
        setImportedPostIds(new Set());
      });

    fetch("/api/habits/posts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load posts.");
        }
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        type PopularPostApi = PopularPost & {
          user?: { name?: string | null };
          habit?: { name?: string | null };
        };
        const normalized = ((data.posts ?? []) as PopularPostApi[]).map(
          (post) => {
            const { user, habit, ...rest } = post;
            return {
              ...rest,
              userName: user?.name ?? null,
              habitName: habit?.name ?? null,
            } as PopularPost;
          }
        );
        setPosts(mergePosts(normalized));
      })
      .catch((fetchError: Error) => {
        if (!active) return;
        setError(fetchError.message);
        setPosts(fallbackPosts);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    fetch("/api/should-dos")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load ideas.");
        }
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        const normalized = ((data.shouldDos ?? []) as ShouldDoApi[]).map(
          (entry) => normalizeShouldDo(entry)
        );
        const merged = (() => {
          const seen = new Set<string>();
          const combined: ShouldDoEntry[] = [];
          seedShouldDos.forEach((seed) => {
            seen.add(seed.id);
            combined.push(seed);
          });
          normalized.forEach((entry) => {
            if (seen.has(entry.id)) return;
            combined.push({ ...entry, isSeed: false });
          });
          return combined;
        })();
        setShouldDos(merged);
      })
      .catch((fetchError: Error) => {
        if (!active) return;
        setShouldDoError(fetchError.message);
        setShouldDos(seedShouldDos);
      })
      .finally(() => {
        if (!active) return;
        setShouldDoLoading(false);
      });

    return () => {
      active = false;
    };
  }, [normalizeShouldDo]);

  const filteredPosts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = category === "All" || post.category === category;
      const matchesCommitment =
        commitment === "Any" || post.commitment === commitment;
      const matchesTime =
        timeWindow === "Any" || post.timeWindow === timeWindow;
      const matchesSearch =
        term.length === 0 ||
        post.title.toLowerCase().includes(term) ||
        (post.summary?.toLowerCase().includes(term) ?? false) ||
        (post.anchor?.toLowerCase().includes(term) ?? false) ||
        post.benefits.some((benefit) => benefit.toLowerCase().includes(term));

      return (
        matchesCategory && matchesCommitment && matchesTime && matchesSearch
      );
    });
  }, [category, commitment, posts, search, timeWindow]);

  useEffect(() => {
    if (filteredPosts.length === 0) {
      setSelectedPostId("");
      return;
    }
    if (
      !selectedPostId ||
      !filteredPosts.some((post) => post.id === selectedPostId)
    ) {
      setSelectedPostId(filteredPosts[0].id);
    }
  }, [filteredPosts, selectedPostId]);

  useEffect(() => {
    setLikeError(null);
  }, [selectedPostId]);

  const selectedPost =
    filteredPosts.find((post) => post.id === selectedPostId) ||
    filteredPosts[0] ||
    null;

  useEffect(() => {
    setAddError(null);
    if (!selectedPost?.id) {
      setJustAddedPostId(null);
      return;
    }
    if (justAddedPostId && justAddedPostId !== selectedPost.id) {
      setJustAddedPostId(null);
    }
  }, [selectedPost?.id, justAddedPostId]);

  useEffect(() => {
    setLikedPostIds(
      new Set(
        posts.filter((post) => post.likedByCurrentUser).map((post) => post.id)
      )
    );
  }, [posts]);

  const userHasAddedSelectedPost = selectedPost
    ? importedPostIds.has(selectedPost.id)
    : false;

  const handleAddToBoard = useCallback(async () => {
    if (!selectedPost || userHasAddedSelectedPost) {
      if (selectedPost && userHasAddedSelectedPost) {
        setAddError("You already added this habit.");
      }
      return;
    }
    setAddError(null);
    setAddingPostId(selectedPost.id);
    try {
      const payload = buildHabitPayloadFromPost(selectedPost);
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          errorBody && typeof errorBody === "object" && "error" in errorBody
            ? (errorBody as { error?: string }).error
            : null;
        throw new Error(message ?? "Unable to add this habit to your board.");
      }
      setImportedPostIds((current) => {
        const next = new Set(current);
        next.add(selectedPost.id);
        return next;
      });
      setJustAddedPostId(selectedPost.id);
    } catch (error) {
      if (error instanceof Error) {
        setAddError(error.message);
      } else {
        setAddError("Unable to add this habit to your board.");
      }
    } finally {
      setAddingPostId(null);
    }
  }, [selectedPost, userHasAddedSelectedPost]);

  const isAddingSelectedPost = addingPostId === selectedPost?.id;
  const isAddedSelectedPost = userHasAddedSelectedPost;
  const showSuccessMessage = justAddedPostId === selectedPost?.id;
  const userHasLikedSelectedPost = selectedPost
    ? likedPostIds.has(selectedPost.id)
    : false;
  const filteredShouldDos = useMemo(() => {
    const term = shouldDoSearch.trim().toLowerCase();
    return [...shouldDos]
      .filter((entry) => {
        if (!term) return true;
        const inTitle = entry.title.toLowerCase().includes(term);
        const inDescription =
          entry.description?.toLowerCase().includes(term) ?? false;
        return inTitle || inDescription;
      })
      .sort((a, b) => b.likesCount - a.likesCount);
  }, [shouldDoSearch, shouldDos]);
  const hasShouldDoSearch = shouldDoSearch.trim().length > 0;

  const resetShouldDoForm = () => {
    setShouldDoForm({ title: "", description: "", iconKey: defaultIconKey });
    setEditingShouldDoId(null);
  };

  const handleEditShouldDo = (id: string) => {
    const target = shouldDos.find((entry) => entry.id === id);
    if (!target) return;
    setEditingShouldDoId(id);
    setShouldDoForm({
      title: target.title,
      description: target.description ?? "",
      iconKey: target.iconKey ?? defaultIconKey,
    });
  };

  const handleSubmitShouldDo = async () => {
    const title = shouldDoForm.title.trim();
    const description = shouldDoForm.description.trim();
    const iconKey = shouldDoForm.iconKey || defaultIconKey;
    const iconColor = iconPalette[iconKey] ?? "#6366f1";
    if (!title) {
      setShouldDoSubmitError("Add a title before posting.");
      return;
    }
    setShouldDoSubmitError(null);
    setSavingShouldDo(true);
    const endpoint = editingShouldDoId
      ? `/api/should-dos/${editingShouldDoId}`
      : "/api/should-dos";
    const method = editingShouldDoId ? "PATCH" : "POST";
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, iconKey, iconColor }),
      });
      const body = (await response.json().catch(() => null)) as {
        shouldDo?: ShouldDoApi;
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(body?.error ?? "Unable to save idea.");
      }
      const normalized = normalizeShouldDo(
        (body?.shouldDo ?? body ?? {}) as ShouldDoApi
      );
      setShouldDos((current) => {
        const withIcon = {
          ...normalized,
          iconKey: normalized.iconKey ?? iconKey,
          iconColor: normalized.iconColor ?? iconColor,
        };
        const next = current.some((entry) => entry.id === normalized.id)
          ? current.map((entry) =>
              entry.id === normalized.id
                ? { ...entry, ...withIcon, isSeed: entry.isSeed }
                : entry
            )
          : [...current, withIcon];
        return next;
      });
      resetShouldDoForm();
    } catch (submitError) {
      setShouldDoSubmitError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save idea."
      );
    } finally {
      setSavingShouldDo(false);
    }
  };

  const handleLikeShouldDo = async (id: string) => {
    const target = shouldDos.find((entry) => entry.id === id);
    if (!target || target.isSeed) {
      return;
    }
    const nextLiked = !target.likedByCurrentUser;
    const delta = nextLiked ? 1 : -1;
    setLikingShouldDoId(id);
    setShouldDos((current) =>
      current.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              likedByCurrentUser: nextLiked,
              likesCount: Math.max(0, entry.likesCount + delta),
            }
          : entry
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
      setShouldDos((current) =>
        current.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                likedByCurrentUser: target.likedByCurrentUser,
                likesCount: target.likesCount,
              }
            : entry
        )
      );
      setShouldDoError(
        likeError instanceof Error
          ? likeError.message
          : nextLiked
          ? "Unable to like this idea."
          : "Unable to unlike this idea."
      );
    } finally {
      setLikingShouldDoId(null);
    }
  };

  return (
    <main className="relative overflow-hidden w-full min-h-screen lg:pt-18 xl:pt-24 2xl:pt-28 text-foreground lg:pb-8 xl:pb-12 2xl:pb-16 bg-linear-to-b from-green-soft/20 via-card/70 to-primary/20">
      <PageGradient />
      <div className="lg:px-4 xl:px-8 2xl:px-28 lg:space-y-6 xl:space-y-8">
        <PageHeading
          badgeLabel="Community habits"
          title="Browse habits people post for the crew"
          description="Open the blueprint, learn why it works, and riff back on a habit that stuck."
          actions={
            <div className="flex flex-col lg:gap-1.5 xl:gap-2 items-center">
              <Button
                onClick={() => router.push("/dashboard/habits/popular/create")}
                className="lg:h-6 xl:h-8 2xl:h-10 lg:px-3 xl:px-5 2xl:px-7 lg:text-[11px] xl:text-xs 2xl:text-sm bg-primary text-white shadow-sm hover:brightness-105 transition"
              >
                Create a post
              </Button>
            </div>
          }
        />

        <div className="flex flex-wrap items-center lg:gap-2 xl:gap-3">
          <HabitsTabs
            active="popular"
            containerClassName="lg:gap-0.5 xl:gap-1 2xl:gap-2"
          />
          <span className="lg:text-[11px] xl:text-xs text-muted-foreground">
            Filter by category, cadence, or time window and click a card to see
            the full post.
          </span>
        </div>

        <div className="lg:space-y-3 xl:space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-inner lg:px-3 xl:px-4 lg:py-3 xl:py-4">
            <div className="flex flex-wrap items-center lg:gap-2 xl:gap-3">
              <div className="relative max-w-xs flex-1 lg:max-w-[200px] xl:max-w-[220px]">
                <Search className="lg:w-2 lg:h-2 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  className="w-full rounded-full border border-gray-100 bg-white lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:pl-7 xl:pl-9 lg:text-[11px] xl:text-xs text-foreground placeholder:text-muted-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex flex-wrap items-center lg:gap-1.5 xl:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCategory("All");
                    setCommitment("Any");
                    setTimeWindow("Any");
                  }}
                  className="lg:px-2 xl:px-3 lg:py-1 xl:py-1.5 rounded-full border border-gray-100 lg:text-[11px] xl:text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition"
                >
                  Reset filters
                </button>
              </div>

              <div className="flex flex-wrap items-center lg:gap-1.5 xl:gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`lg:px-2 xl:px-3 lg:py-1 xl:py-1.5 rounded-full border lg:text-[11px] xl:text-xs font-semibold transition ${
                      category === item
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-muted-foreground border-gray-200 hover:border-primary/40"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center lg:gap-1.5 xl:gap-2">
                {(
                  ["Any", "Quick", "Standard", "Deep"] as (Commitment | "Any")[]
                ).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCommitment(item)}
                    className={`lg:px-2 xl:px-3 lg:py-1 xl:py-1.5 rounded-full border lg:text-[11px] xl:text-xs font-semibold transition ${
                      commitment === item
                        ? "bg-analytics-dark/90 text-white border-analytics-dark"
                        : "bg-white text-muted-foreground border-gray-200 hover:border-primary/40"
                    }`}
                  >
                    {item === "Any" ? "Any effort" : `${item} time`}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center lg:gap-1.5 xl: gap-2">
                {timeFilters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setTimeWindow(item.value === "Any" ? "Any" : item.value)
                    }
                    className={`lg:px-2 xl:px-3 lg:py-1 xl:py-1.5 rounded-full border lg:text-[11px] xl:text-xs font-semibold transition ${
                      timeWindow === item.value ||
                      (timeWindow === "Any" && item.value === "Any")
                        ? "bg-muted text-foreground border-gray-200"
                        : "bg-white text-muted-foreground border-gray-200 hover:border-primary/40"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5">
            <div>
              <div className="lg:space-y-3 xl:space-y-4">
                <div className="flex items-center justify-between lg:gap-2 xl:gap-3">
                  <div>
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                      Browse
                    </p>
                    <h2 className="lg:text-base xl:text-lg 2xl:text-xl font-semibold">
                      Popular habit posts
                    </h2>
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                      Hover or tap a card to preview its full why and steps.
                    </p>
                  </div>
                  <div className="inline-flex items-center lg:gap-1.5 xl:gap-2 rounded-full bg-muted lg:px-2 2xl:px-3 lg:py-0.5 xl:py-1 2xl:py-2 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
                    <TrendingUp className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                    {posts.length} posts
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:gap-2 xl:gap-3">
                  {loading ? (
                    <div className="col-span-2 rounded-2xl border border-dashed border-gray-100 bg-muted/50 lg:px-3 xl:px-4 lg:py-2 xl:py-3 2xl:py-5 lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                      Loading posts…
                    </div>
                  ) : error ? (
                    <div className="col-span-2 rounded-2xl border border-dashed border-gray-100 bg-muted/50 lg:px-3 xl:px-4 lg:py-2 xl:py-3 2xl:py-5 lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold text-rose-600">
                      {error}
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="col-span-2 rounded-2xl border border-dashed border-gray-200 bg-muted/50 lg:px-3 xl:px-4 lg:py-2 xl:py-3 2xl:py-5 lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                      No posts match those filters yet. Try another combination.
                    </div>
                  ) : (
                    filteredPosts.map((post) => {
                      const styles = categoryStyles[post.category];
                      const isSelected = post.id === selectedPostId;
                      const likeLabel =
                        post.likesCount === 1 ? "like" : "likes";
                      return (
                        <div
                          key={post.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedPostId(post.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedPostId(post.id);
                            }
                          }}
                          className={`relative flex flex-col justify-between w-full text-left rounded-2xl border lg:p-3 xl:p-4 transition shadow-sm hover:border-primary/40 ${
                            isSelected
                              ? "border-primary/60 ring-2 ring-primary/20 bg-primary/5"
                              : "border-gray-100 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between lg:gap-1.5 xl:gap-2">
                            <div
                              className={`inline-flex items-center gap-2 rounded-full lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[8px] xl:text-[10px] 2xl:text-[11px] font-semibold ${styles.badge}`}
                            >
                              <span
                                className={`lg:h-1 lg:w-1 xl:h-2 xl:w-2 rounded-full ${styles.dot}`}
                              />
                              {post.category}
                            </div>
                            <span className="lg:text-[9px] xl:text-[11px] font-semibold text-muted-foreground">
                              {formatLikes(post.likesCount)} {likeLabel}
                            </span>
                          </div>
                          <div className="lg:mt-1 xl:mt-2 space-y-1">
                            <p className="lg:text-sm xl:text-base 2xl:text-lg font-semibold">
                              {post.title}
                            </p>
                            <p className="lg:text-[10px] xl:text-xs 2xl:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                              {post.summary ?? "No summary provided."}
                            </p>
                          </div>
                          <div className="lg:mt-2 xl:mt-3 flex flex-wrap lg:gap-1.5 xl:gap-2 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
                            <div className="inline-flex items-center gap-1 rounded-full bg-muted lg:px-2 lg:py-0.5 xl:py-1">
                              <Clock3 className="lg:w-2.5 lg:h-2.5 xl:w-3.5 xl:h-3.5 text-primary" />
                              {post.duration ?? "Flexible"}
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-muted lg:px-2 lg:py-0.5 xl:py-1">
                              <CalendarClock className="lg:w-2.5 lg:h-2.5 xl:w-3.5 xl:h-3.5 text-primary" />
                              {post.cadence}
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-muted lg:px-2 lg:py-0.5 xl:py-1">
                              <HeartPulse className="lg:w-1.5 lg:h-1.5 xl:w-3.5 xl:h-3.5 text-primary" />
                              {commitmentCopy[post.commitment]}
                            </div>
                          </div>
                          <div className="lg:mt-2 xl:mt-3 flex items-center justify-between lg:gap-2 xl:gap-3 lg:text-[9px] xl:text-xs">
                            <span className="text-muted-foreground">
                              • Posted {formatPostedDate(post.createdAt)}
                            </span>
                            <div className="flex flex-col items-end gap-1">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleLike(post.id);
                                }}
                                disabled={
                                  post.likedByCurrentUser ||
                                  likingPostId === post.id
                                }
                                aria-label={
                                  post.likedByCurrentUser
                                    ? "You already liked this post"
                                    : `Like ${post.title}`
                                }
                                className={`inline-flex items-center gap-1 rounded-full border lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] font-semibold transition ${
                                  post.likedByCurrentUser
                                    ? "border-primary bg-primary text-white"
                                    : "border-gray-200 bg-white text-muted-foreground hover:border-primary/40"
                                } ${
                                  likingPostId === post.id ? "opacity-80" : ""
                                }`}
                              >
                                <Heart
                                  className={`lg:h-3 lg:w-3 xl:w-4 xl:h-4 ${
                                    post.likedByCurrentUser
                                      ? "text-white"
                                      : "text-primary"
                                  }`}
                                />
                                <span className="whitespace-nowrap">
                                  {post.likedByCurrentUser ? "Liked" : "Like"}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <aside className="lg:rounded-2xl xl:rounded-3xl border border-gray-100 shadow-inner shadow-black/10 h-fit bg-linear-to-tr to-primary/30 via-card from-white">
              <div className="lg:px-4 xl:px-5 lg:pt-4 xl:pt-5 lg:pb-5 xl:pb-6 lg:space-y-3 xl:space-y-4">
                <div className="flex items-center justify-between lg:gap-2 xl:gap-3">
                  <div>
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                      Playbook
                    </p>
                    <h2 className="lg:text-base xl:text-lg 2xl:text-xl font-semibold">
                      Blueprint and safety net
                    </h2>
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                      Copy the structure, tune the anchor, and pin it in your
                      board.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted lg:px-2 xl:px-3 lg:py-1 xl:py-2 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
                    Community
                  </div>
                </div>

                {selectedPost ? (
                  <div className="lg:space-y-3 xl:space-y-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center lg:gap-1.5 xl:gap-2 rounded-full bg-muted lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 2xl:py-2 lg:text-[9px] xl:text-[11px] font-semibold text-muted-foreground">
                        <Target className="lg:w-2 lg:h-2 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 text-primary" />
                        {selectedPost.timeWindow} -{" "}
                        {selectedPost.anchor ?? "No anchor yet"}
                      </div>
                      <h3 className="lg:text-sm xl:text-base 2xl:text-lg font-semibold lg:pt-1.5 xl:pt-2 2xl:pt-4">
                        {selectedPost.title}
                      </h3>
                      <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground leading-relaxed">
                        {selectedPost.summary ?? "No summary available."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between lg:gap-2 xl:gap-3">
                      <div className="inline-flex items-center lg:gap-1.5 xl:gap-2 lg:text-[11px] xl:text-xs font-semibold text-muted-foreground">
                        <Heart
                          className={`lg:w-3 lg:h-3 xl:w-4 xl:h-4 ${
                            selectedPost.likedByCurrentUser
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span>
                          {selectedPost.likesCount}{" "}
                          {selectedPost.likesCount === 1 ? "like" : "likes"}
                        </span>
                      </div>
                    </div>
                    {likeError ? (
                      <p
                        className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-rose-600"
                        role="alert"
                      >
                        {likeError}
                      </p>
                    ) : null}

                    <div className="grid grid-cols-2 lg:gap-2 xl:gap-3 lg:text-xs xl:text-sm">
                      <div className="rounded-2xl border border-gray-100 bg-muted lg:p-2 xl:p-3 space-y-1">
                        <div className="flex items-center gap-2 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
                          <Clock3 className="lg:w-3 lg:h-3 2xl:w-4 2xl:h-4 text-primary" />
                          Duration
                        </div>
                        <p className="lg:text-xs xl:text-sm 2xl:text-base font-semibold">
                          {selectedPost.duration ?? "Flexible"}
                        </p>
                        <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
                          {commitmentCopy[selectedPost.commitment]}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-muted lg:p-2 xl:p-3 space-y-1">
                        <div className="flex items-center gap-2 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
                          <CalendarClock className="lg:w-3 lg:h-3 2xl:w-4 2xl:h-4 text-primary" />
                          Cadence
                        </div>
                        <p className="lg:text-xs xl:text-sm font-semibold">
                          {selectedPost.cadence}
                        </p>
                        <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
                          {selectedPost.highlight ?? "Why it matters"}
                        </p>
                      </div>
                    </div>

                    <div className="lg:space-y-1 xl:space-y-2">
                      <div className="flex items-center lg:gap-1.5 xl:gap-2">
                        <Brain className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-primary" />
                        <span className="lg:text-xs xl:text-sm 2xl:text-base font-semibold">
                          Why it works
                        </span>
                      </div>
                      <div className="flex flex-wrap lg:gap-1.5 xl:gap-2">
                        {selectedPost.benefits.length > 0 ? (
                          selectedPost.benefits.map((benefit) => (
                            <span
                              key={benefit}
                              className="inline-flex items-center lg:gap-1.5 xl:gap-2 rounded-full bg-muted/30 lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground"
                            >
                              <span className="lg:h-1 lg:w-1 xl:h-1.5 xl:w-1.5 rounded-full bg-primary" />
                              {benefit}
                            </span>
                          ))
                        ) : (
                          <span className="lg:text-[8px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
                            No benefit notes yet.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="lg:space-y-2 xl:space-y-3">
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-primary/5 lg:p-3 xl:p-4 lg:space-y-1 xl:space-y-2">
                        <div className="flex items-center justify-between lg:text-xs xl:text-sm font-semibold">
                          <span className="inline-flex items-center gap-2 lg:text-xs xl:text-sm 2xl:text-base">
                            <CheckCircle2 className="lg:w-3 lg:h-3 2xl:w-4 2xl:h-4 text-primary" />
                            First three reps
                          </span>
                        </div>
                        <ul className="space-y-2 lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                          {selectedPost.steps.length > 0 ? (
                            selectedPost.steps.map((step) => (
                              <li
                                key={step}
                                className="flex items-center gap-2"
                              >
                                <span className="inline-block lg:h-1 lg:w-1 xl:h-1.5 xl:w-1.5 rounded-full bg-primary" />
                                <span>{step}</span>
                              </li>
                            ))
                          ) : (
                            <li className="lg:text-[9px] xl:text-[11px] 2xl:text-xs">
                              No steps recorded yet.
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center lg:gap-1 xl:gap-2 2xl:gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAddToBoard();
                          }}
                          disabled={
                            !selectedPost ||
                            isAddingSelectedPost ||
                            isAddedSelectedPost
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 lg:px-2 xl:px-3 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CalendarClock className="lg:h-3 lg:w-3 xl:w-4 xl:h-4" />
                          <span>
                            {isAddedSelectedPost
                              ? "Added"
                              : isAddingSelectedPost
                              ? "Adding..."
                              : "Add to habit board"}
                          </span>
                          {showSuccessMessage ? (
                            <p className="lg:text-[11px] xl:text-xs text-green-soft">
                              Habit added to your board.
                            </p>
                          ) : null}
                          {addError ? (
                            <p
                              className="lg:text-[11px] xl:text-xs text-rose-500"
                              role="alert"
                            >
                              {addError}
                            </p>
                          ) : null}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLike(selectedPost.id)}
                        disabled={
                          userHasLikedSelectedPost ||
                          likingPostId === selectedPost.id
                        }
                        aria-label={
                          userHasLikedSelectedPost
                            ? "You already liked this post"
                            : `Like ${selectedPost.title}`
                        }
                        className={`inline-flex items-center gap-2 rounded-full border lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs font-semibold transition ${
                          userHasLikedSelectedPost
                            ? "border-primary bg-primary text-white"
                            : "border-gray-200 bg-white text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        <span>
                          {userHasLikedSelectedPost
                            ? "Liked"
                            : "Like this post"}
                        </span>
                      </button>
                      {userHasLikedSelectedPost ? (
                        <p className="text-[11px] text-green-soft">
                          You liked this post.
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-muted/40 lg:p-3 xl:p-4 lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                    Select a post on the left to see its blueprint.
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        <section
          id="should-do"
          className="lg:space-y-2 xl:space-y-3 lg:p-4 xl:p-6 lg:rounded-2xl xl:rounded-3xl shadow-inner border border-gray-100 bg-linear-to-bl from-coral-300 via-slate-100 to-green-soft/30 lg:scroll-mt-24 xl:scroll-mt-28"
        >
          <div className="flex lg:gap-2 xl:gap-3 items-start justify-between">
            <div className="space-y-1">
              <p className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Should Do
              </p>
              <h3 className="lg:text-base xl:text-lg 2xl:text-xl font-semibold">
                Drop wild ideas for everyone to try
              </h3>
              <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                Post, edit, or like community dares. Top liked ones surface on
                the dashboard widget.
              </p>
            </div>
            <div className="flex flex-col lg:gap-1.5 xl:gap-2 w-auto items-end">
              <div className="inline-flex items-center lg:gap-1.5 xl:gap-2 rounded-full bg-muted lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground self-end">
                {filteredShouldDos.length} ideas
              </div>
              <div className="relative w-full lg:w-48 xl:w-64">
                <Search className="lg:w-3 lg:h-3 2xl:w-4 2xl:h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={shouldDoSearch}
                  onChange={(event) => setShouldDoSearch(event.target.value)}
                  placeholder="Search ideas"
                  className="w-full rounded-full border border-gray-100 bg-white lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:pl-7 xl:pl-9 lg:text-[11px] xl:text-xs 2xl:text-sm text-foreground placeholder:text-muted-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-2 xl:gap-3 items-start">
            <div className="lg:space-y-1.5 xl:space-y-2.5">
              {shouldDoLoading ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-muted/40 lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                  Loading ideas...
                </div>
              ) : shouldDoError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold text-rose-600">
                  {shouldDoError}
                </div>
              ) : filteredShouldDos.length === 0 ? (
                hasShouldDoSearch ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-muted/40 lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                    No ideas match your search. Try a different keyword.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-muted/40 lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                    No ideas yet. Be the first to post a Should Do.
                  </div>
                )
              ) : (
                <div className="grid lg:gap-2 xl:gap-3 grid-cols-2 overflow-y-auto lg:pb-2 lg:pr-0.5 xl:pr-1">
                  {filteredShouldDos.map((idea) => {
                    const seedIcon = seedIconMap.get(idea.id);
                    const iconKey = idea.iconKey ?? seedIcon?.iconKey ?? null;
                    const iconColor =
                      idea.iconColor ?? seedIcon?.iconColor ?? undefined;
                    const IconComp = idea.icon ?? resolveIcon(iconKey);
                    const usesClass = (iconColor ?? "").includes("text-");

                    return (
                      <article
                        key={idea.id}
                        className="rounded-2xl border border-gray-100 bg-white shadow-sm xl:p-3 lg:p-2 lg:space-y-1 xl:space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="inline-flex items-center lg:gap-1.5 xl:gap-2 rounded-full bg-muted lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[8px] xl:text-[10px] 2xl:text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.16em]">
                            {idea.isSeed ? "Pinned" : "Community"}
                          </div>
                          <div className="inline-flex items-center lg:gap-1.5 xl:gap-2 rounded-full bg-white lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
                            <Heart className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-primary" />
                            {formatLikes(idea.likesCount)}{" "}
                            {idea.likesCount === 1 ? "like" : "likes"}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center lg:gap-1.5 xl:gap-2">
                            <span className="grid place-items-center lg:w-7 lg:h-7 xl:w-8 xl:h-8 rounded-full border border-gray-100 bg-muted">
                              <IconComp
                                className={
                                  usesClass
                                    ? `${
                                        iconColor ?? "text-primary"
                                      } lg:w-3 lg:h-3 xl:w-4 xl:h-4`
                                    : "lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-slate-700"
                                }
                                style={
                                  usesClass
                                    ? undefined
                                    : { color: iconColor ?? "inherit" }
                                }
                              />
                            </span>
                            <h4 className="lg:text-xs xl:text-sm 2xl:text-base font-semibold text-foreground">
                              {idea.title}
                            </h4>
                          </div>
                          <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-muted-foreground leading-relaxed">
                            {idea.description ?? "No extra details yet."}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center lg:gap-1.5 xl:gap-2">
                          <button
                            type="button"
                            onClick={() => handleLikeShouldDo(idea.id)}
                            disabled={
                              idea.isSeed || likingShouldDoId === idea.id
                            }
                            className={`inline-flex items-center lg:gap-1.5 xl:gap-2 rounded-full border lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold transition ${
                              idea.likedByCurrentUser
                                ? "border-primary bg-primary text-white"
                                : "border-gray-200 bg-white text-muted-foreground hover:border-primary/40"
                            } ${
                              idea.isSeed ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                          >
                            <Heart
                              className={`lg:w-3 lg:h-3 xl:w-4 xl:h-4 ${
                                idea.likedByCurrentUser
                                  ? "text-white"
                                  : "text-primary"
                              }`}
                            />
                            <span>
                              {idea.isSeed
                                ? "Pinned"
                                : idea.likedByCurrentUser
                                ? "Unlike"
                                : "Like"}
                            </span>
                          </button>
                          {idea.ownedByCurrentUser && !idea.isSeed ? (
                            <button
                              type="button"
                              onClick={() => handleEditShouldDo(idea.id)}
                              className="inline-flex items-center lg:gap-1.5 xl:gap-2 rounded-full border border-gray-200 bg-white lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground hover:border-primary/40"
                            >
                              <Pencil className="lg:w-2.5 lg:h-2.5 xl:w-4 xl:h-4 text-primary" />
                              Edit
                            </button>
                          ) : null}
                        </div>

                        {idea.createdAt ? (
                          <p className="lg:text-[8px] xl:text-[11px] 2xl:text-xs text-muted-foreground">
                            Posted {formatPostedDate(idea.createdAt)}
                          </p>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:px-2 xl:px-4 lg:space-y-2 xl:space-y-3">
              <div className="space-y-1">
                <p className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                  {editingShouldDoId ? "Edit your idea" : "Post a Should Do"}
                </p>
                <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                  Keep it punchy. Crazy, hard, or weird ideas welcome.
                </p>
              </div>

              <div className="lg:space-y-2 xl:space-y-3">
                <div className="lg:space-y-1 xl:space-y-2">
                  <label className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold">
                    Icon
                  </label>
                  <div className="grid grid-cols-4 lg:gap-1.5 xl:gap-2">
                    {iconOptions.map((option) => {
                      const IconComp = resolveIcon(option.key);
                      const selected = shouldDoForm.iconKey === option.key;
                      const bg =
                        iconPalette[option.key] ??
                        iconPalette[defaultIconKey] ??
                        "#e5e7eb";
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() =>
                            setShouldDoForm((current) => ({
                              ...current,
                              iconKey: option.key,
                            }))
                          }
                          className={`flex items-center lg:gap-1.5 xl:gap-2 rounded-2xl border lg:p-1 xl:p-2 text-left transition hover:border-primary/40 ${
                            selected
                              ? "border-primary shadow-sm"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <span
                            className="grid place-items-center lg:w-8 lg:h-8 xl:w-9 xl:h-9 rounded-xl border border-white"
                            style={{ backgroundColor: `${bg}20` }}
                          >
                            <IconComp className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-slate-700" />
                          </span>
                          <span className="lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-foreground">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold">
                    Title
                  </label>
                  <input
                    value={shouldDoForm.title}
                    onChange={(event) =>
                      setShouldDoForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="e.g. Sunrise cold plunge accountability"
                    maxLength={80}
                    className="w-full rounded-2xl border border-gray-200 bg-white lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs 2xl:text-sm text-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold">
                    Details (optional)
                  </label>
                  <textarea
                    value={shouldDoForm.description}
                    onChange={(event) =>
                      setShouldDoForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="What makes it fun, scary, or memorable?"
                    className="w-full rounded-2xl border border-gray-200 bg-white lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs 2xl:text-sm text-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
              </div>

              {shouldDoSubmitError ? (
                <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs text-rose-600">
                  {shouldDoSubmitError}
                </p>
              ) : null}

              <div className="flex items-center lg:gap-1.5 xl:gap-2">
                <Button
                  type="button"
                  onClick={handleSubmitShouldDo}
                  disabled={savingShouldDo}
                  className="lg:h-7 xl:h-9 2xl:h-10 lg:text-[11px] xl:text-xs 2xl:text-sm bg-primary text-white shadow-sm hover:brightness-105 transition disabled:opacity-70"
                >
                  {editingShouldDoId
                    ? savingShouldDo
                      ? "Updating..."
                      : "Update idea"
                    : savingShouldDo
                    ? "Posting..."
                    : "Post idea"}
                </Button>
                {editingShouldDoId ? (
                  <button
                    type="button"
                    onClick={resetShouldDoForm}
                    className="lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PopularHabitsPage;
