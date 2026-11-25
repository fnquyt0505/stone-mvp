import { z } from "zod";

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_IMAGES_PER_BATCH = 30;

/** Metadata saved after a successful upload (Cloudinary or local dev storage). */
export const imageRecordSchema = z.object({
  url: z
    .string()
    .trim()
    .max(500)
    .refine(
      (u) =>
        u.startsWith("https://res.cloudinary.com/") ||
        // Exactly the shape /api/upload/local produces: no "..", no subfolders.
        /^\/uploads\/\d{4}\/\d{2}\/[a-f0-9-]+\.(jpg|png|webp|avif)$/.test(u),
      "Đường dẫn ảnh không hợp lệ.",
    ),
  publicId: z.string().trim().min(1).max(300),
  alt: z
    .string({ required_error: "Vui lòng nhập mô tả ảnh." })
    .trim()
    .min(3, "Mô tả ảnh tối thiểu 3 ký tự.")
    .max(200, "Mô tả ảnh tối đa 200 ký tự."),
  width: z.coerce.number().int().min(1).max(20_000),
  height: z.coerce.number().int().min(1).max(20_000),
});

export type ImageRecordInput = z.infer<typeof imageRecordSchema>;

export type SavedImage = ImageRecordInput & { id: string };

export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Chỉ nhận ảnh JPG, PNG, WebP hoặc AVIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) return "Ảnh tối đa 10 MB.";
  return null;
}
