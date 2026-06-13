/**
 * Remove seeded demo catalog, demo listeners, and filler tracks from the database.
 * Keeps real uploads — including "Yea" by Hattie — and deletes "yes" by Hattie.
 *
 * Usage: npx tsx scripts/purge-demo-data.ts
 */
import { PrismaClient } from "@prisma/client";
import { DEMO_LISTENERS, listenerEmailFromName } from "../src/lib/demo-listeners";
import {
  DEMO_TRACKS,
  artistEmailFromName,
  soundHelixUrl,
} from "../src/lib/demo-tracks";

const prisma = new PrismaClient();

const DEMO_TRACK_TITLES = new Set(
  DEMO_TRACKS.map((t) => t.title.toLowerCase())
);

const DEMO_USER_EMAILS = new Set<string>([
  "artist@lowdif.com",
  "listener@lowdif.com",
  ...DEMO_LISTENERS.map((l) => l.email),
  ...DEMO_TRACKS.map((t) => artistEmailFromName(t.artistName)),
]);

function isProtectedTrack(title: string, artistName: string): boolean {
  return (
    title.trim().toLowerCase() === "yea" &&
    artistName.trim().toLowerCase() === "hattie"
  );
}

function shouldDeleteTrack(
  title: string,
  artistName: string,
  fileUrl: string
): boolean {
  if (isProtectedTrack(title, artistName)) return false;

  const normalizedTitle = title.trim().toLowerCase();
  const normalizedArtist = artistName.trim().toLowerCase();

  if (normalizedTitle === "yes" && normalizedArtist === "hattie") return true;
  if (DEMO_TRACK_TITLES.has(normalizedTitle)) return true;
  if (fileUrl.includes("soundhelix.com")) return true;

  return false;
}

async function main() {
  const tracks = await prisma.track.findMany({
    select: {
      id: true,
      title: true,
      fileUrl: true,
      artist: { select: { id: true, name: true, email: true } },
    },
  });

  const toDelete = tracks.filter((track) =>
    shouldDeleteTrack(track.title, track.artist.name, track.fileUrl)
  );
  const kept = tracks.filter(
    (track) => !shouldDeleteTrack(track.title, track.artist.name, track.fileUrl)
  );

  console.log(`Tracks to delete: ${toDelete.length}`);
  for (const track of toDelete) {
    console.log(`  - "${track.title}" by ${track.artist.name}`);
  }

  console.log(`Tracks to keep: ${kept.length}`);
  for (const track of kept) {
    console.log(`  + "${track.title}" by ${track.artist.name}`);
  }

  if (toDelete.length > 0) {
    await prisma.track.deleteMany({
      where: { id: { in: toDelete.map((t) => t.id) } },
    });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      _count: { select: { tracks: true } },
    },
  });

  const usersToDelete = users.filter((user) => {
    if (DEMO_USER_EMAILS.has(user.email.toLowerCase())) return true;
    if (user._count.tracks > 0) return false;
    if (user.email.startsWith("artist-") && user.email.endsWith("@lowdif.com")) {
      return true;
    }
    if (user.email.startsWith("listener-") && user.email.endsWith("@lowdif.com")) {
      return listenerEmailFromName(user.name) === user.email;
    }
    return false;
  });

  // Never delete Hattie if they still have Yea
  const protectedUserIds = new Set(
    kept
      .filter((t) => isProtectedTrack(t.title, t.artist.name))
      .map((t) => t.artist.id)
  );

  const finalUserDeletes = usersToDelete.filter(
    (u) => !protectedUserIds.has(u.id)
  );

  console.log(`Users to delete: ${finalUserDeletes.length}`);
  for (const user of finalUserDeletes) {
    console.log(`  - ${user.name} <${user.email}>`);
  }

  if (finalUserDeletes.length > 0) {
    await prisma.user.deleteMany({
      where: { id: { in: finalUserDeletes.map((u) => u.id) } },
    });
  }

  console.log("Demo purge complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
