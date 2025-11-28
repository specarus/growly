"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Brain,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flame,
  HeartPulse,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/button";
import PageGradient from "@/app/components/ui/page-gradient";

import {
  Category,
  Commitment,
  PopularPost,
  categories,
  commitmentCopy,
  timeFilters,
  TimeWindow,
} from "./types";
import { popularHabits } from "./popular-habits-data";

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

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch("/api/habits/posts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load posts.");
        }
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        const normalized = (data.posts ?? []).map((post: any) => {
          const { user, habit, ...rest } = post;
          return {
            ...rest,
            userName: user?.name ?? null,
            habitName: habit?.name ?? null,
          } as PopularPost;
        });
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
    return () => {
      active = false;
    };
  }, []);

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

  const selectedPost =
    filteredPosts.find((post) => post.id === selectedPostId) ||
    filteredPosts[0] ||
    null;

  return (
    <main className="relative overflow-hidden w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground xl:pb-12 2xl:pb-16 bg-linear-to-b from-green-soft/20 via-card/70 to-primary/20">
      <PageGradient />
      <div className="xl:px-8 2xl:px-28 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              <BadgeCheck className="w-4 h-4" />
              <span>Community habits</span>
            </div>
            <div className="space-y-1">
              <h1 className="xl:text-xl 2xl:text-2xl md:text-3xl font-bold">
                Browse habits people post for the crew
              </h1>
              <p className="xl:text-xs 2xl:text-sm text-muted-foreground max-w-2xl">
                Open the blueprint, learn why it works, and riff back on a habit
                that stuck.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              onClick={() => router.push("/dashboard/habits/popular/create")}
              className="xl:h-10 2xl:h-12 xl:px-5 2xl:px-7 xl:text-sm 2xl:text-base bg-primary text-white shadow-sm hover:brightness-105 transition"
            >
              Create a post
            </Button>
            <Link
              href="/dashboard/habits"
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Back to your habits
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center xl:gap-1 2xl:gap-2 p-2 rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden xl:text-xs 2xl:text-sm">
            <Link
              href="/dashboard/habits"
              className="px-4 py-2 font-semibold text-muted-foreground hover:text-primary transition rounded-full"
            >
              Habits
            </Link>
            <Link
              href="/dashboard/habits/routines"
              className="px-4 py-2 font-semibold text-muted-foreground hover:text-primary transition rounded-full"
            >
              Routines
            </Link>
            <span
              className="px-4 py-2 font-semibold bg-primary text-white rounded-full"
              aria-current="page"
            >
              Popular
            </span>
          </div>
          <span className="xl:text-xs text-muted-foreground">
            Filter by category, cadence, or time window and click a card to see
            the full post.
          </span>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-sm px-4 py-3 xl:py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative max-w-xs flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by habitual anchor, headline, or benefit"
                  className="w-full rounded-full border border-gray-100 bg-white px-4 py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCategory("All");
                    setCommitment("Any");
                    setTimeWindow("Any");
                  }}
                  className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition"
                >
                  Reset filters
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                      category === item
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-muted-foreground border-gray-200 hover:border-primary/40"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(
                  ["Any", "Quick", "Standard", "Deep"] as (Commitment | "Any")[]
                ).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCommitment(item)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                      commitment === item
                        ? "bg-analytics-dark/90 text-white border-analytics-dark"
                        : "bg-white text-muted-foreground border-gray-200 hover:border-primary/40"
                    }`}
                  >
                    {item === "Any" ? "Any effort" : `${item} time`}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {timeFilters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setTimeWindow(item.value === "Any" ? "Any" : item.value)
                    }
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
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

          <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-5">
            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="px-5 pt-5 pb-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Browse
                    </p>
                    <h2 className="text-xl font-semibold">
                      Popular habit posts
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Hover or tap a card to preview its full why, steps, and
                      guardrails.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    {posts.length} posts
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {loading ? (
                    <div className="sm:col-span-2 rounded-2xl border border-dashed border-gray-200 bg-muted/50 px-4 py-5 text-sm text-muted-foreground">
                      Loading posts…
                    </div>
                  ) : error ? (
                    <div className="sm:col-span-2 rounded-2xl border border-dashed border-gray-200 bg-muted/50 px-4 py-5 text-sm font-semibold text-rose-600">
                      {error}
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="sm:col-span-2 rounded-2xl border border-dashed border-gray-200 bg-muted/50 px-4 py-5 text-sm text-muted-foreground">
                      No posts match those filters yet. Try another combination.
                    </div>
                  ) : (
                    filteredPosts.map((post) => {
                      const styles = categoryStyles[post.category];
                      const isSelected = post.id === selectedPostId;
                      return (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => setSelectedPostId(post.id)}
                          className={`relative w-full text-left rounded-2xl border px-4 py-4 transition shadow-sm hover:border-primary/40 ${
                            isSelected
                              ? "border-primary/60 ring-2 ring-primary/20 bg-primary/5"
                              : "border-gray-100 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${styles.badge}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${styles.dot}`}
                              />
                              {post.category}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {post.highlight ?? "Community share"}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="font-semibold">{post.title}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                              {post.summary ?? "No summary provided."}
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                            <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              <Clock3 className="w-3.5 h-3.5 text-primary" />
                              {post.duration ?? "Flexible"}
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              <CalendarClock className="w-3.5 h-3.5 text-primary" />
                              {post.cadence}
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              <HeartPulse className="w-3.5 h-3.5 text-primary" />
                              {commitmentCopy[post.commitment]}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-primary" />
                              <span>
                                {post.habitName ?? "Community habit"} • Posted{" "}
                                {formatPostedDate(post.createdAt)}
                              </span>
                            </div>
                            <span className="font-semibold text-foreground">
                              {post.anchor ?? post.timeWindow}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-gray-100 bg-white shadow-sm h-fit">
              <div className="px-5 pt-5 pb-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Playbook
                    </p>
                    <h2 className="text-xl font-semibold">
                      Blueprint and safety net
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Copy the structure, tune the anchor, and pin it in your
                      board.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    Community
                  </div>
                </div>

                {selectedPost ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                        <Target className="w-4 h-4 text-primary" />
                        {selectedPost.timeWindow} -{" "}
                        {selectedPost.anchor ?? "No anchor yet"}
                      </div>
                      <h3 className="text-lg font-semibold">
                        {selectedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedPost.summary ?? "No summary available."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-gray-100 bg-muted px-3 py-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <Clock3 className="w-4 h-4 text-primary" />
                          Duration
                        </div>
                        <p className="font-semibold">
                          {selectedPost.duration ?? "Flexible"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {commitmentCopy[selectedPost.commitment]}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-muted px-3 py-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <CalendarClock className="w-4 h-4 text-primary" />
                          Cadence
                        </div>
                        <p className="font-semibold">{selectedPost.cadence}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedPost.highlight ?? "Why it matters"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">
                          Why it works
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedPost.benefits.length > 0 ? (
                          selectedPost.benefits.map((benefit) => (
                            <span
                              key={benefit}
                              className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {benefit}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No benefit notes yet.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-primary/5 px-4 py-4 space-y-2">
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            First three reps
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Live soon
                          </span>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {selectedPost.steps.length > 0 ? (
                            selectedPost.steps.map((step) => (
                              <li key={step} className="flex items-start gap-2">
                                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>{step}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-xs">No steps recorded yet.</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          Guardrails
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedPost.guardrails.length > 0 ? (
                          selectedPost.guardrails.map((guardrail) => (
                            <div
                              key={guardrail}
                              className="rounded-2xl border border-gray-100 bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                            >
                              {guardrail}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No guardrails provided.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={() =>
                          router.push("/dashboard/habits/popular/create")
                        }
                        className="xl:h-10 2xl:h-12 xl:px-5 2xl:px-7 xl:text-sm 2xl:text-base bg-primary text-white shadow-sm hover:brightness-105 transition"
                      >
                        Share your version
                      </Button>
                      <Link
                        href="/dashboard/habits"
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition"
                      >
                        <CalendarClock className="w-4 h-4" />
                        Add to a habit
                      </Link>
                      <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                        <Sparkles className="w-4 h-4" />
                        Swap after saving
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
                    Select a post on the left to see its blueprint.
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PopularHabitsPage;
