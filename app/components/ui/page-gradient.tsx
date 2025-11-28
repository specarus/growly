"use client";

const PageGradient = () => (
  <div className="pointer-events-none absolute inset-0 -z-10">
    <div className="pointer-events-none absolute -left-24 -top-12 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
    <div className="pointer-events-none absolute -right-16 top-48 h-64 w-64 rounded-full bg-green-soft/20 blur-3xl" />
    <div className="pointer-events-none absolute left-1/2 bottom-10 h-48 w-48 -translate-x-1/2 rounded-full bg-yellow-soft/25 blur-3xl" />
  </div>
);

export default PageGradient;
