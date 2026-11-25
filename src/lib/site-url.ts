const FALLBACK_SITE_URL = "http://localhost:3000";

/** Public origin without trailing slash, from NEXT_PUBLIC_SITE_URL. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL;
  return raw.replace(/\/+$/, "");
}

/**
 * Absolute URL for a site path, honouring `trailingSlash: true`
 * ("/mo-da-doi" -> "https://example.com/mo-da-doi/"). File paths
 * ("/og.png") and query/hash suffixes are kept as-is.
 */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  const suffixStart = path.search(/[?#]/);
  const pathname = suffixStart === -1 ? path : path.slice(0, suffixStart);
  const suffix = suffixStart === -1 ? "" : path.slice(suffixStart);

  let normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const lastSegment = normalized.split("/").pop() ?? "";
  if (!normalized.endsWith("/") && !lastSegment.includes(".")) normalized += "/";
  return `${getSiteUrl()}${normalized}${suffix}`;
}
