import { PrismaClient } from "@prisma/client";
import { lowdifMintedFromPlays } from "../src/lib/display";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      avatarUrl: true,
      miningRecords: { select: { tokens: true } },
      tracks: { select: { playCount: true } },
    },
  });

  const listeners = users.filter((u) => u.role === "LISTENER");
  const artists = users.filter((u) => u.role === "ARTIST");

  console.log("Total users:", users.length);
  console.log("Listeners:", listeners.length);
  console.log(
    "Listener scores:",
    listeners.map((u) => ({
      name: u.name,
      score: u.miningRecords.reduce((s, r) => s + r.tokens, 0),
    }))
  );
  console.log("Artists:", artists.length);
  console.log(
    "Artist plays (sample):",
    artists.slice(0, 5).map((u) => ({
      name: u.name,
      minted: lowdifMintedFromPlays(
        u.tracks.reduce((s, t) => s + t.playCount, 0)
      ),
    }))
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
