/**
 * Thin GA4 wrapper. Safe to call before (or without) the gtag script:
 * events are dropped silently when GA is not configured.
 */
export type ContactChannel = "call" | "zalo" | "tiktok" | "quote";
export type ContactPlacement = "floating" | "bottom_bar" | "header" | "top_bar" | "banner" | "page";

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", name, params);
  } catch {
    // Analytics must never break the page.
  }
}

/** Standard event for every Gọi / Zalo / TikTok / Báo giá click (PRD §4). */
export function trackContactClick(channel: ContactChannel, placement: ContactPlacement): void {
  trackEvent("contact_click", {
    channel,
    placement,
    page_path: typeof window === "undefined" ? undefined : window.location.pathname,
  });
}
