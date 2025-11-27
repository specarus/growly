-- CreateTable
CREATE TABLE "routine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "anchor" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_habit" (
    "id" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_habit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "routine_userId_idx" ON "routine"("userId");

-- CreateIndex
CREATE INDEX "routine_habit_routineId_idx" ON "routine_habit"("routineId");

-- CreateIndex
CREATE INDEX "routine_habit_habitId_idx" ON "routine_habit"("habitId");

-- CreateIndex
CREATE UNIQUE INDEX "routine_habit_routineId_habitId_key" ON "routine_habit"("routineId", "habitId");

-- AddForeignKey
ALTER TABLE "routine" ADD CONSTRAINT "routine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_habit" ADD CONSTRAINT "routine_habit_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_habit" ADD CONSTRAINT "routine_habit_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
