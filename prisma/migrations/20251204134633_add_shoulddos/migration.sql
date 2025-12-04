-- CreateTable
CREATE TABLE "should_do" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "should_do_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "should_do_like" (
    "id" TEXT NOT NULL,
    "shouldDoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "should_do_like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "should_do_userId_idx" ON "should_do"("userId");

-- CreateIndex
CREATE INDEX "should_do_like_shouldDoId_idx" ON "should_do_like"("shouldDoId");

-- CreateIndex
CREATE INDEX "should_do_like_userId_idx" ON "should_do_like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "should_do_like_shouldDoId_userId_key" ON "should_do_like"("shouldDoId", "userId");

-- AddForeignKey
ALTER TABLE "should_do" ADD CONSTRAINT "should_do_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "should_do_like" ADD CONSTRAINT "should_do_like_shouldDoId_fkey" FOREIGN KEY ("shouldDoId") REFERENCES "should_do"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "should_do_like" ADD CONSTRAINT "should_do_like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
