import type { Metadata } from "next";
import Link from "next/link";
import { ListHeader, StatusPill } from "@/components/admin/admin-page-header";
import { requireStaff } from "@/server/auth-guard";
import { listAdminProjects } from "@/server/queries/admin-content";

export const metadata: Metadata = { title: "Công trình" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminProjectsPage({ searchParams }: Props) {
  await requireStaff();
  const deleted = (await searchParams)["da-xoa"] === "1";
  const projects = await listAdminProjects();

  return (
    <main className="grid gap-6">
      <ListHeader
        title="Công trình"
        newHref="/admin/projects/new/"
        newLabel="Thêm công trình"
        deletedText={deleted ? "Đã xóa công trình." : null}
      />
      {projects.length ? (
        <ul className="grid gap-3" aria-label="Danh sách công trình">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4"
            >
              <div className="grid gap-1">
                <Link
                  href={`/admin/projects/${p.id}/`}
                  className="text-lg font-semibold text-jade-700 hover:underline"
                >
                  {p.title}
                </Link>
                <p className="text-small-responsive text-stone-700">
                  {[
                    p.province,
                    p.category?.name,
                    p.completedAt ? `Hoàn thành ${new Date(p.completedAt).getUTCFullYear()}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.isFeatured ? <StatusPill tone="info">Tiêu biểu</StatusPill> : null}
                <StatusPill tone={p.isPublished ? "on" : "off"}>
                  {p.isPublished ? "Đang hiện" : "Đang ẩn"}
                </StatusPill>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-stone-700">Chưa có công trình nào.</p>
      )}
    </main>
  );
}
