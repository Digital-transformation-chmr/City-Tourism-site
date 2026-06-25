-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "telegramId" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "source" TEXT NOT NULL DEFAULT 'telegram',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "News_telegramId_key" ON "News"("telegramId");
