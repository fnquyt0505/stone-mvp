"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  bannerFormInput,
  bannerInputSchema,
  settingsFormInput,
  settingsInputSchema,
  settingsToRows,
  testimonialFormInput,
  testimonialInputSchema,
} from "@/schemas/admin-misc";
import { CHECK_FIELDS, zodFieldErrors, type SaveResult } from "@/schemas/admin-shared";
import { requireAdmin, requireStaff } from "@/server/auth-guard";
import { db } from "@/server/db";
import { TESTIMONIALS_TAG } from "@/server/queries/home";
import { BANNERS_TAG, SITE_SETTINGS_TAG } from "@/server/queries/site";

type DeleteResult = { ok: boolean; message: string };

// ---------- Testimonials ----------

export async function saveTestimonial(formData: FormData): Promise<SaveResult> {
  await requireStaff();
  const parsed = testimonialInputSchema.safeParse(testimonialFormInput(formData));
  if (!parsed.success)
    return { ok: false, message: CHECK_FIELDS, fieldErrors: zodFieldErrors(parsed.error) };
  const { id, ...data } = parsed.data;
  if (id && !(await db.testimonial.findUnique({ where: { id }, select: { id: true } }))) {
    return { ok: false, message: "Không tìm thấy đánh giá này." };
  }
  const saved = id
    ? await db.testimonial.update({ where: { id }, data, select: { id: true } })
    : await db.testimonial.create({ data, select: { id: true } });
  revalidateTag(TESTIMONIALS_TAG);
  revalidatePath("/admin/testimonials");
  return { ok: true, id: saved.id };
}

export async function deleteTestimonial(id: string): Promise<DeleteResult> {
  await requireStaff();
  const result = await db.testimonial.deleteMany({ where: { id } });
  if (!result.count) return { ok: false, message: "Không tìm thấy đánh giá này." };
  revalidateTag(TESTIMONIALS_TAG);
  return { ok: true, message: "Đã xóa đánh giá." };
}

// ---------- Banners ----------

export async function saveBanner(formData: FormData): Promise<SaveResult> {
  await requireStaff();
  const parsed = bannerInputSchema.safeParse(bannerFormInput(formData));
  if (!parsed.success)
    return { ok: false, message: CHECK_FIELDS, fieldErrors: zodFieldErrors(parsed.error) };
  const { id, ...data } = parsed.data;
  if (id && !(await db.banner.findUnique({ where: { id }, select: { id: true } }))) {
    return { ok: false, message: "Không tìm thấy banner này." };
  }
  const saved = id
    ? await db.banner.update({ where: { id }, data, select: { id: true } })
    : await db.banner.create({ data, select: { id: true } });
  revalidateTag(BANNERS_TAG);
  revalidatePath("/admin/banners");
  return { ok: true, id: saved.id };
}

export async function deleteBanner(id: string): Promise<DeleteResult> {
  await requireStaff();
  const result = await db.banner.deleteMany({ where: { id } });
  if (!result.count) return { ok: false, message: "Không tìm thấy banner này." };
  revalidateTag(BANNERS_TAG);
  return { ok: true, message: "Đã xóa banner." };
}

// ---------- Site settings (admins only) ----------

export async function saveSettings(formData: FormData): Promise<SaveResult> {
  await requireAdmin();
  const parsed = settingsInputSchema.safeParse(settingsFormInput(formData));
  if (!parsed.success)
    return { ok: false, message: CHECK_FIELDS, fieldErrors: zodFieldErrors(parsed.error) };

  const rows = Object.entries(settingsToRows(parsed.data));
  await db.$transaction(
    rows.map(([key, value]) => {
      // Prisma needs JsonNull (not a bare null) to store JSON null.
      const json = value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
      return db.siteSetting.upsert({
        where: { key },
        create: { key, value: json },
        update: { value: json },
      });
    }),
  );
  revalidateTag(SITE_SETTINGS_TAG);
  // Header, footer, contact actions and JSON-LD read settings on every page.
  revalidatePath("/", "layout");
  return { ok: true, id: "settings" };
}
