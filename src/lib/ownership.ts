export interface OwnershipSplitInput {
  walletAddress: string;
  sharePercent: number;
  label?: string;
}

export function normalizeWallet(wallet: string): string {
  return wallet.trim().toLowerCase();
}

export function validateOwnershipSplits(
  splits: OwnershipSplitInput[]
): { ok: true; splits: OwnershipSplitInput[] } | { ok: false; error: string } {
  if (!splits.length) {
    return { ok: false, error: "At least one ownership split is required." };
  }

  const normalized: OwnershipSplitInput[] = [];
  const seen = new Set<string>();

  for (const split of splits) {
    const wallet = split.walletAddress?.trim();
    if (!wallet || wallet.length < 6) {
      return { ok: false, error: "Each owner needs a valid wallet address." };
    }

    const key = normalizeWallet(wallet);
    if (seen.has(key)) {
      return { ok: false, error: "Duplicate wallet addresses in ownership split." };
    }
    seen.add(key);

    const sharePercent = Number(split.sharePercent);
    if (!Number.isFinite(sharePercent) || sharePercent <= 0 || sharePercent > 100) {
      return { ok: false, error: "Each share must be between 0 and 100." };
    }

    normalized.push({
      walletAddress: wallet,
      sharePercent: Math.round(sharePercent * 100) / 100,
      label: split.label?.trim() || undefined,
    });
  }

  const total = normalized.reduce((sum, s) => sum + s.sharePercent, 0);
  if (Math.abs(total - 100) > 0.01) {
    return {
      ok: false,
      error: `Ownership must total 100% (currently ${total.toFixed(1)}%).`,
    };
  }

  return { ok: true, splits: normalized };
}
