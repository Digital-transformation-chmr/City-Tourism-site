-- CreateTable
CREATE TABLE "Excursion" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "coverImage" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 120,
    "placeIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Excursion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Excursion_slug_key" ON "Excursion"("slug");

-- CreateIndex
CREATE INDEX "Excursion_status_idx" ON "Excursion"("status");

-- CreateIndex
CREATE INDEX "Excursion_createdAt_idx" ON "Excursion"("createdAt");
