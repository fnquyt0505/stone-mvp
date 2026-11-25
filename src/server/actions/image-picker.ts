"use server";

import { requireStaff } from "@/server/auth-guard";
import { db } from "@/server/db";

export type PickerImage = { id: string; url: string; alt: string; width: number; height: number };

/** Recent library images for the editor's image picker. Staff only. */
export async function listPickerImages(query = "", take = 60): Promise<PickerImage[]> {
  await requireStaff();
  const q = query.trim().slice(0, 50);
  return db.image.findMany({
    where: q ? { alt: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(take, 1), 100),
    select: { id: true, url: true, alt: true, width: true, height: true },
  });
}
