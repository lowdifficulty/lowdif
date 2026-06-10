import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const artist = await prisma.user.upsert({
    where: { email: "artist@lowdif.com" },
    update: {},
    create: {
      email: "artist@lowdif.com",
      name: "Demo Artist",
      passwordHash,
      role: "ARTIST",
      bio: "Seed artist for LOWDIF Stream",
    },
  });

  await prisma.user.upsert({
    where: { email: "listener@lowdif.com" },
    update: {},
    create: {
      email: "listener@lowdif.com",
      name: "Demo Listener",
      passwordHash,
      role: "LISTENER",
    },
  });

  const demoTracks = [
    {
      title: "Midnight Frequency",
      genre: "Electronic",
      durationSec: 372,
      fileUrl:
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      title: "Neon Drift",
      genre: "Lo-Fi",
      durationSec: 425,
      fileUrl:
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      title: "Voltage Dreams",
      genre: "Ambient",
      durationSec: 390,
      fileUrl:
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
  ];

  for (const track of demoTracks) {
    const existing = await prisma.track.findFirst({
      where: { title: track.title, artistId: artist.id },
    });
    if (!existing) {
      await prisma.track.create({
        data: { ...track, artistId: artist.id },
      });
    }
  }

  console.log("Seed complete.");
  console.log("  Artist:  artist@lowdif.com / password123");
  console.log("  Listener: listener@lowdif.com / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
