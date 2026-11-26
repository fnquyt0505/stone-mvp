import type { Metadata } from "next";
import Link from "next/link";
import { ListHeader, StatusPill } from "@/components/admin/admin-page-header";
import { formatVnDateTime } from "@/lib/vn-time";
import { requireStaff } from "@/server/auth-guard";
import { listAdminPosts } from "@/server/queries/admin-content";

export const metadata: Metadata = { title: "Bài viết" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminPostsPage({ searchParams }: Props) {
  await requireStaff();
  const deleted = (await searchParams)["da-xoa"] === "1";
  const posts = await listAdminPosts();
  const now = Date.now();

  return (
    <main className="grid gap-6">
      <ListHeader
        title="Bài viết"
        newHref="/admin/posts/new/"
        newLabel="Viết bài mới"
        deletedText={deleted ? "Đã xóa bài viết." : null}
      />
      {posts.length ? (
        <ul className="grid gap-3" aria-label="Danh sách bài viết">
          {posts.map((p) => {
            const status = !p.publishedAt
              ? { tone: "off" as const, text: "Nháp" }
              : p.publishedAt.getTime() > now
                ? { tone: "info" as const, text: `Hẹn đăng ${formatVnDateTime(p.publishedAt)}` }
                : { tone: "on" as const, text: "Đã đăng" };
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4"
              >
                <div className="grid gap-1">
                  <Link
                    href={`/admin/posts/${p.id}/`}
                    className="text-lg font-semibold text-jade-700 hover:underline"
                  >
                    {p.title}
                  </Link>
                  <p className="text-small-responsive text-stone-700">
                    {[
                      p.author.name,
                      p.publishedAt && p.publishedAt.getTime() <= now
                        ? formatVnDateTime(p.publishedAt)
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <StatusPill tone={status.tone}>{status.text}</StatusPill>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-stone-700">Chưa có bài viết nào.</p>
      )}
    </main>
  );
}
