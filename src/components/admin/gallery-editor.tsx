"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, GripVertical, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PickerImage } from "@/server/actions/image-picker";
import { INPUT } from "./form-fields";
import { ImagePickerDialog } from "./image-picker-dialog";

export type GalleryRow = { image: PickerImage; caption: string };

/**
 * Ordered gallery: drag-and-drop to reorder (mouse/touch) with Lên/Xuống
 * buttons as the keyboard-accessible alternative. Serialized into `name`.
 */
export function GalleryEditor({
  name,
  rows,
  onChange,
  error,
}: {
  name: string;
  rows: GalleryRow[];
  onChange: (rows: GalleryRow[]) => void;
  error?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [item] = next.splice(from, 1);
    if (item) next.splice(to, 0, item);
    onChange(next);
  };
  const add = (images: PickerImage[]) => {
    const existing = new Set(rows.map((r) => r.image.id));
    onChange([
      ...rows,
      ...images.filter((i) => !existing.has(i.id)).map((image) => ({ image, caption: "" })),
    ]);
  };
  const payload = rows.map((r) => ({ imageId: r.image.id, caption: r.caption }));

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={JSON.stringify(payload)} readOnly />
      <p className="text-stone-700">
        {rows.length
          ? `${rows.length} ảnh. Kéo thả hoặc dùng nút Lên/Xuống để sắp xếp.`
          : "Chưa có ảnh nào."}
      </p>
      <ol
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="Ảnh trong thư viện danh mục"
      >
        {rows.map((row, index) => (
          <li
            key={row.image.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, index);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={cn(
              "grid gap-2 rounded-md border bg-white p-2",
              dragIndex === index && "opacity-50",
            )}
          >
            <div className="flex items-center gap-2">
              <GripVertical aria-hidden className="size-5 shrink-0 cursor-grab text-stone-500" />
              <span className="font-semibold">Ảnh {index + 1}</span>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded bg-stone-200">
              <Image
                src={row.image.url}
                alt={row.image.alt}
                fill
                sizes="300px"
                className="object-cover"
              />
            </div>
            <label className="grid gap-1">
              <span className="text-small font-semibold">Chú thích ảnh {index + 1}</span>
              <input
                value={row.caption}
                maxLength={200}
                className={INPUT}
                onChange={(e) =>
                  onChange(
                    rows.map((r, i) => (i === index ? { ...r, caption: e.target.value } : r)),
                  )
                }
              />
            </label>
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                aria-label={`Đưa ảnh ${index + 1} lên`}
              >
                <ArrowUp aria-hidden />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={index === rows.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label={`Đưa ảnh ${index + 1} xuống`}
              >
                <ArrowDown aria-hidden />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
                aria-label={`Bỏ ảnh ${index + 1}`}
              >
                <Trash2 aria-hidden /> Bỏ
              </Button>
            </div>
          </li>
        ))}
      </ol>
      <Button
        type="button"
        variant="outline"
        className="justify-self-start"
        onClick={() => setPickerOpen(true)}
      >
        <ImagePlus aria-hidden /> Thêm ảnh
      </Button>
      {error ? <p className="font-semibold text-red-600">{error}</p> : null}
      <ImagePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPickMany={add}
        title="Thêm ảnh vào thư viện"
      />
    </div>
  );
}
