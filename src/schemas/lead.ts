import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { isProvince } from "@/lib/provinces";

/**
 * Vietnamese phone numbers after normalization (+84 -> 0):
 * mobile 0[35789]xxxxxxxx (10 digits) or landline 02xxxxxxxxx (11 digits).
 */
export const VN_PHONE_RE = /^(0[35789]\d{8}|02\d{9})$/;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Tối đa ${max} ký tự.`)
    .optional()
    .transform((v) => (v ? v : undefined));

export const utmSchema = z
  .object({
    source: z.string().max(100).optional(),
    medium: z.string().max(100).optional(),
    campaign: z.string().max(100).optional(),
    term: z.string().max(100).optional(),
    content: z.string().max(100).optional(),
  })
  .strip();

export type Utm = z.infer<typeof utmSchema>;

/** Quote request submitted from the public site. Validated again on the server. */
export const leadInputSchema = z.object({
  name: z
    .string({ required_error: "Vui lòng nhập họ tên." })
    .trim()
    .min(2, "Vui lòng nhập họ tên.")
    .max(80, "Họ tên quá dài."),
  phone: z
    .string({ required_error: "Vui lòng nhập số điện thoại." })
    .transform(normalizePhone)
    .refine((p) => VN_PHONE_RE.test(p), "Số điện thoại chưa đúng. Ví dụ: 0912 345 678."),
  province: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && isProvince(v) ? v : undefined)),
  categoryId: z
    .string()
    .trim()
    .regex(/^[a-z0-9]{20,40}$/)
    .optional()
    .catch(undefined),
  message: optionalText(1000),
  /** Page the form was sent from (path only). */
  sourceUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v && v.startsWith("/") && !v.startsWith("//") ? v : "/")),
  utm: utmSchema.optional().catch(undefined),
});

export type LeadInput = z.infer<typeof leadInputSchema>;

export type LeadFieldErrors = Partial<Record<"name" | "phone" | "message", string>>;

export type SubmitLeadState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: LeadFieldErrors; values?: LeadFormValues };

/** Raw values echoed back on error so the form keeps what the visitor typed. */
export type LeadFormValues = Partial<
  Record<"name" | "phone" | "province" | "categoryId" | "message", string>
>;

/** Reads UTM params from a JSON string sent by the form (ignores anything malformed). */
export function parseUtm(raw: unknown): Utm | undefined {
  if (typeof raw !== "string" || !raw) return undefined;
  try {
    const parsed = utmSchema.safeParse(JSON.parse(raw));
    return parsed.success && Object.keys(parsed.data).length ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}
