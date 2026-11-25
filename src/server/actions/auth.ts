"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn, signOut } from "@/auth";
import { loginSchema, type LoginState } from "@/schemas/auth";
import { hashKey, hitRateLimit } from "@/server/rate-limit";

const INVALID = "Email hoặc mật khẩu không đúng.";
/** Brute-force protection: 10 attempts / 15 minutes per IP and per email. */
const LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

/** Only allow redirects back into the admin area. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/admin/") && !next.startsWith("/admin/login") ? next : "/admin/";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email") ?? undefined,
    password: formData.get("password") ?? undefined,
  });
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")) : "";
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? INVALID, email };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const [byIp, byEmail] = await Promise.all([
    hitRateLimit(hashKey("login-ip", ip), LIMIT.limit, LIMIT.windowMs),
    hitRateLimit(hashKey("login-email", parsed.data.email), LIMIT.limit, LIMIT.windowMs),
  ]);
  if (!byIp.allowed || !byEmail.allowed) {
    return {
      status: "error",
      message: "Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.",
      email,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeNext(formData.get("next")),
    });
  } catch (error) {
    // signIn throws a redirect on success; only AuthError means bad credentials.
    if (error instanceof AuthError) return { status: "error", message: INVALID, email };
    throw error;
  }
  return { status: "idle" };
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/admin/login/" });
}
