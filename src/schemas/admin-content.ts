import { z } from "zod";
import { isProvince } from "@/lib/provinces";
import { isValidSlug, slugify } from "@/lib/slugify";
import { vnLocalInputToDate } from "@/lib/vn-time";
import {
  formText,
  galleryField,
  optionalId,
  optionalText,
  richTextField,
  seoFields,
} from "./admin-shared";

const SLUG_MESSAGE = "Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch nối.";

/** Slug typed by staff; empty -> derived from the title. */
function withSlug<T extends { slug: string; title: string }>(v: T, ctx: z.RefinementCtx): T {
  const slug = v.slug || slugify(v.title);
  if (!isValidSlug(slug))
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["slug"], message: SLUG_MESSAGE });
  return { ...v, slug };
}

const title = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `Vui lòng nhập ${label}.`)
    .max(160, `${label[0]?.toUpperCase()}${label.slice(1)} quá dài.`);

// ---------- Project ----------

export const projectInputSchema = z
  .object({
    id: optionalId,
    title: title("tên công trình"),
    slug: z.string().trim().toLowerCase().max(120),
    province: z.string().trim().refine(isProvince, "Vui lòng chọn tỉnh/thành."),
    categoryId: optionalId,
    summary: optionalText(400, "Tóm tắt tối đa 400 ký tự."),
    content: richTextField,
    coverImageId: optionalId,
    gallery: galleryField,
    completedAt: z
      .string()
      .trim()
      .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Ngày hoàn thành không hợp lệ.")
      .transform((v) => (v ? new Date(`${v}T00:00:00Z`) : null)),
    isFeatured: z.boolean(),
    isPublished: z.boolean(),
    ...seoFields,
  })
  .transform(withSlug);

export function projectFormInput(formData: FormData) {
  const t = formText(formData);
  return {
    id: t("id"),
    title: t("title"),
    slug: t("slug"),
    province: t("province"),
    categoryId: t("categoryId"),
    summary: t("summary"),
    content: t("content"),
    coverImageId: t("coverImageId"),
    gallery: t("gallery"),
    completedAt: t("completedAt"),
    isFeatured: t("isFeatured") === "on",
    isPublished: t("isPublished") === "on",
    seoTitle: t("seoTitle"),
    seoDescription: t("seoDescription"),
  };
}

// ---------- Post ----------

export const postInputSchema = z
  .object({
    id: optionalId,
    title: title("tiêu đề"),
    slug: z.string().trim().toLowerCase().max(120),
    excerpt: optionalText(400, "Tóm tắt tối đa 400 ký tự."),
    content: richTextField,
    coverImageId: optionalId,
    /** Vietnam local time; empty = draft. A future time schedules the post. */
    publishedAt: z
      .string()
      .trim()
      .refine((v) => v === "" || vnLocalInputToDate(v) !== null, "Ngày đăng không hợp lệ.")
      .transform((v) => (v ? vnLocalInputToDate(v) : null)),
    ...seoFields,
  })
  .transform(withSlug);

export function postFormInput(formData: FormData) {
  const t = formText(formData);
  return {
    id: t("id"),
    title: t("title"),
    slug: t("slug"),
    excerpt: t("excerpt"),
    content: t("content"),
    coverImageId: t("coverImageId"),
    publishedAt: t("publishedAt"),
    seoTitle: t("seoTitle"),
    seoDescription: t("seoDescription"),
  };
}

// ---------- Static page ----------

export const pageInputSchema = z
  .object({
    id: optionalId,
    title: title("tiêu đề trang"),
    slug: z.string().trim().toLowerCase().max(120),
    content: richTextField,
    ...seoFields,
  })
  .transform(withSlug);

export function pageFormInput(formData: FormData) {
  const t = formText(formData);
  return {
    id: t("id"),
    title: t("title"),
    slug: t("slug"),
    content: t("content"),
    seoTitle: t("seoTitle"),
    seoDescription: t("seoDescription"),
  };
}
