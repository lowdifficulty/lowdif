import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const failed = await prisma.$queryRaw<
    { migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }[]
  >`
    SELECT migration_name, finished_at, rolled_back_at
    FROM "_prisma_migrations"
    WHERE migration_name = '20240610000000_playlists'
  `;

  if (failed.length === 0) {
    console.log("No playlist migration row found — migrate deploy will apply fresh.");
    return;
  }

  const row = failed[0];
  if (row.finished_at) {
    console.log("Playlist migration already applied.");
    return;
  }

  await prisma.$executeRaw`
    UPDATE "_prisma_migrations"
    SET rolled_back_at = NOW(), logs = 'Manually rolled back so idempotent migration can re-apply.'
    WHERE migration_name = '20240610000000_playlists' AND finished_at IS NULL
  `;
  console.log("Marked failed playlist migration as rolled back.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
