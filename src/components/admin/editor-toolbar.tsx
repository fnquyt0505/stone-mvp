"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Table as TableIcon,
  Underline,
  Undo2,
} from "lucide-react";
import { SAFE_LINK } from "@/lib/rich-text-sanitize";
import { cn } from "@/lib/utils";

/**
 * Keep focus and selection inside the editor when a toolbar button is clicked
 * with the mouse; otherwise the first keystroke after e.g. "Đậm" can be lost.
 * Keyboard users still Tab to the buttons and press Enter as usual.
 */
const keepEditorFocus = (e: React.MouseEvent) => e.preventDefault();

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={keepEditorFocus}
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-md text-stone-900 hover:bg-stone-50 disabled:opacity-40",
        active && "bg-jade-50 text-jade-700",
      )}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({
  editor,
  onInsertImage,
}: {
  editor: Editor;
  onInsertImage: () => void;
}) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      table: e.isActive("table"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  function editLink() {
    const current = (editor.getAttributes("link").href as string | undefined) ?? "";
    const href = window.prompt("Địa chỉ liên kết (để trống để bỏ liên kết):", current);
    if (href === null) return;
    if (!href.trim()) return void chain().extendMarkRange("link").unsetLink().run();
    if (!SAFE_LINK.test(href.trim())) return void window.alert("Liên kết không hợp lệ.");
    chain().extendMarkRange("link").setLink({ href: href.trim() }).run();
  }

  return (
    <div
      role="toolbar"
      aria-label="Định dạng"
      className="flex flex-wrap gap-1 border-b bg-white p-1"
    >
      <Tool label="Đậm" active={s.bold} onClick={() => chain().toggleBold().run()}>
        <Bold aria-hidden className="size-5" />
      </Tool>
      <Tool label="Nghiêng" active={s.italic} onClick={() => chain().toggleItalic().run()}>
        <Italic aria-hidden className="size-5" />
      </Tool>
      <Tool label="Gạch chân" active={s.underline} onClick={() => chain().toggleUnderline().run()}>
        <Underline aria-hidden className="size-5" />
      </Tool>
      <Tool
        label="Tiêu đề lớn"
        active={s.h2}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 aria-hidden className="size-5" />
      </Tool>
      <Tool
        label="Tiêu đề nhỏ"
        active={s.h3}
        onClick={() => chain().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 aria-hidden className="size-5" />
      </Tool>
      <Tool label="Danh sách" active={s.bullet} onClick={() => chain().toggleBulletList().run()}>
        <List aria-hidden className="size-5" />
      </Tool>
      <Tool
        label="Danh sách số"
        active={s.ordered}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <ListOrdered aria-hidden className="size-5" />
      </Tool>
      <Tool label="Trích dẫn" active={s.quote} onClick={() => chain().toggleBlockquote().run()}>
        <Quote aria-hidden className="size-5" />
      </Tool>
      <Tool label="Liên kết" active={s.link} onClick={editLink}>
        <LinkIcon aria-hidden className="size-5" />
      </Tool>
      <Tool label="Chèn ảnh" onClick={onInsertImage}>
        <ImagePlus aria-hidden className="size-5" />
      </Tool>
      <Tool
        label="Chèn bảng"
        active={s.table}
        onClick={() => chain().insertTable({ rows: 3, cols: 2, withHeaderRow: false }).run()}
      >
        <TableIcon aria-hidden className="size-5" />
      </Tool>
      {s.table ? (
        <span className="flex flex-wrap gap-1 border-l pl-1">
          <button
            type="button"
            onMouseDown={keepEditorFocus}
            className="h-10 rounded-md px-2 hover:bg-stone-50"
            onClick={() => chain().addRowAfter().run()}
          >
            + Hàng
          </button>
          <button
            type="button"
            onMouseDown={keepEditorFocus}
            className="h-10 rounded-md px-2 hover:bg-stone-50"
            onClick={() => chain().addColumnAfter().run()}
          >
            + Cột
          </button>
          <button
            type="button"
            onMouseDown={keepEditorFocus}
            className="h-10 rounded-md px-2 hover:bg-stone-50"
            onClick={() => chain().deleteRow().run()}
          >
            − Hàng
          </button>
          <button
            type="button"
            onMouseDown={keepEditorFocus}
            className="h-10 rounded-md px-2 hover:bg-stone-50"
            onClick={() => chain().deleteColumn().run()}
          >
            − Cột
          </button>
          <button
            type="button"
            onMouseDown={keepEditorFocus}
            className="h-10 rounded-md px-2 text-red-600 hover:bg-stone-50"
            onClick={() => chain().deleteTable().run()}
          >
            Xóa bảng
          </button>
        </span>
      ) : null}
      <span className="ml-auto flex gap-1">
        <Tool label="Hoàn tác" disabled={!s.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 aria-hidden className="size-5" />
        </Tool>
        <Tool label="Làm lại" disabled={!s.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 aria-hidden className="size-5" />
        </Tool>
      </span>
    </div>
  );
}
