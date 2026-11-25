import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { projectListHref, type ProjectFilter } from "@/schemas/project-filter";
import type { FilterOption } from "@/server/queries/projects";

const SELECT =
  "h-12 w-full rounded-md border border-stone-500 bg-white px-3 text-base text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600";

/** Plain GET form so filtering works without JavaScript and URLs are shareable. */
export function ProjectFilterForm({
  filter,
  provinces,
  groups,
}: {
  filter: ProjectFilter;
  provinces: FilterOption[];
  groups: FilterOption[];
}) {
  const active = Boolean(filter.tinh || filter.loai);
  return (
    <form
      action="/cong-trinh/"
      method="get"
      aria-label="Lọc công trình"
      className="grid gap-4 rounded-lg border bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end md:p-5"
    >
      <label className="grid gap-1.5">
        <span className="font-semibold">Tỉnh / thành</span>
        <select name="tinh" defaultValue={filter.tinh ?? ""} className={SELECT}>
          <option value="">Tất cả tỉnh thành</option>
          {provinces.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5">
        <span className="font-semibold">Loại công trình</span>
        <select name="loai" defaultValue={filter.loai ?? ""} className={SELECT}>
          <option value="">Tất cả loại</option>
          {groups.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-3">
        <Button type="submit" size="lg" className="flex-1 sm:flex-none">
          Lọc
        </Button>
        {active ? (
          <Button asChild variant="outline" size="lg">
            <Link href="/cong-trinh/">Xóa lọc</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}

const PAGE_LINK =
  "inline-flex size-12 items-center justify-center rounded-md border font-semibold hover:border-jade-700 hover:text-jade-700";

export function Pagination({
  filter,
  page,
  pages,
}: {
  filter: ProjectFilter;
  page: number;
  pages: number;
}) {
  if (pages <= 1) return null;
  const href = (trang: number) => projectListHref({ ...filter, trang });
  return (
    <nav aria-label="Phân trang" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={PAGE_LINK} aria-label="Trang trước" rel="prev">
          <ChevronLeft aria-hidden className="size-5" />
        </Link>
      ) : null}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          aria-label={`Trang ${n}`}
          className={cn(
            PAGE_LINK,
            n === page && "border-jade-700 bg-jade-700 text-white hover:text-white",
          )}
        >
          {n}
        </Link>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} className={PAGE_LINK} aria-label="Trang sau" rel="next">
          <ChevronRight aria-hidden className="size-5" />
        </Link>
      ) : null}
    </nav>
  );
}
