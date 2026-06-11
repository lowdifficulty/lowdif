import { prisma } from "./db";
import type { OwnershipSplitInput } from "./ownership";

export interface TrackOwnershipRow {
  walletAddress: string;
  sharePercent: number;
}

export async function insertTrackOwnership(
  trackId: string,
  splits: OwnershipSplitInput[]
): Promise<void> {
  if (splits.length === 0) return;
  await prisma.trackOwnership.createMany({
    data: splits.map((split) => ({
      trackId,
      walletAddress: split.walletAddress,
      sharePercent: split.sharePercent,
      label: split.label ?? null,
    })),
  });
}

export async function replaceTrackOwnership(
  trackId: string,
  splits: OwnershipSplitInput[]
): Promise<void> {
  await prisma.trackOwnership.deleteMany({ where: { trackId } });
  await insertTrackOwnership(trackId, splits);
}

export async function fetchTrackOwnership(
  trackId: string
): Promise<TrackOwnershipRow[]> {
  return prisma.trackOwnership.findMany({
    where: { trackId },
    select: { walletAddress: true, sharePercent: true },
  });
}
