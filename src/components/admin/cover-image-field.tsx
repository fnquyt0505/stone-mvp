"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PickerImage } from "@/server/actions/image-picker";
import { ImagePickerDialog } from "./image-picker-dialog";

/** Single image field (cover). Value posted as the image id in `name`. */
export function CoverImageField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: PickerImage | null;
}) {
  const [image, setImage] = useState<PickerImage | null>(defaultValue);
  const [open, setOpen] = useState(false);
  return (
    <div className="grid gap-2">
      <span className="font-semibold">{label}</span>
      <input type="hidden" name={name} value={image?.id ?? ""} readOnly />
      {image ? (
        <div className="relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-md border bg-stone-200">
          <Image src={image.url} alt={image.alt} fill sizes="320px" className="object-cover" />
        </div>
      ) : (
        <p className="text-stone-700">Chưa chọn ảnh.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          <ImagePlus aria-hidden /> {image ? "Đổi ảnh bìa" : "Chọn ảnh bìa"}
        </Button>
        {image ? (
          <Button
            type="button"
            variant="ghost"
            className="text-red-600"
            onClick={() => setImage(null)}
          >
            <X aria-hidden /> Bỏ ảnh bìa
          </Button>
        ) : null}
      </div>
      <ImagePickerDialog
        open={open}
        onOpenChange={setOpen}
        title="Chọn ảnh bìa"
        onPick={(img) => {
          setImage(img);
          setOpen(false);
        }}
      />
    </div>
  );
}
