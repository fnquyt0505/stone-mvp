"use client";

import { FormSection } from "@/components/admin/form-fields";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SeoVisibilityFields } from "@/components/admin/seo-visibility-fields";
import { TitleSlugFields } from "@/components/admin/title-slug-fields";
import { FormActions, FormMessage, useAdminForm } from "@/components/admin/use-admin-form";
import { deletePage, savePage } from "@/server/actions/admin-content";
import type { AdminPage } from "@/server/queries/admin-content";

export function PageForm({ page }: { page: AdminPage | null }) {
  const { onSubmit, onDelete, pending, errors, message, summaryRef } = useAdminForm({
    save: savePage,
    remove: page ? () => deletePage(page.id) : undefined,
    editPath: (id) => `/admin/pages/${id}/`,
    listPath: "/admin/pages/",
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Thông tin trang"
      className="grid max-w-4xl gap-6"
    >
      <FormMessage message={message} summaryRef={summaryRef} />
      <input type="hidden" name="id" value={page?.id ?? ""} readOnly />

      <FormSection title="Thông tin chính">
        <TitleSlugFields
          titleLabel="Tiêu đề trang"
          initialTitle={page?.title ?? ""}
          initialSlug={page?.slug ?? ""}
          isNew={!page}
          urlPrefix="/"
          errors={errors}
        />
      </FormSection>

      <FormSection title="Nội dung">
        <RichTextEditor name="content" label="Nội dung trang" defaultValue={page?.content} />
      </FormSection>

      <SeoVisibilityFields
        defaults={{ seoTitle: page?.seoTitle ?? "", seoDescription: page?.seoDescription ?? "" }}
        errors={errors}
        titleFallback="tiêu đề trang"
        showOrder={false}
        showPublished={false}
      />

      <FormActions
        pending={pending}
        saveLabel="Lưu trang"
        deleteLabel={page ? "Xóa trang" : undefined}
        onDelete={
          page
            ? () => onDelete(`Xóa trang "${page.title}"? Thao tác này không hoàn tác được.`)
            : undefined
        }
      />
    </form>
  );
}
