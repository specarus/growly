"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useSession } from "@/app/context/session-context";
import { signOut } from "@/lib/actions/auth-actions";
import { ChevronDown, Sprout, User } from "lucide-react";

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
          <p className="text-sm font-semibold text-foreground truncate">
            {name}
          </p>
          {email && (
            <p className="mt-1 text-[11px] tracking-wide text-muted-foreground truncate">
              {email}
            </p>
          )}
        </div>
        <div className="border-t border-gray-50 px-2 py-2 space-y-1">
          <Link
            href="/account"
            className="block rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-primary transition-colors hover:bg-primary/5"
            onClick={() => setIsOpen(false)}
          >
            Account
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending}
            className="w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm font-semibold text-foreground transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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

  return (
    <header className="fixed top-0 left-0 w-full shadow-sm border-b border-gray-50 backdrop-blur-sm z-40">
      <div className="2xl:px-28 xl:px-8 mx-auto xl:h-16 2xl:h-20 flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0 xl:gap-2 2xl:gap-4">
          <Sprout className="text-green-soft" />

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

        <div>{session && <AccountDropdown session={session} />}</div>
      </div>
    </header>
  );
}
