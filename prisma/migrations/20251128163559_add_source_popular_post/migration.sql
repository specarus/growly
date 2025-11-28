/*
  Warnings:

  - A unique constraint covering the columns `[userId,sourcePopularPostId]` on the table `habit` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "habit" ADD COLUMN     "sourcePopularPostId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "habit_userId_sourcePopularPostId_key" ON "habit"("userId", "sourcePopularPostId");
