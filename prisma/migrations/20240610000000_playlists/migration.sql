-- CreateTable
CREATE TABLE IF NOT EXISTS "Playlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PlaylistTrack" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "PlaylistTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Playlist_userId_idx" ON "Playlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Playlist_userId_slug_key" ON "Playlist"("userId", "slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PlaylistTrack_playlistId_idx" ON "PlaylistTrack"("playlistId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PlaylistTrack_playlistId_trackId_key" ON "PlaylistTrack"("playlistId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PlaylistTrack_playlistId_position_key" ON "PlaylistTrack"("playlistId", "position");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "PlaylistTrack" ADD CONSTRAINT "PlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "PlaylistTrack" ADD CONSTRAINT "PlaylistTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
