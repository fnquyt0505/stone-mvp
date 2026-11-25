import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/server/db";

/** Salted SHA-256 so raw IPs/phones are never stored. */
export function hashKey(scope: string, value: string): string {
  const salt = process.env.AUTH_SECRET ?? "dev-salt";
  return `${scope}:${createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 32)}`;
}

/**
 * DB-backed sliding window (works across serverless instances). Records the
 * attempt and returns whether it is still within `limit` per `windowMs`.
 */
export async function hitRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; count: number }> {
  const since = new Date(Date.now() - windowMs);
  const count = await db.rateLimitHit.count({ where: { key, createdAt: { gte: since } } });
  if (count >= limit) return { allowed: false, count };

  await db.rateLimitHit.create({ data: { key } });
  // Opportunistic cleanup of this key's expired hits.
  await db.rateLimitHit.deleteMany({ where: { key, createdAt: { lt: since } } });
  return { allowed: true, count: count + 1 };
}

/** Read-only check: true when `key` already has `limit` hits inside the window. */
export async function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const since = new Date(Date.now() - windowMs);
  return (await db.rateLimitHit.count({ where: { key, createdAt: { gte: since } } })) >= limit;
}

/** Records one hit (e.g. a failed login) for `key`. */
export async function recordHit(key: string): Promise<void> {
  await db.rateLimitHit.create({ data: { key } });
}
