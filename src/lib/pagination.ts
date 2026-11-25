/** Reads a 1-based ?trang= value; anything invalid becomes 1. */
export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 1000 ? n : 1;
}

/** Number of pages for a result set (at least 1). */
export function pageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
