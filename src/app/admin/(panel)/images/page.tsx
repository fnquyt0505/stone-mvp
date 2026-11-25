import type { Metadata } from "next";
import Image from "next/image";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Pagination } from "@/components/site/pagination";
import { pageCount, parsePageParam } from "@/lib/pagination";
import { requireStaff } from "@/server/auth-guard";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Thư viện ảnh" };

const PAGE_SIZE = 48;
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminImagesPage({ searchParams }: Props) {
  await requireStaff();
  const page = parsePageParam((await searchParams).trang);
  const [total, images] = await Promise.all([
    db.image.count(),
    db.image.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, url: true, alt: true, width: true, height: true },
    }),
  ]);

  return (
    <main className="grid gap-8">
      <h1>Thư viện ảnh</h1>
      <section aria-labelledby="upload-heading" className="grid gap-4">
        <h2 id="upload-heading" className="text-h3 md:text-h3">
          Tải ảnh lên
        </h2>
        <ImageUploader />
      </section>
      <section aria-labelledby="images-heading" className="grid gap-4">
        <h2 id="images-heading" className="text-h3 md:text-h3">
          Ảnh đã có ({total})
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {images.map((img) => (
            <li key={img.id} className="overflow-hidden rounded-lg border bg-white">
              <div className="relative aspect-square bg-stone-200">
                <Image src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" />
              </div>
              <p className="line-clamp-2 p-2 text-small">{img.alt}</p>
              <p className="px-2 pb-2 text-small text-stone-700">
                {img.width}×{img.height}
              </p>
            </li>
          ))}
        </ul>
        <Pagination
          page={Math.min(page, pageCount(total, PAGE_SIZE))}
          pages={pageCount(total, PAGE_SIZE)}
          hrefFor={(n) => (n > 1 ? `/admin/images/?trang=${n}` : "/admin/images/")}
        />
      </section>
    </main>
  );
}
