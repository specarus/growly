"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import {
  Activity,
  ArrowRight,
  HandHeart,
  Heart,
  Lock,
  MapPin,
  Search,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";

import Link from "next/link";
import PageGradient from "@/app/components/ui/page-gradient";
import PageHeading from "@/app/components/page-heading";
import CircularProgress from "@/app/dashboard/components/circular-progress";
import type { FriendHabit, FriendProfile } from "./types";

type FriendsPageProps = {
  friends: FriendProfile[];
};

const formatXP = (value: number) => value.toLocaleString("en-US");

const badgeClass =
  "inline-flex items-center gap-1 rounded-full bg-muted lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground";

const HabitPill: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 border border-gray-100 lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-foreground shadow-inner">
    {label}
  </span>
);

const FriendsPage: React.FC<FriendsPageProps> = ({ friends }) => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(friends[0]?.id ?? "");
  const [connections, setConnections] = useState<
    Record<string, "connected" | "requested">
  >({});

  const filteredFriends = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return friends;
    return friends.filter((friend) => {
      const haystack = [
        friend.name,
        friend.focus,
        friend.headline,
        friend.dominantCategory,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [friends, search]);

  const selectedFriend =
    filteredFriends.find((friend) => friend.id === selectedId) ??
    filteredFriends[0] ??
    null;

  const handleCardActivate = (id: string) => {
    setSelectedId(id);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardActivate(id);
    }
  };

  const handleConnect = (id: string) => {
    setConnections((current) => {
      if (current[id] === "connected") {
        const { [id]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [id]: "connected" };
    });
  };

  const connectionState = (id: string) =>
    connections[id] ? "connected" : "add";

  const renderLikedHabit = (habit: FriendHabit) => (
    <article
      key={`${habit.id}-${habit.title}`}
      className="rounded-2xl border border-gray-100 bg-white shadow-inner lg:p-3 xl:p-4 space-y-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="lg:text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Liked habit
          </p>
          <h4 className="lg:text-xs xl:text-sm 2xl:text-base font-semibold text-foreground">
            {habit.title}
          </h4>
          <p className="lg:text-[10px] xl:text-[11px] 2xl:text-xs text-muted-foreground line-clamp-2">
            {habit.summary ?? habit.highlight ?? "No description yet."}
          </p>
        </div>
        <div className="text-right space-y-1">
          <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[10px] xl:text-[11px] font-semibold">
            <Heart className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
            {habit.likesCount}
          </div>
          {habit.likedByCurrentUser ? (
            <span className="block lg:text-[10px] xl:text-[11px] text-green-soft font-semibold">
              You liked this too
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center lg:gap-1.5 xl:gap-2">
        <HabitPill label={habit.category} />
        {habit.timeWindow ? <HabitPill label={habit.timeWindow} /> : null}
        {habit.commitment ? <HabitPill label={habit.commitment} /> : null}
        {habit.anchor ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
            <Sparkles className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-primary" />
            {habit.anchor}
          </span>
        ) : null}
      </div>
    </article>
  );

  return (
    <main className="relative overflow-hidden w-full min-h-screen lg:pt-18 xl:pt-24 2xl:pt-28 text-foreground lg:pb-8 xl:pb-12 2xl:pb-16 bg-linear-to-br from-white/90 via-light-yellow/55 to-green-soft/15">
      <PageGradient />
      <div className="lg:px-4 xl:px-8 2xl:px-28 lg:space-y-6 xl:space-y-8">
        <PageHeading
          badgeLabel="Social"
          title="Friends board"
          description="Add friends, watch their level climbs, and peek at habits they like."
          titleClassName="font-bold"
          actions={
            <Link
              href="/dashboard/habits"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white lg:px-3 xl:px-4 lg:py-1.5 xl:py-2 lg:text-[10px] xl:text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition shadow-sm"
            >
              <Users className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
              Habit board
            </Link>
          }
        />

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-4 xl:gap-5">
          <section className="lg:rounded-2xl xl:rounded-3xl border border-gray-100 bg-white shadow-inner lg:p-4 xl:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="lg:text-[11px] xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Friend directory
                </p>
                <h3 className="lg:text-sm xl:text-base 2xl:text-lg font-semibold">
                  People sharing their progress
                </h3>
                <p className="lg:text-[9px] xl:text-[11px] text-muted-foreground">
                  Search and open a profile to see level progress and liked
                  habits.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
                <Users className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                {filteredFriends.length} profiles
              </div>
            </div>

            <div className="relative">
              <Search className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, focus, or category"
                className="w-full rounded-full border border-gray-100 bg-white lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:pl-8 xl:pl-10 lg:text-[11px] xl:text-xs 2xl:text-sm text-foreground placeholder:text-muted-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[70vh] overflow-y-auto pr-1">
              {filteredFriends.length === 0 ? (
                <p className="lg:text-[11px] xl:text-xs text-muted-foreground rounded-2xl border border-dashed border-gray-200 bg-muted/40 lg:px-3 xl:px-4 lg:py-3 xl:py-4 col-span-full">
                  No friends match that search. Try a different keyword.
                </p>
              ) : (
                filteredFriends.map((friend) => {
                  const isSelected = friend.id === selectedFriend?.id;
                  const status = connectionState(friend.id);
                  const levelLabel = `Level ${friend.level}`;
                  return (
                    <article
                      key={friend.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => handleCardActivate(friend.id)}
                      onKeyDown={(event) =>
                        handleCardKeyDown(event, friend.id)
                      }
                      className={`w-full text-left rounded-2xl border lg:p-3 xl:p-4 transition shadow-sm flex flex-col gap-3 ${
                        isSelected
                          ? "border-primary/50 bg-primary/5"
                          : "border-gray-100 bg-white hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="lg:text-sm xl:text-base font-semibold text-foreground">
                            {friend.name}
                          </h4>
                          <p className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
                            {levelLabel}
                          </p>
                          <p className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
                            {friend.friendsInCommon ?? 0} friends in common
                          </p>
                          {friend.privateAccount ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted lg:px-2 xl:px-2.5 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[10px] font-semibold text-muted-foreground">
                              <Lock className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                              Private profile
                            </span>
                          ) : null}
                        </div>
                        <CircularProgress
                          progress={Math.min(100, friend.xpProgress)}
                          size={54}
                          progressColor="#f09029"
                        >
                          <span className="text-[10px] font-semibold">
                            L{friend.level}
                          </span>
                        </CircularProgress>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCardActivate(friend.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-full bg-primary text-white lg:px-3 xl:px-4 lg:py-1.5 xl:py-2 lg:text-[10px] xl:text-xs font-semibold shadow-sm shadow-primary/25"
                        >
                          View profile
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleConnect(friend.id);
                          }}
                          className={`inline-flex items-center gap-2 rounded-full border lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[10px] xl:text-xs font-semibold transition ${
                            status === "connected"
                              ? "border-primary bg-primary text-white"
                              : "border-gray-200 bg-white text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          <UserPlus className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                          {status === "connected" ? "Friends" : "Add friend"}
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section className="h-fit lg:rounded-2xl xl:rounded-3xl border border-gray-100 bg-white shadow-inner lg:p-4 xl:p-5 space-y-4">
            {!selectedFriend ? (
              <p className="lg:text-[11px] xl:text-xs text-muted-foreground">
                Select a friend to view their profile.
              </p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="lg:text-[11px] xl:text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      Profile
                    </p>
                    <div className="flex items-center gap-2">
                      <h3 className="lg:text-base xl:text-lg 2xl:text-xl font-semibold">
                        {selectedFriend.name}
                      </h3>
                      <span className={badgeClass}>
                        <MapPin className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-primary" />
                        {selectedFriend.location ?? "Remote"}
                      </span>
                      {selectedFriend.privateAccount ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[10px] xl:text-[11px] font-semibold text-muted-foreground">
                          <Lock className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                          Private profile
                        </span>
                      ) : null}
                    </div>
                    <p className="lg:text-[10px] xl:text-[11px] 2xl:text-sm text-muted-foreground max-w-3xl">
                      {selectedFriend.highlight ?? selectedFriend.headline}
                    </p>
                    <div className="flex flex-wrap items-center lg:gap-1.5 xl:gap-2">
                      <HabitPill
                        label={
                          selectedFriend.focus || "Exploring accountability"
                        }
                      />
                      {selectedFriend.dominantCategory ? (
                        <HabitPill
                          label={`Leans ${selectedFriend.dominantCategory}`}
                        />
                      ) : null}
                      {selectedFriend.badges.map((badge) => (
                        <span key={badge} className={badgeClass}>
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center lg:gap-2 xl:gap-3">
                    <div className="flex flex-col items-end gap-2 text-right">
                      <CircularProgress
                        progress={Math.min(100, selectedFriend.xpProgress)}
                        size={80}
                        progressColor="#f09029"
                        textColor="#f09029"
                      >
                        <div className="flex flex-col items-center leading-tight">
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            Level
                          </span>
                          <span className="text-base font-bold text-foreground">
                            {selectedFriend.level}
                          </span>
                        </div>
                      </CircularProgress>
                      <div className="lg:text-[10px] xl:text-[11px] 2xl:text-xs text-muted-foreground space-y-0.5">
                        <p>{formatXP(selectedFriend.totalXP)} XP total</p>
                        <p>
                          {formatXP(
                            Math.max(
                              0,
                              selectedFriend.xpNeededForLevelUp -
                                selectedFriend.xpIntoLevel
                            )
                          )}{" "}
                          XP to next level
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConnect(selectedFriend.id)}
                      className={`inline-flex items-center gap-2 rounded-full border lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[11px] xl:text-xs font-semibold transition shadow-sm ${
                        connectionState(selectedFriend.id) === "connected"
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 bg-white text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <UserPlus className="lg:w-4 lg:h-4 xl:w-5 xl:h-5" />
                      {connectionState(selectedFriend.id) === "connected"
                        ? "Friends"
                        : "Add friend"}
                    </button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-4 lg:gap-2 xl:gap-3">
                  <div className="rounded-2xl border border-gray-100 bg-muted/50 lg:p-3 xl:p-4 space-y-1">
                    <p className="lg:text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                      Friends in common
                    </p>
                    <p className="lg:text-lg xl:text-xl font-bold text-foreground">
                      {selectedFriend.friendsInCommon ?? 0}
                    </p>
                    <p className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
                      People already connected to both of you
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-muted/50 lg:p-3 xl:p-4 space-y-1">
                    <p className="lg:text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                      Streak days
                    </p>
                    <p className="lg:text-lg xl:text-xl font-bold text-foreground">
                      {selectedFriend.streakDays}
                    </p>
                    <p className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
                      Days at or above streak threshold
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-muted/50 lg:p-3 xl:p-4 space-y-1">
                    <p className="lg:text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                      Top category
                    </p>
                    <p className="lg:text-lg xl:text-xl font-bold text-foreground">
                      {selectedFriend.dominantCategory ?? "Balanced"}
                    </p>
                    <p className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
                      Where their likes cluster
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-muted/50 lg:p-3 xl:p-4 space-y-1">
                    <p className="lg:text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                      XP to next
                    </p>
                    <p className="lg:text-lg xl:text-xl font-bold text-foreground">
                      {formatXP(
                        Math.max(
                          0,
                          selectedFriend.xpNeededForLevelUp -
                            selectedFriend.xpIntoLevel
                        )
                      )}
                    </p>
                    <p className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
                      Invite them to a focus sprint
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="lg:text-[11px] xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        Liked habits
                      </p>
                      <h4 className="lg:text-sm xl:text-base 2xl:text-lg font-semibold">
                        What {selectedFriend.name.split(" ")[0] ?? "this friend"} is into
                      </h4>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-100 lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground">
                      <Heart className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-primary" />
                      {selectedFriend.likedHabits.length} saved
                    </div>
                  </div>
                  {selectedFriend.likedHabits.length === 0 ? (
                    <p className="lg:text-[11px] xl:text-xs text-muted-foreground rounded-2xl border border-dashed border-gray-200 bg-muted/40 lg:px-3 xl:px-4 lg:py-3 xl:py-4">
                      This friend has not liked any habits yet.
                    </p>
                  ) : (
                    <div className="grid lg:gap-2 xl:gap-3 grid-cols-1 md:grid-cols-2">
                      {selectedFriend.likedHabits
                        .slice(0, 4)
                        .map(renderLikedHabit)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="lg:text-[11px] xl:text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        Social signals
                      </p>
                      <h4 className="lg:text-sm xl:text-base 2xl:text-lg font-semibold">
                        Recent activity
                      </h4>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold">
                      <Sparkles className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
                      Accountability ready
                    </span>
                  </div>
                  {selectedFriend.recentActivity &&
                  selectedFriend.recentActivity.length > 0 ? (
                    <ul className="grid lg:gap-2 xl:gap-3 grid-cols-1 md:grid-cols-2">
                      {selectedFriend.recentActivity.map((activity) => (
                        <li
                          key={activity}
                          className="rounded-2xl border border-gray-100 bg-white shadow-inner lg:px-3 xl:px-4 lg:py-2 xl:py-3 flex items-center justify-between lg:text-[11px] xl:text-xs 2xl:text-sm"
                        >
                          <span className="inline-flex items-center gap-2 text-foreground">
                            <ArrowRight className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-primary" />
                            {activity}
                          </span>
                          <HandHeart className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-green-soft" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="lg:text-[11px] xl:text-xs text-muted-foreground rounded-2xl border border-dashed border-gray-200 bg-muted/40 lg:px-3 xl:px-4 lg:py-3 xl:py-4">
                      No recent signals yet. Send a friend request and share a
                      habit link.
                    </p>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default FriendsPage;
