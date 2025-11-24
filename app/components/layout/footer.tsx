import Image from "next/image";
import Link from "next/link";

import logo from "@/public/logo.png";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Todos", href: "/dashboard/todos" },
  { label: "New todo", href: "/dashboard/todos/create" },
];

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Support", href: "#" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/60 bbg-white text-foreground shadow-inner shadow-gray-200/40 overflow-visible">
      <div className="mx-auto xl:px-8 2xl:px-28 space-y-10 pt-10 pb-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="select-none pointer-events-none flex h-14 w-14 items-center justify-center rounded-xl shadow-sm bg-primary/20">
                <Image src={logo} height={1000} width={1000} alt="Logo" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Growly</p>
                <p className="text-sm text-muted-foreground">
                  Stay consistent, win the tiny moments.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 xl:text-xs 2xl:text-sm">
              <span className="rounded-full bg-white/70 text-primary font-semibold">
                Tiny wins, every day.
              </span>
              <span className="text-muted-foreground/70">
                &copy; {year} Growly
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
              Navigate
            </p>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground/90">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-xl px-3 py-2 hover:bg-white/70 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col justify-between text-sm text-muted-foreground">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
                Keep in touch
              </p>
              <p className="leading-relaxed">
                Questions or ideas? Reach out any time and we will keep the tiny
                wins coming.
              </p>
              <div className="text-xs uppercase tracking-[0.4em] text-primary">
                hello@growly.app
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-8 text-muted-foreground/80">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
