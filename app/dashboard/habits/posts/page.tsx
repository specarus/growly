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
});

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
