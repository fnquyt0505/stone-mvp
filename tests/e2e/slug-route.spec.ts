import { expect, test } from "@playwright/test";

test("child category resolves with breadcrumb JSON-LD", async ({ page }) => {
  const res = await page.goto("/mo-da-doi/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("Mộ đá đôi");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/mo-da-doi\/$/);

  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  // A script may hold one node or an array of nodes.
  const breadcrumb = jsonLd
    .flatMap((t) => JSON.parse(t))
    .find((d) => d["@type"] === "BreadcrumbList");
  expect(breadcrumb.itemListElement.map((i: { name: string }) => i.name)).toEqual([
    "Trang chủ",
    "Lăng mộ đá",
    "Mộ đá đôi",
  ]);
});

test("top-level category resolves", async ({ page }) => {
  const res = await page.goto("/lang-mo-da/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("Lăng mộ đá");
});

test("adds the trailing slash", async ({ page }) => {
  await page.goto("/mo-da-doi");
  await expect(page).toHaveURL(/\/mo-da-doi\/$/);
});

test("redirects uppercase URLs to the lowercase canonical", async ({ page, request }) => {
  const res = await request.get("/Mo-Da-Doi/", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toMatch(/\/mo-da-doi\/$/);
  await page.goto("/Mo-Da-Doi/");
  await expect(page).toHaveURL(/\/mo-da-doi\/$/);
});

for (const path of ["/khong-ton-tai/", "/mo--da/"]) {
  test(`unknown or invalid slug ${path} returns 404`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Không tìm thấy trang");
  });
}
