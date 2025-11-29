import { headers } from "next/headers";
import { redirect } from "next/navigation";

import HabitCreatePage from "./create-habit-page";
import type { HabitFormState } from "./types";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Habit, PostHabit } from "@prisma/client";

import { popularHabits } from "../popular/popular-habits-data";
import type { PopularPost } from "../popular/types";
import { buildHabitFormStateFromPost } from "../popular/import-habit-utils";

type SearchParams = {
  popularPostId?: string | string[];
};

type CreateHabitPageProps = {
  searchParams?: Promise<SearchParams | undefined> | SearchParams | undefined;
};

type PostWithRelations = PostHabit & {
  habit: Habit | null;
  user: { name: string | null } | null;
};

const toPopularPost = (post: PostWithRelations): PopularPost => ({
  id: post.id,
  title: post.title,
  summary: post.summary ?? null,
  category: post.category,
  cadence: post.cadence,
  timeWindow: post.timeWindow,
  commitment: post.commitment,
  anchor: post.anchor ?? "",
  duration: post.duration ?? "",
  highlight: post.highlight ?? "",
  benefits: post.benefits ?? [],
  steps: post.steps ?? [],
  guardrails: post.guardrails ?? [],
  createdAt: post.createdAt.toISOString(),
  userName: post.user?.name ?? null,
  habitName: post.habit?.name ?? null,
  likesCount: post.likesCount,
  likedByCurrentUser: false,
  isCommunityPost: true,
});

const findPopularPostById = async (
  postId: string
): Promise<PopularPost | null> => {
  const record =
    (await prisma.postHabit.findUnique({
      where: { id: postId },
      include: {
        habit: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    })) as PostWithRelations | null;

  if (record) {
    return toPopularPost(record);
  }

  return popularHabits.find((entry) => entry.id === postId) ?? null;
};

export default async function CreateHabit({
  searchParams,
}: CreateHabitPageProps = {}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  let popularPost: PopularPost | null = null;
  let initialHabit: Partial<HabitFormState> | undefined;

  const resolvedSearchParams = await searchParams;
  const rawPopularPostId = resolvedSearchParams?.popularPostId;
  const normalizedPopularPostId =
    typeof rawPopularPostId === "string"
      ? rawPopularPostId
      : Array.isArray(rawPopularPostId)
      ? rawPopularPostId[0]
      : undefined;

  if (normalizedPopularPostId) {
    popularPost = await findPopularPostById(normalizedPopularPostId);
    if (popularPost) {
      initialHabit = buildHabitFormStateFromPost(popularPost);
    }
  }

  return (
    <HabitCreatePage initialHabit={initialHabit} popularPost={popularPost} />
  );
}
