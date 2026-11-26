"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LoginState } from "@/schemas/auth";
import { login } from "@/server/actions/auth";

const FIELD = "h-12 w-full rounded-md border border-stone-500 bg-white px-3";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {
    status: "idle",
  });
  const email = state.status === "error" ? state.email : undefined;

  return (
    <form action={action} className="grid gap-4" aria-label="Đăng nhập">
      <div role="alert" aria-live="assertive">
        {state.status === "error" ? (
          <p className="rounded-md bg-red-600/10 p-3 font-semibold text-red-600">{state.message}</p>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="login-email" className="font-semibold">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={email}
          className={FIELD}
        />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="login-password" className="font-semibold">
          Mật khẩu
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={FIELD}
        />
      </div>
      <input type="hidden" name="next" value={next} readOnly />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Loader2 aria-hidden className="animate-spin" /> : null}
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
    </form>
  );
}
