-- CreateTable
CREATE TABLE "habit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cadence" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "timeOfDay" TEXT,
    "reminder" TEXT,
    "goalAmount" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "goalUnit" TEXT NOT NULL DEFAULT 'count',
    "goalUnitCategory" TEXT NOT NULL DEFAULT 'Quantity',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "habit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "habit_userId_idx" ON "habit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "habit_id_userId_key" ON "habit"("id", "userId");

-- AddForeignKey
ALTER TABLE "habit" ADD CONSTRAINT "habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
