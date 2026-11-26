import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ProjectFilter } from "@/schemas/project-filter";
import type { FilterOption } from "@/server/queries/projects";

const SELECT =
  "h-12 w-full rounded-md border border-stone-500 bg-white px-3 text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600";

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
