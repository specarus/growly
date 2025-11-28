-- AlterTable
ALTER TABLE "post_habit" ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "post_habit_like" (
    "id" TEXT NOT NULL,
    "postHabitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_habit_like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_habit_like_postHabitId_idx" ON "post_habit_like"("postHabitId");

-- CreateIndex
CREATE INDEX "post_habit_like_userId_idx" ON "post_habit_like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "post_habit_like_postHabitId_userId_key" ON "post_habit_like"("postHabitId", "userId");

-- AddForeignKey
ALTER TABLE "post_habit_like" ADD CONSTRAINT "post_habit_like_postHabitId_fkey" FOREIGN KEY ("postHabitId") REFERENCES "post_habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_habit_like" ADD CONSTRAINT "post_habit_like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
