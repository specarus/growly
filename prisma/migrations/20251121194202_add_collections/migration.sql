-- AlterTable
ALTER TABLE "todo" ALTER COLUMN "iconColor" SET DEFAULT '#E5E7EB',
ALTER COLUMN "iconName" SET DEFAULT 'Notebook';

-- CreateTable
CREATE TABLE "collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_todo" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_todo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collection_userId_name_idx" ON "collection"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "collection_todo_collectionId_todoId_key" ON "collection_todo"("collectionId", "todoId");

-- AddForeignKey
ALTER TABLE "collection" ADD CONSTRAINT "collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_todo" ADD CONSTRAINT "collection_todo_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_todo" ADD CONSTRAINT "collection_todo_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
