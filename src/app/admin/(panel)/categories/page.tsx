import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPriceRange } from "@/lib/format-price";
import { requireStaff } from "@/server/auth-guard";
import { listAdminCategoryTree } from "@/server/queries/admin-categories";

export const metadata: Metadata = { title: "Danh mục" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function Status({ published }: { published: boolean }) {
  return published ? (
    <span className="rounded-md bg-success px-2 py-0.5 text-small font-semibold text-white">
      Đang hiện
    </span>
  ) : (
    <span className="rounded-md bg-stone-200 px-2 py-0.5 text-small font-semibold text-stone-700">
      Đang ẩn
    </span>
  );
}

export default async function AdminCategoriesPage({ searchParams }: Props) {
  await requireStaff();
  const deleted = (await searchParams)["da-xoa"] === "1";
  const groups = await listAdminCategoryTree();

  return (
    <main className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1>Danh mục</h1>
        <Button asChild size="lg">
          <Link href="/admin/categories/new/">
            <Plus aria-hidden /> Thêm danh mục
          </Link>
        </Button>
      </div>
      {deleted ? (
        <p role="status" className="rounded-md bg-success/10 p-3 font-semibold text-success">
          Đã xóa danh mục.
        </p>
      ) : null}

      <ul className="grid gap-4" aria-label="Cây danh mục">
        {groups.map((g) => (
          <li key={g.id} className="rounded-lg border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/categories/${g.id}/`}
                  className="font-heading text-lg font-semibold text-jade-700 hover:underline"
                >
                  {g.name}
                </Link>
                <Status published={g.isPublished} />
                <span className="text-small text-stone-700">Thứ tự {g.order}</span>
              </div>
              <a
                href={`/${g.slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 text-stone-700 hover:text-jade-700"
              >
                /{g.slug}/ <ExternalLink aria-hidden className="size-4" />
              </a>
            </div>
            {g.children.length ? (
              <ul className="divide-y">
                {g.children.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 pr-4 pl-8"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/categories/${c.id}/`}
                        className="font-semibold hover:text-jade-700 hover:underline"
                      >
                        {c.name}
                      </Link>
                      <Status published={c.isPublished} />
                    </div>
                    <span className="text-small text-stone-700">
                      {formatPriceRange(c.priceFrom, c.priceTo)} · {c._count.gallery} ảnh · Thứ tự{" "}
                      {c.order}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 pl-8 text-stone-700">Chưa có danh mục con.</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
