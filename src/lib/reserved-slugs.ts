/**
 * First path segments owned by dedicated routes. A category or page using one
 * of these slugs would be shadowed and never shown at /[slug]/.
 */
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "cong-trinh",
  "tin-tuc",
  "thu-vien-hinh-anh",
  "lien-he",
  "huong-dan-dat-hang",
  "dev",
  "uploads",
  "samples",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}
