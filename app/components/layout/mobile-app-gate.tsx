import { Sprout } from "lucide-react";

const appStoreLink = "https://www.apple.com/app-store/";

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
    className={`inline-flex items-center justify-center rounded-full border border-white/40 bg-primary text-white px-4 md:px-8 py-3 md:py-4 text-center text-base md:text-xl font-semibold shadow-[0_5px_10px_rgba(240,144,41,0.35)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
    target="_blank"
    rel="noreferrer"
  >
    {label}
  </a>
);

export default function MobileAppGate() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-primary/20 via-[#f7f4ff] to-green-soft/30 text-foreground">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-[160px]" />
      <div className="pointer-events-none absolute -right-10 top-24 h-56 w-56 rounded-full bg-yellow-soft/40 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-8 right-1/4 h-48 w-48 -translate-x-1/2 rounded-full bg-green-soft/30 blur-[120px]" />

      <div className="relative mx-auto flex w-full flex-col gap-8 md:gap-10 py-10 md:py-16 px-6 md:px-8">
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <div className="flex items-center justify-center gap-4 px-4 py-2 shadow-inner bg-white rounded-full border border-muted">
            <Sprout className="w-6 h-6 md:w-9 md:h-9 text-green-soft" />
            <p className="text-sm md:text-lg uppercase tracking-[0.6em] text-muted-foreground">
              Growly
            </p>
          </div>
          <h1 className="text-2xl md:text-4xl text-center max-w-xl md:max-w-lg font-semibold leading-tight text-foreground">
            Build habits that survive the real world — right from your pocket.
          </h1>
          <p className="mx-auto max-w-xl md:max-w-2xl text-center text-muted-foreground text-base   md:text-lg">
            Download the app for the calmest, most capable habit companion.
          </p>
        </div>

        <div className="md:w-3/4 md:mx-auto flex flex-1 flex-col gap-4 md:gap-6 text-foreground bg-white rounded-3xl md:rounded-4xl p-4 md:p-6 shadow-inner border border-white">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] md:text-sm text-center uppercase tracking-[0.35em] text-muted-foreground">
                Tap into the app
              </p>
            </div>

            <AppLink label="Download on the App Store" href={appStoreLink} />
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-4 md:gap-6 rounded-3xl md:rounded-4xl border border-white/70 bg-white/80 p-4 md:p-6 shadow-inner backdrop-blur-lg">
          <div className="flex-1 space-y-4 rounded-2xl border border-white/50 bg-linear-to-b from-white to-muted/30 p-4 md:p-6 shadow-inner shadow-black/10">
            <div className="rounded-2xl bg-linear-to-br from-primary/70 to-green-soft/80 p-3 md:p-5 text-white shadow-lg">
              <p className="text-[11px] md:text-xs uppercase tracking-[0.4em]">
                Momentum
              </p>
              <p className="text-2xl md:text-3xl font-semibold">Week 3</p>
              <p className="text-xs md:text-sm text-white/80">Streak: 9 days</p>
            </div>
            <div className="space-y-2 md:space-y-3">
              {featureTiles.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-muted border-dashed bg-white/70 py-3 px-4 md:px-5 md:py-4"
                >
                  <p className="text-xs md:text-base font-semibold text-foreground">
                    {feature.title}
                  </p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">
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
