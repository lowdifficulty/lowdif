export const MIN_AUDIO_DURATION_SEC = 30;
export const MAX_AUDIO_DURATION_SEC = 7 * 60;

export const ALLOWED_AUDIO_EXTENSIONS = new Set([
  ".mp3",
  ".wav",
  ".wave",
  ".m4a",
  ".aac",
  ".ogg",
  ".oga",
  ".flac",
  ".webm",
  ".aiff",
  ".aif",
  ".opus",
  ".wma",
  ".mp4",
]);

export const ALLOWED_AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/aac",
  "audio/x-m4a",
  "audio/ogg",
  "audio/flac",
  "audio/webm",
  "audio/aiff",
  "audio/x-aiff",
  "audio/opus",
  "audio/x-ms-wma",
]);

export const AUDIO_FILE_ACCEPT =
  "audio/*,.mp3,.wav,.wave,.m4a,.aac,.ogg,.oga,.flac,.webm,.aiff,.aif,.opus,.wma";

export class AudioUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AudioUploadError";
  }
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

export function isAllowedAudioFile(file: Pick<File, "name" | "type">): boolean {
  const ext = extensionOf(file.name);
  if (ALLOWED_AUDIO_EXTENSIONS.has(ext)) return true;
  if (file.type.startsWith("audio/")) return true;
  if (file.type && ALLOWED_AUDIO_MIME_TYPES.has(file.type)) return true;
  return false;
}

export function formatAudioDuration(sec: number): string {
  const total = Math.max(0, Math.round(sec));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function validateAudioDurationSec(durationSec: number): void {
  const rounded = Math.round(durationSec);
  if (!Number.isFinite(rounded) || rounded <= 0) {
    throw new AudioUploadError("Could not determine audio duration.");
  }
  if (rounded < MIN_AUDIO_DURATION_SEC) {
    throw new AudioUploadError(
      `Audio must be at least ${MIN_AUDIO_DURATION_SEC} seconds (detected ${rounded}s).`
    );
  }
  if (rounded > MAX_AUDIO_DURATION_SEC) {
    throw new AudioUploadError(
      `Audio must be ${MAX_AUDIO_DURATION_SEC / 60} minutes or less (detected ${formatAudioDuration(rounded)}).`
    );
  }
}

export function readAudioDurationSec(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";

    const cleanup = () => URL.revokeObjectURL(url);

    audio.onloadedmetadata = () => {
      cleanup();
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        reject(new AudioUploadError("Could not read audio duration from this file."));
        return;
      }
      resolve(audio.duration);
    };

    audio.onerror = () => {
      cleanup();
      reject(new AudioUploadError("Could not read this audio file."));
    };

    audio.src = url;
    audio.load();
  });
}
