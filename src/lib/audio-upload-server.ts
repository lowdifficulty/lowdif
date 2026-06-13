import { parseBuffer } from "music-metadata";
import {
  AudioUploadError,
  isAllowedAudioFile,
  validateAudioDurationSec,
} from "./audio-upload";

export async function analyzeAudioBuffer(
  buffer: Buffer,
  file: Pick<File, "name" | "type">
): Promise<number> {
  if (!isAllowedAudioFile(file)) {
    throw new AudioUploadError(
      "Unsupported audio format. Use MP3, WAV, M4A, AAC, OGG, FLAC, WebM, AIFF, or Opus."
    );
  }

  let durationSec: number | undefined;
  try {
    const metadata = await parseBuffer(buffer, {
      mimeType: file.type || undefined,
      size: buffer.length,
    });
    durationSec = metadata.format.duration;
  } catch {
    throw new AudioUploadError("Could not read audio file metadata.");
  }

  if (!durationSec || !Number.isFinite(durationSec)) {
    throw new AudioUploadError("Could not determine audio duration.");
  }

  const rounded = Math.round(durationSec);
  validateAudioDurationSec(rounded);
  return rounded;
}

export async function analyzeAudioFile(file: File): Promise<number> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return analyzeAudioBuffer(buffer, file);
}

export async function analyzeAudioFromUrl(
  url: string,
  file: Pick<File, "name" | "type">
): Promise<number> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new AudioUploadError("Could not verify uploaded audio file.");
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return analyzeAudioBuffer(buffer, file);
}
