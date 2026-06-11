"use client";

import { useEffect, useRef, useState } from "react";

const OUTPUT_SIZE = 512;

interface SquareImageCropperProps {
  file: File | null;
  onCropped: (blob: Blob | null) => void;
}

export function cropFileToSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.drawImage(img, sx, sy, size, size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) reject(new Error("Crop failed"));
          else resolve(blob);
        },
        "image/jpeg",
        0.92
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image"));
    };
    img.src = url;
  });
}

export function SquareImageCropper({ file, onCropped }: SquareImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onCroppedRef = useRef(onCropped);
  onCroppedRef.current = onCropped;

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      onCroppedRef.current(null);
      return;
    }

    let cancelled = false;

    void cropFileToSquare(file).then((blob) => {
      if (cancelled) return;
      const url = URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      onCroppedRef.current(blob);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(img.src);
      };
      img.src = url;
    });

    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!file) {
    return (
      <div className="flex aspect-square w-full max-w-[12rem] items-center justify-center border border-dashed border-ld-border bg-ld-bg-secondary text-xs text-ld-text-muted">
        No cover selected
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-square w-full max-w-[12rem] overflow-hidden border border-ld-border bg-black">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Cropped cover preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ld-text-muted">
            Cropping…
          </div>
        )}
      </div>
      <p className="text-[11px] text-ld-text-muted">
        Center-cropped to square · 512×512
      </p>
      <canvas ref={canvasRef} className="hidden" aria-hidden />
    </div>
  );
}
