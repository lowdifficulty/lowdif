"use client";

interface VerifiedOverlayProps {
  tokens: number;
  onContinue: () => void;
}

export function VerifiedOverlay({ tokens, onContinue }: VerifiedOverlayProps) {
  const mintLabel = `${tokens % 1 === 0 ? tokens : tokens.toFixed(1)} LOWDIF Minted`;

  return (
    <div
      className="verified-overlay fixed inset-0 z-[200] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verified-title"
    >
      <div className="verified-overlay-backdrop absolute inset-0 bg-black/88 backdrop-blur-md" />

      <div className="verified-overlay-burst pointer-events-none absolute inset-0" aria-hidden />
      <div className="verified-overlay-ring pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-10 flex flex-col items-center px-6 text-center text-white">
        <p className="verified-overlay-eyebrow ld-eyebrow mb-8 text-[11px] sm:text-xs">
          Proof-of-Listen
        </p>

        <div className="verified-overlay-stamp border-[3px] border-white px-10 py-4 sm:px-14 sm:py-5">
          <p
            id="verified-title"
            className="text-4xl font-black tracking-[0.2em] sm:text-6xl"
          >
            Verified
          </p>
        </div>

        <div className="verified-overlay-line my-10 h-px bg-white" />

        <p className="verified-overlay-mint text-xl font-black tracking-tight sm:text-3xl">
          {mintLabel}
        </p>

        <button
          type="button"
          onClick={onContinue}
          className="verified-overlay-cta mt-12 border-2 border-white px-10 py-3.5 text-[11px] font-bold tracking-[0.3em] text-white uppercase transition hover:bg-white hover:text-black sm:text-xs"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
