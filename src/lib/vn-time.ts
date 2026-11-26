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

/** "2026-11-26" -> start of that day in Vietnam (UTC Date); null when invalid. */
export function vnDateStart(isoDate: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) return null;
  const utc = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(utc - VN_OFFSET_MS);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "2026-11-26" -> start of the following day in Vietnam (exclusive end). */
export function vnDateEnd(isoDate: string): Date | null {
  const start = vnDateStart(isoDate);
  return start ? new Date(start.getTime() + DAY_MS) : null;
}

/** "2026-11-27T09:30" typed in Vietnam time -> UTC Date; null when empty/invalid. */
export function vnLocalInputToDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const utc = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
  return new Date(utc - VN_OFFSET_MS);
}

/** UTC Date -> "YYYY-MM-DDTHH:mm" in Vietnam time, for <input type="datetime-local">. */
export function dateToVnLocalInput(date: Date | string | null): string {
  if (!date) return "";
  const vn = new Date(new Date(date).getTime() + VN_OFFSET_MS);
  return vn.toISOString().slice(0, 16);
}
