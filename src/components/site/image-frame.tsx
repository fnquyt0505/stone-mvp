import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardImage } from "@/server/queries/home";

/**
 * Fixed-ratio image box. Falls back to a neutral stone placeholder while no
 * real photo has been uploaded, so grids never shift.
 */
export function ImageFrame({
  image,
  ratio,
  sizes,
  priority = false,
  className,
}: {
  image: CardImage | null;
  /** Tailwind aspect class, e.g. "aspect-[4/3]". */
  ratio: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-stone-200", ratio, className)}>
      {image ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label="Ảnh minh họa đang được cập nhật"
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-stone-200 to-stone-50 text-stone-700"
        >
          <ImageIcon aria-hidden className="size-8 opacity-60" />
          <span className="text-small">Ảnh đang cập nhật</span>
        </div>
      )}
    </div>
  );
}
