"use client";

import { useCallback, useEffect, useState } from "react";

import Button from "@/app/components/ui/button";
import { Quote } from "lucide-react";

type DailyQuote = {
  text: string;
  author: string;
  date: string;
};

const DailyQuoteWidget: React.FC = () => {
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/daily-quote");
      if (!response.ok) {
        throw new Error("Unable to load quote");
      }
      const data = (await response.json()) as { quote?: DailyQuote };
      if (!data.quote) {
        throw new Error("Malformed quote response");
      }
      setQuote(data.quote);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Unable to load today's motivation.");
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return (
    <div className="relative h-fit overflow-hidden rounded-2xl border border-muted/50 shadow-inner bg-secondary">
      <div className="absolute inset-0 opacity-30 bg-white" />
      <div className="relative flex h-full flex-col gap-3 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/50 backdrop-blur">
              <Quote className="w-4 h-4 text-primary" />
            </span>
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-[0.12em] text-foreground">
                Daily motivation
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-2xl bg-white/5 backdrop-blur dark:bg-slate-900/70">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3 w-1/3 rounded bg-gradient-to-r from-white/70 to-white/40 dark:from-primary/30 dark:to-primary/10" />
              <div className="h-4 rounded bg-gradient-to-r from-white/70 to-white/40 dark:from-primary/25 dark:to-primary/5" />
              <div className="h-4 w-5/6 rounded bg-gradient-to-r from-white/50 to-white/20 dark:from-slate-700/70 dark:to-slate-600/70" />
              <div className="h-3 w-1/2 rounded bg-gradient-to-r from-white/50 to-white/20 dark:from-slate-700/60 dark:to-slate-600/60" />
            </div>
          ) : error ? (
            <div className="flex h-fit flex-col items-start justify-center gap-3 text-sm">
              <p className="text-rose-100/90">{error}</p>
              <Button
                onClick={fetchQuote}
                className="xl:h-8 xl:px-3 2xl:h-9 2xl:px-4 bg-white text-primary hover:bg-white/90 shadow-sm"
              >
                Try again
              </Button>
            </div>
          ) : quote ? (
            <div className="flex h-fit flex-col justify-between gap-3 bg-white/70 px-5 py-3 text-foreground/90 rounded-2xl shadow-inner">
              <div className="flex items-start">
                <p className="xl:text-xs 2xl:text-sm font-medium leading-relaxed ">
                  "{quote.text}"
                </p>
              </div>
              <div className="flex items-center justify-between xl:text-[11px] 2xl:text-xs">
                <span className="font-semibold text-primary">
                  — {quote.author}
                </span>
                <span>{quote.date}</span>
              </div>
            </div>
          ) : (
            <p className="xl:text-xs 2xl:text-sm">
              No quote available right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyQuoteWidget;
