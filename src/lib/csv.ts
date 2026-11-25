/**
 * Minimal RFC 4180 CSV writer. Cells that a spreadsheet would treat as a
 * formula (= + - @ tab CR) are prefixed with a quote to block CSV injection.
 */
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** CSV document with a UTF-8 BOM so Excel shows Vietnamese correctly. */
export function toCsv(header: string[], rows: unknown[][]): string {
  const lines = [header, ...rows].map((r) => r.map(csvCell).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}
