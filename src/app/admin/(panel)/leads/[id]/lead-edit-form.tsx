"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { LEAD_STATUS_LABELS } from "@/components/admin/lead-status";
import { Button } from "@/components/ui/button";
import { LEAD_STATUSES, type LeadStatusValue, type LeadUpdateState } from "@/schemas/admin-lead";
import { updateLead } from "@/server/actions/admin-lead";

export function LeadEditForm({
  id,
  status,
  note,
}: {
  id: string;
  status: LeadStatusValue;
  note: string | null;
}) {
  const [state, action, pending] = useActionState<LeadUpdateState, FormData>(updateLead, {
    status: "idle",
  });

  return (
    <form action={action} className="grid gap-4" aria-label="Cập nhật yêu cầu">
      <input type="hidden" name="id" value={id} readOnly />
      <fieldset className="grid gap-2">
        <legend className="mb-1 font-semibold">Trạng thái</legend>
        <div className="flex flex-wrap gap-2">
          {LEAD_STATUSES.map((s) => (
            <label
              key={s}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border bg-white px-3 has-[:checked]:border-jade-700 has-[:checked]:bg-jade-50 has-[:checked]:font-semibold"
            >
              <input
                type="radio"
                name="status"
                value={s}
                defaultChecked={s === status}
                className="size-4 accent-jade-700"
              />
              {LEAD_STATUS_LABELS[s]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-1.5">
        <span className="font-semibold">Ghi chú nội bộ (nội dung cuộc gọi, hẹn khảo sát…)</span>
        <textarea
          name="note"
          rows={5}
          maxLength={2000}
          defaultValue={note ?? ""}
          className="rounded-md border border-stone-500 bg-white p-3"
        />
      </label>
      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 aria-hidden className="animate-spin" /> : null}
          Lưu
        </Button>
        <p role="status" className={state.status === "error" ? "text-red-600" : "text-success"}>
          {state.status !== "idle" ? state.message : null}
        </p>
      </div>
    </form>
  );
}
