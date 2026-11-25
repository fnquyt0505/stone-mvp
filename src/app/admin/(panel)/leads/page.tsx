import type { Metadata } from "next";
import Link from "next/link";
import { Download, Phone } from "lucide-react";
import { LEAD_STATUS_LABELS, LeadStatusBadge } from "@/components/admin/lead-status";
import { Pagination } from "@/components/site/pagination";
import { Button } from "@/components/ui/button";
import { pageCount } from "@/lib/pagination";
import { formatPhone, telHref } from "@/lib/phone";
import { formatVnDateTime } from "@/lib/vn-time";
import { LEAD_STATUSES, leadFilterQuery, parseLeadFilter } from "@/schemas/admin-lead";
import { requireStaff } from "@/server/auth-guard";
import { ADMIN_LEADS_PAGE_SIZE, listAdminLeads } from "@/server/queries/admin-leads";

export const metadata: Metadata = { title: "Yêu cầu báo giá" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const INPUT = "h-11 w-full rounded-md border border-stone-500 bg-white px-3";

export default async function AdminLeadsPage({ searchParams }: Props) {
  await requireStaff();
  const filter = parseLeadFilter(await searchParams);
  const { total, items } = await listAdminLeads(filter);
  const pages = pageCount(total, ADMIN_LEADS_PAGE_SIZE);
  const exportHref = `/admin/leads/export/${leadFilterQuery({ ...filter, page: 1 })}`;

  return (
    <main className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1>Yêu cầu báo giá</h1>
        <Button asChild variant="outline">
          <a href={exportHref} download>
            <Download aria-hidden />
            Xuất CSV
          </a>
        </Button>
      </div>

      <form
        method="get"
        aria-label="Lọc yêu cầu"
        className="grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.5fr_auto] lg:items-end"
      >
        <label className="grid gap-1">
          <span className="font-semibold">Trạng thái</span>
          <select name="trang-thai" defaultValue={filter.status ?? ""} className={INPUT}>
            <option value="">Tất cả</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="font-semibold">Từ ngày</span>
          <input type="date" name="tu-ngay" defaultValue={filter.from} className={INPUT} />
        </label>
        <label className="grid gap-1">
          <span className="font-semibold">Đến ngày</span>
          <input type="date" name="den-ngay" defaultValue={filter.to} className={INPUT} />
        </label>
        <label className="grid gap-1">
          <span className="font-semibold">Tìm tên hoặc SĐT</span>
          <input type="search" name="q" defaultValue={filter.q} maxLength={50} className={INPUT} />
        </label>
        <div className="flex gap-2">
          <Button type="submit">Lọc</Button>
          <Button asChild variant="ghost">
            <Link href="/admin/leads/">Xóa lọc</Link>
          </Button>
        </div>
      </form>

      <p role="status" className="text-stone-700">
        {total ? `${total} yêu cầu` : "Không có yêu cầu phù hợp."}
      </p>

      {items.length ? (
        <ul className="grid gap-3">
          {items.map((l) => (
            <li
              key={l.id}
              className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  <Link
                    href={`/admin/leads/${l.id}/`}
                    className="text-lg text-jade-700 hover:underline"
                  >
                    {l.name}
                  </Link>
                  <LeadStatusBadge status={l.status} />
                </p>
                <p className="text-small-responsive text-stone-700">
                  {[formatVnDateTime(l.createdAt), l.category?.name, l.province]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {l.message ? <p className="mt-1 line-clamp-2 text-stone-900">{l.message}</p> : null}
                {l.note ? (
                  <p className="mt-1 line-clamp-1 text-small-responsive text-stone-700">
                    Ghi chú: {l.note}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={telHref(l.phone)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-red-600 px-4 font-semibold text-white hover:bg-red-600/90"
                >
                  <Phone aria-hidden className="size-4" />
                  {formatPhone(l.phone)}
                </a>
                <Button asChild variant="outline">
                  <Link href={`/admin/leads/${l.id}/`} aria-label={`Xử lý yêu cầu của ${l.name}`}>
                    Xử lý
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <Pagination
        page={Math.min(filter.page, pages)}
        pages={pages}
        hrefFor={(page) => `/admin/leads/${leadFilterQuery({ ...filter, page })}`}
      />
    </main>
  );
}
