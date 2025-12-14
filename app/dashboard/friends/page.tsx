export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import FriendsPage from "./friends-page";
import type { FriendHabit, FriendProfile } from "./types";
import type { PopularPost } from "../habits/popular/types";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { XP_PER_HABIT, XP_PER_TODO } from "@/lib/xp";
import { computeLevelState } from "@/lib/xp-level";
import { popularHabits } from "../habits/popular/popular-habits-data";
import { seedTemplates } from "./seed-templates";
import { formatDayKey } from "@/lib/habit-progress";
import { HABIT_STREAK_THRESHOLD } from "@/lib/streak";

const normalizeGoal = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return 1;
  }
  return value;
};

const mapPostToFriendHabit = (
  post: {
    id: string;
    title: string;
    summary: string | null;
    category: string;
    timeWindow?: string | null;
    commitment?: string | null;
    anchor?: string | null;
    highlight?: string | null;
    likesCount?: number | null;
    user?: { name?: string | null } | null;
  },
  likedByCurrentUser: boolean
): FriendHabit => ({
  id: post.id,
  title: post.title,
  summary: post.summary,
  category: post.category,
  timeWindow: post.timeWindow,
  commitment: post.commitment,
  anchor: post.anchor,
  highlight: post.highlight,
  likesCount: post.likesCount ?? 0,
  userName: post.user?.name ?? undefined,
  likedByCurrentUser,
});

const mapPopularToFriendHabit = (
  post: PopularPost,
  likedByCurrentUser: boolean
): FriendHabit =>
  mapPostToFriendHabit(
    {
      id: post.id,
      title: post.title,
      summary: post.summary,
      category: post.category,
      timeWindow: post.timeWindow,
      commitment: post.commitment,
      anchor: post.anchor,
      highlight: post.highlight,
      likesCount: post.likesCount,
      user: post.userName ? { name: post.userName } : undefined,
    },
    likedByCurrentUser
  );

const buildSeedFriends = (currentLikedIds: Set<string>): FriendProfile[] => {
  return seedTemplates.map((seed) => {
    const likedHabits = seed.likedHabitIds
      .map((id) => popularHabits.find((entry) => entry.id === id))
      .filter((entry): entry is PopularPost => Boolean(entry))
      .map((post) =>
        mapPopularToFriendHabit(post, currentLikedIds.has(post.id))
      );

    const { level, xpGainedInLevel, xpNeededForLevelUp, progress } =
      computeLevelState(seed.xp);
    const mutualLikes = likedHabits.filter(
      (habit) => habit.likedByCurrentUser
    ).length;
    const categoryCounts = likedHabits.reduce<Record<string, number>>(
      (acc, habit) => {
        acc[habit.category] = (acc[habit.category] ?? 0) + 1;
        return acc;
      },
      {}
    );
    const dominantCategory =
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      undefined;

    const recentActivity = likedHabits
      .slice(0, 3)
      .map((habit) => `Liked ${habit.title}`);

    return {
      id: seed.id,
      name: seed.name,
      location: seed.location,
      focus: seed.focus,
      headline: seed.headline,
      privateAccount: seed.privateAccount ?? false,
      friendsInCommon: seed.friendsInCommon ?? Math.min(3, mutualLikes),
      mutualLikes,
      streakDays: seed.streakDays,
      level,
      totalXP: seed.xp,
      xpProgress: progress,
      xpIntoLevel: xpGainedInLevel,
      xpNeededForLevelUp,
      badges: seed.badges,
      likedHabits,
      dominantCategory,
      isNew: true,
      vibe: seed.vibe,
      highlight: likedHabits[0]?.summary ?? seed.headline,
      recentActivity,
      friendStatus: "none",
    } satisfies FriendProfile;
  });
};

export default async function Friends() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const currentUserLikedRecords = await prisma.postHabitLike.findMany({
    where: { userId: session.user.id },
    select: { postHabitId: true },
  });
  const currentLikedIds = new Set(
    currentUserLikedRecords.map((entry) => entry.postHabitId)
  );

  const users = await prisma.user.findMany({
    where: { id: { not: session.user.id } },
    select: { id: true, name: true, createdAt: true, privateAccount: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const friendIds = users.map((user) => user.id);

  const friendRequests = await (prisma as any).friendRequest.findMany({
    where: {
      OR: [
        { fromUserId: session.user.id },
        { toUserId: session.user.id },
      ],
    },
    select: {
      id: true,
      fromUserId: true,
      toUserId: true,
      status: true,
    },
  });

  const friendStatusByUser = new Map<
    string,
    { status: "friends" | "incoming" | "outgoing"; requestId?: string }
  >();

  friendRequests.forEach(
    (request: {
      id: string;
      fromUserId: string;
      toUserId: string;
      status: "PENDING" | "ACCEPTED" | "DECLINED";
    }) => {
      const otherUserId =
        request.fromUserId === session.user.id
          ? request.toUserId
          : request.fromUserId;

      if (request.status === "ACCEPTED") {
        friendStatusByUser.set(otherUserId, {
          status: "friends",
          requestId: request.id,
        });
        return;
      }

      if (request.status === "PENDING") {
        if (request.fromUserId === session.user.id) {
          if (!friendStatusByUser.has(otherUserId)) {
            friendStatusByUser.set(otherUserId, {
              status: "outgoing",
              requestId: request.id,
            });
          }
        } else if (request.toUserId === session.user.id) {
          if (!friendStatusByUser.has(otherUserId)) {
            friendStatusByUser.set(otherUserId, {
              status: "incoming",
              requestId: request.id,
            });
          }
        }
      }
    }
  );

  const [todoGroups, habitProgressEntries, likedRecords]: [
    { userId: string; status: string; _count: number }[],
    {
      progress: number;
      date: Date;
      habit: { userId: string; goalAmount: number | null } | null;
    }[],
    {
      userId: string;
      post: {
        id: string;
        title: string;
        summary: string | null;
        category: string;
        timeWindow: string;
        commitment: string;
        anchor: string | null;
        highlight: string | null;
        likesCount: number | null;
        user?: { name?: string | null } | null;
      } | null;
    }[]
  ] =
    friendIds.length === 0
      ? [[], [], []]
      : await Promise.all([
          prisma.todo.groupBy({
            by: ["userId", "status"],
            where: {
              userId: { in: friendIds },
              status: "COMPLETED",
            },
            _count: true,
          }),
          prisma.habitDailyProgress.findMany({
            where: { habit: { userId: { in: friendIds } } },
            select: {
              progress: true,
              date: true,
              habit: {
                select: {
                  userId: true,
                  goalAmount: true,
                },
              },
            },
          }),
          prisma.postHabitLike.findMany({
            where: { userId: { in: friendIds } },
            include: {
              post: {
                select: {
                  id: true,
                  title: true,
                  summary: true,
                  category: true,
                  timeWindow: true,
                  commitment: true,
                  anchor: true,
                  highlight: true,
                  likesCount: true,
                  user: { select: { name: true } },
                },
              },
            },
          }),
        ]);

  const todoCompletedByUser = new Map<string, number>();
  todoGroups.forEach((group) => {
    todoCompletedByUser.set(group.userId, group._count);
  });

  const habitCompletionByUser = new Map<string, number>();
  const streakDaysByUser = new Map<string, Set<string>>();
  habitProgressEntries.forEach((entry) => {
    const habit = entry.habit;
    const userId = habit?.userId;
    if (!userId || !habit) return;

    const goal = normalizeGoal(habit.goalAmount);
    const ratio = goal > 0 ? entry.progress / goal : 0;

    if (entry.progress >= goal) {
      habitCompletionByUser.set(
        userId,
        (habitCompletionByUser.get(userId) ?? 0) + 1
      );
    }

    if (ratio >= HABIT_STREAK_THRESHOLD) {
      const key = formatDayKey(entry.date);
      const existing = streakDaysByUser.get(userId) ?? new Set<string>();
      existing.add(key);
      streakDaysByUser.set(userId, existing);
    }
  });

  const likedByUser = new Map<string, FriendHabit[]>();
  likedRecords.forEach((record) => {
    const post = record.post;
    if (!post) return;
    const list = likedByUser.get(record.userId) ?? [];
    list.push(mapPostToFriendHabit(post, currentLikedIds.has(post.id)));
    likedByUser.set(record.userId, list);
  });

  const friendsFromDb: FriendProfile[] = users.map((user) => {
    const todoCompleted = todoCompletedByUser.get(user.id) ?? 0;
    const habitCompleted = habitCompletionByUser.get(user.id) ?? 0;
    const totalXP = todoCompleted * XP_PER_TODO + habitCompleted * XP_PER_HABIT;
    const { level, xpGainedInLevel, xpNeededForLevelUp, progress } =
      computeLevelState(totalXP);

    const likedHabits = (likedByUser.get(user.id) ?? []).sort(
      (a, b) => b.likesCount - a.likesCount
    );
    const mutualLikes = likedHabits.filter(
      (habit) => habit.likedByCurrentUser
    ).length;

    const categoryCounts = likedHabits.reduce<Record<string, number>>(
      (acc, habit) => {
        acc[habit.category] = (acc[habit.category] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const dominantCategory =
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      undefined;

    const badges: string[] = [];
    if (mutualLikes > 0) badges.push("Mutual likes");
    if ((streakDaysByUser.get(user.id)?.size ?? 0) >= 5)
      badges.push("Streak safe");
    if (likedHabits.length >= 3) badges.push("Habit scout");
    if (badges.length === 0) badges.push("Open to connect");

    const headline =
      likedHabits[0]?.summary ??
      "Exploring habits from the community and looking for accountability.";

    const recentActivity = likedHabits
      .slice(0, 3)
      .map((habit) => `Liked ${habit.title}`);

    return {
      id: user.id,
      name: user.name,
      privateAccount: user.privateAccount ?? false,
      friendsInCommon: Math.min(5, mutualLikes),
      headline,
      focus: dominantCategory ? `${dominantCategory} focus` : "Explorer",
      location: "Community",
      mutualLikes,
      streakDays: streakDaysByUser.get(user.id)?.size ?? 0,
      level,
      totalXP,
      xpProgress: progress,
      xpIntoLevel: xpGainedInLevel,
      xpNeededForLevelUp,
      badges,
      likedHabits,
      dominantCategory,
      joinedAt: user.createdAt?.toISOString(),
      highlight:
        likedHabits[0]?.highlight ?? likedHabits[0]?.anchor ?? undefined,
      recentActivity,
      friendStatus: friendStatusByUser.get(user.id)?.status ?? "none",
      requestId: friendStatusByUser.get(user.id)?.requestId,
    } satisfies FriendProfile;
  });

  const seedFriends = buildSeedFriends(currentLikedIds);
  const combinedFriends =
    friendsFromDb.length > 0
      ? [...friendsFromDb, ...seedFriends].slice(0, 12)
      : seedFriends;

  return <FriendsPage friends={combinedFriends} />;
}
