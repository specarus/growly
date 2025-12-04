export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Prisma } from "@prisma/client";

import { DisplayPost, DisplayShouldDo } from "./types";

import Section from "./components/section";
import ShouldDoSection from "./components/should-do-section";

import PageGradient from "@/app/components/ui/page-gradient";
import PageHeading from "@/app/components/page-heading";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { popularHabits } from "../popular/popular-habits-data";
import type { PopularPost } from "../popular/types";
import { Heart, TrendingUp } from "lucide-react";

const mapToDisplayPost = (
  post: Prisma.PostHabitGetPayload<{
    include: {
      user: { select: { name: true } };
      habit: { select: { name: true } };
    };
  }>,
  label: string
): DisplayPost => ({
  id: post.id,
  title: post.title,
  summary: post.summary,
  category: post.category,
  createdAt: post.createdAt.toISOString(),
  cadence: post.cadence,
  timeWindow: post.timeWindow,
  commitment: post.commitment,
  anchor: post.anchor,
  duration: post.duration,
  highlight: post.highlight,
  likesCount: post.likesCount,
  label,
});

const mapFallbackPost = (post: PopularPost, label: string): DisplayPost => ({
  id: post.id,
  title: post.title,
  summary: post.summary,
  category: post.category,
  createdAt: post.createdAt,
  cadence: post.cadence,
  timeWindow: post.timeWindow,
  commitment: post.commitment,
  anchor: post.anchor ?? null,
  duration: post.duration ?? null,
  highlight: post.highlight ?? null,
  likesCount: post.likesCount,
  label,
});

const mapShouldDo = (
  idea: Prisma.ShouldDoGetPayload<{
    select: {
      id: true;
      title: true;
      description: true;
      createdAt: true;
      likesCount: true;
      userId: true;
      iconKey: true;
      iconColor: true;
    };
  }>,
  label: string
): DisplayShouldDo => ({
  id: idea.id,
  title: idea.title,
  description: idea.description,
  createdAt: idea.createdAt.toISOString(),
  likesCount: idea.likesCount,
  label,
  iconKey: idea.iconKey,
  iconColor: idea.iconColor,
});

const sumLikes = (items: { likesCount: number }[]) =>
  items.reduce((total, entry) => total + (entry.likesCount ?? 0), 0);

const buildMonthBuckets = (items: { createdAt: string }[], monthsBack = 5) => {
  const now = new Date();
  const buckets: { key: string; label: string; count: number }[] = [];
  for (let i = monthsBack; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = new Intl.DateTimeFormat("en-US", {
      month: "short",
    }).format(date);
    buckets.push({ key, label, count: 0 });
  }

  items.forEach((item) => {
    const parsed = new Date(item.createdAt);
    if (Number.isNaN(parsed.getTime())) return;
    const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
    const target = buckets.find((bucket) => bucket.key === key);
    if (target) {
      target.count += 1;
    }
  });

  return buckets;
};

export default async function MyPostsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/");
  }

  const userId = session.user.id;
  const [
    ownedPosts,
    likedRecords,
    addedHabits,
    ownedShouldDos,
    likedShouldDoRecords,
  ] = await Promise.all([
    prisma.postHabit.findMany({
      where: { userId },
      include: {
        user: { select: { name: true } },
        habit: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.postHabitLike.findMany({
      where: { userId },
      select: { postHabitId: true },
    }),
    prisma.habit.findMany({
      where: {
        userId,
        sourcePopularPostId: { not: null },
      },
      select: { sourcePopularPostId: true },
    }),
    prisma.shouldDo.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        likesCount: true,
        createdAt: true,
        userId: true,
        iconKey: true,
        iconColor: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.shouldDoLike.findMany({
      where: { userId },
      select: { shouldDoId: true },
    }),
  ]);

  const likedPostIds = likedRecords.map((record) => record.postHabitId);
  const likedPosts = likedPostIds.length
    ? await prisma.postHabit.findMany({
        where: { id: { in: likedPostIds } },
        include: {
          user: { select: { name: true } },
          habit: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const likedShouldDoIds = likedShouldDoRecords.map(
    (record) => record.shouldDoId
  );
  const likedShouldDos = likedShouldDoIds.length
    ? await prisma.shouldDo.findMany({
        where: { id: { in: likedShouldDoIds } },
        select: {
          id: true,
          title: true,
          description: true,
          likesCount: true,
          createdAt: true,
          userId: true,
          iconKey: true,
          iconColor: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const addedSourceIds = Array.from(
    new Set(
      addedHabits
        .map((habit) => habit.sourcePopularPostId)
        .filter(Boolean) as string[]
    )
  );

  const addedPosts =
    addedSourceIds.length > 0
      ? await prisma.postHabit.findMany({
          where: { id: { in: addedSourceIds } },
          include: {
            user: { select: { name: true } },
            habit: { select: { name: true } },
          },
        })
      : [];

  const foundAddedIds = new Set(addedPosts.map((post) => post.id));
  const fallbackAddedPosts = addedSourceIds
    .filter((id) => !foundAddedIds.has(id))
    .map((id) => popularHabits.find((post) => post.id === id))
    .filter(Boolean) as PopularPost[];

  const displayOwned = ownedPosts.map((post) =>
    mapToDisplayPost(post, "Your post")
  );

  const displayLiked = likedPosts
    .filter((post) => post.userId !== userId)
    .map((post) => mapToDisplayPost(post, "Liked post"));

  const displayAdded = [
    ...addedPosts.map((post) => mapToDisplayPost(post, "Added from popular")),
    ...fallbackAddedPosts.map((post) =>
      mapFallbackPost(post, "Added from popular")
    ),
  ];

  const displayOwnedShouldDos = ownedShouldDos.map((idea) =>
    mapShouldDo(idea, "Your Should Do")
  );

  const displayLikedShouldDos = likedShouldDos
    .filter((idea) => idea.userId !== userId)
    .map((idea) => mapShouldDo(idea, "Liked Should Do"));

  const allPosts = [...displayOwned, ...displayLiked, ...displayAdded].filter(
    (post) => Boolean(post.createdAt)
  );

  const totalLikesGiven =
    sumLikes(displayLiked) + sumLikes(displayLikedShouldDos);
  const totalLikesEarned =
    sumLikes(displayOwned) + sumLikes(displayOwnedShouldDos);

  const categorySpread = (() => {
    const map = new Map<string, number>();
    allPosts.forEach((post) => {
      map.set(post.category, (map.get(post.category) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  })();

  const activityBuckets = buildMonthBuckets(
    [
      ...allPosts.map((post) => ({ createdAt: post.createdAt })),
      ...displayOwnedShouldDos.map((idea) => ({ createdAt: idea.createdAt })),
    ],
    5
  );

  const combinedIdeas = [...displayOwnedShouldDos, ...displayLikedShouldDos];
  const topIdea =
    combinedIdeas.length === 0
      ? null
      : combinedIdeas.reduce((current, entry) =>
          current.likesCount >= entry.likesCount ? current : entry
        );

  const topPost =
    allPosts.length === 0
      ? null
      : allPosts.reduce((current, entry) =>
          current.likesCount >= entry.likesCount ? current : entry
        );

  const likesPerCategory = (() => {
    const map = new Map<string, number>();
    allPosts.forEach((post) => {
      map.set(
        post.category,
        (map.get(post.category) ?? 0) + (post.likesCount ?? 0)
      );
    });
    return Array.from(map.entries())
      .map(([category, likes]) => ({ category, likes }))
      .sort((a, b) => b.likes - a.likes);
  })();

  const highlightStats = [
    {
      label: "Posted habits",
      value: displayOwned.length,
      hint: `${totalLikesEarned} total likes earned`,
      accent:
        "from-sky-500 via-blue-600 to-indigo-700 dark:from-sky-500 dark:via-blue-600 dark:to-indigo-700",
    },
    {
      label: "Ideas shared",
      value: displayOwnedShouldDos.length,
      hint: topIdea
        ? `"${topIdea.title}" is topping with ${topIdea.likesCount} likes`
        : "Try posting a fresh Should Do",
      accent:
        "from-rose-500 via-pink-500 to-fuchsia-500 dark:from-rose-500 dark:via-pink-500 dark:to-fuchsia-500",
    },
    {
      label: "Likes you gave",
      value: totalLikesGiven,
      hint: `${
        displayLiked.length + displayLikedShouldDos.length
      } things boosted`,
      accent:
        "from-purple-500 via-violet-500 to-indigo-500 dark:from-purple-500 dark:via-violet-500 dark:to-indigo-500",
    },
    {
      label: "Added blueprints",
      value: displayAdded.length,
      hint: "Imported to your board",
      accent:
        "from-emerald-400 via-green-500 to-teal-500 dark:from-emerald-400 dark:via-green-500 dark:to-teal-500",
    },
  ];

  return (
    <main className="relative overflow-hidden w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground xl:pb-12 2xl:pb-16 bg-linear-to-t from-white/90 via-light-yellow/55 to-green-soft/15">
      <PageGradient />
      <div className="xl:px-8 2xl:px-28 space-y-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-linear-to-r from-primary/10 via-white to-green-soft/20 dark:from-primary/20 dark:via-slate-900 dark:to-emerald-800/30 shadow-inner px-6 py-7 2xl:px-10 2xl:py-9">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_45%)]" />
          <div className="absolute inset-y-0 right-0 w-72 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_40%)] dark:bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.35),transparent_40%)] blur-2xl" />
          <div className="relative space-y-6">
            <PageHeading
              badgeLabel="My posts"
              title="Your habit drops, likes, and dares — now with stats"
              description="A personalized pulse of what you've published, bookmarked, and added from the crew."
              titleClassName="xl:text-2xl 2xl:text-3xl"
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 relative">
              {highlightStats.map((stat) => (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-2xl border border-white/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 shadow-inner px-4 py-3"
                >
                  <div
                    className={`absolute inset-0 opacity-70 bg-linear-to-br ${stat.accent} dark:from-white/10 dark:via-primary/25 dark:to-emerald-700/40`}
                  />
                  <div className="relative space-y-1 text-white drop-shadow-sm">
                    <p className="xl:text-[11px] 2xl:text-xs uppercase tracking-[0.14em] font-semibold">
                      {stat.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="xl:text-xl 2xl:text-2xl font-semibold">
                        {stat.value}
                      </span>
                    </div>
                    <p className="xl:text-[11px] 2xl:text-xs opacity-80">
                      {stat.hint}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-gray-100 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 shadow-inner p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  Category momentum
                </p>
                <h3 className="font-semibold xl:text-lg 2xl:text-xl">
                  Where your posts live
                </h3>
              </div>
              <div className="rounded-full bg-primary/10 text-primary font-semibold xl:text-xs 2xl:text-sm px-4 py-1">
                {allPosts.length} total posts
              </div>
            </div>
            {categorySpread.length === 0 ? (
              <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                Post a habit to see category momentum.
              </p>
            ) : (
              <div className="space-y-2">
                {categorySpread.map((entry, index) => {
                  const max =
                    categorySpread[0]?.count === 0
                      ? 1
                      : categorySpread[0].count;
                  const width = Math.max(8, (entry.count / max) * 100);
                  const accents = [
                    "from-primary/70 to-primary",
                    "from-green-soft/80 to-emerald-500",
                    "from-secondary to-primary",
                    "from-coral to-orange-500",
                  ];
                  const gradient = accents[index % accents.length];
                  return (
                    <div
                      key={entry.category}
                      className="rounded-2xl border border-gray-100 dark:border-white/10 bg-muted/40 dark:bg-slate-800/70 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between xl:text-sm 2xl:text-base font-semibold">
                        <span>{entry.category}</span>
                        <span className="text-muted-foreground">
                          {entry.count} {entry.count === 1 ? "post" : "posts"}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full bg-linear-to-r ${gradient}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-gray-100 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 shadow-inner p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  Posting rhythm
                </p>
                <h3 className="font-semibold xl:text-lg 2xl:text-xl">
                  Last 6 months
                </h3>
              </div>
              <div className="rounded-full bg-secondary/20 text-secondary-foreground font-semibold xl:text-xs 2xl:text-sm px-4 py-1">
                {activityBuckets.reduce(
                  (total, bucket) => total + bucket.count,
                  0
                )}{" "}
                drops
              </div>
            </div>
            <div className="flex items-end gap-3 h-28">
              {activityBuckets.map((bucket) => {
                const max =
                  activityBuckets.reduce(
                    (m, entry) => (entry.count > m ? entry.count : m),
                    0
                  ) || 1;
                const height = Math.max(8, (bucket.count / max) * 100);
                return (
                  <div
                    key={bucket.key}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="w-full rounded-full bg-muted dark:bg-slate-800 h-2 overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-primary to-green-soft dark:from-primary/70 dark:to-emerald-500"
                        style={{ width: `${(bucket.count / max) * 100 || 8}%` }}
                      />
                    </div>
                    <div
                      className="w-full rounded-xl bg-linear-to-b from-primary/80 to-green-soft/70 dark:from-primary/70 dark:to-emerald-600"
                      style={{ height: `${height}%` }}
                    />
                    <span className="xl:text-[10px] 2xl:text-[11px] text-muted-foreground">
                      {bucket.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="xl:text-[11px] 2xl:text-xs text-muted-foreground">
              Tracks everything you posted, liked, or added — plus your Should
              Do drops — to surface weekly momentum.
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-gray-100 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 shadow-inner p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  Like highlights
                </p>
                <h3 className="font-semibold xl:text-lg 2xl:text-xl">
                  What’s getting love
                </h3>
              </div>
              <div className="rounded-full bg-primary/10 text-primary font-semibold xl:text-xs 2xl:text-sm px-4 py-1">
                {totalLikesEarned} likes earned
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-linear-to-br from-primary/10 to-white dark:from-primary/20 dark:to-slate-900 px-4 py-3 space-y-2 shadow-inner">
                <p className="xl:text-[11px] 2xl:text-xs font-semibold text-primary uppercase tracking-[0.16em]">
                  Top post
                </p>
                {topPost ? (
                  <>
                    <h4 className="font-semibold xl:text-sm 2xl:text-base">
                      {topPost.title}
                    </h4>
                    <p className="text-muted-foreground xl:text-[11px] 2xl:text-xs line-clamp-2">
                      {topPost.summary ??
                        topPost.highlight ??
                        "No details yet."}
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                      <Heart className="w-3 h-3 text-primary" />
                      {topPost.likesCount}{" "}
                      {topPost.likesCount === 1 ? "like" : "likes"}
                    </div>
                  </>
                ) : (
                  <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                    Post a habit to start earning likes.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-linear-to-br from-secondary/10 to-white dark:from-secondary/20 dark:to-slate-900 px-4 py-3 space-y-2 shadow-inner">
                <p className="xl:text-[11px] 2xl:text-xs font-semibold text-secondary uppercase tracking-[0.16em]">
                  Top idea
                </p>
                {topIdea ? (
                  <>
                    <h4 className="font-semibold xl:text-sm 2xl:text-base">
                      {topIdea.title}
                    </h4>
                    <p className="text-muted-foreground xl:text-[11px] 2xl:text-xs line-clamp-2">
                      {topIdea.description ?? "No details yet."}
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                      <Heart className="w-3 h-3 text-primary" />
                      {topIdea.likesCount}{" "}
                      {topIdea.likesCount === 1 ? "like" : "likes"}
                    </div>
                  </>
                ) : (
                  <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                    Share a Should Do to see it compete.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-muted/40 dark:bg-slate-800/70 px-4 py-3 text-[11px] 2xl:text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Heart className="w-3 h-3 text-primary" />
                You liked {totalLikesGiven} things
              </span>
              <span className="inline-flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-primary" />
                {totalLikesEarned} likes received
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 shadow-inner p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  Likes by category
                </p>
                <h3 className="font-semibold xl:text-lg 2xl:text-xl">
                  Where the applause lands
                </h3>
              </div>
              <div className="rounded-full bg-muted px-4 py-1 xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
                {likesPerCategory.length} categories
              </div>
            </div>
            {likesPerCategory.length === 0 ? (
              <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
                Earn some likes to see category breakdown.
              </p>
            ) : (
              <div className="space-y-2">
                {likesPerCategory.map((entry, index) => {
                  const max =
                    likesPerCategory[0]?.likes === 0
                      ? 1
                      : likesPerCategory[0].likes;
                  const width = Math.max(8, (entry.likes / max) * 100);
                  const accents = [
                    "from-primary to-primary/70",
                    "from-green-soft to-emerald-500",
                    "from-secondary to-primary",
                    "from-amber-400 to-orange-500",
                  ];
                  const gradient = accents[index % accents.length];
                  return (
                    <div
                      key={entry.category}
                      className="rounded-2xl border border-gray-100 dark:border-white/10 bg-muted/40 dark:bg-slate-800/70 p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between xl:text-sm 2xl:text-base font-semibold">
                        <span>{entry.category}</span>
                        <span className="text-muted-foreground">
                          {entry.likes} {entry.likes === 1 ? "like" : "likes"}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full bg-linear-to-r ${gradient}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <Section
            title="Your posts"
            description="Posts you published from your habits"
            posts={displayOwned}
          />
          <Section
            title="Liked posts"
            description="Community posts you bookmarked with a like"
            posts={displayLiked}
          />
          <Section
            title="Added posts"
            description="Popular blueprints you added to your board"
            posts={displayAdded}
          />
          <ShouldDoSection
            title="Your Should Do ideas"
            description="Ideas you published in the Should Do board"
            ideas={displayOwnedShouldDos}
          />
          <ShouldDoSection
            title="Liked Should Dos"
            description="Community ideas you liked"
            ideas={displayLikedShouldDos}
          />
        </div>
      </div>
    </main>
  );
}
