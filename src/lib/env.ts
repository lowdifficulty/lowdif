/** JWT signing key — required in production. */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("JWT_SECRET must be set in production.");
  }
  return new TextEncoder().encode(
    secret ?? "dev-secret-change-in-production"
  );
}

export function requireBlobInProduction(): void {
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.BLOB_READ_WRITE_TOKEN
  ) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required in production for uploads."
    );
  }
}

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_MARKETING_URL ??
    "http://localhost:3000"
  );
}
