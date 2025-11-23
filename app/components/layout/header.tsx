"use client";

import { useContext } from "react";

import { useRouter } from "next/navigation";

import Button from "@/app/components/ui/button";

import { ModalContext } from "@/app/context/modal-context";

import { signOut } from "@/lib/actions/auth-actions";
import { useSession } from "@/app/context/session-context";
import { usePathname } from "next/navigation";

const formatSegment = (segment: string) =>
  segment
    .replace(/[\[\]]/g, "")
    .split(/[-_]/)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ")
    .trim();

const isLikelyId = (segment: string) => /^[0-9a-fA-F-]{6,}$/.test(segment);

export default function Header() {
  const context = useContext(ModalContext);
  const router = useRouter();
  const { session, setSession } = useSession();
  const pathname = usePathname();
  const setShowModal = context?.setShowModal ?? (() => {});

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => !isLikelyId(segment));

  const breadcrumb = segments.length > 0 ? segments : ["home"];
  const formatted = breadcrumb.map((segment) => formatSegment(segment));

  const handleSignOut = async () => {
    await signOut();
    setSession(null);
    router.push("/");
    router.refresh();
  };

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

        <div className="flex items-center xl:gap-2 2xl:gap-4">
          {session ? (
            <Button
              onClick={handleSignOut}
              className="xl:text-xs 2xl:text-sm hover:bg-primary hover:text-white transition-all duration-100 xl:min-w-20 2xl:min-w-24 xl:h-8 2xl:h-10 border border-primary text-primary"
            >
              Log out
            </Button>
          ) : (
            <Button
              onClick={() => setShowModal(true)}
              className="xl:text-xs 2xl:text-sm hover:bg-primary hover:text-white transition-all duration-100 xl:min-w-20 2xl:min-w-24 xl:h-8 2xl:h-10 border border-primary text-primary"
            >
              Log in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
