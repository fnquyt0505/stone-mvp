"use client";

/** Browser-side upload helpers for ImageUploader. */

type UploadTarget =
  | {
      mode: "cloudinary";
      uploadUrl: string;
      apiKey: string;
      folder: string;
      timestamp: number;
      signature: string;
    }
  | { mode: "local"; uploadUrl: string };

export type UploadedFile = { url: string; publicId: string; width: number; height: number };

async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string | { message?: string } };
    if (typeof data.error === "string") return data.error;
    if (data.error?.message) return data.error.message;
  } catch {
    // non-JSON body
  }
  return fallback;
}

/** Asks the server how to upload (fresh Cloudinary signature or local dev mode). */
export async function getUploadTarget(): Promise<UploadTarget> {
  const res = await fetch("/api/upload", { method: "POST" });
  if (!res.ok) throw new Error(await errorMessage(res, "Không lấy được quyền tải ảnh."));
  return (await res.json()) as UploadTarget;
}

/** Natural pixel size of an image file (Vietnamese error if it cannot be decoded). */
export async function imageSize(file: File): Promise<{ width: number; height: number }> {
  try {
    return await readImageSize(file);
  } catch {
    throw new Error(`Không đọc được ảnh "${file.name}". Vui lòng chọn ảnh khác.`);
  }
}

async function readImageSize(file: File): Promise<{ width: number; height: number }> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function uploadFile(target: UploadTarget, file: File): Promise<UploadedFile> {
  const body = new FormData();
  body.set("file", file);

  if (target.mode === "cloudinary") {
    body.set("api_key", target.apiKey);
    body.set("timestamp", String(target.timestamp));
    body.set("signature", target.signature);
    body.set("folder", target.folder);
    const res = await fetch(target.uploadUrl, { method: "POST", body });
    if (!res.ok) throw new Error(await errorMessage(res, "Tải ảnh lên Cloudinary thất bại."));
    const data = (await res.json()) as {
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
    };
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  }

  const res = await fetch(target.uploadUrl, { method: "POST", body });
  if (!res.ok) throw new Error(await errorMessage(res, "Tải ảnh thất bại."));
  const data = (await res.json()) as { url: string; publicId: string };
  return { ...data, ...(await imageSize(file)) };
}
