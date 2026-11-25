import "server-only";
import {
  buildLeadEmail,
  buildLeadTelegram,
  type LeadNotificationData,
} from "@/lib/lead-notification";

const TIMEOUT_MS = 8000;

function maskPhone(phone: string): string {
  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}

async function post(url: string, init: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res;
}

/** Sends the lead email through Resend's REST API. Returns false when not configured. */
export async function sendLeadEmail(lead: LeadNotificationData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.LEAD_NOTIFY_EMAIL?.split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (!apiKey || !to?.length) return false;

  const { subject, html, text } = buildLeadEmail(lead);
  await post("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // Resend's shared test sender works without domain setup; use a verified domain in production.
      from: process.env.LEAD_NOTIFY_FROM?.trim() || "Website <onboarding@resend.dev>",
      to,
      subject,
      html,
      text,
    }),
  });
  return true;
}

/** Sends the lead to a Telegram chat. Returns false when not configured. */
export async function sendLeadTelegram(lead: LeadNotificationData): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return false;

  await post(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildLeadTelegram(lead),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  return true;
}

/**
 * Fans out new-lead notifications. Never throws: the lead is already saved,
 * so failures are only logged (with a masked phone number).
 */
export async function notifyNewLead(lead: LeadNotificationData): Promise<void> {
  const results = await Promise.allSettled([sendLeadEmail(lead), sendLeadTelegram(lead)]);
  const channels = ["email", "telegram"] as const;
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[lead] ${channels[i]} notification failed`, {
        leadId: lead.id,
        phone: maskPhone(lead.phone),
        error: r.reason instanceof Error ? r.reason.message : String(r.reason),
      });
    }
  });
}
