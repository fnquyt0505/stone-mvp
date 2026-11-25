import "server-only";
import { createHash } from "node:crypto";

export const UPLOAD_FOLDER = "stone-mvp";

export type CloudinaryConfig = { cloudName: string; apiKey: string; apiSecret: string };

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

/**
 * Local disk storage is a development/test convenience only (no Cloudinary
 * keys yet). It is never available in production deployments.
 */
export function isLocalStorageAllowed(): boolean {
  if (getCloudinaryConfig()) return false;
  if (process.env.VERCEL === "1") return false;
  if (process.env.NODE_ENV !== "production") return true;
  // Production builds only for local e2e runs (set by playwright.config.ts).
  return process.env.ALLOW_LOCAL_UPLOADS === "1";
}

/**
 * Cloudinary signed-upload signature: SHA-1 of the alphabetically sorted
 * "key=value" pairs joined by "&", followed by the API secret.
 */
export function signCloudinaryParams(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");
}
