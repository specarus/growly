import Link from "next/link";

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
    <footer className="relative border-t xl:border-b-6 2xl:border-b-8 border-b-primary border-muted/60 bg-card text-foreground shadow-inner shadow-gray-200/40 dark:shadow-none overflow-visible">
      <div className="mx-auto xl:px-8 2xl:px-28 space-y-10 xl:pt-8 xl:pb-6 2xl:pt-10 2xl:pb-8">
        <div className="grid xl:gap-6 2xl:gap-8 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="space-y-1 xl:text-xs 2xl:text-sm">
                <p className="font-semibold text-foreground">Growly</p>
                <p className="text-sm text-muted-foreground">
                  Stay consistent, win the tiny moments.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 xl:text-[11px] 2xl:text-sm">
              <span className="rounded-full bg-card/70 text-primary font-semibold px-3 py-1">
                Tiny wins, every day.
              </span>
              <span className="text-muted-foreground/70">
                &copy; {year} Growly
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="xl:text-[11px] 2xl:text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
              Navigate
            </p>
            <nav className="flex flex-col xl:gap-1 2xl:gap-2 xl:text-xs 2xl:text-sm text-muted-foreground/90">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-xl px-3 py-2 hover:bg-card/70 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col justify-between xl:text-xs 2xl:text-sm text-muted-foreground">
            <div className="space-y-3">
              <p className="xl:text-[11px] 2xl:text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
                Keep in touch
              </p>
              <p className="leading-relaxed">
                Questions or ideas? Reach out any time and we will keep the tiny
                wins coming.
              </p>
              <div className="xl:text-[11px] 2xl:text-xs uppercase tracking-[0.4em] text-primary">
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
