import { z } from "zod";
import { parseRichTextJson } from "@/lib/rich-text-sanitize";
import { isValidSlug, slugify } from "@/lib/slugify";

const CUID = /^[a-z0-9]{20,40}$/;
const MILLION = 1_000_000;

/** Optional price typed in "triệu" (millions of VND), stored as integer VND. */
const priceInMillions = z
  .string()
  .trim()
  .transform((v) => v.replace(",", "."))
  .refine((v) => v === "" || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) <= 100_000), {
    message: "Nhập số triệu, ví dụ 25 hoặc 1,5.",
  })
  .transform((v) => (v === "" ? null : Math.round(Number(v) * MILLION)));

function jsonArray<T extends z.ZodTypeAny>(item: T, max: number, label: string) {
  return z
    .string()
    .transform((raw, ctx) => {
      try {
        return raw ? (JSON.parse(raw) as unknown) : [];
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} không hợp lệ.` });
        return z.NEVER;
      }
    })
    .pipe(z.array(item).max(max, `${label} tối đa ${max} mục.`));
}

const specItem = z.object({
  label: z.string().trim().min(1, "Thông số cần có tên.").max(80),
  value: z.string().trim().min(1, "Thông số cần có giá trị.").max(300),
});
const faqItem = z.object({
  q: z.string().trim().min(1, "Câu hỏi không được để trống.").max(200),
  a: z.string().trim().min(1, "Câu trả lời không được để trống.").max(2000),
});
const galleryItem = z.object({
  imageId: z.string().regex(CUID),
  caption: z.string().trim().max(200).optional().default(""),
});

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((v) => (v ? v : null));

export const categoryInputSchema = z
  .object({
    id: z
      .string()
      .regex(CUID)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    name: z.string().trim().min(2, "Vui lòng nhập tên danh mục.").max(120, "Tên quá dài."),
    slug: z.string().trim().toLowerCase().max(120),
    parentId: z
      .string()
      .regex(CUID)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    menuGroup: optionalText(60, "Nhóm menu tối đa 60 ký tự."),
    excerpt: optionalText(300, "Mô tả ngắn tối đa 300 ký tự."),
    priceFrom: priceInMillions,
    priceTo: priceInMillions,
    content: z.string().transform((raw) => parseRichTextJson(raw)),
    specs: jsonArray(specItem, 30, "Bảng thông số"),
    faqs: jsonArray(faqItem, 30, "Câu hỏi thường gặp"),
    coverImageId: z
      .string()
      .regex(CUID)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    gallery: jsonArray(galleryItem, 200, "Thư viện ảnh"),
    seoTitle: optionalText(70, "Tiêu đề SEO tối đa 70 ký tự."),
    seoDescription: optionalText(170, "Mô tả SEO tối đa 170 ký tự."),
    order: z.coerce.number().int().min(0).max(9999).catch(0),
    isPublished: z.boolean(),
  })
  .transform((v) => ({ ...v, slug: v.slug || slugify(v.name) }))
  .superRefine((v, ctx) => {
    if (!isValidSlug(v.slug)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["slug"],
        message: "Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch nối.",
      });
    }
    if (v.priceFrom !== null && v.priceTo !== null && v.priceFrom > v.priceTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["priceTo"],
        message: "Giá đến phải lớn hơn hoặc bằng giá từ.",
      });
    }
    if (new Set(v.gallery.map((g) => g.imageId)).size !== v.gallery.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gallery"],
        message: "Ảnh bị trùng trong thư viện.",
      });
    }
  });

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export type CategoryFieldErrors = Partial<Record<string, string>>;

export type SaveCategoryResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; message: string; fieldErrors?: CategoryFieldErrors };

/** Reads the admin form's FormData into the schema's input shape. */
export function categoryFormInput(formData: FormData) {
  const text = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : "";
  };
  return {
    id: text("id"),
    name: text("name"),
    slug: text("slug"),
    parentId: text("parentId"),
    menuGroup: text("menuGroup"),
    excerpt: text("excerpt"),
    priceFrom: text("priceFrom"),
    priceTo: text("priceTo"),
    content: text("content"),
    specs: text("specs"),
    faqs: text("faqs"),
    coverImageId: text("coverImageId"),
    gallery: text("gallery"),
    seoTitle: text("seoTitle"),
    seoDescription: text("seoDescription"),
    order: text("order"),
    isPublished: formData.get("isPublished") === "on",
  };
}
