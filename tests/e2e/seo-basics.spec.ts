import { expect, test } from "@playwright/test";

/**
 * Mirrors Lighthouse's SEO audits (title, meta description, status code,
 * indexability, canonical, lang, viewport, link text, crawlable anchors,
 * image alt, legible font sizes) for the key public pages.
 */
const PAGES = [
  "/",
  "/mo-da-doi/",
  "/lang-mo-da/",
  "/cong-trinh/",
  "/cong-trinh/mau-mo-da-doi-ninh-binh/",
  "/tin-tuc/",
  "/tin-tuc/mau-phan-biet-mo-cai-tang-va-an-tang/",
  "/thu-vien-hinh-anh/",
];
const GENERIC_LINK_TEXT = ["click here", "bấm vào đây", "xem thêm", "tại đây", "here", "more"];

for (const path of PAGES) {
  test(`SEO basics: ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status(), "http-status-code").toBe(200);

    expect((await page.title()).length, "document-title").toBeGreaterThan(10);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.trim().length ?? 0, "meta-description").toBeGreaterThan(30);

    await expect(page.locator("html"), "html-has-lang").toHaveAttribute("lang", "vi");
    await expect(page.locator('meta[name="viewport"]'), "viewport").toHaveCount(1);
    await expect(
      page.locator('meta[name="robots"][content*="noindex"]'),
      "is-crawlable",
    ).toHaveCount(0);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical, "canonical").toMatch(
      new RegExp(`^https?://[^/]+${path.replace(/\//g, "\\/")}$`),
    );

    await expect(page.locator("h1"), "single h1").toHaveCount(1);

    const anchors = await page.locator("a").evaluateAll((els) =>
      els.map((a) => ({
        href: a.getAttribute("href"),
        text: (a.textContent ?? "").trim().toLowerCase(),
        label: a.getAttribute("aria-label"),
      })),
    );
    for (const a of anchors) {
      expect(a.href, "crawlable-anchors").toBeTruthy();
      expect(a.href, "crawlable-anchors").not.toMatch(/^javascript:/i);
      if (!a.label) expect(GENERIC_LINK_TEXT, `link-text "${a.text}"`).not.toContain(a.text);
    }

    const missingAlt = await page.locator("img:not([alt])").count();
    expect(missingAlt, "image-alt").toBe(0);

    // font-size audit: >= 60% of text must be >= 12px; we require all visible text >= 12px.
    const tinyText = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let tiny = 0;
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const el = n.parentElement;
        if (
          !el ||
          !n.textContent?.trim() ||
          el.closest("[aria-hidden=true], .sr-only, script, style")
        )
          continue;
        if (parseFloat(getComputedStyle(el).fontSize) < 12) tiny++;
      }
      return tiny;
    });
    expect(tinyText, "font-size").toBe(0);
  });
}
