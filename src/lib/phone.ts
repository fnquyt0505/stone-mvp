/** Keeps digits only; converts +84/84 prefix to a leading 0. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("84") && digits.length >= 11) return `0${digits.slice(2)}`;
  return digits;
}

/** "0900000000" -> "0900 000 000"; landlines "02XXXXXXXXX" -> "02X XXXX XXXX". */
export function formatPhone(raw: string): string {
  const p = normalizePhone(raw);
  if (p.length === 10) return `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}`;
  if (p.length === 11) return `${p.slice(0, 3)} ${p.slice(3, 7)} ${p.slice(7)}`;
  return p;
}

/** tel: link using the international form so it works from abroad too. */
export function telHref(raw: string): string {
  const p = normalizePhone(raw);
  return p.startsWith("0") ? `tel:+84${p.slice(1)}` : `tel:${p}`;
}

/** Zalo chat link for a phone number registered with Zalo (local 0-prefixed form). */
export function zaloHref(raw: string): string {
  return `https://zalo.me/${normalizePhone(raw)}`;
}
