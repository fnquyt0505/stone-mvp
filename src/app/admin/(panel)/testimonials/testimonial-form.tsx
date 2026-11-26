"use client";

import { Field, FormSection, INPUT, TEXTAREA } from "@/components/admin/form-fields";
import { SeoVisibilityFields } from "@/components/admin/seo-visibility-fields";
import { FormActions, FormMessage, useAdminForm } from "@/components/admin/use-admin-form";
import { PROVINCES } from "@/lib/provinces";
import { deleteTestimonial, saveTestimonial } from "@/server/actions/admin-misc";

export type TestimonialValues = {
  id: string;
  name: string;
  province: string | null;
  content: string;
  rating: number | null;
  order: number;
  isPublished: boolean;
};

export function TestimonialForm({ item }: { item: TestimonialValues | null }) {
  const { onSubmit, onDelete, pending, errors, message, summaryRef } = useAdminForm({
    save: saveTestimonial,
    remove: item ? () => deleteTestimonial(item.id) : undefined,
    editPath: (id) => `/admin/testimonials/${id}/`,
    listPath: "/admin/testimonials/",
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Thông tin đánh giá"
      className="grid max-w-3xl gap-6"
    >
      <FormMessage message={message} summaryRef={summaryRef} />
      <input type="hidden" name="id" value={item?.id ?? ""} readOnly />
      <FormSection title="Đánh giá của khách hàng">
        <p className="rounded-md bg-jade-50 p-3 text-stone-900">
          Chỉ đăng đánh giá thật, đã được khách hàng đồng ý. Không tự viết đánh giá.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Tên khách hàng" required error={errors.name}>
            {(p) => (
              <input
                {...p}
                name="name"
                defaultValue={item?.name ?? ""}
                maxLength={80}
                className={INPUT}
              />
            )}
          </Field>
          <Field id="province" label="Tỉnh / thành" error={errors.province}>
            {(p) => (
              <select {...p} name="province" defaultValue={item?.province ?? ""} className={INPUT}>
                <option value="">— Không ghi —</option>
                {PROVINCES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
        <Field id="content" label="Nội dung đánh giá" required error={errors.content}>
          {(p) => (
            <textarea
              {...p}
              name="content"
              defaultValue={item?.content ?? ""}
              rows={5}
              maxLength={1000}
              className={TEXTAREA}
            />
          )}
        </Field>
        <Field
          id="rating"
          label="Số sao"
          hint="Để trống nếu khách không chấm sao."
          error={errors.rating}
          className="max-w-48"
        >
          {(p) => (
            <select
              {...p}
              name="rating"
              defaultValue={item?.rating ? String(item.rating) : ""}
              className={INPUT}
            >
              <option value="">— Không có —</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} sao
                </option>
              ))}
            </select>
          )}
        </Field>
      </FormSection>
      <SeoVisibilityFields
        defaults={{
          seoTitle: "",
          seoDescription: "",
          order: item?.order ?? 0,
          isPublished: item?.isPublished ?? false,
        }}
        errors={errors}
        titleFallback=""
        showSeo={false}
        title="Hiển thị"
      />
      <FormActions
        pending={pending}
        saveLabel="Lưu đánh giá"
        deleteLabel={item ? "Xóa đánh giá" : undefined}
        onDelete={item ? () => onDelete(`Xóa đánh giá của "${item.name}"?`) : undefined}
      />
    </form>
  );
}
