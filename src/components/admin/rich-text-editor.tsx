"use client";

import { useState } from "react";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorToolbar } from "./editor-toolbar";
import { ImagePickerDialog } from "./image-picker-dialog";

/** Image node that also stores intrinsic size (used by next/image on the site). */
const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
    };
  },
});

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

/**
 * Tiptap editor for long-form content. The document is written as JSON into a
 * hidden input named `name`; the server sanitizes it on save
 * (lib/rich-text-sanitize.ts).
 */
export function RichTextEditor({
  name,
  defaultValue,
  label,
}: {
  name: string;
  defaultValue?: unknown;
  label: string;
}) {
  const initial = (defaultValue as JSONContent | null | undefined) ?? EMPTY_DOC;
  const [json, setJson] = useState(() => JSON.stringify(initial));
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false, // avoid SSR hydration mismatches
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        strike: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      SizedImage,
      TableKit.configure({ table: { resizable: false } }),
    ],
    content: initial,
    editorProps: {
      attributes: {
        "aria-label": label,
        "aria-multiline": "true",
        role: "textbox",
        class:
          "min-h-64 space-y-3 p-4 outline-none [&_h2]:font-heading [&_h2]:text-h3 [&_h2]:font-semibold [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-gold-600 [&_blockquote]:pl-4 [&_a]:text-jade-700 [&_a]:underline [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-stone-200 [&_td]:p-2 [&_th]:border [&_th]:border-stone-200 [&_th]:p-2 [&_img]:max-h-96 [&_img]:rounded-md [&_.selectedCell]:bg-jade-50",
      },
    },
    onUpdate: ({ editor: e }) => setJson(JSON.stringify(e.getJSON())),
  });

  return (
    <div className="grid gap-1.5">
      <span className="font-semibold">{label}</span>
      <div className="overflow-hidden rounded-md border border-stone-500 bg-white focus-within:outline-2 focus-within:outline-gold-600">
        {editor ? (
          <EditorToolbar editor={editor} onInsertImage={() => setPickerOpen(true)} />
        ) : null}
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={json} readOnly />
      <ImagePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={(img) => {
          editor
            ?.chain()
            .focus()
            .setImage({ src: img.url, alt: img.alt })
            .updateAttributes("image", { width: img.width, height: img.height })
            .run();
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
