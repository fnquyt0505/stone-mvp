"use client";

import { useActionState } from "react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { RichText } from "@/components/rich-text";
import { Button } from "@/components/ui/button";
import { previewRichText, type PreviewState } from "@/server/actions/rich-text-preview";

export function EditorPlayground() {
  const [state, action, pending] = useActionState<PreviewState, FormData>(previewRichText, {
    doc: null,
    json: "",
  });
  return (
    <div className="grid gap-6">
      <form action={action} className="grid gap-4" aria-label="Thử trình soạn thảo">
        <RichTextEditor name="content" label="Nội dung" />
        <Button type="submit" disabled={pending} className="justify-self-start">
          Xem trước
        </Button>
      </form>
      <section aria-label="Bản xem trước" className="rounded-lg border bg-white p-5">
        <RichText doc={state.doc} className="space-y-4" />
        <pre data-testid="sanitized-json" className="mt-4 hidden">
          {state.json}
        </pre>
      </section>
    </div>
  );
}
