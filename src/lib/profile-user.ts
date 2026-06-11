import { prisma } from "./db";
import { toSessionUser } from "./session-user";
import type { SessionUser } from "./types";

export const profileSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  walletAddress: true,
  bio: true,
  avatarUrl: true,
  giveShareToArtists: true,
  tracks: { select: { coverUrl: true }, take: 1 },
} as const;

/** @deprecated Use profileSelect */
export const legacyProfileSelect = profileSelect;

export async function readGiveShareToArtists(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { giveShareToArtists: true },
  });
  return user?.giveShareToArtists ?? false;
}

export async function writeGiveShareToArtists(
  userId: string,
  value: boolean
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { giveShareToArtists: value },
  });
}

export async function fetchProfileUser(
  userId: string,
  sessionFallback?: SessionUser | null
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });

  if (!user) return sessionFallback ?? null;
  return toSessionUser(user);
}
