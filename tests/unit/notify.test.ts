import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildLeadEmail, buildLeadTelegram, escapeHtml } from "@/lib/lead-notification";
import { notifyNewLead, sendLeadEmail, sendLeadTelegram } from "@/server/notify";

const lead = {
  id: "lead1",
  name: "Nguyễn <b>Văn</b> A",
  phone: "0912345678",
  province: "Ninh Bình",
  categoryName: "Mộ đá đôi",
  message: "Mộ đôi\n3 × 4 m & có cuốn thư",
  sourceUrl: "/mo-da-doi/",
  utm: { source: "facebook" },
  createdAt: new Date("2026-11-26T03:00:00Z"),
};

const okResponse = () => new Response(JSON.stringify({ id: "x" }), { status: 200 });

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("lead notification content", () => {
  it("escapes visitor input in HTML", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;",
    );
    const { html, text, subject } = buildLeadEmail(lead);
    expect(html).not.toContain("<b>Văn</b>");
    expect(html).toContain("Nguyễn &lt;b&gt;Văn&lt;/b&gt; A");
    expect(html).toContain('href="tel:+84912345678"');
    expect(html).toContain("Mộ đôi<br>3 × 4 m &amp; có cuốn thư");
    expect(html).toContain("https://example.com/mo-da-doi/");
    expect(text).toContain("Số điện thoại: 0912 345 678");
    expect(text).toContain("UTM: source=facebook");
    expect(subject).toBe("Yêu cầu báo giá mới: Nguyễn <b>Văn</b> A – 0912 345 678");
  });

  it("formats a Telegram HTML message", () => {
    const msg = buildLeadTelegram(lead);
    expect(msg).toContain("<b>Loại sản phẩm:</b> Mộ đá đôi");
    expect(msg).toContain("Nguyễn &lt;b&gt;Văn&lt;/b&gt; A");
  });
});

describe("senders", () => {
  it("skip silently when not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendLeadEmail(lead)).toBe(false);
    expect(await sendLeadTelegram(lead)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("call Resend and Telegram with the expected payloads", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("LEAD_NOTIFY_EMAIL", "a@example.com, b@example.com");
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "123:abc");
    vi.stubEnv("TELEGRAM_CHAT_ID", "-100");
    const fetchMock = vi.fn().mockImplementation(async () => okResponse());
    vi.stubGlobal("fetch", fetchMock);

    await notifyNewLead(lead);

    const [emailCall, tgCall] = fetchMock.mock.calls as [string, RequestInit][];
    expect(emailCall?.[0]).toBe("https://api.resend.com/emails");
    expect(emailCall?.[1].headers).toMatchObject({ Authorization: "Bearer re_test" });
    expect(JSON.parse(String(emailCall?.[1].body))).toMatchObject({
      to: ["a@example.com", "b@example.com"],
      subject: expect.stringContaining("0912 345 678"),
    });
    expect(tgCall?.[0]).toBe("https://api.telegram.org/bot123:abc/sendMessage");
    expect(JSON.parse(String(tgCall?.[1].body))).toMatchObject({
      chat_id: "-100",
      parse_mode: "HTML",
    });
  });
});

describe("notifyNewLead", () => {
  it("never throws and logs failures with a masked phone", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("LEAD_NOTIFY_EMAIL", "a@example.com");
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "123:abc");
    vi.stubEnv("TELEGRAM_CHAT_ID", "-100");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response("bad key", { status: 401 }))
        .mockRejectedValueOnce(new Error("network down")),
    );
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(notifyNewLead(lead)).resolves.toBeUndefined();

    expect(log).toHaveBeenCalledTimes(2);
    const logged = JSON.stringify(log.mock.calls);
    expect(logged).toContain("091****678");
    expect(logged).not.toContain("0912345678");
  });
});
