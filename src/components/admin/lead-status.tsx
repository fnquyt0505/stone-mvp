import type { LeadStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Mới",
  CONTACTED: "Đã liên hệ",
  QUOTED: "Đã báo giá",
  WON: "Chốt",
  LOST: "Hủy",
};

const STYLES: Record<LeadStatus, string> = {
  NEW: "bg-red-600 text-white",
  CONTACTED: "bg-gold-600 text-stone-900",
  QUOTED: "bg-jade-50 text-jade-700",
  WON: "bg-success text-white",
  LOST: "bg-stone-200 text-stone-700",
};

/** Colored badge with a text label (color is never the only signal). */
export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-small font-semibold whitespace-nowrap",
        STYLES[status],
      )}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
