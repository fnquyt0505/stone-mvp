import { readFile } from "node:fs/promises";
import path from "node:path";
import { isLocalStorageAllowed } from "@/server/storage";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

type Props = { params: Promise<{ path: string[] }> };

/**
 * Serves dev/e2e uploads from public/uploads. `next start` only serves public
 * files that existed at build time, so /uploads/* is rewritten here
 * (next.config.ts). Disabled whenever local storage is (e.g. production).
 */
export async function GET(_request: Request, { params }: Props) {
  if (!isLocalStorageAllowed()) return new Response("Not found", { status: 404 });

  const parts = (await params).path;
  const rel = parts.join("/");
  const match = /^(\d{4})\/(\d{2})\/([a-f0-9-]+)\.(jpg|png|webp|avif)$/.exec(rel);
  if (!match) return new Response("Not found", { status: 404 });

  try {
    const file = await readFile(path.join(process.cwd(), "public", "uploads", ...parts));
    return new Response(new Uint8Array(file), {
      headers: { "Content-Type": TYPES[match[4] ?? ""] ?? "application/octet-stream" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
