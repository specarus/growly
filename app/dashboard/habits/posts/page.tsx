export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Prisma } from "@prisma/client";

import PageGradient from "@/app/components/ui/page-gradient";
import PageHeading from "@/app/components/page-heading";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { popularHabits } from "../popular/popular-habits-data";
import type { PopularPost } from "../popular/types";
import { CalendarClock, Clock3, HeartPulse, TrendingUp } from "lucide-react";

type DisplayPost = {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  createdAt: string;
  cadence: string;
  timeWindow: string;
  commitment: string;
  anchor: string | null;
  duration: string | null;
  highlight: string | null;
  likesCount: number;
  label: string;
};

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

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

type SectionProps = {
  title: string;
  description: string;
  posts: DisplayPost[];
};

const Section = ({ title, description, posts }: SectionProps) => (
  <section className="rounded-3xl border border-gray-100 bg-white shadow-sm">
    <div className="px-6 py-5 space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            {title}
          </p>
          <h2 className="xl:text-base 2xl:text-lg font-semibold">
            {description}
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </div>
      </div>
      <div className="space-y-4 pt-4">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-muted/50 xl:px-4 xl:py-3 2xl:py-6 xl:text-xs 2xl:text-sm text-muted-foreground">
            No posts yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-gray-100 bg-muted/40 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                    {post.category}
                  </span>
                  <span className="xl:text-[10px] 2xl:text-[11px] font-semibold text-muted-foreground">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <h3 className="xl:text-sm 2xl:text-base font-semibold text-foreground">
                  {post.title}
                </h3>
                <p className="xl:text-xs 2xl:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {post.summary ?? post.highlight ?? "No additional details."}
                </p>
                <div className="flex flex-wrap items-center gap-3 xl:text-[10px] 2xl:text-[11px] font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 xl:text-[11px] 2xl:text-xs uppercase tracking-[0.15em]">
                    <CalendarClock className="w-3 h-3 text-primary" />
                    {post.cadence}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 xl:text-[11px] 2xl:text-xs uppercase tracking-[0.15em]">
                    <Clock3 className="w-3 h-3 text-primary" />
                    {post.duration ?? "Flexible"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 xl:text-[11px] 2xl:text-xs uppercase tracking-[0.15em]">
                    <HeartPulse className="w-3 h-3 text-primary" />
                    {post.commitment}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{post.label}</span>
                  <span>
                    {post.likesCount} {post.likesCount === 1 ? "like" : "likes"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
);

export default async function MyPostsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/");
  }

  const userId = session.user.id;
  const [ownedPosts, likedRecords, addedHabits] = await Promise.all([
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

  return (
    <main className="relative overflow-hidden w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground xl:pb-12 2xl:pb-16 bg-linear-to-b from-white/90 via-light-yellow/55 to-green-soft/15">
      <PageGradient />
      <div className="xl:px-8 2xl:px-28 space-y-8">
        <PageHeading
          badgeLabel="My posts"
          title="Track everything you've shared & saved"
          description="Browse posts you've created, liked, or added from the community."
        />
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
        </div>
      </div>
    </main>
  );
}
