import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  CalendarDays,
  EyeOff,
  Flame,
  Goal,
  Medal,
  ShieldCheck,
} from "lucide-react";

import DeleteAccountForm from "./components/delete-account-form";
import EditProfileForm from "./components/edit-profile-form";
import PrivacySettings from "./components/privacy-settings";
import SignOutButton from "./components/sign-out-button";
import StreakGoalForm from "./components/streak-goal-form";
import PageHeading from "@/app/components/page-heading";
import { auth } from "@/lib/auth";
import { buildHabitAnalytics } from "@/lib/habit-analytics";
import { formatDayKey } from "@/lib/habit-progress";
import { prisma } from "@/lib/prisma";
import { XP_PER_HABIT, XP_PER_TODO } from "@/lib/xp";
import { BADGE_TIERS } from "@/lib/badges";

export const dynamic = "force-dynamic";

const BASE_XP_PER_LEVEL = 100;
const LEVEL_XP_INCREMENT = 25;

const xpForLevel = (level: number) =>
  BASE_XP_PER_LEVEL + (level - 1) * LEVEL_XP_INCREMENT;

const cumulativeXpForLevel = (targetLevel: number) => {
  let total = 0;
  for (let level = 1; level < targetLevel; level += 1) {
    total += xpForLevel(level);
  }
  return total;
};

const computeLevelState = (totalXP: number) => {
  let remainingXP = totalXP;
  let currentLevel = 1;
  let xpForCurrentLevel = xpForLevel(currentLevel);

  while (xpForCurrentLevel > 0 && remainingXP >= xpForCurrentLevel) {
    remainingXP -= xpForCurrentLevel;
    currentLevel += 1;
    xpForCurrentLevel = xpForLevel(currentLevel);
  }

  return {
    level: currentLevel,
    xpGainedInLevel: remainingXP,
    xpNeededForLevelUp: xpForCurrentLevel,
  };
};

const focusAreas = [
  {
    title: "Weekly rhythm audit",
    description:
      "Reflect on the rituals that feel effortless and adjust the rest.",
    icon: CalendarDays,
  },
  {
    title: "Energy supply",
    description:
      "Schedule gentle breaks so your streaks survive the hard days.",
    icon: Flame,
  },
  {
    title: "Guardrails",
    description: "Review quiet reminders and permissions to keep focus sacred.",
    icon: ShieldCheck,
  },
];

const quickLinks = [
  { label: "Open dashboard", href: "/dashboard" },
  { label: "Highlight habits", href: "/dashboard/habits" },
  { label: "Check analytics", href: "/dashboard/analytics" },
];

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const name = session.user?.name ?? "Growly member";
  const email = session.user?.email ?? "No email on file";
  const editableName = session.user?.name ?? "";
  const editableEmail = session.user?.email ?? "";
  const initials = name
    .split(" ")
    .map((node) => node.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const userRecord = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { streakGoalDays: true, privateAccount: true },
  });

  const streakGoal = userRecord?.streakGoalDays ?? 21;
  const privateAccount = userRecord?.privateAccount ?? false;

  type AccountAnalytics = {
    stats: { label: string; value: string; tone: string }[];
    level: number;
    badgeCurrent: (typeof BADGE_TIERS)[number] | null;
    badgeNext: (typeof BADGE_TIERS)[number] | null;
    progressToNextBadge: number;
    badgeStatuses: {
      stage: string;
      level: number;
      label: string;
      className: string;
      achieved: boolean;
      xpNeeded: number;
      levelsAway: number;
    }[];
  };

  let analytics: AccountAnalytics | null = null;

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

  if (!privateAccount) {
    const [completedTodosCount, habits, progressEntries] = await Promise.all([
      prisma.todo.count({
        where: {
          userId: session.user.id,
          status: "COMPLETED",
        },
      }),
      prisma.habit.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.habitDailyProgress.findMany({
        where: {
          habit: { userId: session.user.id },
        },
        select: {
          habitId: true,
          date: true,
          progress: true,
        },
      }),
    ]);

    const { habitsWithStats, progressByDay } = buildHabitAnalytics(
      habits,
      progressEntries
    );

    const habitGoalMap = new Map<string, number>();
    habits.forEach((habit) => {
      habitGoalMap.set(habit.id, habit.goalAmount ?? 1);
    });

    const totalHabitCompletions = progressEntries.reduce((sum, entry) => {
      const goalAmount = habitGoalMap.get(entry.habitId) ?? 1;
      const normalizedGoal = goalAmount > 0 ? goalAmount : 1;
      return sum + (entry.progress >= normalizedGoal ? 1 : 0);
    }, 0);

    const totalHabitXP = totalHabitCompletions * XP_PER_HABIT;
    const totalTodosXP = completedTodosCount * XP_PER_TODO;
    const totalXP = totalTodosXP + totalHabitXP;

    const { level } = computeLevelState(totalXP);

    const badgeCurrent =
      BADGE_TIERS.find((tier) => level >= tier.level) ?? null;
    const badgeNext = [...BADGE_TIERS]
      .sort((a, b) => a.level - b.level)
      .find((tier) => level < tier.level);
    const startXP = cumulativeXpForLevel(badgeCurrent?.level ?? 1);
    const targetXP = badgeNext ? cumulativeXpForLevel(badgeNext.level) : null;
    const progressToNextBadge =
      targetXP && targetXP > startXP
        ? Math.min(
            100,
            Math.max(
              0,
              Math.floor(((totalXP - startXP) / (targetXP - startXP)) * 100)
            )
          )
        : 100;

    const badgeStatuses = BADGE_TIERS.map((tier) => {
      const achieved = level >= tier.level;
      const xpNeeded = Math.max(cumulativeXpForLevel(tier.level) - totalXP, 0);
      const levelsAway = Math.max(tier.level - level, 0);
      return { ...tier, achieved, xpNeeded, levelsAway };
    });

    const bestStreak = habitsWithStats.reduce(
      (max, habit) => Math.max(max, habit.streak ?? 0),
      0
    );

    const weeklyWins = Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setUTCDate(day.getUTCDate() - index);
      const key = formatDayKey(day);
      return (progressByDay[key] ?? 0) >= 1 ? 1 : 0;
    }).reduce<number>((sum, value) => sum + value, 0);

    const recoveryDays = Math.max(0, 7 - weeklyWins);

    const stats = [
      {
        label: "Current streak",
        value: `${bestStreak} days`,
        tone: bestStreak > 0 ? "text-primary" : "text-muted-foreground",
      },
      {
        label: "Weekly wins",
        value: `${weeklyWins} / 7`,
        tone:
          weeklyWins >= 5 ? "text-green-soft" : "text-yellow-soft-foreground",
      },
      {
        label: "Recovery days",
        value: `${recoveryDays} open`,
        tone: "text-yellow-soft-foreground",
      },
    ];

    analytics = {
      stats,
      level,
      badgeCurrent,
      badgeNext: badgeNext ?? null,
      progressToNextBadge,
      badgeStatuses,
    };
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-white/90 via-light-yellow/55 to-green-soft/15 lg:pb-8 xl:pb-12 2xl:pb-16 lg:pt-18 xl:pt-24 2xl:pt-28">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,214,102,0.55),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,153,120,0.4),transparent_60%)] blur-3xl" />
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,145,255,0.4),transparent_60%)] blur-3xl" />
      </div>
      <div className="relative z-10 lg:px-24 xl:px-48 2xl:px-80">
        <div className="mx-auto flex flex-col gap-10">
          <section className="space-y-8">
            <PageHeading
              badgeLabel="Account"
              title="Keep your rituals tidy and your focus protected."
              titleClassName="font-semibold text-foreground"
              description={
                <>
                  Everything starts with a calm overview.
                  <br />
                  Adjust notifications, revisit weekly priorities, or glance at
                  how confident you feel about upcoming rituals.
                </>
              }
              descriptionClassName="text-muted-foreground max-w-3xl"
            />

            <div className="grid lg:gap-4 xl:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="lg:space-y-4 xl:space-y-6">
                <div className="lg:space-y-3 xl:space-y-5 lg:rounded-2xl xl:rounded-3xl border border-gray-100 bg-card lg:p-4 xl:p-6 shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="grid lg:h-12 lg:w-12 xl:h-16 2xl:h-20 xl:w-16 2xl:w-20 place-items-center rounded-2xl bg-primary lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-white shadow-lg shadow-primary/30">
                      {initials}
                    </div>
                    <div>
                      <p className="lg:text-[11px] xl:text-xs 2xl:text-sm uppercase tracking-[0.4em] text-muted-foreground">
                        Profile
                      </p>
                      <p className="lg:text-sm xl:text-base 2xl:text-lg font-semibold text-foreground">
                        {name}
                      </p>
                      <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                        {email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 lg:text-[10px] xl:text-xs 2xl:text-sm text-muted-foreground">
                    <p>Joined with patient goals, not noisy streaks.</p>
                    <p>All notifications land in your trusted channels.</p>
                  </div>
                  <div className="flex flex-wrap lg:gap-1.5 xl:gap-2">
                    {["Release notes", "Privacy", "Support"].map((link) => (
                      <span
                        key={link}
                        className="rounded-full border border-muted lg:px-2 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground"
                      >
                        {link}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:rounded-2xl xl:rounded-3xl border border-gray-100 bg-card lg:p-4 xl:p-6 shadow-inner">
                  <EditProfileForm
                    initialName={editableName}
                    initialEmail={editableEmail}
                  />
                </div>

                <div className="lg:rounded-2xl xl:rounded-3xl border border-gray-100 bg-card lg:p-4 xl:p-6 shadow-inner">
                  <PrivacySettings initialPrivate={privateAccount} />
                </div>

                <div className="lg:rounded-2xl xl:rounded-3xl border border-gray-100 bg-card lg:p-4 xl:p-6 shadow-inner flex flex-col lg:gap-3 xl:gap-4 2xl:gap-5">
                  <div className="lg:space-y-2 xl:space-y-3">
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm uppercase tracking-[0.4em] text-muted-foreground">
                      Need a break?
                    </p>
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                      Log out when you need a reset and return to your calm
                      landing page.
                    </p>
                    <SignOutButton />
                  </div>
                </div>
              </div>
              <div className="lg:rounded-2xl xl:rounded-3xl border border-primary/40 bg-linear-to-b from-primary/10 to-white/75 lg:p-4 xl:p-6 shadow-inner shadow-primary/20 h-fit">
                <p className="lg:text-[11px] xl:text-xs 2xl:text-sm uppercase tracking-[0.4em] text-primary">
                  Momentum
                </p>
                {analytics ? (
                  <>
                    <p className="lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-foreground">
                      {analytics.stats[0]?.value ?? "—"} streak
                    </p>
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                      Focused energy made possible by calm reminders and gentle
                      check-ins.
                    </p>
                    <div className="lg:mt-4 xl:mt-5 2xl:mt-6 grid lg:gap-2 xl:gap-3">
                      {analytics.stats.map((stat) => (
                        <div
                          key={stat.label}
                          className="flex items-center justify-between rounded-2xl bg-card lg:px-3 xl:px-4 lg:py-2 xl:py-3 lg:text-[11px] xl:text-xs 2xl:text-sm shadow-sm"
                        >
                          <span className="text-muted-foreground">
                            {stat.label}
                          </span>
                          <span className={stat.tone + " font-semibold"}>
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="lg:space-y-2 xl:space-y-3">
                    <p className="lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-foreground">
                      Analytics paused
                    </p>
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                      Your account is private, so streak and weekly stats stay
                      hidden. Switch privacy off below to bring them back.
                    </p>
                    <div className="flex items-center gap-2 rounded-full bg-white/80 border border-primary/20 lg:px-3 xl:px-4 lg:py-2 xl:py-3 text-primary lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold">
                      <EyeOff className="lg:w-4 lg:h-4 xl:w-5 xl:h-5" />
                      Private mode on
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:space-y-3 xl:space-y-4">
              <div className="lg:space-y-4 xl:space-y-5">
                <div className="flex items-start justify-between lg:gap-2">
                  <div className="lg:space-y-1 xl:space-y-1.5">
                    <p className="lg:text-[10px] xl:text-[11px] uppercase tracking-[0.4em] text-primary">
                      Level badges
                    </p>
                    <h3 className="lg:text-base xl:text-lg 2xl:text-xl font-semibold text-foreground">
                      Track your next milestone
                    </h3>
                    <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground max-w-2xl">
                      {privateAccount
                        ? "Badges stay hidden while privacy is on."
                        : "Build up XP to unlock badges."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/80 border border-primary/30 lg:px-3 xl:px-4 lg:py-1 xl:py-2 shadow-sm">
                    <Medal className="lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-primary" />
                    <span className="lg:text-[11px] xl:text-xs font-semibold text-primary">
                      {analytics ? `Level ${analytics.level}` : "Private"}
                    </span>
                  </div>
                </div>

                {analytics ? (
                  <div className="bg-muted/50 dark:bg-card/20 border border-gray-100 shadow-inner p-4 rounded-2xl grid gap-3 xl:gap-4">
                    <div className="grid lg:grid-cols-2 gap-3 xl:gap-4">
                      <div className="rounded-2xl border border-gray-100 bg-card/90 shadow-sm lg:p-3 xl:p-4 space-y-2">
                        <p className="lg:text-[10px] xl:text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                          Current badge
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`inline-flex items-center gap-2 rounded-full lg:px-2.5 xl:px-3 lg:py-1 xl:py-1.5 text-xs font-semibold ${
                                analytics.badgeCurrent?.className ??
                                "bg-muted text-foreground"
                              }`}
                            >
                              <span className="uppercase tracking-[0.16em]">
                                {analytics.badgeCurrent?.stage ?? "Starter"}
                              </span>
                            </div>
                          </div>
                          <p className="lg:text-sm xl:text-base font-semibold text-primary">
                            Level {analytics.level}
                          </p>
                        </div>
                        <p className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
                          {analytics.badgeCurrent?.label ??
                            "Earn your first badge at level 5."}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-card/90 shadow-sm lg:p-3 xl:p-4 space-y-2">
                        <p className="lg:text-[10px] xl:text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                          Next badge
                        </p>
                        {analytics.badgeNext ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div
                                className={`inline-flex items-center gap-2 rounded-full lg:px-2.5 xl:px-3 lg:py-1 xl:py-1.5 text-xs font-semibold ${analytics.badgeNext.className}`}
                              >
                                <span className="uppercase tracking-[0.16em]">
                                  {analytics.badgeNext.stage}
                                </span>
                              </div>
                              <span className="lg:text-[11px] xl:text-xs text-muted-foreground font-semibold">
                                Level {analytics.badgeNext.level}
                              </span>
                            </div>
                            <div className="rounded-full bg-muted lg:h-2 xl:h-3 overflow-hidden">
                              <div
                                className="h-full bg-linear-to-r from-primary to-coral transition-all"
                                style={{
                                  width: `${analytics.progressToNextBadge}%`,
                                }}
                              />
                            </div>
                            <p className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
                              {analytics.badgeNext.level - analytics.level}{" "}
                              levels to go; keep logging to unlock it.
                            </p>
                          </div>
                        ) : (
                          <p className="lg:text-[11px] xl:text-xs text-muted-foreground">
                            You&apos;re at the top badge. Keep stacking XP to
                            open new milestones.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-2 xl:gap-3">
                      {analytics.badgeStatuses.map((tier) => (
                        <div
                          key={tier.stage}
                          className="rounded-2xl border border-gray-100 bg-white/80 shadow-sm lg:p-3 xl:p-4 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="lg:text-[10px] xl:text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                              {tier.stage}
                            </span>
                            <span className="lg:text-[10px] xl:text-[11px] font-semibold text-primary">
                              Lv {tier.level}
                            </span>
                          </div>
                          <div
                            className={`inline-flex items-center gap-1 rounded-full lg:px-2 xl:px-2.5 lg:py-0.5 text-xs font-semibold ${tier.className}`}
                          >
                            <span>{tier.label}</span>
                          </div>
                          <p className="lg:text-[10px] xl:text-[11px] text-muted-foreground">
                            {tier.achieved
                              ? "Unlocked"
                              : `${
                                  tier.levelsAway
                                } levels away - ${formatNumber(
                                  tier.xpNeeded
                                )} XP`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 lg:p-4 xl:p-5 lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground shadow-inner">
                    XP milestones are hidden while your account is private.
                    Toggle privacy off to see streak levels and badge progress.
                  </div>
                )}
              </div>

              <div className="flex lg:gap-2 xl:gap-3 flex-row items-center justify-between">
                <div>
                  <p className="lg:text-[11px] xl:text-xs 2xl:text-sm uppercase tracking-[0.4em] lg:mt-1 xl:mt-2 text-muted-foreground">
                    Quick links
                  </p>
                  <h2 className="lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-foreground">
                    Tap into what matters
                  </h2>
                </div>
                <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                  Keep renewals thoughtful and purposeful.
                </p>
              </div>

              <div className="flex flex-wrap lg:gap-2 xl:gap-3">
                {quickLinks.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="rounded-full border border-muted lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="lg:rounded-2xl xl:rounded-3xl border border-primary/30 dark:border-none bg-linear-to-r from-primary/10 via-white/85 dark:via-card/20 to-light-yellow/40 lg:p-4 xl:p-6 shadow-inner shadow-primary/15 lg:space-y-4 xl:space-y-5">
              <div className="flex lg:gap-1.5 xl:gap-2 items-start justify-between">
                <div className="lg:space-y-1 xl:space-y-1.5">
                  <p className="lg:text-[9px] xl:text-[11px] 2xl:text-xs uppercase tracking-[0.4em] text-primary">
                    Streak target
                  </p>
                  <h3 className="lg:text-base xl:text-lg 2xl:text-xl font-semibold text-foreground">
                    Pick the streak length you're chasing
                  </h3>
                  <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground max-w-2xl">
                    Set a realistic stretch goal that will show up in analytics
                    so you can see progress against it.
                  </p>
                </div>
                <div className="flex items-center lg:gap-1.5 xl:gap-2 self-start rounded-full bg-white/80 lg:px-3 xl:px-4 lg:py-1 xl:py-2 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-primary border border-primary/30 shadow-sm">
                  <Goal className="lg:w-3 lg:h-3 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5" />
                  <p>{streakGoal} days</p>
                </div>
              </div>

              <div className="rounded-2xl border border-muted bg-card/90 lg:p-4 xl:p-5 shadow-inner shadow-black/5 lg:space-y-3 xl:space-y-4">
                <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                  {privateAccount
                    ? "Analytics are paused while your account is private. You can still set a target for when you turn visibility back on."
                    : "Analytics will track how your best streak compares to this target."}
                </p>
                <StreakGoalForm initialGoal={streakGoal} />
              </div>
            </div>
          </section>

          <section className="grid lg:gap-4 xl:gap-6 lg:rounded-2xl xl:rounded-3xl border border-gray-100 bg-card lg:p-4 xl:p-6 2xl:p-8 shadow-inner shadow-black/10 backdrop-blur">
            <div className="flex flex-col lg:gap-1.5 xl:gap-2">
              <p className="lg:text-[11px] xl:text-xs 2xl:text-sm uppercase tracking-[0.4em] text-muted-foreground">
                Weekly focus
              </p>
              <h2 className="lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-foreground">
                Ritual notes that keep your energy anchored
              </h2>
            </div>

            <div className="grid lg:gap-3 xl:gap-4 grid-cols-3">
              {focusAreas.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="lg:space-y-2 xl:space-y-3 rounded-2xl border border-muted bg-linear-to-b from-white to-muted/30 lg:p-4 xl:p-5 shadow-sm"
                >
                  <div className="flex lg:h-7 lg:w-7 xl:h-9 2xl:h-11 xl:w-9 2xl:w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                    <Icon className="lg:w-3 lg:h-3 xl:w-4 2xl:h-5 xl:h-4 2xl:w-5" />
                  </div>
                  <p className="lg:text-sm xl:text-base 2xl:text-lg font-semibold text-foreground">
                    {title}
                  </p>
                  <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <div className="lg:rounded-2xl xl:rounded-3xl border border-destructive/40 bg-destructive/5 lg:p-4 xl:p-6">
              <DeleteAccountForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
