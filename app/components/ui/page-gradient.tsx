"use client";

const PageGradient = () => (
  <div className="pointer-events-none absolute inset-0 -z-10">
    <div className="absolute -top-16 -right-8 h-72 w-72 rounded-full bg-linear-to-br from-primary/40 via-blue-300/40 to-transparent blur-3xl opacity-80 transition dark:from-primary/30 dark:via-cyan-500/20" />
    <div className="absolute bottom-6 left-[8%] h-64 w-64 rounded-full bg-linear-to-br from-amber-200/70 via-orange-200/40 to-transparent blur-3xl opacity-60 transition dark:from-orange-500/50 dark:via-fuchsia-500/25" />
    <div className="absolute top-1/2 -left-12 h-64 w-64 -translate-y-1/2 rounded-full bg-linear-to-br from-slate-300/70 via-transparent to-transparent blur-3xl opacity-40 transition dark:from-sky-500/40 dark:via-cyan-800/30" />
  </div>
);

export default PageGradient;
