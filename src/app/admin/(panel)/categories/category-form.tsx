"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2 } from "lucide-react";
import { FormSection } from "@/components/admin/form-fields";
import { GalleryEditor, type GalleryRow } from "@/components/admin/gallery-editor";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { RowsEditor } from "@/components/admin/rows-editor";
import { SeoVisibilityFields } from "@/components/admin/seo-visibility-fields";
import { Button } from "@/components/ui/button";
import type { CategoryFieldErrors } from "@/schemas/admin-category";
import type { Faq, Spec } from "@/schemas/category";
import { deleteCategory, saveCategory } from "@/server/actions/admin-category";
import type { PickerImage } from "@/server/actions/image-picker";
import { CategoryBasics } from "./category-basics";

export type CategoryFormValues = {
  id?: string;
  name: string;
  slug: string;
  parentId: string;
  menuGroup: string;
  excerpt: string;
  priceFrom: string;
  priceTo: string;
  content: unknown;
  specs: Spec[];
  faqs: Faq[];
  cover: PickerImage | null;
  gallery: GalleryRow[];
  seoTitle: string;
  seoDescription: string;
  order: number;
  isPublished: boolean;
  hasChildren: boolean;
};

export function CategoryForm({
  initial,
  parents,
}: {
  initial: CategoryFormValues;
  parents: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [specs, setSpecs] = useState(initial.specs);
  const [faqs, setFaqs] = useState(initial.faqs);
  const [gallery, setGallery] = useState(initial.gallery);
  const [errors, setErrors] = useState<CategoryFieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const summary = useRef<HTMLDivElement>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveCategory(formData);
      if (result.ok) {
        router.push(`/admin/categories/${result.id}/?da-luu=1`);
        router.refresh();
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setMessage(result.message);
      summary.current?.focus();
    });
  }

  function onDelete() {
    if (
      !initial.id ||
      !window.confirm(`Xóa danh mục "${initial.name}"? Thao tác này không hoàn tác được.`)
    )
      return;
    startTransition(async () => {
      const result = await deleteCategory(initial.id ?? "");
      if (result.ok) {
        router.push("/admin/categories/?da-xoa=1");
        router.refresh();
      } else {
        setMessage(result.message);
        summary.current?.focus();
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid max-w-4xl gap-6"
      aria-label="Thông tin danh mục"
      noValidate
    >
      <div ref={summary} tabIndex={-1} role="alert" className="outline-none">
        {message ? (
          <p className="rounded-md bg-red-600/10 p-4 font-semibold text-red-600">{message}</p>
        ) : null}
      </div>
      <input type="hidden" name="id" value={initial.id ?? ""} readOnly />

      <CategoryBasics initial={initial} parents={parents} errors={errors} />

      <FormSection title="Nội dung bài giới thiệu">
        <RichTextEditor name="content" label="Nội dung" defaultValue={initial.content} />
      </FormSection>

      <FormSection title="Bảng thông số">
        <RowsEditor
          name="specs"
          itemLabel="Thông số"
          addLabel="Thêm thông số"
          rows={specs}
          onChange={setSpecs}
          error={errors.specs}
          columns={[
            { key: "label", label: "Tên thông số", max: 80 },
            { key: "value", label: "Giá trị", max: 300 },
          ]}
        />
      </FormSection>

      <FormSection title="Câu hỏi thường gặp">
        <RowsEditor
          name="faqs"
          itemLabel="Câu hỏi"
          addLabel="Thêm câu hỏi"
          rows={faqs}
          onChange={setFaqs}
          error={errors.faqs}
          columns={[
            { key: "q", label: "Câu hỏi", max: 200 },
            { key: "a", label: "Trả lời", multiline: true, max: 2000 },
          ]}
        />
      </FormSection>

      <FormSection title="Thư viện ảnh">
        <GalleryEditor name="gallery" rows={gallery} onChange={setGallery} error={errors.gallery} />
      </FormSection>

      <SeoVisibilityFields defaults={initial} errors={errors} titleFallback="tên danh mục" />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 aria-hidden className="animate-spin" /> : <Save aria-hidden />}
          Lưu danh mục
        </Button>
        {initial.id ? (
          <Button
            type="button"
            variant="ghost"
            className="text-red-600"
            disabled={pending}
            onClick={onDelete}
          >
            <Trash2 aria-hidden /> Xóa danh mục
          </Button>
        ) : null}
      </div>
    </form>
  );
}
