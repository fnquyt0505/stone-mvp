import { Field, FormSection, INPUT, TEXTAREA } from "./form-fields";

/**
 * Shared "SEO và hiển thị" section: SEO title/description plus optional order
 * and published toggle. Field names: seoTitle, seoDescription, order, isPublished.
 */
export function SeoVisibilityFields({
  defaults,
  errors,
  titleFallback,
  showOrder = true,
  showPublished = true,
  showSeo = true,
  title = "SEO và hiển thị",
  publishedName = "isPublished",
  publishedLabel = "Hiển thị trên website",
}: {
  defaults: { seoTitle: string; seoDescription: string; order?: number; isPublished?: boolean };
  errors: Partial<Record<string, string>>;
  /** What the page title falls back to, e.g. "tên danh mục". */
  titleFallback: string;
  showOrder?: boolean;
  showPublished?: boolean;
  showSeo?: boolean;
  title?: string;
  /** Checkbox field name/label (e.g. banners use "isActive"). */
  publishedName?: string;
  publishedLabel?: string;
}) {
  return (
    <FormSection title={title}>
      {showSeo ? (
        <>
          <Field
            id="seoTitle"
            label="Tiêu đề SEO"
            hint={`Để trống sẽ dùng ${titleFallback}. Tối đa 70 ký tự.`}
            error={errors.seoTitle}
          >
            {(p) => (
              <input
                {...p}
                name="seoTitle"
                defaultValue={defaults.seoTitle}
                maxLength={70}
                className={INPUT}
              />
            )}
          </Field>
          <Field
            id="seoDescription"
            label="Mô tả SEO"
            hint="Tối đa 170 ký tự."
            error={errors.seoDescription}
          >
            {(p) => (
              <textarea
                {...p}
                name="seoDescription"
                defaultValue={defaults.seoDescription}
                rows={2}
                maxLength={170}
                className={TEXTAREA}
              />
            )}
          </Field>
        </>
      ) : null}
      {showOrder ? (
        <Field
          id="order"
          label="Thứ tự"
          hint="Số nhỏ hiện trước."
          error={errors.order}
          className="max-w-40"
        >
          {(p) => (
            <input
              {...p}
              name="order"
              type="number"
              min={0}
              max={9999}
              defaultValue={defaults.order ?? 0}
              className={INPUT}
            />
          )}
        </Field>
      ) : null}
      {showPublished ? (
        <label className="flex min-h-11 items-center gap-3 font-semibold">
          <input
            type="checkbox"
            name={publishedName}
            defaultChecked={defaults.isPublished}
            className="size-5 accent-jade-700"
          />
          {publishedLabel}
        </label>
      ) : null}
    </FormSection>
  );
}
