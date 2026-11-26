"use client";

import { CoverImageField } from "@/components/admin/cover-image-field";
import { Field, FormSection, INPUT, TEXTAREA } from "@/components/admin/form-fields";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SeoVisibilityFields } from "@/components/admin/seo-visibility-fields";
import { TitleSlugFields } from "@/components/admin/title-slug-fields";
import { FormActions, FormMessage, useAdminForm } from "@/components/admin/use-admin-form";
import { dateToVnLocalInput } from "@/lib/vn-time";
import { deletePost, savePost } from "@/server/actions/admin-content";
import type { AdminPost } from "@/server/queries/admin-content";

export function PostForm({ post }: { post: AdminPost | null }) {
  const { onSubmit, onDelete, pending, errors, message, summaryRef } = useAdminForm({
    save: savePost,
    remove: post ? () => deletePost(post.id) : undefined,
    editPath: (id) => `/admin/posts/${id}/`,
    listPath: "/admin/posts/",
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Thông tin bài viết"
      className="grid max-w-4xl gap-6"
    >
      <FormMessage message={message} summaryRef={summaryRef} />
      <input type="hidden" name="id" value={post?.id ?? ""} readOnly />

      <FormSection title="Thông tin chính">
        <TitleSlugFields
          titleLabel="Tiêu đề"
          initialTitle={post?.title ?? ""}
          initialSlug={post?.slug ?? ""}
          isNew={!post}
          urlPrefix="/tin-tuc/"
          errors={errors}
        />
        <Field
          id="publishedAt"
          label="Ngày giờ đăng (giờ Việt Nam)"
          hint="Để trống: lưu nháp, chưa hiện trên website. Chọn giờ trong tương lai để hẹn giờ đăng."
          error={errors.publishedAt}
          className="max-w-xs"
        >
          {(p) => (
            <input
              {...p}
              type="datetime-local"
              name="publishedAt"
              defaultValue={dateToVnLocalInput(post?.publishedAt ?? null)}
              className={INPUT}
            />
          )}
        </Field>
        <Field
          id="excerpt"
          label="Tóm tắt"
          hint="Hiện trong danh sách tin tức."
          error={errors.excerpt}
        >
          {(p) => (
            <textarea
              {...p}
              name="excerpt"
              defaultValue={post?.excerpt ?? ""}
              rows={3}
              maxLength={400}
              className={TEXTAREA}
            />
          )}
        </Field>
        <CoverImageField
          name="coverImageId"
          label="Ảnh bìa"
          defaultValue={post?.coverImage ?? null}
        />
      </FormSection>

      <FormSection title="Nội dung">
        <RichTextEditor name="content" label="Nội dung bài viết" defaultValue={post?.content} />
      </FormSection>

      <SeoVisibilityFields
        defaults={{ seoTitle: post?.seoTitle ?? "", seoDescription: post?.seoDescription ?? "" }}
        errors={errors}
        titleFallback="tiêu đề bài viết"
        showOrder={false}
        showPublished={false}
      />

      <FormActions
        pending={pending}
        saveLabel="Lưu bài viết"
        deleteLabel={post ? "Xóa bài viết" : undefined}
        onDelete={
          post
            ? () => onDelete(`Xóa bài viết "${post.title}"? Thao tác này không hoàn tác được.`)
            : undefined
        }
      />
    </form>
  );
}
