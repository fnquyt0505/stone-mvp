"use server";

import { revalidatePath } from "next/cache";
import { imageRecordSchema, MAX_IMAGES_PER_BATCH, type SavedImage } from "@/schemas/image";
import { requireStaff } from "@/server/auth-guard";
import { db } from "@/server/db";
import { UPLOAD_FOLDER } from "@/server/storage";

export type SaveImagesResult = { ok: true; images: SavedImage[] } | { ok: false; message: string };

/**
 * Stores metadata for images already uploaded (Cloudinary or local dev).
 * Only accepts files from our own Cloudinary folder or local uploads.
 */
export async function saveImages(input: unknown[]): Promise<SaveImagesResult> {
  await requireStaff();
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_IMAGES_PER_BATCH) {
    return { ok: false, message: `Mỗi lần lưu từ 1 đến ${MAX_IMAGES_PER_BATCH} ảnh.` };
  }

  const records = [];
  for (const item of input) {
    const parsed = imageRecordSchema.safeParse(item);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Thông tin ảnh không hợp lệ.",
      };
    }
    const { publicId } = parsed.data;
    if (!publicId.startsWith(`${UPLOAD_FOLDER}/`) && !publicId.startsWith("local/")) {
      return { ok: false, message: "Ảnh không thuộc thư mục của website." };
    }
    records.push(parsed.data);
  }

  const images = await db.$transaction(
    records.map((data) =>
      db.image.upsert({
        where: { publicId: data.publicId },
        create: data,
        update: { alt: data.alt },
        select: { id: true, url: true, publicId: true, alt: true, width: true, height: true },
      }),
    ),
  );
  revalidatePath("/admin/images");
  return { ok: true, images };
}
