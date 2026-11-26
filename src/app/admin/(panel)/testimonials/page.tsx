import type { Metadata } from "next";
import Link from "next/link";
import { ListHeader, StatusPill } from "@/components/admin/admin-page-header";
import { requireStaff } from "@/server/auth-guard";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Đánh giá" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminTestimonialsPage({ searchParams }: Props) {
  await requireStaff();
  const deleted = (await searchParams)["da-xoa"] === "1";
  const items = await db.testimonial.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      province: true,
      content: true,
      rating: true,
      order: true,
      isPublished: true,
    },
  });

  return (
    <main className="grid gap-6">
      <ListHeader
        title="Đánh giá"
        newHref="/admin/testimonials/new/"
        newLabel="Thêm đánh giá"
        deletedText={deleted ? "Đã xóa đánh giá." : null}
      />
      <p className="text-stone-700">Trang chủ hiện 3 đánh giá đang hiện có thứ tự nhỏ nhất.</p>
      <ul className="grid gap-3" aria-label="Danh sách đánh giá">
        {items.map((t) => (
          <li
            key={t.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-white p-4"
          >
            <div className="grid max-w-2xl gap-1">
              <Link
                href={`/admin/testimonials/${t.id}/`}
                className="text-lg font-semibold text-jade-700 hover:underline"
              >
                {t.name}
              </Link>
              <p className="text-small-responsive text-stone-700">
                {[t.province, t.rating ? `${t.rating} sao` : null, `Thứ tự ${t.order}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="line-clamp-2">{t.content}</p>
            </div>
            <StatusPill tone={t.isPublished ? "on" : "off"}>
              {t.isPublished ? "Đang hiện" : "Đang ẩn"}
            </StatusPill>
          </li>
        ))}
      </ul>
    </main>
  );
}
