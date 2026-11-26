"use client";

import { useState } from "react";
import { CoverImageField } from "@/components/admin/cover-image-field";
import { Field, FormSection, INPUT, TEXTAREA } from "@/components/admin/form-fields";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SeoVisibilityFields } from "@/components/admin/seo-visibility-fields";
import { TitleSlugFields } from "@/components/admin/title-slug-fields";
import { FormActions, FormMessage, useAdminForm } from "@/components/admin/use-admin-form";
import { PROVINCES } from "@/lib/provinces";
import { deleteProject, saveProject } from "@/server/actions/admin-content";
import type { AdminProject, CategoryChoice } from "@/server/queries/admin-content";

export function ProjectForm({
  project,
  categories,
}: {
  project: AdminProject | null;
  categories: CategoryChoice[];
}) {
  const [gallery, setGallery] = useState(
    project?.gallery.map((g) => ({ image: g.image, caption: g.caption ?? "" })) ?? [],
  );
  const { onSubmit, onDelete, pending, errors, message, summaryRef } = useAdminForm({
    save: saveProject,
    remove: project ? () => deleteProject(project.id) : undefined,
    editPath: (id) => `/admin/projects/${id}/`,
    listPath: "/admin/projects/",
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Thông tin công trình"
      className="grid max-w-4xl gap-6"
    >
      <FormMessage message={message} summaryRef={summaryRef} />
      <input type="hidden" name="id" value={project?.id ?? ""} readOnly />

      <FormSection title="Thông tin chính">
        <TitleSlugFields
          titleLabel="Tên công trình"
          initialTitle={project?.title ?? ""}
          initialSlug={project?.slug ?? ""}
          isNew={!project}
          urlPrefix="/cong-trinh/"
          errors={errors}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="province" label="Tỉnh / thành" required error={errors.province}>
            {(p) => (
              <select
                {...p}
                name="province"
                defaultValue={project?.province ?? ""}
                className={INPUT}
              >
                <option value="">Chọn tỉnh thành</option>
                {PROVINCES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id="categoryId" label="Loại sản phẩm" error={errors.categoryId}>
            {(p) => (
              <select
                {...p}
                name="categoryId"
                defaultValue={project?.categoryId ?? ""}
                className={INPUT}
              >
                <option value="">— Không chọn —</option>
                {categories.map((g) => (
                  <optgroup key={g.id} label={g.name}>
                    <option value={g.id}>{g.name} (chung)</option>
                    {g.children.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </Field>
        </div>
        <Field
          id="completedAt"
          label="Ngày hoàn thành"
          error={errors.completedAt}
          className="max-w-60"
        >
          {(p) => (
            <input
              {...p}
              type="date"
              name="completedAt"
              defaultValue={
                project?.completedAt ? new Date(project.completedAt).toISOString().slice(0, 10) : ""
              }
              className={INPUT}
            />
          )}
        </Field>
        <Field
          id="summary"
          label="Tóm tắt"
          hint="Hiện ở đầu trang công trình."
          error={errors.summary}
        >
          {(p) => (
            <textarea
              {...p}
              name="summary"
              defaultValue={project?.summary ?? ""}
              rows={3}
              maxLength={400}
              className={TEXTAREA}
            />
          )}
        </Field>
        <CoverImageField
          name="coverImageId"
          label="Ảnh bìa"
          defaultValue={project?.coverImage ?? null}
        />
        <label className="flex min-h-11 items-center gap-3 font-semibold">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={project?.isFeatured ?? false}
            className="size-5 accent-jade-700"
          />
          Công trình tiêu biểu (hiện ở trang chủ)
        </label>
      </FormSection>

      <FormSection title="Nội dung">
        <RichTextEditor name="content" label="Mô tả công trình" defaultValue={project?.content} />
      </FormSection>

      <FormSection title="Thư viện ảnh">
        <GalleryEditor name="gallery" rows={gallery} onChange={setGallery} error={errors.gallery} />
      </FormSection>

      <SeoVisibilityFields
        defaults={{
          seoTitle: project?.seoTitle ?? "",
          seoDescription: project?.seoDescription ?? "",
          isPublished: project?.isPublished ?? false,
        }}
        errors={errors}
        titleFallback="tên công trình"
        showOrder={false}
      />

      <FormActions
        pending={pending}
        saveLabel="Lưu công trình"
        deleteLabel={project ? "Xóa công trình" : undefined}
        onDelete={
          project
            ? () => onDelete(`Xóa công trình "${project.title}"? Thao tác này không hoàn tác được.`)
            : undefined
        }
      />
    </form>
  );
}
