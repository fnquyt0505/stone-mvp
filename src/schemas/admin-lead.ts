import { z } from "zod";

export const LEAD_STATUSES = ["NEW", "CONTACTED", "QUOTED", "WON", "LOST"] as const;
export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);

/** Query string of /admin/leads/ (and the CSV export). Invalid values are ignored. */
export const leadFilterSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional().catch(undefined),
  from: isoDate,
  to: isoDate,
  q: z
    .string()
    .trim()
    .max(50)
    .optional()
    .catch(undefined)
    .transform((v) => (v ? v : undefined)),
  page: z.coerce.number().int().min(1).max(10_000).catch(1).default(1),
});

export type LeadFilter = z.infer<typeof leadFilterSchema>;

type Raw = Record<string, string | string[] | undefined>;

export function parseLeadFilter(params: Raw): LeadFilter {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
  return leadFilterSchema.parse({
    status: first(params["trang-thai"]),
    from: first(params["tu-ngay"]),
    to: first(params["den-ngay"]),
    q: first(params.q),
    page: first(params.trang),
  });
}

export function leadFilterQuery(filter: Partial<LeadFilter>): string {
  const qs = new URLSearchParams();
  if (filter.status) qs.set("trang-thai", filter.status);
  if (filter.from) qs.set("tu-ngay", filter.from);
  if (filter.to) qs.set("den-ngay", filter.to);
  if (filter.q) qs.set("q", filter.q);
  if (filter.page && filter.page > 1) qs.set("trang", String(filter.page));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export const leadUpdateSchema = z.object({
  id: z.string().regex(/^[a-z0-9]{20,40}$/),
  status: z.enum(LEAD_STATUSES, { errorMap: () => ({ message: "Trạng thái không hợp lệ." }) }),
  note: z
    .string()
    .trim()
    .max(2000, "Ghi chú tối đa 2000 ký tự.")
    .optional()
    .transform((v) => (v ? v : null)),
});

export type LeadUpdateState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };
