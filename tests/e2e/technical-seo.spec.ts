import { expect, test } from "@playwright/test";

test.skip(({ isMobile }) => isMobile, "server responses are viewport independent");

test("sitemap lists public pages and leaves out drafts and admin", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("xml");
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1] ?? "").pathname);

  for (const path of [
    "/",
    "/cong-trinh/",
    "/tin-tuc/",
    "/lien-he/",
    "/mo-da-doi/",
    "/lang-mo-da/",
    "/gioi-thieu/",
  ]) {
    expect(urls, path).toContain(path);
  }
  expect(urls).toContain("/cong-trinh/mau-mo-da-doi-ninh-binh/");
  expect(urls).toContain("/tin-tuc/mau-phan-biet-mo-cai-tang-va-an-tang/");
  expect(urls.some((u) => u.startsWith("/admin") || u.startsWith("/api"))).toBe(false);
  // Every URL uses the trailing-slash canonical form.
  expect(urls.every((u) => u.endsWith("/"))).toBe(true);
  expect(xml).toContain("<lastmod>");
});

test("robots.txt blocks indexing while the site runs on sample data", async ({ request }) => {
  // Seed data sets isSampleData = true.
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/User-Agent: \*\s+Disallow: \/\s*$/m);
  expect(body).not.toContain("Allow: /");
});

test("pages without a cover share the default Open Graph image", async ({ page }) => {
  await page.goto("/lien-he/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/og-default\.jpg$/,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  const img = await page.request.get("/og-default.jpg");
  expect(img.status()).toBe(200);

  // Pages with their own cover keep it.
  await page.goto("/mo-da-doi/");
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute(
    "content",
    /\/samples\/mau-\d\.jpg$/,
  );
});
