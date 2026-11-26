"use client";

import { useState } from "react";
import { Field, FormSection, INPUT, TEXTAREA } from "@/components/admin/form-fields";
import { RowsEditor } from "@/components/admin/rows-editor";
import { FormActions, FormMessage, useAdminForm } from "@/components/admin/use-admin-form";
import { formatPhone } from "@/lib/phone";
import type { SiteSettings } from "@/schemas/site-settings";
import { saveSettings } from "@/server/actions/admin-misc";

function Text({
  id,
  label,
  hint,
  value,
  errors,
  max = 200,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  errors: Partial<Record<string, string>>;
  max?: number;
}) {
  return (
    <Field id={id} label={label} hint={hint} error={errors[id]}>
      {(p) => <input {...p} name={id} defaultValue={value} maxLength={max} className={INPUT} />}
    </Field>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [achievements, setAchievements] = useState(settings.achievements);
  const { onSubmit, pending, errors, message, summaryRef } = useAdminForm({
    save: saveSettings,
    editPath: () => "/admin/settings/",
    listPath: "/admin/settings/",
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Cài đặt website"
      className="grid max-w-3xl gap-6"
    >
      <FormMessage message={message} summaryRef={summaryRef} />

      <FormSection title="Thông tin liên hệ">
        <Text
          id="brandName"
          label="Tên thương hiệu"
          value={settings.brandName}
          errors={errors}
          max={80}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text
            id="hotline"
            label="Hotline"
            hint="Nút Gọi ngay dùng số này."
            value={settings.hotline ? formatPhone(settings.hotline) : ""}
            errors={errors}
            max={20}
          />
          <Text
            id="zalo"
            label="Số Zalo"
            hint="Để trống sẽ dùng hotline."
            value={settings.zalo ? formatPhone(settings.zalo) : ""}
            errors={errors}
            max={20}
          />
        </div>
        <Text id="email" label="Email" value={settings.email ?? ""} errors={errors} max={120} />
        <Text
          id="address"
          label="Địa chỉ xưởng"
          value={settings.address}
          errors={errors}
          max={300}
        />
        <Text
          id="workingHours"
          label="Giờ làm việc"
          hint="Ví dụ: 7:00 – 21:00, tất cả các ngày"
          value={settings.workingHours}
          errors={errors}
          max={120}
        />
        <Field
          id="mapEmbedUrl"
          label="Bản đồ Google Maps"
          hint="Trên Google Maps: Chia sẻ → Nhúng bản đồ → Sao chép HTML, rồi dán vào đây."
          error={errors.mapEmbedUrl}
        >
          {(p) => (
            <textarea
              {...p}
              name="mapEmbedUrl"
              defaultValue={settings.mapEmbedUrl ?? ""}
              rows={3}
              className={TEXTAREA}
            />
          )}
        </Field>
      </FormSection>

      <FormSection title="Mạng xã hội">
        <Text
          id="facebook"
          label="Facebook"
          value={settings.social.facebook ?? ""}
          errors={errors}
          max={300}
        />
        <Text
          id="tiktok"
          label="TikTok"
          value={settings.social.tiktok ?? ""}
          errors={errors}
          max={300}
        />
        <Text
          id="youtube"
          label="YouTube"
          value={settings.social.youtube ?? ""}
          errors={errors}
          max={300}
        />
      </FormSection>

      <FormSection title="Thành tích (trang chủ)">
        <p className="text-stone-700">Chỉ ghi số liệu thật, có thể chứng minh. Tối đa 6 mục.</p>
        <RowsEditor
          name="achievements"
          itemLabel="Thành tích"
          addLabel="Thêm thành tích"
          rows={achievements}
          onChange={(rows) => setAchievements(rows.slice(0, 6))}
          error={errors.achievements}
          columns={[
            { key: "value", label: "Số liệu (VD: 15+)", max: 20 },
            { key: "label", label: "Mô tả (VD: Năm kinh nghiệm)", max: 60 },
          ]}
        />
      </FormSection>

      <FormSection title="Người biên soạn nội dung">
        <Text
          id="authorName"
          label="Họ tên"
          hint="Để trống sẽ ẩn hộp tác giả."
          value={settings.author?.name ?? ""}
          errors={errors}
          max={80}
        />
        <Text
          id="authorRole"
          label="Vai trò"
          value={settings.author?.role ?? ""}
          errors={errors}
          max={80}
        />
        <Field id="authorBio" label="Giới thiệu ngắn" error={errors.authorBio}>
          {(p) => (
            <textarea
              {...p}
              name="authorBio"
              defaultValue={settings.author?.bio ?? ""}
              rows={3}
              maxLength={400}
              className={TEXTAREA}
            />
          )}
        </Field>
      </FormSection>

      <FormSection title="Dữ liệu mẫu">
        <label className="flex min-h-11 items-center gap-3 font-semibold">
          <input
            type="checkbox"
            name="isSampleData"
            defaultChecked={settings.isSampleData}
            className="size-5 accent-jade-700"
          />
          Website đang dùng dữ liệu mẫu ([MẪU])
        </label>
        <p className="text-stone-700">
          Khi còn chọn, Google sẽ không lập chỉ mục website (robots.txt chặn toàn bộ). Bỏ chọn khi
          đã thay toàn bộ thông tin thật và sẵn sàng ra mắt.
        </p>
      </FormSection>

      <FormActions pending={pending} saveLabel="Lưu cài đặt" />
    </form>
  );
}
