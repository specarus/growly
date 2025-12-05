import { NextResponse } from "next/server";

type Quote = {
  text: string;
  author: string;
  date: string;
};

const hashDate = (dateKey: string): number => {
  let hash = 0;
  for (let index = 0; index < dateKey.length; index += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(index)) % 2147483647;
  }
  return hash || 1;
};

const createDeterministicGenerator = (seedValue: number) => {
  let seed = seedValue;
  const next = () => {
    seed = (seed * 48271) % 2147483647;
    return seed;
  };
  const pick = <T>(items: readonly T[]): T => {
    const value = next();
    return items[value % items.length];
  };
  return { pick };
};

const openers = [
  "Today is a clean page.",
  "You get one lap through this day.",
  "This morning sets the tone.",
  "Small moves stack up fast.",
  "Energy follows intention.",
  "Quiet effort beats loud excuses.",
  "Momentum loves consistency.",
  "Your habits are casting votes.",
] as const;

const focuses = [
  "Build the thing you said you would.",
  "Protect the time that matters.",
  "Start before you feel ready.",
  "Choose progress over perfection.",
  "Let action lead your attitude.",
  "Aim for better, not perfect.",
  "Make it obvious, make it easy.",
  "Clear the path for deep focus.",
] as const;

const actions = [
  "Do one hard thing first.",
  "Ship a rough draft.",
  "Close one loop you opened.",
  "Reduce scope, increase speed.",
  "Trade scrolling for a 10-minute push.",
  "Put your phone in the other room.",
  "Plan your next move before you stop.",
  "Stack your habit on something you already do.",
] as const;

const closers = [
  "Leave the day proud of your choices.",
  "Future-you is watching.",
  "You don’t need permission to start.",
  "Consistency beats intensity.",
  "Tiny wins count—stack them.",
  "You’re building proof you can trust yourself.",
  "Reset fast; keep going.",
  "Let momentum carry you into tomorrow.",
] as const;

const firstNames = [
  "Alex",
  "Jordan",
  "Taylor",
  "Casey",
  "Riley",
  "Morgan",
  "Quinn",
  "Reese",
] as const;

const lastNames = [
  "Stone",
  "Brooks",
  "Parker",
  "Hayes",
  "Reid",
  "Carson",
  "Wells",
  "Rivera",
] as const;

const buildQuoteForDate = (dateKey: string): Quote => {
  const generator = createDeterministicGenerator(hashDate(dateKey));
  const opener = generator.pick(openers);
  const focus = generator.pick(focuses);
  const author = `${generator.pick(firstNames)} ${generator.pick(lastNames)}`;

  return {
    text: [opener, focus].join(" "),
    author,
    date: dateKey,
  };
};

export const dynamic = "force-dynamic";

export async function GET() {
  const today = new Date();
  const dateKey = today.toISOString().slice(0, 10);
  const quote = buildQuoteForDate(dateKey);

  return NextResponse.json({ quote });
}
