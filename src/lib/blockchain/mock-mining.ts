import type { ProofOfListenResult } from "./types";

export interface ProofOfListenPayload {
  userId: string;
  trackId: string;
  listenDurationMs: number;
  walletAddress?: string | null;
}

/**
 * Mock Grapewallet / LOWDIF mining adapter.
 * Replace this module with real HTTP calls when API credentials are available.
 */
export async function submitProofOfListen(
  payload: ProofOfListenPayload
): Promise<ProofOfListenResult> {
  const apiUrl = process.env.GRAPEWALLET_API_URL;
  const apiKey = process.env.GRAPEWALLET_API_KEY;
  const tokenSymbol = process.env.LOWDIF_TOKEN_SYMBOL ?? "LOWDIF";
  const tokensPerListen = Number(process.env.LOWDIF_TOKENS_PER_LISTEN ?? "1");

  if (apiUrl && apiKey) {
    try {
      const response = await fetch(`${apiUrl}/proof-of-listen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          userId: payload.userId,
          trackId: payload.trackId,
          durationMs: payload.listenDurationMs,
          wallet: payload.walletAddress,
          token: tokenSymbol,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          txHash?: string;
          tokens?: number;
          status?: string;
        };
        return {
          txHash: data.txHash ?? generateMockTxHash(payload),
          tokens: data.tokens ?? tokensPerListen,
          status: "CONFIRMED",
          tokenSymbol,
        };
      }
    } catch {
      // Fall through to mock on network failure
    }
  }

  await simulateNetworkDelay();

  return {
    txHash: generateMockTxHash(payload),
    tokens: tokensPerListen,
    status: "CONFIRMED",
    tokenSymbol,
  };
}

function generateMockTxHash(payload: ProofOfListenPayload): string {
  const seed = `${payload.userId}:${payload.trackId}:${payload.listenDurationMs}:${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `0xlowdif${hex}${Date.now().toString(16)}`.slice(0, 66);
}

async function simulateNetworkDelay(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 600));
}
