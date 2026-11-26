"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listPickerImages, type PickerImage } from "@/server/actions/image-picker";
import { ImageUploader } from "./image-uploader";

/**
 * Choose an image from the library (or upload new ones). With `onPickMany`,
 * every uploaded image is returned and the dialog stays open for more picks.
 */
export function ImagePickerDialog({
  open,
  onOpenChange,
  onPick,
  onPickMany,
  title = "Chèn ảnh",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick?: (image: PickerImage) => void;
  onPickMany?: (images: PickerImage[]) => void;
  title?: string;
}) {
  const pick = (imgs: PickerImage[]) => {
    if (onPickMany) onPickMany(imgs);
    else if (imgs[0]) onPick?.(imgs[0]);
  };
  const [images, setImages] = useState<PickerImage[]>([]);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(
      () => startTransition(async () => setImages(await listPickerImages(query))),
      250,
    );
    return () => clearTimeout(t);
  }, [open, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-10 text-xl leading-snug">{title}</DialogTitle>
          <DialogDescription>Chọn ảnh có sẵn hoặc tải ảnh mới lên.</DialogDescription>
        </DialogHeader>

        <details className="rounded-lg border p-3">
          <summary className="cursor-pointer font-semibold">Tải ảnh mới</summary>
          <div className="mt-3">
            <ImageUploader onUploaded={(saved) => pick(saved)} />
          </div>
        </details>

        <label className="grid gap-1">
          <span className="font-semibold">Tìm theo mô tả</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 rounded-md border border-stone-500 px-3"
          />
        </label>

        <ul aria-busy={pending} className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => pick([img])}
                className="grid w-full gap-1 rounded-md border bg-white p-1 text-left hover:border-jade-700"
              >
                <span className="relative block aspect-square overflow-hidden rounded bg-stone-200">
                  <Image src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" />
                </span>
                <span className="line-clamp-2 px-1 text-small">{img.alt}</span>
              </button>
            </li>
          ))}
        </ul>
        {!pending && images.length === 0 ? (
          <p className="text-stone-700">Không có ảnh phù hợp.</p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
