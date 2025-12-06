import Link from "next/link";
import { redirect } from "next/navigation";

import DeleteAccountForm from "./components/delete-account-form";
import EditProfileForm from "./components/edit-profile-form";
import SignOutButton from "./components/sign-out-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CalendarDays, Flame, Goal, ShieldCheck } from "lucide-react";
import PageHeading from "@/app/components/page-heading";
import { prisma } from "@/lib/prisma";
import StreakGoalForm from "./components/streak-goal-form";
import { buildHabitAnalytics } from "@/lib/habit-analytics";
import { formatDayKey } from "@/lib/habit-progress";

export const dynamic = "force-dynamic";

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
  const [userRecord, habits, progressEntries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { streakGoalDays: true },
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
  const streakGoal = userRecord?.streakGoalDays ?? 21;

  const { habitsWithStats, progressByDay } = buildHabitAnalytics(
    habits,
    progressEntries
  );

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
      tone: weeklyWins >= 5 ? "text-green-soft" : "text-yellow-soft-foreground",
    },
    {
      label: "Recovery days",
      value: `${recoveryDays} open`,
      tone: "text-yellow-soft-foreground",
    },
  ];

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
                  <div className="flex flex-wrapl lg:gap-1.5 xl:gap-2">
                    {["Release notes", "Privacy", "Support"].map((link) => (
                      <span
                        key={link}
                        className="rounded-full border border-muted lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground"
                      >
                        {link}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:rounded-2xl xl:rounded-3xl border border-gray-100 bg-card/90 lg:p-4 xl:p-6 shadow-inner">
                  <EditProfileForm
                    initialName={editableName}
                    initialEmail={editableEmail}
                  />
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

              <div className="lg:rounded-2xl xl:rounded-3xl border border-primary/40 bg-linear-to-b from-primary/10 to-white/75 lg:p-4 xl:p-6 shadow-lg shadow-primary/20 h-fit">
                <p className="lg:text-[11px] xl:text-xs 2xl:text-sm uppercase tracking-[0.4em] text-primary">
                  Momentum
                </p>
                <p className="lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-foreground">
                  {stats[0].value} streak
                </p>
                <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
                  Focused energy made possible by calm reminders and gentle
                  check-ins.
                </p>
                <div className="lg:mt-4 xl:mt-5 2xl:mt-6 grid lg:gap-2 xl:gap-3">
                  {stats.map((stat) => (
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
              </div>
            </div>

            <div className="lg:space-y-3 xl:space-y-4">
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

            <div className="lg:rounded-2xl xl:rounded-3xl border border-primary/30 dark:border-none bg-linear-to-r from-primary/10 via-white/85 dark:via-card/20 to-light-yellow/40 lg:p-4 xl:p-6 shadow-lg shadow-primary/15 lg:space-y-4 xl:space-y-5">
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

              <div className="rounded-2xl border border-muted bg-card/90 lg:p-4 xl:p-5 shadow-inner shadow-primary/5 lg:space-y-3 xl:space-y-4">
                <p className="lg:text-xs xl:text-sm 2xl:text-base text-muted-foreground">
                  Analytics will track how your best streak compares to this
                  target.
                </p>
                <StreakGoalForm initialGoal={streakGoal} />
              </div>
            </div>
          </section>

          <section className="grid lg:gap-4 xl:gap-6 lg:rounded-2xl xl:rounded-3xl border border-gray-100 bg-card lg:p-4 xl:p-6 2xl:p-8 shadow-inner shadow-foreground/5 backdrop-blur">
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
