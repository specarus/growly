import { SectionProps } from "../types";
import PostActions from "./post-actions";

import { CalendarClock, Clock3, HeartPulse, TrendingUp } from "lucide-react";

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

const Section = ({ title, description, posts }: SectionProps) => (
  <section className="relative overflow-hidden lg:rounded-2xl xl:rounded-3xl border border-white/70 dark:border-white/10 bg-linear-to-br from-white via-white/90 to-primary/5 dark:from-slate-900 dark:via-slate-950 dark:to-primary/15 shadow-inner">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_45%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_45%)] dark:bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.2),transparent_45%)]" />
    <div className="relative lg:px-5 xl:px-6 lg:py-4 xl:py-5 space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="lg:text-[11px] xl:text-xs 2xl:text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            {title}
          </p>
          <h2 className="lg:text-sm xl:text-base 2xl:text-lg font-semibold">
            {description}
          </h2>
        </div>
        <div className="inline-flex items-center lg:gap-1.5 xl:gap-2 rounded-full bg-primary/10 text-primary lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[9px] text-[11px] font-semibold dark:bg-primary/20 dark:text-primary-foreground">
          <TrendingUp className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </div>
      </div>
      <div className="space-y-4 pt-4">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-muted/50 dark:bg-slate-800/70 lg:px-3 xl:px-4 lg:py-2 xl:py-3 2xl:py-6 lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground">
            No posts yet.
          </div>
        ) : (
          <div className="grid lg:gap-2 xl:gap-3 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 shadow-inner lg:p-3 xl:p-4 lg:space-y-1 xl:space-y-2"
              >
                <div className="flex items-center justify-between lg:gap-2 xl:gap-3">
                  <span className="inline-flex items-center lg:gap-1.5 xl:gap-2 rounded-full bg-linear-to-r from-primary/10 to-green-soft/30 dark:from-primary/25 dark:to-emerald-700/60 border border-white dark:border-white/10 lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[10px] 2xl:text-[11px] font-semibold text-primary uppercase tracking-[0.2em] dark:text-white">
                    {post.category}
                  </span>
                  <span className="lg:text-[9px] xl:text-[10px] 2xl:text-[11px] font-semibold text-muted-foreground">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <h3 className="lg:text-xs xl:text-sm 2xl:text-base font-semibold text-foreground">
                  {post.title}
                </h3>
                <p className="lg:text-[11px] xl:text-xs 2xl:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {post.summary ?? post.highlight ?? "No additional details."}
                </p>
                <div className="flex flex-wrap items-center lg:gap-2 xl:gap-3 lg:text-[9px] xl:text-[10px] 2xl:text-[11px] font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-slate-800 lg:px-2 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] 2xl:text-xs uppercase tracking-[0.15em] shadow-sm">
                    <CalendarClock className="lg:w-2 lg:h-2 xl:w-3 xl:h-3 text-primary" />
                    {post.cadence}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-slate-800 lg:px-2 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] 2xl:text-xs uppercase tracking-[0.15em] shadow-sm">
                    <Clock3 className="lg:w-2 lg:h-2 xl:w-3 xl:h-3 text-primary" />
                    {post.duration ?? "Flexible"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-slate-800 lg:px-2 lg:py-0.5 xl:py-1 lg:text-[9px] xl:text-[11px] 2xl:text-xs uppercase tracking-[0.15em] shadow-sm">
                    <HeartPulse className="lg:w-2 lg:h-2 xl:w-3 xl:h-3 text-primary" />
                    {post.commitment}
                  </span>
                </div>
                <div className="flex items-center justify-between lg:gap-2 xl:gap-3 lg:text-[9px] xl:text-[11px] text-muted-foreground">
                  <span>{post.label}</span>
                  <div className="flex items-center lg:gap-1.5 xl:gap-2">
                    <PostActions
                      postId={post.id}
                      isOwned={post.isOwned}
                      isLiked={post.isLiked}
                    />
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted dark:bg-slate-800 lg:px-2 lg:py-0.5 xl:py-1 font-semibold">
                      <TrendingUp className="lg:w-2 lg:h-2 xl:w-3 xl:h-3 text-primary" />
                      {post.likesCount}{" "}
                      {post.likesCount === 1 ? "like" : "likes"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
);

export default Section;
