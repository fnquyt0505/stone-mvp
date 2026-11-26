import { z } from "zod";
import { parseRichTextJson } from "@/lib/rich-text-sanitize";

/** Shared building blocks for admin content schemas. */
export const CUID_RE = /^[a-z0-9]{20,40}$/;

export const optionalId = z
  .string()
  .regex(CUID_RE)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((v) => (v ? v : null));

export const richTextField = z.string().transform((raw) => parseRichTextJson(raw));

/** JSON array posted from a hidden input (row editors, gallery). */
export function jsonArray<T extends z.ZodTypeAny>(item: T, max: number, label: string) {
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

export const galleryItem = z.object({
  imageId: z.string().regex(CUID_RE),
  caption: z.string().trim().max(200).optional().default(""),
});

export const galleryField = jsonArray(galleryItem, 200, "Thư viện ảnh").refine(
  (items) => new Set(items.map((g) => g.imageId)).size === items.length,
  "Ảnh bị trùng trong thư viện.",
);

export const seoFields = {
  seoTitle: optionalText(70, "Tiêu đề SEO tối đa 70 ký tự."),
  seoDescription: optionalText(170, "Mô tả SEO tối đa 170 ký tự."),
};

export type FieldErrors = Partial<Record<string, string>>;

export type SaveResult =
  { ok: true; id: string } | { ok: false; message: string; fieldErrors?: FieldErrors };

export const CHECK_FIELDS = "Vui lòng kiểm tra lại các ô báo lỗi.";

/** First message per top-level field from a ZodError. */
export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/** Reads every string entry of a FormData (checkboxes come back as "on"). */
export function formText(formData: FormData) {
  return (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : "";
  };
}
