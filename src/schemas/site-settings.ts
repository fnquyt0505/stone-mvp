import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

/**
 * Shape of the SiteSetting key/value table, merged into one object.
 * Unknown keys are ignored; invalid values fall back to defaults.
 */
export const siteSettingsSchema = z.object({
  isSampleData: z.boolean().default(false),
  brandName: z.string().trim().min(1).default("Xưởng đá mỹ nghệ"),
  /** Digits only, e.g. "0900000000". */
  hotline: z.string().trim().default(""),
  /** Phone number registered with Zalo (digits only). */
  zalo: z.string().trim().default(""),
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  address: z.string().trim().default(""),
  workingHours: z.string().trim().default(""),
  social: z
    .object({ facebook: optionalUrl, tiktok: optionalUrl, youtube: optionalUrl })
    .default({}),
  /** Highlight figures for the home page, e.g. { value: "15+", label: "Năm kinh nghiệm" }. */
  achievements: z
    .array(z.object({ value: z.string().trim().min(1), label: z.string().trim().min(1) }))
    .max(6)
    .default([]),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

/** Parses each key independently so one bad value does not discard the rest. */
export function parseSiteSettings(rows: { key: string; value: unknown }[]): SiteSettings {
  const shape = siteSettingsSchema.shape;
  const merged: Record<string, unknown> = {};
  for (const { key, value } of rows) {
    if (!(key in shape)) continue;
    const field = shape[key as keyof typeof shape];
    const parsed = field.safeParse(value);
    if (parsed.success) merged[key] = parsed.data;
  }
  return siteSettingsSchema.parse(merged);
}
