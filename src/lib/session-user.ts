import type { User } from "@prisma/client";
import { avatarForUser } from "./user-avatar";
import type { SessionUser } from "./types";

export function toSessionUser(
  user: Pick<
    User,
    | "id"
    | "email"
    | "name"
    | "role"
    | "walletAddress"
    | "bio"
    | "giveShareToArtists"
  > & {
    avatarUrl?: string | null;
    tracks?: { coverUrl: string | null }[];
  }
): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    walletAddress: user.walletAddress,
    bio: user.bio,
    giveShareToArtists: user.giveShareToArtists ?? false,
    avatarUrl:
      user.avatarUrl ??
      avatarForUser(user.name, user.tracks?.[0]?.coverUrl),
  };
}
