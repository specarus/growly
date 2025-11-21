"use client";

export const safetyNets: Record<string, string[]> = {
  "morning-mobility": [
    "Lay out the mat and band the night before so rolling out is frictionless.",
    "If the morning is packed, do a 3 minute spine/hips reset instead of skipping.",
    "Track it next to your first calendar block to keep the cue visible.",
  ],
  "hydrate-3l": [
    "Anchor 1L to breakfast, 1L to lunch, 1L to mid-afternoon; bottles pre-filled.",
    "If noon is low, drink 300ml immediately and schedule the next refill on your calendar.",
    "Skip ice-cold water first thing if it slows you down; room temp is fine.",
  ],
  "strength-training": [
    "When energy is low, switch to a 15 minute bodyweight circuit instead of canceling.",
    "If sore or travel-bound, swap heavy lifts for mobility and carries to keep the streak.",
    "Lay out shoes/straps the night before and block the session as busy on your calendar.",
  ],
  "reading-20m": [
    "Keep the book/kindle on your pillow so your bedtime cue is automatic.",
    "If you miss the slot, read 5 minutes and highlight one insight—small reps count.",
    "Use a warm lamp and airplane mode to avoid doom-scroll detours.",
  ],
  "walk-after-lunch": [
    "Set a calendar nudge 10 minutes before lunch ends; shoes by the door.",
    "If weather is bad, do stairs or an indoor loop for at least 5 minutes.",
    "Have a 2 minute mobility reset ready if a meeting crowds the full walk.",
  ],
  "low-screen-mornings": [
    "Park the phone in the kitchen overnight; alarm is analog by the bed.",
    "If you slip, switch to audio-only (podcast/news) and stay off visuals.",
    "Prep a paper checklist the night before so you know what to do screen-free.",
  ],
  default: [
    "Pair the habit to a fixed anchor so the cue is automatic.",
    "If you miss the window, do the smallest possible rep.",
    "Review misses weekly and adjust anchors instead of quitting.",
  ],
};
