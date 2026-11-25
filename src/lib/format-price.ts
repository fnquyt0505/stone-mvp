const MILLION = 1_000_000;
const BILLION = 1_000_000_000;

const decimal = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });

/** Formats a VND amount compactly: 20_000_000 -> "20 triệu", 1_500_000_000 -> "1,5 tỷ". */
export function formatVndShort(amount: number): string {
  if (amount >= BILLION) return `${decimal.format(amount / BILLION)} tỷ`;
  if (amount >= MILLION) return `${decimal.format(amount / MILLION)} triệu`;
  return `${new Intl.NumberFormat("vi-VN").format(amount)} đ`;
}

function splitUnit(text: string): [value: string, unit: string] {
  const i = text.lastIndexOf(" ");
  return [text.slice(0, i), text.slice(i + 1)];
}

/**
 * Human-readable reference price range for category pages, e.g.
 * "20 – 50 triệu", "300 triệu – 1,5 tỷ", "Từ 20 triệu". "Liên hệ" when unset.
 */
export function formatPriceRange(from?: number | null, to?: number | null): string {
  const hasFrom = typeof from === "number" && from > 0;
  const hasTo = typeof to === "number" && to > 0;

  if (hasFrom && hasTo) {
    const [low, high] = from <= to ? [from, to] : [to, from];
    if (low === high) return formatVndShort(low);
    const lowText = formatVndShort(low);
    const highText = formatVndShort(high);
    const [lowValue, lowUnit] = splitUnit(lowText);
    const [, highUnit] = splitUnit(highText);
    return lowUnit === highUnit ? `${lowValue} – ${highText}` : `${lowText} – ${highText}`;
  }
  if (hasFrom) return `Từ ${formatVndShort(from)}`;
  if (hasTo) return `Đến ${formatVndShort(to)}`;
  return "Liên hệ";
}
