"use client";

import { useState } from "react";
import { slugify } from "@/lib/slugify";
import { Field, INPUT } from "./form-fields";

/**
 * Title + slug pair. For new items the slug follows the title until staff edit
 * it by hand. `urlPrefix` shows where the page will live, e.g. "/tin-tuc/".
 */
export function TitleSlugFields({
  titleLabel,
  initialTitle,
  initialSlug,
  isNew,
  urlPrefix,
  errors,
}: {
  titleLabel: string;
  initialTitle: string;
  initialSlug: string;
  isNew: boolean;
  urlPrefix: string;
  errors: Partial<Record<string, string>>;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [touched, setTouched] = useState(!isNew);
  return (
    <>
      <Field id="title" label={titleLabel} required error={errors.title}>
        {(p) => (
          <input
            {...p}
            name="title"
            value={title}
            maxLength={160}
            className={INPUT}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!touched) setSlug(slugify(e.target.value));
            }}
          />
        )}
      </Field>
      <Field
        id="slug"
        label="Đường dẫn"
        hint={`Địa chỉ trang: ${urlPrefix}${slug || "…"}/`}
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
              setTouched(true);
            }}
          />
        )}
      </Field>
    </>
  );
}
