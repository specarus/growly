-- CreateTable
CREATE TABLE "notification_read" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_read_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_read_userId_idx" ON "notification_read"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_read_userId_notificationId_key" ON "notification_read"("userId", "notificationId");

-- AddForeignKey
ALTER TABLE "notification_read" ADD CONSTRAINT "notification_read_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
