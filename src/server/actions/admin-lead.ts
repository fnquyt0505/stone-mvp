"use server";

import { revalidatePath } from "next/cache";
import { leadUpdateSchema, type LeadUpdateState } from "@/schemas/admin-lead";
import { requireStaff } from "@/server/auth-guard";
import { db } from "@/server/db";

/** Changes a lead's status and internal note. Staff only. */
export async function updateLead(
  _prev: LeadUpdateState,
  formData: FormData,
): Promise<LeadUpdateState> {
  await requireStaff();

  const parsed = leadUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    note: formData.get("note") ?? undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  }

  const { id, status, note } = parsed.data;
  const result = await db.lead.updateMany({ where: { id }, data: { status, note } });
  if (result.count === 0) return { status: "error", message: "Không tìm thấy yêu cầu này." };

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { status: "success", message: "Đã lưu." };
}
