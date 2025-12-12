-- CreateTable
CREATE TABLE "habit_reflection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_reflection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "habit_reflection_userId_entryDate_idx" ON "habit_reflection"("userId", "entryDate");

-- AddForeignKey
ALTER TABLE "habit_reflection" ADD CONSTRAINT "habit_reflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
