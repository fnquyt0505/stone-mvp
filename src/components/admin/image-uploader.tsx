"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGES_PER_BATCH,
  validateImageFile,
  type SavedImage,
} from "@/schemas/image";
import { saveImages } from "@/server/actions/images";
import { getUploadTarget, uploadFile } from "./upload-client";

type Item = { key: string; file: File; preview: string; alt: string; error?: string };

/**
 * Drag-and-drop multi-image uploader. Every image needs a meaningful Vietnamese
 * description (alt) before it can be uploaded (docs/DESIGN.md §6).
 */
export function ImageUploader({ onUploaded }: { onUploaded?: (images: SavedImage[]) => void }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const previews = useRef<string[]>([]);

  useEffect(() => () => previews.current.forEach((u) => URL.revokeObjectURL(u)), []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setMessage(null);
    const next: Item[] = [];
    for (const file of Array.from(list)) {
      const error = validateImageFile(file) ?? undefined;
      const preview = URL.createObjectURL(file);
      previews.current.push(preview);
      next.push({
        key: `${file.name}-${file.size}-${Math.random()}`,
        file,
        preview,
        alt: "",
        error,
      });
    }
    setItems((cur) => [...cur, ...next].slice(0, MAX_IMAGES_PER_BATCH));
  }

  const valid = items.filter((i) => !i.error);
  const ready = valid.length > 0 && valid.every((i) => i.alt.trim().length >= 3);

  async function upload() {
    setBusy(true);
    setMessage(null);
    try {
      const target = await getUploadTarget();
      const records = [];
      for (const item of valid)
        records.push({ ...(await uploadFile(target, item.file)), alt: item.alt.trim() });
      const result = await saveImages(records);
      if (!result.ok) throw new Error(result.message);
      setItems([]);
      setMessage({ kind: "ok", text: `Đã tải lên ${result.images.length} ảnh.` });
      onUploaded?.(result.images);
      router.refresh();
    } catch (error) {
      setMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "Tải ảnh thất bại.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stone-500 bg-white p-6 text-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-600",
          dragging && "border-jade-700 bg-jade-50",
        )}
      >
        <ImagePlus aria-hidden className="size-8 text-jade-700" />
        <span className="font-semibold">Kéo thả ảnh vào đây hoặc bấm để chọn</span>
        <span className="text-small-responsive text-stone-700">
          JPG, PNG, WebP, AVIF · tối đa 10 MB/ảnh · {MAX_IMAGES_PER_BATCH} ảnh/lần
        </span>
        <input
          type="file"
          multiple
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="sr-only"
          aria-label="Chọn ảnh"
          disabled={busy}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {items.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Ảnh chờ tải lên">
          {items.map((item, index) => (
            <li key={item.key} className="grid gap-2 rounded-lg border bg-white p-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-stone-200">
                <Image
                  src={item.preview}
                  alt=""
                  fill
                  unoptimized
                  sizes="300px"
                  className="object-cover"
                />
              </div>
              {item.error ? (
                <p className="font-semibold text-red-600">
                  {item.file.name}: {item.error}
                </p>
              ) : (
                <label className="grid gap-1">
                  <span className="text-small font-semibold">Mô tả ảnh {index + 1} (bắt buộc)</span>
                  <input
                    value={item.alt}
                    maxLength={200}
                    placeholder="VD: Mộ đá đôi xanh rêu tại Ninh Bình"
                    onChange={(e) =>
                      setItems((cur) =>
                        cur.map((i) => (i.key === item.key ? { ...i, alt: e.target.value } : i)),
                      )
                    }
                    className="h-11 rounded-md border border-stone-500 px-3"
                  />
                </label>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => setItems((cur) => cur.filter((i) => i.key !== item.key))}
              >
                <Trash2 aria-hidden /> Bỏ ảnh này
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="button" size="lg" disabled={!ready || busy} onClick={upload}>
          {busy ? <Loader2 aria-hidden className="animate-spin" /> : <Upload aria-hidden />}
          {busy ? "Đang tải lên…" : `Tải lên ${valid.length || ""} ảnh`}
        </Button>
        {items.length && !ready && !busy ? (
          <p className="text-stone-700">Nhập mô tả (ít nhất 3 ký tự) cho mọi ảnh để tải lên.</p>
        ) : null}
        <p
          role="status"
          className={
            message?.kind === "error" ? "font-semibold text-red-600" : "font-semibold text-success"
          }
        >
          {message?.text}
        </p>
      </div>
    </div>
  );
}
