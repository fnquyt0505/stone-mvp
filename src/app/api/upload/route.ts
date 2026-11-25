import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getCloudinaryConfig,
  isLocalStorageAllowed,
  signCloudinaryParams,
  UPLOAD_FOLDER,
} from "@/server/storage";

export const dynamic = "force-dynamic";

/**
 * Returns how the browser should upload: a Cloudinary signature (direct
 * upload, the secret never leaves the server) or the local dev endpoint.
 * Staff only — /api is not covered by middleware, so check here.
 */
export async function POST() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const cloudinary = getCloudinaryConfig();
  if (cloudinary) {
    const timestamp = Math.floor(Date.now() / 1000);
    const params = { folder: UPLOAD_FOLDER, timestamp };
    return NextResponse.json({
      mode: "cloudinary",
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`,
      apiKey: cloudinary.apiKey,
      folder: UPLOAD_FOLDER,
      timestamp,
      signature: signCloudinaryParams(params, cloudinary.apiSecret),
    });
  }
  if (isLocalStorageAllowed()) {
    return NextResponse.json({ mode: "local", uploadUrl: "/api/upload/local" });
  }
  return NextResponse.json({ error: "Chưa cấu hình nơi lưu ảnh (Cloudinary)." }, { status: 503 });
}
