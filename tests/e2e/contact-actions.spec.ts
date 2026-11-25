import { expect, test, type Page } from "@playwright/test";

/** Captures gtag("event", ...) calls without loading Google Analytics. */
async function mockGtag(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __events: unknown[][]; gtag: (...args: unknown[]) => void };
    w.__events = [];
    w.gtag = (...args: unknown[]) => w.__events.push(args);
  });
}

const events = (page: Page) =>
  page.evaluate(() => (window as unknown as { __events: unknown[][] }).__events);

test.describe("floating contact (desktop)", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");

  test("shows call and Zalo buttons with correct links and tracks clicks", async ({ page }) => {
    await mockGtag(page);
    await page.goto("/");

    const floating = page.getByRole("group", { name: "Liên hệ nhanh" });
    const call = floating.getByRole("link", { name: /^Gọi ngay \d/ });
    await expect(call).toHaveAttribute("href", /^tel:\+84\d{9}$/);
    const zalo = floating.getByRole("link", { name: "Nhắn tin Zalo" });
    await expect(zalo).toHaveAttribute("href", /^https:\/\/zalo\.me\/0\d{9}$/);

    // Prevent navigation so we can inspect the tracked event.
    await zalo.evaluate((a) => a.addEventListener("click", (e) => e.preventDefault()));
    await zalo.click();
    expect(await events(page)).toContainEqual([
      "event",
      "contact_click",
      { channel: "zalo", placement: "floating", page_path: "/" },
    ]);

    await expect(page.getByRole("navigation", { name: "Liên hệ nhanh" })).toBeHidden();
  });

  test("back-to-top appears after scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 300 });
    await page.goto("/");
    // Hidden from assistive tech until visible, so locate it by its label attribute.
    const top = page.locator('button[aria-label="Lên đầu trang"]');
    await expect(top).toHaveCSS("opacity", "0");
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    );
    await expect(top).toHaveCSS("opacity", "1");
    await expect(page.getByRole("button", { name: "Lên đầu trang" })).toBeVisible();
  });
});

test.describe("sticky bottom bar (mobile)", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("offers Gọi · Zalo · Báo giá in one tap", async ({ page }) => {
    await mockGtag(page);
    await page.goto("/");
    const bar = page.getByRole("navigation", { name: "Liên hệ nhanh" });
    await expect(bar).toBeVisible();
    await expect(bar.getByRole("link", { name: "Gọi ngay" })).toHaveAttribute("href", /^tel:/);
    await expect(bar.getByRole("link", { name: "Nhắn Zalo" })).toHaveAttribute("href", /zalo\.me/);
    const quote = bar.getByRole("link", { name: "Báo giá" });
    await expect(quote).toHaveAttribute("href", "/lien-he/#bao-gia");

    const call = bar.getByRole("link", { name: "Gọi ngay" });
    await call.evaluate((a) => a.addEventListener("click", (e) => e.preventDefault()));
    await call.click();
    expect(await events(page)).toContainEqual([
      "event",
      "contact_click",
      { channel: "call", placement: "bottom_bar", page_path: "/" },
    ]);

    // The floating desktop column is not shown on mobile.
    await expect(page.getByRole("link", { name: "Nhắn tin Zalo" })).toBeHidden();
  });
});
