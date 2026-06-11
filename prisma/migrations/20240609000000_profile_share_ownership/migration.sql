-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "giveShareToArtists" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "referredById" TEXT;

-- CreateTable
CREATE TABLE "TrackOwnership" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "sharePercent" DOUBLE PRECISION NOT NULL,
    "label" TEXT,

    CONSTRAINT "TrackOwnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareEvent" (
    "id" TEXT NOT NULL,
    "sharerId" TEXT,
    "trackId" TEXT,
    "playlistSlug" TEXT,
    "channel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrackOwnership_trackId_idx" ON "TrackOwnership"("trackId");

-- CreateIndex
CREATE INDEX "ShareEvent_trackId_idx" ON "ShareEvent"("trackId");
CREATE INDEX "ShareEvent_playlistSlug_idx" ON "ShareEvent"("playlistSlug");
CREATE INDEX "ShareEvent_sharerId_idx" ON "ShareEvent"("sharerId");
CREATE INDEX "ShareEvent_createdAt_idx" ON "ShareEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackOwnership" ADD CONSTRAINT "TrackOwnership_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareEvent" ADD CONSTRAINT "ShareEvent_sharerId_fkey" FOREIGN KEY ("sharerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareEvent" ADD CONSTRAINT "ShareEvent_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
