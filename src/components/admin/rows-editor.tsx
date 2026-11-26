"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INPUT, TEXTAREA } from "./form-fields";

type Column<K extends string> = { key: K; label: string; multiline?: boolean; max: number };

/**
 * Editable list of small records (specs label/value, FAQ question/answer) with
 * add / remove / move up / move down. Serialized as JSON into `name`.
 */
export function RowsEditor<K extends string>({
  name,
  columns,
  rows,
  onChange,
  itemLabel,
  addLabel,
  error,
}: {
  name: string;
  columns: Column<K>[];
  rows: Record<K, string>[];
  onChange: (rows: Record<K, string>[]) => void;
  itemLabel: string;
  addLabel: string;
  error?: string;
}) {
  const update = (index: number, key: K, value: string) =>
    onChange(rows.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [item] = next.splice(from, 1);
    if (item) next.splice(to, 0, item);
    onChange(next);
  };
  const empty = Object.fromEntries(columns.map((c) => [c.key, ""])) as Record<K, string>;

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={JSON.stringify(rows)} readOnly />
      {rows.length === 0 ? <p className="text-stone-700">Chưa có mục nào.</p> : null}
      <ol className="grid gap-3">
        {rows.map((row, index) => (
          <li key={index} className="grid gap-3 rounded-md border bg-stone-50 p-3">
            <p className="font-semibold">
              {itemLabel} {index + 1}
            </p>
            {columns.map((col) => {
              const id = `${name}-${index}-${col.key}`;
              return (
                <label key={col.key} htmlFor={id} className="grid gap-1">
                  <span className="text-small font-semibold">{col.label}</span>
                  {col.multiline ? (
                    <textarea
                      id={id}
                      rows={3}
                      maxLength={col.max}
                      value={row[col.key]}
                      className={TEXTAREA}
                      onChange={(e) => update(index, col.key, e.target.value)}
                    />
                  ) : (
                    <input
                      id={id}
                      maxLength={col.max}
                      value={row[col.key]}
                      className={INPUT}
                      onChange={(e) => update(index, col.key, e.target.value)}
                    />
                  )}
                </label>
              );
            })}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                aria-label={`Đưa ${itemLabel.toLowerCase()} ${index + 1} lên`}
              >
                <ArrowUp aria-hidden /> Lên
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={index === rows.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label={`Đưa ${itemLabel.toLowerCase()} ${index + 1} xuống`}
              >
                <ArrowDown aria-hidden /> Xuống
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
                aria-label={`Xóa ${itemLabel.toLowerCase()} ${index + 1}`}
              >
                <Trash2 aria-hidden /> Xóa
              </Button>
            </div>
          </li>
        ))}
      </ol>
      <Button
        type="button"
        variant="outline"
        className="justify-self-start"
        onClick={() => onChange([...rows, empty])}
      >
        <Plus aria-hidden /> {addLabel}
      </Button>
      {error ? <p className="font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
