-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "friend_request" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friend_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "friend_request_toUserId_status_idx" ON "friend_request"("toUserId", "status");

-- CreateIndex
CREATE INDEX "friend_request_fromUserId_status_idx" ON "friend_request"("fromUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "friend_request_fromUserId_toUserId_key" ON "friend_request"("fromUserId", "toUserId");

-- AddForeignKey
ALTER TABLE "friend_request" ADD CONSTRAINT "friend_request_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_request" ADD CONSTRAINT "friend_request_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
