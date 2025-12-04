import {
  Heart,
  Sparkles,
  TrendingUp,
  icons as lucideIcons,
  LucideIcon,
} from "lucide-react";

import type { DisplayShouldDo } from "../types";
import { shouldDoSeeds } from "@/app/dashboard/components/should-do-seeds";

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

type Props = {
  title: string;
  description: string;
  ideas: DisplayShouldDo[];
};

const seedIconMap = new Map(
  shouldDoSeeds.map((seed) => [
    seed.id,
    { iconKey: seed.icon?.name ?? null, iconColor: seed.iconColor ?? null },
  ])
);

const resolveIcon = (key?: string | null): LucideIcon => {
  if (!key) return Heart;
  const IconComp = (lucideIcons as Record<string, LucideIcon>)[key];
  return IconComp ?? Heart;
};

const ShouldDoSection = ({ title, description, ideas }: Props) => (
  <section className="relative overflow-hidden rounded-3xl border border-white/70 dark:border-white/10 bg-linear-to-br from-white via-white/90 to-secondary/10 dark:from-slate-900 dark:via-slate-950 dark:to-secondary/20 shadow-inner">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.08),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.18),transparent_45%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_45%)] dark:bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_45%)]" />
    <div className="relative px-6 py-5 space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            {title}
          </p>
          <h2 className="xl:text-base 2xl:text-lg font-semibold">
            {description}
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 text-secondary-foreground px-3 py-1 text-[11px] font-semibold dark:bg-secondary/25">
          <TrendingUp className="w-4 h-4" />
          {ideas.length} {ideas.length === 1 ? "idea" : "ideas"}
        </div>
      </div>
      <div className="space-y-4 pt-4">
        {ideas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-muted/50 dark:bg-slate-800/70 xl:px-4 xl:py-3 2xl:py-6 xl:text-xs 2xl:text-sm text-muted-foreground">
            No ideas yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ideas.map((idea) => (
              <article
                key={idea.id}
                className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 shadow-inner p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-secondary/20 to-primary/20 dark:from-secondary/30 dark:to-primary/25 border border-white dark:border-white/10 px-3 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold text-primary uppercase tracking-[0.2em] dark:text-white">
                    Should Do
                  </span>
                  <span className="xl:text-[10px] 2xl:text-[11px] font-semibold text-muted-foreground">
                    {formatDate(idea.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="grid place-items-center w-8 h-8 rounded-full border border-white dark:border-white/10 bg-muted">
                    {(() => {
                      const seedIcon = seedIconMap.get(idea.id);
                      const iconKey = idea.iconKey ?? seedIcon?.iconKey ?? null;
                      const iconColor =
                        idea.iconColor ?? seedIcon?.iconColor ?? undefined;
                      const IconComp = resolveIcon(iconKey);
                      const usesClass = (iconColor ?? "").includes("text-");
                      return (
                        <IconComp
                          className={
                            usesClass
                              ? `${iconColor ?? "text-primary"} w-4 h-4`
                              : "w-4 h-4 text-primary dark:text-white"
                          }
                          style={
                            usesClass
                              ? undefined
                              : { color: iconColor ?? "var(--primary)" }
                          }
                        />
                      );
                    })()}
                  </span>
                  <h3 className="xl:text-sm 2xl:text-base font-semibold text-foreground">
                    {idea.title}
                  </h3>
                </div>
                <p className="xl:text-xs 2xl:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {idea.description ?? "No extra details."}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{idea.label}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted dark:bg-slate-800 px-2 py-1 font-semibold">
                    <Heart className="w-3 h-3 text-primary" />
                    {idea.likesCount} {idea.likesCount === 1 ? "like" : "likes"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
);

export default ShouldDoSection;
