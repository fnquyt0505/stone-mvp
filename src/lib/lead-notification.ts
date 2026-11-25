import { formatPhone, telHref } from "./phone";
import { absoluteUrl } from "./site-url";

export type LeadNotificationData = {
  id: string;
  name: string;
  phone: string;
  province: string | null;
  categoryName: string | null;
  message: string | null;
  sourceUrl: string;
  utm: Record<string, string> | null;
  createdAt: Date;
};

/** Escapes text for HTML email bodies and Telegram's HTML parse mode. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function rows(lead: LeadNotificationData): [string, string][] {
  const utm = lead.utm
    ? Object.entries(lead.utm)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")
    : "";
  return [
    ["Họ tên", lead.name],
    ["Số điện thoại", formatPhone(lead.phone)],
    ["Tỉnh / thành", lead.province ?? "—"],
    ["Loại sản phẩm", lead.categoryName ?? "—"],
    ["Ghi chú", lead.message ?? "—"],
    ["Trang gửi", absoluteUrl(lead.sourceUrl)],
    ...(utm ? ([["UTM", utm]] as [string, string][]) : []),
    ["Thời gian", lead.createdAt.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })],
  ];
}

/** Email subject + HTML + plain-text bodies for a new lead. */
export function buildLeadEmail(lead: LeadNotificationData) {
  const subject = `Yêu cầu báo giá mới: ${lead.name} – ${formatPhone(lead.phone)}`;
  const adminUrl = absoluteUrl("/admin/leads/");
  const tableRows = rows(lead)
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:6px 12px 6px 0;vertical-align:top">${escapeHtml(label)}</th><td style="padding:6px 0">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;font-size:16px;color:#1F2420">
<h2 style="margin:0 0 12px">Yêu cầu báo giá mới</h2>
<p><a href="${escapeHtml(telHref(lead.phone))}" style="font-size:20px;font-weight:bold">Gọi ngay ${escapeHtml(formatPhone(lead.phone))}</a></p>
<table cellpadding="0" cellspacing="0">${tableRows}</table>
<p><a href="${escapeHtml(adminUrl)}">Mở danh sách lead</a></p>
</div>`;
  const text = [
    "Yêu cầu báo giá mới",
    ...rows(lead).map(([label, value]) => `${label}: ${value}`),
    `Danh sách lead: ${adminUrl}`,
  ].join("\n");
  return { subject, html, text };
}

/** Telegram message (HTML parse mode). */
export function buildLeadTelegram(lead: LeadNotificationData): string {
  return [
    "<b>🔔 Yêu cầu báo giá mới</b>",
    ...rows(lead).map(([label, value]) => `<b>${escapeHtml(label)}:</b> ${escapeHtml(value)}`),
  ].join("\n");
}
