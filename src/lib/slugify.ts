/**
 * Vietnamese-aware slug: strips diacritics, maps đ/Đ to d, lowercases and
 * joins words with single hyphens. "Mộ Đá Đôi" -> "mo-da-doi".
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** True for lowercase ASCII slugs with single hyphens, e.g. "mo-da-doi". */
export function isValidSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= 120 && SLUG_RE.test(slug);
}
