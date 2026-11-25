import "server-only";

/**
 * Key parts for unstable_cache. Appends a per-build id so a deploy (or dev
 * server restart) never serves entries cached with an older query shape.
 */
export function cacheKey(...parts: string[]): string[] {
  return [...parts, process.env.CACHE_BUILD_ID ?? "dev"];
}
