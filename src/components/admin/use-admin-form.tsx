"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FieldErrors, SaveResult } from "@/schemas/admin-shared";

/**
 * Submit/delete plumbing shared by admin content forms. Submits via onSubmit
 * (not the form `action` prop) so React never resets typed values on errors.
 */
export function useAdminForm({
  save,
  remove,
  editPath,
  listPath,
}: {
  save: (formData: FormData) => Promise<SaveResult>;
  remove?: () => Promise<{ ok: boolean; message: string }>;
  /** Builds the edit URL for a saved id, e.g. (id) => `/admin/posts/${id}/`. */
  editPath: (id: string) => string;
  listPath: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  function fail(text: string, fieldErrors: FieldErrors = {}) {
    setErrors(fieldErrors);
    setMessage(text);
    summaryRef.current?.focus();
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await save(formData);
      if (!result.ok) return fail(result.message, result.fieldErrors);
      router.push(`${editPath(result.id)}?da-luu=1`);
      router.refresh();
    });
  }

  function onDelete(confirmText: string) {
    if (!remove || !window.confirm(confirmText)) return;
    startTransition(async () => {
      const result = await remove();
      if (!result.ok) return fail(result.message);
      router.push(`${listPath}?da-xoa=1`);
      router.refresh();
    });
  }

  return { onSubmit, onDelete, pending, errors, message, summaryRef };
}

export function FormMessage({
  message,
  summaryRef,
}: {
  message: string | null;
  summaryRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={summaryRef} tabIndex={-1} role="alert" className="outline-none">
      {message ? (
        <p className="rounded-md bg-red-600/10 p-4 font-semibold text-red-600">{message}</p>
      ) : null}
    </div>
  );
}

export function FormActions({
  pending,
  saveLabel,
  deleteLabel,
  onDelete,
}: {
  pending: boolean;
  saveLabel: string;
  deleteLabel?: string;
  onDelete?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Loader2 aria-hidden className="animate-spin" /> : <Save aria-hidden />}
        {saveLabel}
      </Button>
      {onDelete && deleteLabel ? (
        <Button
          type="button"
          variant="ghost"
          className="text-red-600"
          disabled={pending}
          onClick={onDelete}
        >
          <Trash2 aria-hidden /> {deleteLabel}
        </Button>
      ) : null}
    </div>
  );
}

/** "Đã lưu…" / "Đã xóa…" banner driven by ?da-luu=1 / ?da-xoa=1. */
export function SavedNotice({ text }: { text: string }) {
  return (
    <p role="status" className="rounded-md bg-success/10 p-3 font-semibold text-success">
      {text}
    </p>
  );
}
