"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useSession } from "@/app/context/session-context";
import { useTheme } from "@/app/context/theme-context";
import { signOut } from "@/lib/actions/auth-actions";
import { ChevronDown, Moon, Sprout, Sun, User } from "lucide-react";

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
};

function AccountDropdown({ session }: AccountDropdownProps) {
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
        className="shadow-sm shadow-primary/20 inline-flex items-center justify-center gap-3 rounded-full border border-primary/50 px-4 py-2 bg-white text-xs font-semibold text-primary transition hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <User className="h-4 w-4" />
        <p className="xl:text-xs 2xl:text-sm truncate">{name}</p>
        <ChevronDown
          className={`xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`absolute right-0 top-full mt-3 w-56 min-w-[200px] rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200 transition-all duration-200 ease-out z-50 ${
          isOpen
            ? "opacity-100 visible translate-y-0 pointer-events-auto"
            : "opacity-0 invisible translate-y-2 pointer-events-none"
        }`}
      >
        <div className="px-4 py-3 text-[11px] text-muted-foreground">
          <p className="xl:text-xs 2xl:text-sm font-semibold text-foreground truncate">
            {name}
          </p>
          {email && (
            <p className="mt-1 xl:text-[10px] 2xl:text-[11px] tracking-wide text-muted-foreground truncate">
              {email}
            </p>
          )}
        </div>
        <div className="border-t border-gray-50 px-2 py-2 space-y-1">
          <Link
            href="/account"
            className="block rounded-xl px-3 xl:py-1 2xl:py-2 xl:text-[11px] 2xl:text-xs font-semibold uppercase tracking-[0.4em] text-primary transition-colors hover:bg-primary/5"
            onClick={() => setIsOpen(false)}
          >
            Account
          </Link>
          <Link
            href="/dashboard/habits/posts"
            className="block rounded-xl px-3 xl:py-1 2xl:py-2 xl:text-[11px] 2xl:text-xs font-semibold uppercase tracking-[0.4em] text-primary transition-colors hover:bg-primary/5"
            onClick={() => setIsOpen(false)}
          >
            My posts
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending}
            className="w-full cursor-pointer rounded-xl px-3 xl:py-1 2xl:py-2 text-left xl:text-xs 2xl:text-sm font-semibold text-foreground bg-card/70 hover:bg-card/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
  ];

  const normalizedPathname = pathname ?? "";
  const isLinkActive = (href: string) =>
    normalizedPathname === href || normalizedPathname.startsWith(`${href}/`);

  return (
    <header className="fixed top-0 left-0 w-full shadow-sm border-b border-gray-50 backdrop-blur-sm z-40">
      <div className="2xl:px-28 xl:px-8 mx-auto xl:h-16 2xl:h-20 grid grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] items-center gap-4">
        <div className="flex items-center min-w-0 gap-4">
          <Sprout className="text-green-soft" />

          <div className="flex w-full flex-1 flex-col min-w-0 xl:flex-row xl:items-center xl:gap-20 2xl:gap-24">
            <div className="flex items-center xl:gap-1.5 2xl:gap-2 xl:text-sm 2xl:text-base truncate">
              {formatted.map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className="flex items-center xl:gap-1 2xl:gap-1.5"
                >
                  <span
                    className={`xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.3em] transition ${
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
            className="flex flex-wrap items-center gap-3 xl:text-[10px] 2xl:text-[11px] uppercase tracking-[0.3em] justify-self-center"
          >
            {quickLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full xl:px-3 2xl:px-4 xl:py-1 xl:text-[10px] 2xl:text-[11px] font-semibold transition ${
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

        <div className="flex items-center gap-3 justify-self-end">
          <ThemeToggle />
          {session && <AccountDropdown session={session} />}
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
      className="inline-flex items-center justify-center rounded-full border border-muted/40 bg-card/80 p-2 text-foreground transition hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-primary" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
    </button>
  );
}
