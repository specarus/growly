import Link from "next/link";
import { redirect } from "next/navigation";

import EditProfileForm from "./components/edit-profile-form";
import SignOutButton from "./components/sign-out-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BadgeCheck, CalendarDays, Flame, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const stats = [
  { label: "Current streak", value: "12 days", tone: "text-primary" },
  { label: "Weekly wins", value: "7 / 7", tone: "text-green-soft-foreground" },
  {
    label: "Recovery days",
    value: "2 scheduled",
    tone: "text-yellow-soft-foreground",
  },
];

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

  return (
    <main className="relative min-h-screen bg-linear-to-b from-white via-light-yellow/60 to-green-soft/10 pb-16 pt-28">
      <div className="xl:px-36 2xl:px-80">
        <div className="mx-auto flex flex-col gap-10">
          <section className="space-y-8">
            <div className="flex flex-col gap-3">
              <div className="w-fit inline-flex items-center gap-2 rounded-full select-none bg-light-yellow px-3 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                <BadgeCheck className="w-4 h-4" />
                <span>Account</span>
              </div>
              <h1 className="text-3xl font-semibold text-foreground">
                Keep your rituals tidy and your focus protected.
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl">
                Everything starts with a calm overview.<br></br>Adjust
                notifications, revisit weekly priorities, or glance at how
                confident you feel about upcoming rituals.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <div className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="grid h-20 w-20 place-items-center rounded-2xl bg-primary text-2xl font-semibold text-white shadow-lg shadow-primary/30">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
                        Profile
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {name}
                      </p>
                      <p className="text-sm text-muted-foreground">{email}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Joined with patient goals, not noisy streaks.</p>
                    <p>All notifications land in your trusted channels.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Release notes", "Privacy", "Support"].map((link) => (
                      <span
                        key={link}
                        className="rounded-full border border-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                      >
                        {link}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-sm">
                  <EditProfileForm
                    initialName={editableName}
                    initialEmail={editableEmail}
                  />
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                      Need a break?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Log out when you need a reset and return to your calm
                      landing page.
                    </p>
                    <SignOutButton />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-primary/40 bg-linear-to-b from-primary/10 to-white/75 p-6 shadow-lg shadow-primary/20 h-fit">
                <p className="text-xs uppercase tracking-[0.4em] text-primary">
                  momentum
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {stats[0].value} streak
                </p>
                <p className="text-sm text-muted-foreground">
                  Focused energy made possible by calm reminders and gentle
                  check-ins.
                </p>
                <div className="mt-6 grid gap-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm shadow-sm"
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

            <div className="space-y-4">
              <div className="flex gap-3 flex-row items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                    Quick links
                  </p>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Tap into what matters
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep renewals thoughtful and purposeful.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {quickLinks.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="rounded-full border border-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm shadow-foreground/5 backdrop-blur">
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                Weekly focus
              </p>
              <h2 className="text-2xl font-semibold text-foreground">
                Ritual notes that keep your energy anchored
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {focusAreas.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="space-y-3 rounded-2xl border border-muted bg-linear-to-b from-white to-muted/30 p-5 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {title}
                  </p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
