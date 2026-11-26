import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ListHeader } from "@/components/admin/admin-page-header";
import { formatVnDateTime } from "@/lib/vn-time";
import { requireStaff } from "@/server/auth-guard";
import { listAdminPages } from "@/server/queries/admin-content";

export const metadata: Metadata = { title: "Trang tĩnh" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminPagesPage({ searchParams }: Props) {
  await requireStaff();
  const deleted = (await searchParams)["da-xoa"] === "1";
  const pages = await listAdminPages();

  return (
    <main className="grid gap-6">
      <ListHeader
        title="Trang tĩnh"
        newHref="/admin/pages/new/"
        newLabel="Thêm trang"
        deletedText={deleted ? "Đã xóa trang." : null}
      />
      <ul className="grid gap-3" aria-label="Danh sách trang">
        {pages.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4"
          >
            <div className="grid gap-1">
              <Link
                href={`/admin/pages/${p.id}/`}
                className="text-lg font-semibold text-jade-700 hover:underline"
              >
                {p.title}
              </Link>
              <p className="text-small-responsive text-stone-700">
                Cập nhật {formatVnDateTime(p.updatedAt)}
              </p>
            </div>
            <a
              href={`/${p.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 text-stone-700 hover:text-jade-700"
            >
              /{p.slug}/ <ExternalLink aria-hidden className="size-4" />
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
