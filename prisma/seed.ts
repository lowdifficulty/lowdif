import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { playCountForArtist } from "../src/lib/demo-artist-plays";
import { DEMO_LISTENERS } from "../src/lib/demo-listeners";
import {
  DEMO_TRACK_DURATION_SEC,
  DEMO_TRACKS,
  artistEmailFromName,
  soundHelixUrl,
} from "../src/lib/demo-tracks";

const prisma = new PrismaClient();

function artistEmail(name: string): string {
  if (name === "Kira Voss") return "artist@lowdif.com";
  return artistEmailFromName(name);
}

function demoTxHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return `0xseed${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

async function main() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.SEED_DEMO_DATA !== "true"
  ) {
    console.log(
      "Skipping demo seed in production. Set SEED_DEMO_DATA=true to load QA filler data."
    );
    return;
  }

  const passwordHash = await bcrypt.hash("password123", 12);
  const artistIds = new Map<string, string>();
  const trackIds: { id: string; title: string }[] = [];

  for (const track of DEMO_TRACKS) {
    const email = artistEmail(track.artistName);
    if (!artistIds.has(email)) {
      const artist = await prisma.user.upsert({
        where: { email },
        update: {
          name: track.artistName,
          role: "LISTENER",
          avatarUrl: track.coverUrl,
        },
        create: {
          email,
          name: track.artistName,
          passwordHash,
          role: "LISTENER",
          bio: `${track.artistName} on LOWDIF Stream`,
          avatarUrl: track.coverUrl,
        },
      });
      artistIds.set(email, artist.id);
    }
  }

  const seedTitles = new Set(DEMO_TRACKS.map((t) => t.title));

  for (const track of DEMO_TRACKS) {
    const artistId = artistIds.get(artistEmail(track.artistName))!;
    const playCount = playCountForArtist(track.artistName);
    const data = {
      title: track.title,
      genre: track.genre,
      durationSec: DEMO_TRACK_DURATION_SEC,
      coverUrl: track.coverUrl,
      fileUrl: soundHelixUrl(track.soundHelixIndex),
      artistId,
      playCount,
    };

    const existing = await prisma.track.findFirst({
      where: { title: track.title },
    });

    if (!existing) {
      const created = await prisma.track.create({ data });
      trackIds.push({ id: created.id, title: created.title });
    } else {
      const updated = await prisma.track.update({
        where: { id: existing.id },
        data,
      });
      trackIds.push({ id: updated.id, title: updated.title });
    }
  }

  const legacy = await prisma.track.findMany({
    select: { id: true, title: true },
  });
  for (const row of legacy) {
    if (!seedTitles.has(row.title)) {
      await prisma.track.delete({ where: { id: row.id } });
    }
  }

  const catalogArtistIds = new Set(artistIds.values());
  const keepEmails = new Set(DEMO_LISTENERS.map((l) => l.email));

  const usersWithoutTracks = await prisma.user.findMany({
    where: { tracks: { none: {} } },
    select: { id: true, email: true },
  });
  for (const user of usersWithoutTracks) {
    if (catalogArtistIds.has(user.id)) continue;
    if (keepEmails.has(user.email)) continue;
    await prisma.user.delete({ where: { id: user.id } });
  }

  await prisma.user.updateMany({
    where: { role: "ARTIST" },
    data: { role: "LISTENER" },
  });

  const sampleTrackId = trackIds[0]?.id;
  if (!sampleTrackId) {
    throw new Error("No tracks seeded.");
  }

  for (const listener of DEMO_LISTENERS) {
    const user = await prisma.user.upsert({
      where: { email: listener.email },
      update: {
        name: listener.name,
        role: "LISTENER",
        avatarUrl: listener.avatarUrl,
      },
      create: {
        email: listener.email,
        name: listener.name,
        passwordHash,
        role: "LISTENER",
        avatarUrl: listener.avatarUrl,
      },
    });

    await prisma.miningRecord.deleteMany({ where: { userId: user.id } });
    await prisma.listenEvent.deleteMany({ where: { userId: user.id } });

    if (listener.tokensMined <= 0) continue;

    const listenEvent = await prisma.listenEvent.create({
      data: {
        userId: user.id,
        trackId: sampleTrackId,
        durationMs: DEMO_TRACK_DURATION_SEC * 1000,
        completed: true,
      },
    });

    await prisma.miningRecord.create({
      data: {
        userId: user.id,
        listenEventId: listenEvent.id,
        txHash: demoTxHash(`${user.id}:listener`),
        tokens: listener.tokensMined,
        status: "CONFIRMED",
      },
    });
  }

  console.log(`Seed complete — ${DEMO_TRACKS.length} tracks @ ${DEMO_TRACK_DURATION_SEC}s.`);
  console.log(`  ${artistIds.size} artists with play counts`);
  console.log(`  ${DEMO_LISTENERS.length} listeners with mining history`);
  console.log("  Main login:  listener@lowdif.com / password123 (Matthew)");
  console.log("  Artist login: artist@lowdif.com / password123 (Kira Voss)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
