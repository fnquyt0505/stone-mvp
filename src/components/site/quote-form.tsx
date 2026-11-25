"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { PROVINCES } from "@/lib/provinces";
import { readSessionUtm } from "@/lib/utm";
import { cn } from "@/lib/utils";
import type { SubmitLeadState } from "@/schemas/lead";
import { submitLead } from "@/server/actions/lead";
import { TurnstileWidget, type TurnstileHandle } from "./turnstile-widget";

export type CategoryOptionGroup = { name: string; options: { id: string; name: string }[] };

const FIELD =
  "w-full rounded-md border border-stone-500 bg-white px-3 text-base text-stone-900 placeholder:text-stone-500 aria-[invalid=true]:border-red-600";
export function QuoteForm({
  categories,
  defaultCategoryId,
  turnstileSiteKey,
  idPrefix = "quote",
}: {
  categories: CategoryOptionGroup[];
  defaultCategoryId?: string;
  turnstileSiteKey: string | null;
  idPrefix?: string;
}) {
  const [state, action, pending] = useActionState<SubmitLeadState, FormData>(submitLead, {
    status: "idle",
  });
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const turnstile = useRef<TurnstileHandle>(null);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  // React resets forms after an action; echoed values keep the input on errors.
  const values = state.status === "error" ? (state.values ?? {}) : {};
  const id = (name: string) => `${idPrefix}-${name}`;

  // Kept in state (not written to the DOM) so React's post-action form reset
  // does not wipe them before a retry.
  const [meta, setMeta] = useState({ sourceUrl: "", utm: "" });
  useEffect(() => {
    setMeta({
      sourceUrl: window.location.pathname + window.location.search,
      utm: readSessionUtm(),
    });
  }, []);

  useEffect(() => {
    if (state.status === "idle") return;
    statusRef.current?.focus();
    turnstile.current?.reset(); // tokens are single-use
    if (state.status === "success") {
      formRef.current?.reset();
      trackEvent("generate_lead", { form: idPrefix });
    }
  }, [state, idPrefix]);

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      className="grid gap-4"
      aria-label="Yêu cầu báo giá"
    >
      <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="outline-none">
        {state.status === "success" ? (
          <p className="flex gap-3 rounded-md bg-success/10 p-4 font-semibold text-success">
            <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0" />
            Đã nhận yêu cầu của Quý khách. Chúng tôi sẽ gọi lại trong 30 phút (giờ làm việc).
          </p>
        ) : state.status === "error" ? (
          <p className="rounded-md bg-red-600/10 p-4 font-semibold text-red-600">{state.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor={id("name")} className="font-semibold">
            Họ và tên <span className="text-red-600">*</span>
          </label>
          <input
            id={id("name")}
            name="name"
            defaultValue={values.name}
            required
            autoComplete="name"
            maxLength={80}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? id("name-error") : undefined}
            className={cn(FIELD, "h-12")}
          />
          {errors.name ? (
            <p id={id("name-error")} className="text-red-600">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={id("phone")} className="font-semibold">
            Số điện thoại <span className="text-red-600">*</span>
          </label>
          <input
            id={id("phone")}
            name="phone"
            defaultValue={values.phone}
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="0912 345 678"
            maxLength={20}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? id("phone-error") : undefined}
            className={cn(FIELD, "h-12")}
          />
          {errors.phone ? (
            <p id={id("phone-error")} className="text-red-600">
              {errors.phone}
            </p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={id("province")} className="font-semibold">
            Tỉnh / thành
          </label>
          <select
            id={id("province")}
            name="province"
            // Selects only read defaultValue on mount; remount with the echoed value.
            key={`province-${values.province ?? ""}`}
            defaultValue={values.province ?? ""}
            className={cn(FIELD, "h-12")}
          >
            <option value="">Chọn tỉnh thành</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={id("category")} className="font-semibold">
            Loại sản phẩm
          </label>
          <select
            id={id("category")}
            name="categoryId"
            key={`category-${values.categoryId ?? ""}`}
            defaultValue={values.categoryId ?? defaultCategoryId ?? ""}
            className={cn(FIELD, "h-12")}
          >
            <option value="">Chọn loại sản phẩm</option>
            {categories.map((g) => (
              <optgroup key={g.name} label={g.name}>
                {g.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor={id("message")} className="font-semibold">
          Kích thước, yêu cầu hoặc ghi chú
        </label>
        <textarea
          id={id("message")}
          name="message"
          defaultValue={values.message}
          rows={4}
          maxLength={1000}
          placeholder="Ví dụ: mộ đôi đá xanh rêu, khuôn viên 3 × 4 m…"
          aria-invalid={Boolean(errors.message)}
          className={cn(FIELD, "py-3")}
        />
        {errors.message ? <p className="text-red-600">{errors.message}</p> : null}
      </div>

      {/* Honeypot: hidden from people and assistive tech, tempting for bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="sourceUrl" value={meta.sourceUrl} readOnly />
      <input type="hidden" name="utm" value={meta.utm} readOnly />

      {turnstileSiteKey ? <TurnstileWidget ref={turnstile} siteKey={turnstileSiteKey} /> : null}

      <Button type="submit" variant="cta" size="lg" disabled={pending} className="w-full">
        {pending ? <Loader2 aria-hidden className="animate-spin" /> : <Send aria-hidden />}
        {pending ? "Đang gửi…" : "Gửi yêu cầu báo giá"}
      </Button>
      <p className="text-small-responsive text-stone-700">
        Thông tin chỉ dùng để liên hệ tư vấn. Báo giá trọn gói nhưng không gồm phần móng.
      </p>
    </form>
  );
}
