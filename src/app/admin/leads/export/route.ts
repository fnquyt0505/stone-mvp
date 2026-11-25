import { toCsv } from "@/lib/csv";
import { formatPhone } from "@/lib/phone";
import { absoluteUrl } from "@/lib/site-url";
import { formatVnDateTime } from "@/lib/vn-time";
import { LEAD_STATUS_LABELS } from "@/components/admin/lead-status";
import { parseLeadFilter } from "@/schemas/admin-lead";
import { requireStaff } from "@/server/auth-guard";
import { exportAdminLeads } from "@/server/queries/admin-leads";

export const dynamic = "force-dynamic";

/** CSV export of leads matching the current filters. Staff only. */
export async function GET(request: Request) {
  await requireStaff();
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const leads = await exportAdminLeads(parseLeadFilter(params));

  const csv = toCsv(
    [
      "Thời gian",
      "Họ tên",
      "Số điện thoại",
      "Tỉnh/thành",
      "Loại sản phẩm",
      "Yêu cầu",
      "Trạng thái",
      "Ghi chú",
      "Trang gửi",
      "UTM",
    ],
    leads.map((l) => [
      formatVnDateTime(l.createdAt),
      l.name,
      // Spaced format keeps the leading zero when opened in Excel.
      formatPhone(l.phone),
      l.province,
      l.category?.name,
      l.message,
      LEAD_STATUS_LABELS[l.status],
      l.note,
      absoluteUrl(l.sourceUrl),
      l.utm ? JSON.stringify(l.utm) : "",
    ]),
  );

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="yeu-cau-bao-gia-${stamp}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
