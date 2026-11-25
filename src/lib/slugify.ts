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
