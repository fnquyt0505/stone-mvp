"use client";

import { useState } from "react";
import { CoverImageField } from "@/components/admin/cover-image-field";
import { Field, FormSection, INPUT, TEXTAREA } from "@/components/admin/form-fields";
import { slugify } from "@/lib/slugify";
import type { CategoryFieldErrors } from "@/schemas/admin-category";
import type { CategoryFormValues } from "./category-form";

/** "Thông tin chính": name (auto slug), slug, parent, menu column, excerpt, prices, cover. */
export function CategoryBasics({
  initial,
  parents,
  errors,
}: {
  initial: CategoryFormValues;
  parents: { id: string; name: string }[];
  errors: CategoryFieldErrors;
}) {
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  // New categories derive the slug from the name until it is edited by hand.
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [parentId, setParentId] = useState(initial.parentId);

  return (
    <FormSection title="Thông tin chính">
      <Field id="name" label="Tên danh mục" required error={errors.name}>
        {(p) => (
          <input
            {...p}
            name="name"
            value={name}
            maxLength={120}
            className={INPUT}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        )}
      </Field>
      <Field
        id="slug"
        label="Đường dẫn"
        hint={`Trang sẽ ở địa chỉ /${slug || "…"}/`}
        error={errors.slug}
      >
        {(p) => (
          <input
            {...p}
            name="slug"
            value={slug}
            maxLength={120}
            className={INPUT}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
        )}
      </Field>
      <Field
        id="parentId"
        label="Thuộc nhóm"
        hint={
          initial.hasChildren
            ? "Đang có danh mục con nên phải là nhóm cấp 1."
            : "Để trống nếu đây là nhóm cấp 1 trên menu."
        }
        error={errors.parentId}
      >
        {(p) => (
          <select
            {...p}
            name="parentId"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            disabled={initial.hasChildren}
            className={INPUT}
          >
            <option value="">— Nhóm cấp 1 —</option>
            {parents.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        )}
      </Field>
      {!parentId ? (
        <Field
          id="menuGroup"
          label="Tên cột trên menu"
          hint="Mặc định dùng tên danh mục."
          error={errors.menuGroup}
        >
          {(p) => (
            <input
              {...p}
              name="menuGroup"
              defaultValue={initial.menuGroup}
              maxLength={60}
              className={INPUT}
            />
          )}
        </Field>
      ) : null}
      <Field
        id="excerpt"
        label="Mô tả ngắn"
        hint="Hiện trên thẻ danh mục và đầu trang."
        error={errors.excerpt}
      >
        {(p) => (
          <textarea
            {...p}
            name="excerpt"
            defaultValue={initial.excerpt}
            rows={2}
            maxLength={300}
            className={TEXTAREA}
          />
        )}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="priceFrom"
          label="Giá từ (triệu đồng)"
          hint="Ví dụ: 20 hoặc 1,5. Để trống nếu chưa có."
          error={errors.priceFrom}
        >
          {(p) => (
            <input
              {...p}
              name="priceFrom"
              defaultValue={initial.priceFrom}
              inputMode="decimal"
              className={INPUT}
            />
          )}
        </Field>
        <Field id="priceTo" label="Giá đến (triệu đồng)" error={errors.priceTo}>
          {(p) => (
            <input
              {...p}
              name="priceTo"
              defaultValue={initial.priceTo}
              inputMode="decimal"
              className={INPUT}
            />
          )}
        </Field>
      </div>
      <CoverImageField name="coverImageId" label="Ảnh bìa" defaultValue={initial.cover} />
    </FormSection>
  );
}
