import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Todos", href: "/dashboard/todos" },
  { label: "Weather", href: "/dashboard/weather" },
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
    <footer className="border-t border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="2xl:px-28 xl:px-8 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/15 text-primary font-semibold text-lg flex items-center justify-center">
              G
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Growly</p>
              <p className="text-sm text-muted-foreground">
                Stay consistent, win the tiny moments.
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-green-soft/15 text-green-soft-foreground font-medium">
              Tiny wins, every day.
            </span>
            <span className="hidden sm:inline text-muted-foreground/70">
              &copy; {year} Growly
            </span>
          </div>

          <div className="flex items-center gap-4">
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
    </footer>
  );
}
