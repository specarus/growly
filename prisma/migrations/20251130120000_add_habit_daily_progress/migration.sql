-- CreateTable
CREATE TABLE "habit_daily_progress" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_daily_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "habit_daily_progress_habitId_date_key" ON "habit_daily_progress"("habitId", "date");

-- CreateIndex
CREATE INDEX "habit_daily_progress_habitId_idx" ON "habit_daily_progress"("habitId");

-- CreateIndex
CREATE INDEX "habit_daily_progress_date_idx" ON "habit_daily_progress"("date");

-- AddForeignKey
ALTER TABLE "habit_daily_progress" ADD CONSTRAINT "habit_daily_progress_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UpdateData
UPDATE "habit" SET "dailyProgress" = 0;
