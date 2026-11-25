"use server";

import { parseRichTextJson, type RichNode } from "@/lib/rich-text-sanitize";
import { requireStaff } from "@/server/auth-guard";

export type PreviewState = { doc: RichNode | null; json: string };

/** Sanitizes editor output exactly as saving will (used by the editor playground). */
export async function previewRichText(
  _prev: PreviewState,
  formData: FormData,
): Promise<PreviewState> {
  await requireStaff();
  const doc = parseRichTextJson(formData.get("content"));
  return { doc, json: JSON.stringify(doc) };
}
