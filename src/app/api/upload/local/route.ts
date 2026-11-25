import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateImageFile } from "@/schemas/image";
import { isLocalStorageAllowed } from "@/server/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Checks the file's leading bytes so a renamed non-image is rejected. */
function looksLikeImage(bytes: Uint8Array, type: string): boolean {
  const hex = Buffer.from(bytes.subarray(0, 12)).toString("hex");
  if (type === "image/jpeg") return hex.startsWith("ffd8ff");
  if (type === "image/png") return hex.startsWith("89504e47");
  if (type === "image/webp") return hex.startsWith("52494646") && hex.slice(16, 24) === "57454250";
  if (type === "image/avif") return hex.slice(8, 16) === "66747970"; // "ftyp"
  return false;
}

/** Development/test-only storage under public/uploads (never on Vercel/production). */
export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }
  if (!isLocalStorageAllowed()) {
    return NextResponse.json({ error: "Lưu ảnh cục bộ không được bật." }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Thiếu tệp ảnh." }, { status: 400 });
  }
  const problem = validateImageFile(file);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!looksLikeImage(bytes, file.type)) {
    return NextResponse.json({ error: "Tệp không phải ảnh hợp lệ." }, { status: 400 });
  }

  const now = new Date();
  const dir = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const name = `${randomUUID()}.${EXT[file.type]}`;
  const absDir = path.join(process.cwd(), "public", "uploads", dir);
  await mkdir(absDir, { recursive: true });
  await writeFile(path.join(absDir, name), bytes);

  return NextResponse.json({ url: `/uploads/${dir}/${name}`, publicId: `local/${dir}/${name}` });
}
