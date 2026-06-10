export type UserRole = "LISTENER" | "ARTIST";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  walletAddress?: string | null;
}

export interface TrackWithArtist {
  id: string;
  title: string;
  genre: string;
  durationSec: number;
  fileUrl: string;
  coverUrl: string | null;
  playCount: number;
  createdAt: string;
  artist: {
    id: string;
    name: string;
  };
}

export interface ProofOfListenResult {
  txHash: string;
  tokens: number;
  status: "CONFIRMED" | "PENDING" | "FAILED";
  tokenSymbol: string;
}

export interface StatsSummary {
  totalListens: number;
  totalTokensEarned: number;
  totalTracksPlayed: number;
  recentMining: {
    id: string;
    txHash: string;
    tokens: number;
    trackTitle: string;
    createdAt: string;
  }[];
}

export interface ArtistStats {
  totalPlays: number;
  totalTracks: number;
  topTracks: {
    id: string;
    title: string;
    playCount: number;
  }[];
  recentPlays: number;
}
