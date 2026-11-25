import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Vui lòng nhập email." })
    .trim()
    .toLowerCase()
    .email("Email chưa đúng."),
  password: z
    .string({ required_error: "Vui lòng nhập mật khẩu." })
    .min(1, "Vui lòng nhập mật khẩu.")
    .max(200),
});

export type LoginState = { status: "idle" } | { status: "error"; message: string; email?: string };
