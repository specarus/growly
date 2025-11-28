-- CreateEnum
CREATE TYPE "HabitCategory" AS ENUM ('Movement', 'Energy', 'Focus', 'Recovery', 'Mindset', 'Health');

-- CreateEnum
CREATE TYPE "HabitCommitment" AS ENUM ('Quick', 'Standard', 'Deep');

-- CreateEnum
CREATE TYPE "HabitTimeWindow" AS ENUM ('Anytime', 'Morning', 'Workday', 'Evening');

-- CreateTable
CREATE TABLE "post_habit" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "highlight" TEXT,
    "anchor" TEXT,
    "duration" TEXT,
    "cadence" TEXT NOT NULL,
    "category" "HabitCategory" NOT NULL,
    "timeWindow" "HabitTimeWindow" NOT NULL DEFAULT 'Anytime',
    "commitment" "HabitCommitment" NOT NULL,
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "guardrails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "habitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_habit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_habit_habitId_idx" ON "post_habit"("habitId");

-- CreateIndex
CREATE INDEX "post_habit_userId_idx" ON "post_habit"("userId");

-- AddForeignKey
ALTER TABLE "post_habit" ADD CONSTRAINT "post_habit_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_habit" ADD CONSTRAINT "post_habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
