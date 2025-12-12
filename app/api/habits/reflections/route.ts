import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/habit-actions";
import { getUtcDayStart } from "@/lib/habit-progress";

const MAX_NOTE_LENGTH = 600;

const parseEntryDate = (value: unknown): Date | null => {
  if (typeof value === "string" || value instanceof Date) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return getUtcDayStart(parsed);
    }
  }
  return null;
};

const getErrorStatus = (message: string) => {
  if (message === "Unauthorized") return 401;
  if (message.includes("note") || message.includes("date")) return 400;
  return 500;
};

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const url = new URL(request.url);
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");

    const today = getUtcDayStart(new Date());
    const defaultFrom = new Date(today);
    defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 30);

    const from = parseEntryDate(fromParam);
    const to = parseEntryDate(toParam);
    const hasRange = Boolean(from || to);

    const reflections = await prisma.habitReflection.findMany({
      where: {
        userId,
        ...(hasRange
          ? {
              entryDate: {
                gte: from ?? defaultFrom,
                lte: to ?? today,
              },
            }
          : {}),
      },
      orderBy: {
        entryDate: "desc",
      },
      take: 30,
    });

    return NextResponse.json({ reflections });
  } catch (error) {
    if (error instanceof Error) {
      const status = getErrorStatus(error.message);
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "Unable to load reflections right now." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const payload = (await request.json()) as {
      note?: unknown;
      entryDate?: unknown;
    };
    const note =
      typeof payload.note === "string" ? payload.note.trim() : undefined;
    if (!note || note.length === 0) {
      return NextResponse.json(
        { error: "Note cannot be empty." },
        { status: 400 }
      );
    }
    if (note.length > MAX_NOTE_LENGTH) {
      return NextResponse.json(
        { error: "Note is too long. Keep it under 600 characters." },
        { status: 400 }
      );
    }

    const entryDate = parseEntryDate(payload.entryDate);
    if (!entryDate) {
      return NextResponse.json(
        { error: "A valid entry date is required." },
        { status: 400 }
      );
    }

    const today = getUtcDayStart(new Date());
    if (entryDate > today) {
      return NextResponse.json(
        { error: "You can only reflect on today or previous days." },
        { status: 400 }
      );
    }

    const reflection = await prisma.habitReflection.create({
      data: {
        userId,
        entryDate,
        note,
      },
    });

    return NextResponse.json({ reflection }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const status = getErrorStatus(error.message);
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "Unable to save reflection. Try again later." },
      { status: 500 }
    );
  }
}
