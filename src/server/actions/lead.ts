"use server";

import { headers } from "next/headers";
import {
  leadInputSchema,
  type LeadFormValues,
  parseUtm,
  type LeadFieldErrors,
  type SubmitLeadState,
} from "@/schemas/lead";
import { db } from "@/server/db";
import { hashKey, hitRateLimit } from "@/server/rate-limit";
import { verifyTurnstile } from "@/server/turnstile";

/** docs/RULES.md §2: 5 submissions per 10 minutes per IP; also cap per phone. */
const IP_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };
const PHONE_LIMIT = { limit: 5, windowMs: 24 * 60 * 60 * 1000 };

const GENERIC_ERROR = "Chưa gửi được yêu cầu. Quý khách vui lòng thử lại hoặc gọi hotline.";

async function clientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || null;
}

function maskPhone(phone: string): string {
  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}

/**
 * Public quote form handler (no auth by design). Order: honeypot → validate →
 * Turnstile → rate limit → save. Notifications are sent after saving (T16)
 * and must never make this action fail.
 */
export async function submitLead(
  _prev: SubmitLeadState,
  formData: FormData,
): Promise<SubmitLeadState> {
  const text = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v.slice(0, 1000) : "";
  };
  const values: LeadFormValues = {
    name: text("name"),
    phone: text("phone"),
    province: text("province"),
    categoryId: text("categoryId"),
    message: text("message"),
  };

  // Honeypot: real visitors never see this field. Pretend success to bots.
  if (String(formData.get("website") ?? "").trim()) return { status: "success" };

  const parsed = leadInputSchema.safeParse({
    name: formData.get("name") ?? undefined,
    phone: formData.get("phone") ?? undefined,
    province: formData.get("province") ?? undefined,
    categoryId: formData.get("categoryId") || undefined,
    message: formData.get("message") ?? undefined,
    sourceUrl: formData.get("sourceUrl") ?? undefined,
    utm: parseUtm(formData.get("utm")),
  });
  if (!parsed.success) {
    const fieldErrors: LeadFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if ((field === "name" || field === "phone" || field === "message") && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { status: "error", message: "Vui lòng kiểm tra lại thông tin.", fieldErrors, values };
  }
  const input = parsed.data;

  const ip = await clientIp();
  if (!(await verifyTurnstile(formData.get("cf-turnstile-response"), ip))) {
    return {
      status: "error",
      message: "Chưa xác minh xong. Quý khách vui lòng bấm gửi lại sau giây lát.",
      values,
    };
  }

  try {
    const byIp = await hitRateLimit(
      hashKey("lead-ip", ip ?? "unknown"),
      IP_LIMIT.limit,
      IP_LIMIT.windowMs,
    );
    const byPhone = byIp.allowed
      ? await hitRateLimit(
          hashKey("lead-phone", input.phone),
          PHONE_LIMIT.limit,
          PHONE_LIMIT.windowMs,
        )
      : byIp;
    if (!byIp.allowed || !byPhone.allowed) {
      return {
        status: "error",
        message:
          "Quý khách đã gửi nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau ít phút hoặc gọi hotline.",
        values,
      };
    }

    const categoryExists = input.categoryId
      ? Boolean(
          await db.category.findUnique({ where: { id: input.categoryId }, select: { id: true } }),
        )
      : false;

    // Save first; notifications (T16) come after and must not fail the request.
    await db.lead.create({
      data: {
        name: input.name,
        phone: input.phone,
        province: input.province ?? null,
        categoryId: categoryExists ? input.categoryId : null,
        message: input.message ?? null,
        sourceUrl: input.sourceUrl,
        utm: input.utm ?? undefined,
      },
    });
  } catch (error) {
    console.error("[lead] failed to save lead", { phone: maskPhone(input.phone), error });
    return { status: "error", message: GENERIC_ERROR, values };
  }

  return { status: "success" };
}
