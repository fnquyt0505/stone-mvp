import "server-only";
import type { Prisma } from "@prisma/client";
import { normalizePhone } from "@/lib/phone";
import { vnDateEnd, vnDateStart } from "@/lib/vn-time";
import type { LeadFilter } from "@/schemas/admin-lead";
import { db } from "@/server/db";

export const ADMIN_LEADS_PAGE_SIZE = 20;

export function leadWhere(filter: LeadFilter): Prisma.LeadWhereInput {
  const from = filter.from ? vnDateStart(filter.from) : null;
  const to = filter.to ? vnDateEnd(filter.to) : null;
  const q = filter.q;
  const digits = q ? normalizePhone(q) : "";
  return {
    ...(filter.status ? { status: filter.status } : {}),
    ...(from || to
      ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lt: to } : {}) } }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            ...(digits.length >= 3 ? [{ phone: { contains: digits } }] : []),
          ],
        }
      : {}),
  };
}

const listSelect = {
  id: true,
  name: true,
  phone: true,
  province: true,
  message: true,
  sourceUrl: true,
  status: true,
  note: true,
  createdAt: true,
  category: { select: { name: true } },
} satisfies Prisma.LeadSelect;

export type AdminLeadRow = Prisma.LeadGetPayload<{ select: typeof listSelect }>;

/** Not cached: staff need live data. */
export async function listAdminLeads(filter: LeadFilter) {
  const where = leadWhere(filter);
  const [total, items] = await Promise.all([
    db.lead.count({ where }),
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filter.page - 1) * ADMIN_LEADS_PAGE_SIZE,
      take: ADMIN_LEADS_PAGE_SIZE,
      select: listSelect,
    }),
  ]);
  return { total, items };
}

export async function getAdminLead(id: string) {
  if (!/^[a-z0-9]{20,40}$/.test(id)) return null;
  return db.lead.findUnique({
    where: { id },
    select: { ...listSelect, utm: true, updatedAt: true },
  });
}

/** All matching leads for CSV export (capped to keep the response reasonable). */
export async function exportAdminLeads(filter: LeadFilter, limit = 10_000) {
  return db.lead.findMany({
    where: leadWhere(filter),
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { ...listSelect, utm: true },
  });
}
