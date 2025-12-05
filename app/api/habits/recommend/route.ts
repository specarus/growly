"use server";

import { spawn } from "node:child_process";
import { join } from "node:path";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type HabitRecord = {
  id: string;
  name: string;
  description: string | null;
};

const runRecommender = async (
  habits: HabitRecord[],
  targetHabitId: string,
  topN: number
) => {
  const scriptPath = join(process.cwd(), "scripts", "habit_recommender.py");
  const modelPath = join(process.cwd(), "scripts", "models", "habit_tfidf.json");
  const payload = JSON.stringify({
    habits,
    targetHabitId,
    topN,
  });

  return new Promise<{ recommendations?: unknown; error?: string }>(
    (resolve) => {
      const proc = spawn("python", [scriptPath, "--output", modelPath]);
      let stdout = "";
      let stderr = "";

      proc.stdin.write(payload);
      proc.stdin.end();

      proc.stdout.on("data", (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        if (code !== 0) {
          resolve({
            error:
              stderr.trim() ||
              `Recommender exited with code ${code ?? "unknown"}`,
          });
          return;
        }
        try {
          const parsed = JSON.parse(stdout || "{}");
          resolve(parsed);
        } catch (error) {
          resolve({
            error:
              error instanceof Error
                ? error.message
                : "Failed to parse recommender output",
          });
        }
      });
    }
  );
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const habitId = url.searchParams.get("habitId");
  const topN = Number.parseInt(url.searchParams.get("limit") ?? "5", 10);

  if (!habitId) {
    return NextResponse.json(
      { error: "habitId query param is required" },
      { status: 400 }
    );
  }

  const habits = await prisma.habit.findMany({
    select: { id: true, name: true, description: true },
  });

  const result = await runRecommender(habits, habitId, Number.isFinite(topN) ? topN : 5);

  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json({
    recommendations: result.recommendations ?? [],
  });
}
