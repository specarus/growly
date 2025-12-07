const appStoreLink = "https://www.apple.com/app-store/";
const playStoreLink = "https://play.google.com/store/apps";

const featureHighlights = [
  "Calm, weekly reminders",
  "Progress that stays",
  "Offline-friendly rituals",
];

const featureTiles = [
  {
    title: "Intention-only reminders",
    copy: "Gentle nudges respect your focus windows so the app never interrupts the flow.",
  },
  {
    title: "Stacks with context",
    copy: "Log how you feel, not just if you checked a box, for a realistic streak story.",
  },
  {
    title: "Momentum keeps living",
    copy: "Reflective prompts and insights help the tiny wins compound, even offline.",
  },
];

const AppLink = ({
  label,
  href,
  className = "",
}: {
  label: string;
  href: string;
  className?: string;
}) => (
  <a
    href={href}
    className={`inline-flex items-center justify-center rounded-full border border-white/40 bg-white/80 px-6 py-3 text-center text-sm font-semibold text-foreground shadow-lg shadow-black/15 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
    target="_blank"
    rel="noreferrer"
  >
    {label}
  </a>
);

export default function MobileAppGate() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-[#fefcf6] via-[#f7f4ff] to-[#defbee] text-foreground">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-[160px]" />
      <div className="pointer-events-none absolute -right-10 top-24 h-56 w-56 rounded-full bg-yellow-soft/40 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-8 right-1/4 h-48 w-48 -translate-x-1/2 rounded-full bg-green-soft/30 blur-[120px]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-16 lg:px-8">
        <div className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">
            Growly • mobile preview
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Build habits that survive the real world—right from your pocket.
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Growly exists in your pocket so you can stack focused rituals, track
            momentum, and recover from missed days without the noise of a
            desktop inbox. Download the app for the calmest, most capable habit
            companion.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-6 rounded-4xl border border-white/70 bg-white/80 p-6 shadow-[0_40px_80px_-40px_rgba(34,34,34,0.65)] backdrop-blur-lg lg:flex-row lg:p-10">
          <div className="flex flex-1 flex-col gap-6 text-foreground">
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-muted/40 bg-muted/10 px-4 py-1">
                Gentle reminders
              </span>
              <span className="rounded-full border border-muted/40 bg-muted/10 px-4 py-1">
                Dashboards that feel humane
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
                  Tap into the app
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  Designed for your phone, not a cluttered dashboard.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <AppLink
                  label="Download on the App Store"
                  href={appStoreLink}
                />
                <AppLink
                  label="Get it on Google Play"
                  href={playStoreLink}
                  className="bg-primary text-white shadow-[0_20px_40px_-20px_rgba(22,111,65,0.9)] hover:bg-primary/90"
                />
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {featureHighlights.map((highlight) => (
                <span
                  key={highlight}
                  className="flex items-center gap-1 rounded-full border border-muted/30 bg-muted/10 px-3 py-1 font-semibold uppercase tracking-[0.3em]"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 rounded-2xl border border-white/50 bg-linear-to-b from-white to-muted/30 p-6 shadow-inner shadow-black/20">
            <div className="rounded-2xl bg-linear-to-br from-primary/70 to-green-soft/80 p-5 text-white shadow-lg">
              <p className="text-xs uppercase tracking-[0.4em]">Momentum</p>
              <p className="text-3xl font-semibold">Week 3</p>
              <p className="text-sm text-white/80">Streak: 9 days</p>
            </div>
            <div className="space-y-3">
              {featureTiles.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-muted/40 bg-white/70 p-4"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {feature.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {feature.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
