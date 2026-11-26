import type { Metadata } from "next";
import Link from "next/link";
import { ListHeader, StatusPill } from "@/components/admin/admin-page-header";
import { requireStaff } from "@/server/auth-guard";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Banner" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminBannersPage({ searchParams }: Props) {
  await requireStaff();
  const deleted = (await searchParams)["da-xoa"] === "1";
  const items = await db.banner.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, subtitle: true, order: true, isActive: true },
  });
  const shownId = items.find((b) => b.isActive)?.id;

  return (
    <main className="grid gap-6">
      <ListHeader
        title="Banner"
        newHref="/admin/banners/new/"
        newLabel="Thêm banner"
        deletedText={deleted ? "Đã xóa banner." : null}
      />
      <ul className="grid gap-3" aria-label="Danh sách banner">
        {items.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4"
          >
            <div className="grid gap-1">
              <Link
                href={`/admin/banners/${b.id}/`}
                className="text-lg font-semibold text-jade-700 hover:underline"
              >
                {b.title}
              </Link>
              <p className="text-small-responsive text-stone-700">
                {[b.subtitle, `Thứ tự ${b.order}`].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {b.id === shownId ? (
                <StatusPill tone="info">Đang hiện trên website</StatusPill>
              ) : null}
              <StatusPill tone={b.isActive ? "on" : "off"}>
                {b.isActive ? "Đang bật" : "Đang tắt"}
              </StatusPill>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
