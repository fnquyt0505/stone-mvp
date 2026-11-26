import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { isProvince } from "@/lib/provinces";
import { VN_PHONE_RE } from "./lead";
import { formText, jsonArray, optionalId, optionalText } from "./admin-shared";

const order = z.coerce.number().int().min(0).max(9999).catch(0);

// ---------- Testimonial ----------

export const testimonialInputSchema = z.object({
  id: optionalId,
  name: z.string().trim().min(2, "Vui lòng nhập tên khách hàng.").max(80, "Tên quá dài."),
  province: z
    .string()
    .trim()
    .transform((v) => (v && isProvince(v) ? v : null)),
  content: z
    .string()
    .trim()
    .min(10, "Nội dung đánh giá tối thiểu 10 ký tự.")
    .max(1000, "Tối đa 1000 ký tự."),
  rating: z
    .string()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 5), "Số sao từ 1 đến 5."),
  order,
  isPublished: z.boolean(),
});

export function testimonialFormInput(formData: FormData) {
  const t = formText(formData);
  return {
    id: t("id"),
    name: t("name"),
    province: t("province"),
    content: t("content"),
    rating: t("rating"),
    order: t("order"),
    isPublished: t("isPublished") === "on",
  };
}

// ---------- Banner ----------

/** Call-to-action targets: phone, https link or an internal path. */
export const SAFE_CTA_HREF = /^(tel:\+?\d{8,15}|https:\/\/[^\s"'<>]+|\/(?!\/)[^\s"'<>]*)$/;

export const bannerInputSchema = z
  .object({
    id: optionalId,
    title: z.string().trim().min(2, "Vui lòng nhập tiêu đề.").max(120, "Tiêu đề tối đa 120 ký tự."),
    subtitle: optionalText(200, "Phụ đề tối đa 200 ký tự."),
    ctaLabel: optionalText(30, "Chữ trên nút tối đa 30 ký tự."),
    ctaHref: optionalText(300, "Liên kết quá dài.").refine(
      (v) => v === null || SAFE_CTA_HREF.test(v),
      "Liên kết phải bắt đầu bằng tel:, https:// hoặc /",
    ),
    order,
    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.ctaLabel && !v.ctaHref) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ctaHref"],
        message: "Nút cần có liên kết.",
      });
    }
  });

export function bannerFormInput(formData: FormData) {
  const t = formText(formData);
  return {
    id: t("id"),
    title: t("title"),
    subtitle: t("subtitle"),
    ctaLabel: t("ctaLabel"),
    ctaHref: t("ctaHref"),
    order: t("order"),
    isActive: t("isActive") === "on",
  };
}

// ---------- Site settings ----------

const phone = (label: string) =>
  z
    .string()
    .transform(normalizePhone)
    .refine((v) => v === "" || VN_PHONE_RE.test(v), `${label} chưa đúng. Ví dụ: 0912 345 678.`);

const httpsUrl = (label: string) =>
  z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^https:\/\/[^\s"'<>]+$/.test(v),
      `${label} phải bắt đầu bằng https://`,
    );

/** Accepts the Google Maps embed URL or the whole <iframe> snippet Google provides. */
export function extractMapEmbedUrl(input: string): string {
  const raw = input.trim();
  const fromIframe = /src="([^"]+)"/.exec(raw)?.[1];
  return (fromIframe ?? raw).replace(/&amp;/g, "&");
}

export const settingsInputSchema = z.object({
  brandName: z.string().trim().min(2, "Vui lòng nhập tên thương hiệu.").max(80),
  hotline: phone("Hotline"),
  zalo: phone("Số Zalo"),
  email: z
    .string()
    .trim()
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "Email chưa đúng."),
  address: z.string().trim().max(300, "Địa chỉ tối đa 300 ký tự."),
  workingHours: z.string().trim().max(120, "Giờ làm việc tối đa 120 ký tự."),
  mapEmbedUrl: z
    .string()
    .transform(extractMapEmbedUrl)
    .refine(
      (v) => v === "" || v.startsWith("https://www.google.com/maps/embed"),
      'Dán link "Nhúng bản đồ" của Google Maps (bắt đầu bằng https://www.google.com/maps/embed).',
    ),
  facebook: httpsUrl("Link Facebook"),
  tiktok: httpsUrl("Link TikTok"),
  youtube: httpsUrl("Link YouTube"),
  achievements: jsonArray(
    z.object({
      value: z.string().trim().min(1, "Thành tích cần có số liệu.").max(20),
      label: z.string().trim().min(1, "Thành tích cần có mô tả.").max(60),
    }),
    6,
    "Thành tích",
  ),
  authorName: z.string().trim().max(80),
  authorRole: z.string().trim().max(80),
  authorBio: z.string().trim().max(400, "Giới thiệu tác giả tối đa 400 ký tự."),
  isSampleData: z.boolean(),
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;

export function settingsFormInput(formData: FormData) {
  const t = formText(formData);
  const keys = [
    "brandName",
    "hotline",
    "zalo",
    "email",
    "address",
    "workingHours",
    "mapEmbedUrl",
    "facebook",
    "tiktok",
    "youtube",
    "achievements",
    "authorName",
    "authorRole",
    "authorBio",
  ] as const;
  return {
    ...Object.fromEntries(keys.map((k) => [k, t(k)])),
    isSampleData: t("isSampleData") === "on",
  };
}

/** Maps the validated form to SiteSetting rows (key -> JSON value). */
export function settingsToRows(v: SettingsInput): Record<string, unknown> {
  return {
    brandName: v.brandName,
    hotline: v.hotline,
    zalo: v.zalo,
    email: v.email,
    address: v.address,
    workingHours: v.workingHours,
    mapEmbedUrl: v.mapEmbedUrl,
    social: { facebook: v.facebook, tiktok: v.tiktok, youtube: v.youtube },
    achievements: v.achievements,
    author: v.authorName ? { name: v.authorName, role: v.authorRole, bio: v.authorBio } : null,
    isSampleData: v.isSampleData,
  };
}
