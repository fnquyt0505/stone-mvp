import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * axe-core (the engine behind Lighthouse's accessibility score) on the main
 * public pages, WCAG 2.x A/AA + best-practice rules. Anything above "minor" fails.
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
  "/huong-dan-dat-hang/",
  "/lien-he/",
  "/gioi-thieu/",
  "/admin/login/",
];

for (const path of PAGES) {
  test(`no serious accessibility issues: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      // Third-party iframes (Turnstile, maps) are outside our control.
      .exclude("iframe")
      .analyze();
    const blocking = results.violations
      .filter((v) => v.impact !== "minor")
      .map((v) => ({
        id: v.id,
        help: v.help,
        nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
      }));
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}
