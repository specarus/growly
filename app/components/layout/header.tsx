"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSession } from "@/app/context/session-context";
import { User } from "lucide-react";

const formatSegment = (segment: string) =>
  segment
    .replace(/[\[\]]/g, "")
    .split(/[-_]/)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ")
    .trim();

const isLikelyId = (segment: string) => /^[0-9a-fA-F-]{6,}$/.test(segment);

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
        <div className="flex items-center xl:gap-2 2xl:gap-4 flex-1 min-w-0">
          <div className="flex items-center xl:gap-2 2xl:gap-3">
            <div className="xl:w-2 xl:h-2 2xl:w-2.5 2xl:h-2.5 rounded-full bg-red-500" />
            <div className="xl:w-2 xl:h-2 2xl:w-2.5 2xl:h-2.5 rounded-full bg-yellow-500" />
            <div className="xl:w-2 xl:h-2 2xl:w-2.5 2xl:h-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center xl:gap-1.5 2xl:gap-2 xl:text-xs 2xl:text-sm truncate text-muted-foreground">
            {formatted.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="flex items-center xl:gap-1 2xl:gap-1.5"
              >
                <span
                  className={index === 0 ? "font-medium text-foreground" : ""}
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

        <div>
          {session && (
            <Link
              href="/account"
              className="shadow-sm shadow-primary/20 inline-flex items-center justify-center gap-4 rounded-full border border-primary/50 px-4 py-2 bg-white text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              <User />
              <p className="xl:text-xs 2xl:text-sm">{session.user.name}</p>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
