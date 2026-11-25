import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { LeadStatusBadge } from "@/components/admin/lead-status";
import { formatPhone, telHref } from "@/lib/phone";
import { formatVnDateTime } from "@/lib/vn-time";
import { requireStaff } from "@/server/auth-guard";
import { getDashboardStats } from "@/server/queries/admin-stats";

export const metadata: Metadata = { title: "Tổng quan" };

function Stat({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href} className="rounded-lg border bg-white p-5 shadow-sm hover:border-jade-700">
      <p className="text-stone-700">{label}</p>
      <p
        className={`mt-1 font-heading text-h1 font-bold ${highlight ? "text-red-600" : "text-stone-900"}`}
      >
        {value}
      </p>
    </Link>
  );
}

export default async function AdminHomePage() {
  const session = await requireStaff();
  const stats = await getDashboardStats();

  return (
    <main className="grid gap-8">
      <div>
        <h1>Xin chào, {session.user.name ?? "bạn"}</h1>
        <p className="mt-1 text-stone-700">Tổng quan yêu cầu báo giá và nội dung website.</p>
      </div>

      <section aria-labelledby="stats-leads">
        <h2 id="stats-leads" className="mb-4 text-h3 md:text-h3">
          Yêu cầu báo giá
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            label="Mới hôm nay"
            value={stats.leads.today}
            href="/admin/leads/"
            highlight={stats.leads.today > 0}
          />
          <Stat label="7 ngày qua" value={stats.leads.week} href="/admin/leads/" />
          <Stat
            label="Chưa xử lý (Mới)"
            value={stats.leads.new}
            href="/admin/leads/?trang-thai=NEW"
            highlight={stats.leads.new > 0}
          />
        </div>
      </section>

      <section aria-labelledby="recent-leads" className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="recent-leads" className="text-h3 md:text-h3">
            Yêu cầu gần nhất
          </h2>
          <Link
            href="/admin/leads/"
            className="inline-flex min-h-11 items-center gap-1 font-semibold text-jade-700 hover:underline"
          >
            Xem tất cả <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        {stats.recentLeads.length ? (
          <ul className="divide-y">
            {stats.recentLeads.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">
                    {l.name} <LeadStatusBadge status={l.status} />
                  </p>
                  <p className="text-small-responsive text-stone-700">
                    {[l.category?.name, l.province, formatVnDateTime(l.createdAt)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <a
                  href={telHref(l.phone)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-red-600 px-4 font-semibold text-white hover:bg-red-600/90"
                >
                  <Phone aria-hidden className="size-4" />
                  {formatPhone(l.phone)}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-700">Chưa có yêu cầu nào.</p>
        )}
      </section>

      <section aria-labelledby="stats-content">
        <h2 id="stats-content" className="mb-4 text-h3 md:text-h3">
          Nội dung đang hiển thị
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Danh mục" value={stats.content.categories} href="/admin/categories/" />
          <Stat label="Công trình" value={stats.content.projects} href="/admin/projects/" />
          <Stat label="Bài viết" value={stats.content.posts} href="/admin/posts/" />
          <Stat label="Đánh giá" value={stats.content.testimonials} href="/admin/testimonials/" />
        </div>
      </section>
    </main>
  );
}
