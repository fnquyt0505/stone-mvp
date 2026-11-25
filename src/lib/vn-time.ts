/** Vietnam has no DST: always UTC+7. */
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Start of the current day in Vietnam (as a UTC Date). */
export function startOfVnDay(now: Date = new Date()): Date {
  const vn = new Date(now.getTime() + VN_OFFSET_MS);
  const midnightVn = Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate());
  return new Date(midnightVn - VN_OFFSET_MS);
}

/** Start of the Vietnam day `days` days ago (0 = today). */
export function vnDaysAgo(days: number, now: Date = new Date()): Date {
  return new Date(startOfVnDay(now).getTime() - days * DAY_MS);
}

export function formatVnDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
