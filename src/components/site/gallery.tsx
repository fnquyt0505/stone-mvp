"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

export type GalleryItem = {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  caption: string | null;
};

/** 2/3/4-column lazy-loaded grid; clicking an image opens a captioned lightbox. */
export function Gallery({ items, title }: { items: GalleryItem[]; title: string }) {
  const [index, setIndex] = useState(-1);
  if (!items.length) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <li key={item.id}>
            <figure>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Xem ảnh lớn: ${item.alt}`}
                className="relative block aspect-square w-full overflow-hidden rounded-md bg-stone-200"
              >
                <Image
                  src={item.url}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform hover:scale-105"
                />
              </button>
              {item.caption ? (
                <figcaption className="mt-1 text-small-responsive text-stone-700">
                  {item.caption}
                </figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
      <Lightbox
        open={index >= 0}
        index={Math.max(index, 0)}
        close={() => setIndex(-1)}
        plugins={[Captions]}
        slides={items.map((item) => ({
          src: item.url,
          alt: item.alt,
          width: item.width,
          height: item.height,
          description: item.caption ?? undefined,
        }))}
        labels={{ Previous: "Ảnh trước", Next: "Ảnh sau", Close: "Đóng" }}
        aria-label={`Thư viện ảnh ${title}`}
      />
    </>
  );
}
