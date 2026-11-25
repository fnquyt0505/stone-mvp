import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { LeadStatusBadge } from "@/components/admin/lead-status";
import { formatPhone, telHref, zaloHref } from "@/lib/phone";
import { formatVnDateTime } from "@/lib/vn-time";
import { requireStaff } from "@/server/auth-guard";
import { getAdminLead } from "@/server/queries/admin-leads";
import { LeadEditForm } from "./lead-edit-form";

export const metadata: Metadata = { title: "Chi tiết yêu cầu" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminLeadPage({ params }: Props) {
  await requireStaff();
  const lead = await getAdminLead((await params).id);
  if (!lead) notFound();

  const utm =
    lead.utm && typeof lead.utm === "object" && !Array.isArray(lead.utm)
      ? Object.entries(lead.utm as Record<string, unknown>).map(([k, v]) => `${k}=${String(v)}`)
      : [];
  const rows: [string, React.ReactNode][] = [
    ["Thời gian", formatVnDateTime(lead.createdAt)],
    ["Tỉnh / thành", lead.province ?? "—"],
    ["Loại sản phẩm", lead.category?.name ?? "—"],
    [
      "Yêu cầu của khách",
      lead.message ? <span className="whitespace-pre-line">{lead.message}</span> : "—",
    ],
    [
      "Trang gửi",
      <a
        key="src"
        href={lead.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-jade-700 underline"
      >
        {lead.sourceUrl}
      </a>,
    ],
    ["UTM", utm.length ? utm.join(", ") : "—"],
  ];

  return (
    <main className="grid max-w-3xl gap-6">
      <Link
        href="/admin/leads/"
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-jade-700 hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Danh sách yêu cầu
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1>{lead.name}</h1>
        <LeadStatusBadge status={lead.status} />
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={telHref(lead.phone)}
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-red-600 px-5 text-lg font-semibold text-white hover:bg-red-600/90"
        >
          <Phone aria-hidden className="size-5" />
          Gọi {formatPhone(lead.phone)}
        </a>
        <a
          href={zaloHref(lead.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-zalo px-5 text-lg font-semibold text-white hover:bg-zalo/90"
        >
          <MessageCircle aria-hidden className="size-5" />
          Nhắn Zalo
        </a>
      </div>

      <dl className="grid gap-3 rounded-lg border bg-white p-5 sm:grid-cols-[10rem_1fr]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-semibold text-stone-700">{label}</dt>
            <dd className="text-stone-900">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="lead-update" className="rounded-lg border bg-white p-5">
        <h2 id="lead-update" className="mb-4 text-h3 md:text-h3">
          Cập nhật xử lý
        </h2>
        <LeadEditForm id={lead.id} status={lead.status} note={lead.note} />
      </section>
    </main>
  );
}
