"use client";

import type { OwnershipSplitInput } from "@/lib/ownership";

interface OwnershipSplitEditorProps {
  ownerWallet: string;
  onOwnerWalletChange: (value: string) => void;
  coOwners: OwnershipSplitInput[];
  onCoOwnersChange: (rows: OwnershipSplitInput[]) => void;
}

export function OwnershipSplitEditor({
  ownerWallet,
  onOwnerWalletChange,
  coOwners,
  onCoOwnersChange,
}: OwnershipSplitEditorProps) {
  const coTotal = coOwners.reduce((sum, row) => sum + (Number(row.sharePercent) || 0), 0);
  const ownerShare = Math.max(0, 100 - coTotal);

  function updateCoOwner(
    index: number,
    field: keyof OwnershipSplitInput,
    value: string
  ) {
    const next = coOwners.map((row, i) =>
      i === index
        ? {
            ...row,
            [field]: field === "sharePercent" ? Number(value) : value,
          }
        : row
    );
    onCoOwnersChange(next);
  }

  function addCoOwner() {
    onCoOwnersChange([
      ...coOwners,
      { walletAddress: "", sharePercent: 10, label: "" },
    ]);
  }

  function removeCoOwner(index: number) {
    onCoOwnersChange(coOwners.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4 border border-ld-border bg-ld-bg-secondary p-4">
      <div>
        <p className="ld-eyebrow mb-1">Ownership split</p>
        <p className="text-xs text-ld-text-secondary">
          Co-owner wallets receive their share automatically when LOWDIF is minted.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
        <div>
          <label className="ld-label">Your wallet</label>
          <input
            value={ownerWallet}
            onChange={(e) => onOwnerWalletChange(e.target.value)}
            placeholder="0x…"
            className="ld-input font-mono text-xs"
            required
          />
        </div>
        <div>
          <label className="ld-label">Your share</label>
          <input
            value={ownerShare.toFixed(1)}
            readOnly
            className="ld-input bg-ld-card text-ld-text-muted"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-ld-text">Co-owners</p>
          <button
            type="button"
            onClick={addCoOwner}
            className="text-[10px] font-bold tracking-widest text-ld-text-secondary uppercase transition hover:text-white"
          >
            + Add owner
          </button>
        </div>

        {coOwners.length === 0 && (
          <p className="text-xs text-ld-text-muted">
            No co-owners — you receive 100% of on-chain royalties.
          </p>
        )}

        {coOwners.map((row, index) => (
          <div
            key={index}
            className="grid gap-2 border border-ld-border bg-black p-3 sm:grid-cols-[1fr_5rem_5rem_auto]"
          >
            <div>
              <label className="ld-label">Wallet</label>
              <input
                value={row.walletAddress}
                onChange={(e) =>
                  updateCoOwner(index, "walletAddress", e.target.value)
                }
                placeholder="0x…"
                className="ld-input font-mono text-xs"
              />
            </div>
            <div>
              <label className="ld-label">Share %</label>
              <input
                type="number"
                min={0.1}
                max={100}
                step={0.1}
                value={row.sharePercent}
                onChange={(e) =>
                  updateCoOwner(index, "sharePercent", e.target.value)
                }
                className="ld-input"
              />
            </div>
            <div>
              <label className="ld-label">Label</label>
              <input
                value={row.label ?? ""}
                onChange={(e) => updateCoOwner(index, "label", e.target.value)}
                placeholder="Optional"
                className="ld-input"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeCoOwner(index)}
                className="h-[42px] border border-ld-border px-3 text-xs text-ld-text-muted transition hover:border-white hover:text-white"
                aria-label="Remove co-owner"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <p
        className={`text-xs ${
          Math.abs(coTotal + ownerShare - 100) < 0.01
            ? "text-green-400"
            : "text-amber-300"
        }`}
      >
        Total: {(coTotal + ownerShare).toFixed(1)}% · Your share: {ownerShare.toFixed(1)}%
      </p>
    </div>
  );
}
