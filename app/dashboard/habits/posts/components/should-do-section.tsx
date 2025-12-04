import { Heart, Sparkles, TrendingUp } from "lucide-react";

import type { DisplayShouldDo } from "../types";

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

const ShouldDoSection = ({ title, description, ideas }: Props) => (
  <section className="rounded-3xl border border-gray-100 bg-white shadow-inner">
    <div className="px-6 py-5 space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            {title}
          </p>
          <h2 className="xl:text-base 2xl:text-lg font-semibold">
            {description}
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          {ideas.length} {ideas.length === 1 ? "idea" : "ideas"}
        </div>
      </div>
      <div className="space-y-4 pt-4">
        {ideas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-muted/50 xl:px-4 xl:py-3 2xl:py-6 xl:text-xs 2xl:text-sm text-muted-foreground">
            No ideas yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {ideas.map((idea) => (
              <article
                key={idea.id}
                className="rounded-2xl border border-gray-100 bg-muted/40 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                    Should Do
                  </span>
                  <span className="xl:text-[10px] 2xl:text-[11px] font-semibold text-muted-foreground">
                    {formatDate(idea.createdAt)}
                  </span>
                </div>
                <h3 className="xl:text-sm 2xl:text-base font-semibold text-foreground">
                  {idea.title}
                </h3>
                <p className="xl:text-xs 2xl:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {idea.description ?? "No extra details."}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{idea.label}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
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
