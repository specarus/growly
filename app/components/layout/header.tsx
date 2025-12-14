"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useSession } from "@/app/context/session-context";
import { useTheme } from "@/app/context/theme-context";
import { useXP } from "@/app/context/xp-context";
import { BADGE_TIERS } from "@/lib/badges";
import { signOut } from "@/lib/actions/auth-actions";
import {
  Bell,
  ChevronDown,
  Medal,
  Moon,
  Sprout,
  Sun,
  User,
  Users,
} from "lucide-react";

const formatSegment = (segment: string) =>
  segment
    .replace(/[\[\]]/g, "")
    .split(/[-_]/)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ")
    .trim();

const isLikelyId = (segment: string) => /^[0-9a-fA-F-]{6,}$/.test(segment);

type AccountDropdownProps = {
  session: NonNullable<ReturnType<typeof useSession>["session"]>;
  badge: BadgeInfo | null;
};

type BadgeInfo = {
  label: string;
  stage: string;
  className: string;
};

type FriendRequest = {
  id: string;
  fromName: string;
  createdAt?: string | null;
};

function NotificationsDropdown() {
  const { activityLog, markNotificationsRead } = useXP();
  const [isOpen, setIsOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkXpRead = (id: string) => {
    void markNotificationsRead([id]);
  };

  const handleMarkFriendRead = (id: string) => {
    setFriendRequests((prev) => prev.filter((request) => request.id !== id));
    void fetch(`/api/friends/requests/${id}/decline`, { method: "POST" }).catch(
      (error) => console.error("[NotificationsDropdown] decline request", error)
    );
  };

  const handleAcceptFriend = async (id: string) => {
    setFriendRequests((prev) => prev.filter((request) => request.id !== id));
    try {
      await fetch(`/api/friends/requests/${id}/accept`, { method: "POST" });
    } catch (error) {
      console.error("[NotificationsDropdown] accept friend request", error);
    }
  };

  const loadFriendRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/friends/requests?direction=incoming", {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) return;
      const data = await response.json();
      const mapped: FriendRequest[] = (data.requests ?? []).map(
        (item: FriendRequest & { createdAt?: string | null }) => ({
          id: item.id,
          fromName: item.fromName,
          createdAt: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "New",
        })
      );
      setFriendRequests(mapped);
    } catch (error) {
      console.error("[NotificationsDropdown] load friend requests", error);
    }
  }, []);

  useEffect(() => {
    void loadFriendRequests();
  }, [loadFriendRequests]);

  const visibleXpNotifications = activityLog.slice(0, 5);
  const totalCount = visibleXpNotifications.length + friendRequests.length;
  const badgeLabel =
    totalCount > 9 ? "9+" : totalCount > 0 ? totalCount.toString() : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Open notifications"
        className="inline-flex items-center gap-1.5 rounded-full border border-muted lg:p-1 xl:p-2 bg-white text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Bell className="lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" />
        {badgeLabel ? (
          <span className="inline-flex items-center justify-center rounded-full bg-primary text-white lg:px-1.5 xl:px-2 lg:py-0.5 xl:py-0.5 lg:text-[9px] xl:text-[10px] font-bold">
            {badgeLabel}
          </span>
        ) : null}
      </button>

      <div
        className={`absolute right-0 top-full lg:mt-2 xl:mt-3 w-72 lg:rounded-xl xl:rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200 dark:shadow-black/40 transition-all duration-200 ease-out z-50 ${
          isOpen
            ? "opacity-100 visible translate-y-0 pointer-events-auto"
            : "opacity-0 invisible translate-y-2 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between lg:px-3 xl:px-4 lg:py-2 xl:py-3">
          <p className="lg:text-[9px] xl:text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Notifications
          </p>
          <span className="lg:text-[9px] xl:text-[10px] text-muted-foreground">
            {badgeLabel ? `${totalCount} new` : "Up to date"}
          </span>
        </div>
        <div className="border-t border-gray-50 lg:px-3 xl:px-4 lg:py-2 xl:py-3 space-y-3">
          <div>
            <p className="lg:text-[9px] xl:text-[10px] uppercase tracking-[0.24em] text-primary font-semibold">
              XP updates
            </p>
            {activityLog.length === 0 ? (
              <p className="lg:text-[9px] xl:text-[10px] text-muted-foreground mt-1">
                No XP activity yet. Complete a todo or habit to log XP.
              </p>
            ) : (
              <div className="mt-1 grid gap-2">
                {visibleXpNotifications.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-muted/60 lg:px-2.5 xl:px-3 lg:py-1.5 xl:py-2"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="lg:text-[10px] xl:text-xs font-semibold text-foreground">
                        {entry.label}
                      </span>
                      {entry.detail ? (
                        <span className="lg:text-[9px] xl:text-[10px] text-muted-foreground">
                          {entry.detail}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="lg:text-[10px] xl:text-xs font-bold text-primary">
                        {entry.xp > 0 ? "+" : ""}
                        {entry.xp} XP
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMarkXpRead(entry.id)}
                        className="lg:text-[9px] xl:text-[10px] text-muted-foreground hover:text-primary underline-offset-2 hover:underline"
                      >
                        Mark as read
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-2">
            <div className="flex items-center justify-between">
              <p className="lg:text-[9px] xl:text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold">
                Friend requests
              </p>
              <Users className="lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 text-muted-foreground" />
            </div>
            {friendRequests.length === 0 ? (
              <p className="mt-1 lg:text-[9px] xl:text-[10px] text-muted-foreground">
                No friend requests right now. Check back after connecting in the
                community.
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {friendRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-muted/60 lg:px-2.5 xl:px-3 lg:py-1.5 xl:py-2"
                  >
                    <div className="min-w-0">
                      <p className="lg:text-[10px] xl:text-xs font-semibold text-foreground">
                        {request.fromName}
                      </p>
                      <p className="lg:text-[9px] xl:text-[10px] text-muted-foreground">
                        wants to connect
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="lg:text-[9px] xl:text-[10px] text-muted-foreground">
                        {request.createdAt ?? "New"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAcceptFriend(request.id)}
                        className="lg:text-[9px] xl:text-[10px] text-primary hover:text-primary/80 underline-offset-2 hover:underline"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkFriendRead(request.id)}
                        className="lg:text-[9px] xl:text-[10px] text-muted-foreground hover:text-primary underline-offset-2 hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const getBadgeForLevel = (level: number): BadgeInfo | null => {
  const tier = BADGE_TIERS.find((item) => level >= item.level);
  return tier
    ? {
        label: tier.label,
        stage: tier.stage,
        className: tier.className,
      }
    : null;
};

function AccountDropdown({ session, badge }: AccountDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setIsOpen(false);
    startTransition(async () => {
      await signOut();
      router.push("/");
      router.refresh();
    });
  };

  const name = session.user?.name ?? "Account";
  const email = session.user?.email;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Open account menu"
        className="shadow-sm shadow-primary/20 inline-flex items-center justify-center lg:gap-2 xl:gap-3 rounded-full border border-primary/50 lg:px-3 xl:px-4 lg:py-1 xl:py-2 bg-white text-xs font-semibold text-primary transition hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <User className="lg:h-3 lg:w-3 xl:h-4 xl:w-4" />
        <p className="lg:text-[10px] xl:text-xs 2xl:text-sm truncate">{name}</p>
        {badge ? (
          <span
            className={`hidden sm:inline-flex items-center gap-1 rounded-full border border-white/40 lg:px-1.5 xl:px-2 lg:py-0.5 xl:py-0.5 text-[10px] font-semibold shadow-sm ${badge.className}`}
          >
            <Medal className="lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5" />
            <span className="uppercase tracking-wider">{badge.stage}</span>
          </span>
        ) : null}
        <ChevronDown
          className={`lg:h-2 lg:w-2 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`absolute right-0 top-full lg:mt-2 xl:mt-3 lg:w-40 xl:w-56 lg:rounded-xl xl:rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200 dark:shadow-black/40 transition-all duration-200 ease-out z-50 ${
          isOpen
            ? "opacity-100 visible translate-y-0 pointer-events-auto"
            : "opacity-0 invisible translate-y-2 pointer-events-none"
        }`}
      >
        <div className="lg:px-3 xl:px-4 lg:py-2 xl:py-3 text-muted-foreground">
          <p className="lg:text-[10px] xl:text-xs 2xl:text-sm font-semibold text-foreground truncate">
            {name}
          </p>
          {badge ? (
            <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 lg:px-2 xl:px-2.5 lg:py-0.5 xl:py-0.5 text-primary font-semibold lg:text-[9px] xl:text-[10px] uppercase tracking-[0.16em]">
              <Medal className="lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5" />
              <span>{badge.label}</span>
            </div>
          ) : null}
          {email && (
            <p className="mt-1 lg:text-[8px] xl:text-[10px] 2xl:text-[11px] tracking-wide text-muted-foreground truncate">
              {email}
            </p>
          )}
        </div>
        <div className="border-t border-gray-50 lg:p-1 xl:p-2 space-y-1 lg:text-[8px] xl:text-[11px]">
          <Link
            href="/account"
            className="block rounded-xl lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 2xl:py-2 font-semibold uppercase tracking-[0.4em] text-primary transition-colors hover:bg-primary/5"
            onClick={() => setIsOpen(false)}
          >
            Account
          </Link>
          <Link
            href="/dashboard/habits/posts"
            className="block rounded-xl lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 2xl:py-2 font-semibold uppercase tracking-[0.4em] text-primary transition-colors hover:bg-primary/5"
            onClick={() => setIsOpen(false)}
          >
            My posts
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending}
            className="w-full cursor-pointer rounded-xl lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 2xl:py-2 text-left font-semibold text-foreground bg-card/70 hover:bg-card/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Signing out..." : "Log out"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const { session } = useSession();
  const { level, loading: xpLoading } = useXP();
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => !isLikelyId(segment));

  const breadcrumb = segments.length > 0 ? segments : ["home"];
  const formatted = breadcrumb.map((segment) => formatSegment(segment));

  const quickLinks = [
    { label: "Todos", href: "/dashboard/todos" },
    { label: "Habits", href: "/dashboard/habits" },
    { label: "Analytics", href: "/dashboard/analytics" },
    { label: "Friends", href: "/dashboard/friends" },
  ];

  const normalizedPathname = pathname ?? "";
  const isLinkActive = (href: string) =>
    normalizedPathname === href || normalizedPathname.startsWith(`${href}/`);
  const badge = xpLoading ? null : getBadgeForLevel(level);

  return (
    <header className="fixed top-0 left-0 w-full shadow-sm border-b border-gray-50 backdrop-blur-sm z-40">
      <div className="lg:px-6 xl:px-8 2xl:px-28 mx-auto lg:h-12 xl:h-16 2xl:h-20 grid grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-4">
        <div className="flex items-center min-w-0 gap-4">
          <Sprout className="lg:w-4 lg:h-4 xl:w-6 xl:h-6 2xl:w-8 2xl:h-8 text-green-soft" />

          <div className="flex w-full flex-1 flex-col min-w-0 xl:flex-row xl:items-center lg:gap-16 xl:gap-20 2xl:gap-24">
            <div className="flex items-center lg:gap-1 xl:gap-1.5 2xl:gap-2 lg:text-xs xl:text-sm 2xl:text-base truncate">
              {formatted.map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className="flex items-center lg:gap-0.5 xl:gap-1 2xl:gap-1.5"
                >
                  <span
                    className={`lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.3em] transition ${
                      index === 0 ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                  {index < formatted.length - 1 && (
                    <span className="hidden sm:inline">/</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {session ? (
          <nav
            aria-label="Dashboard shortcuts"
            className="flex flex-wrap items-center lg:gap-2 xl:gap-3 uppercase tracking-[0.3em] justify-self-center"
          >
            {quickLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full lg:px-2 xl:px-3 2xl:px-4 lg:py-0.5 xl:py-1 lg:text-[8px] xl:text-[10px] 2xl:text-[11px] font-semibold transition ${
                    active
                      ? "bg-primary text-white shadow-[0_2px_20px_rgba(240,144,41,0.35)]"
                      : "border border-gray-100 text-muted-foreground hover:border-primary/60 hover:text-primary"
                  } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <div />
        )}

        <div className="flex items-center lg:gap-2 xl:gap-3 justify-self-end">
          <ThemeToggle />
          {session ? <NotificationsDropdown /> : null}
          {session && <AccountDropdown session={session} badge={badge} />}
        </div>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex items-center justify-center rounded-full border border-muted/40 bg-card/80 lg:p-1.5 xl:p-2 text-foreground transition hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {isDark ? (
        <Sun className="lg:w-2.5 lg:h-2.5 xl:h-4 xl:w-4 text-primary" />
      ) : (
        <Moon className="lg:w-2.5 lg:h-2.5 xl:h-4 xl:w-4 text-foreground" />
      )}
    </button>
  );
}
