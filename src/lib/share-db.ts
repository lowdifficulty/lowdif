import { prisma } from "./db";
import type { ShareChannel } from "./share";

export async function recordShareEvent(input: {
  sharerId?: string | null;
  trackId?: string | null;
  playlistSlug?: string | null;
  channel: ShareChannel;
}): Promise<void> {
  try {
    await prisma.shareEvent.create({
      data: {
        sharerId: input.sharerId ?? null,
        trackId: input.trackId ?? null,
        playlistSlug: input.playlistSlug ?? null,
        channel: input.channel,
      },
    });
  } catch {
    // Share tracking is best-effort
  }
}

export async function getShareStats(input: {
  trackId?: string;
  playlistSlug?: string;
}): Promise<{ count: number; recentSharers: string[] }> {
  const where = input.trackId
    ? { trackId: input.trackId }
    : input.playlistSlug
      ? { playlistSlug: input.playlistSlug }
      : null;

  if (!where) return { count: 0, recentSharers: [] };

  try {
    const [count, recent] = await Promise.all([
      prisma.shareEvent.count({ where }),
      prisma.shareEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { sharer: { select: { name: true } } },
      }),
    ]);

    const recentSharers = recent
      .map((row) => row.sharer?.name)
      .filter((name): name is string => Boolean(name));

    return { count, recentSharers: [...new Set(recentSharers)] };
  } catch {
    return { count: 0, recentSharers: [] };
  }
}
