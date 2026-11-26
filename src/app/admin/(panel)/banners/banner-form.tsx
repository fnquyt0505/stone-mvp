"use client";

import { Field, FormSection, INPUT } from "@/components/admin/form-fields";
import { SeoVisibilityFields } from "@/components/admin/seo-visibility-fields";
import { FormActions, FormMessage, useAdminForm } from "@/components/admin/use-admin-form";
import { deleteBanner, saveBanner } from "@/server/actions/admin-misc";

export type BannerValues = {
  id: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  order: number;
  isActive: boolean;
};

export function BannerForm({ item }: { item: BannerValues | null }) {
  const { onSubmit, onDelete, pending, errors, message, summaryRef } = useAdminForm({
    save: saveBanner,
    remove: item ? () => deleteBanner(item.id) : undefined,
    editPath: (id) => `/admin/banners/${id}/`,
    listPath: "/admin/banners/",
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Thông tin banner"
      className="grid max-w-3xl gap-6"
    >
      <FormMessage message={message} summaryRef={summaryRef} />
      <input type="hidden" name="id" value={item?.id ?? ""} readOnly />
      <FormSection title="Nội dung dải khuyến mãi">
        <p className="text-stone-700">
          Hiện ở dải trên cùng mọi trang. Nếu có nhiều banner đang bật, banner có thứ tự nhỏ nhất
          được hiện.
        </p>
        <Field id="title" label="Tiêu đề" required error={errors.title}>
          {(p) => (
            <input
              {...p}
              name="title"
              defaultValue={item?.title ?? ""}
              maxLength={120}
              className={INPUT}
            />
          )}
        </Field>
        <Field id="subtitle" label="Phụ đề" error={errors.subtitle}>
          {(p) => (
            <input
              {...p}
              name="subtitle"
              defaultValue={item?.subtitle ?? ""}
              maxLength={200}
              className={INPUT}
            />
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <Field id="ctaLabel" label="Chữ trên nút" hint="Ví dụ: Gọi ngay" error={errors.ctaLabel}>
            {(p) => (
              <input
                {...p}
                name="ctaLabel"
                defaultValue={item?.ctaLabel ?? ""}
                maxLength={30}
                className={INPUT}
              />
            )}
          </Field>
          <Field
            id="ctaHref"
            label="Liên kết của nút"
            hint="Để trống sẽ gọi hotline. Ví dụ: tel:0912345678, /lien-he/ hoặc https://…"
            error={errors.ctaHref}
          >
            {(p) => (
              <input
                {...p}
                name="ctaHref"
                defaultValue={item?.ctaHref ?? ""}
                maxLength={300}
                className={INPUT}
              />
            )}
          </Field>
        </div>
      </FormSection>
      <SeoVisibilityFields
        defaults={{
          seoTitle: "",
          seoDescription: "",
          order: item?.order ?? 0,
          isPublished: item?.isActive ?? false,
        }}
        errors={errors}
        titleFallback=""
        showSeo={false}
        title="Hiển thị"
        publishedName="isActive"
        publishedLabel="Đang bật"
      />
      <FormActions
        pending={pending}
        saveLabel="Lưu banner"
        deleteLabel={item ? "Xóa banner" : undefined}
        onDelete={item ? () => onDelete(`Xóa banner "${item.title}"?`) : undefined}
      />
    </form>
  );
}
