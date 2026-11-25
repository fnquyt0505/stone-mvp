import { expect, test } from "@playwright/test";

test("blog list shows published posts newest first", async ({ page }) => {
  const res = await page.goto("/tin-tuc/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("Tin tức & kinh nghiệm");
  const titles = page.locator("main article h3");
  await expect(titles).toHaveCount(3);
  // Seeded publish dates are Jan 10/11/12: the last seeded post comes first.
  await expect(titles.first()).toContainText("So sánh đá xanh rêu và đá granite");
});

test("article page has meta line, content and Article JSON-LD", async ({ page }) => {
  await page.goto("/tin-tuc/");
  await page.getByRole("link", { name: /Phân biệt mộ cải táng và mộ an táng/ }).click();
  await expect(page).toHaveURL(/\/tin-tuc\/mau-phan-biet-mo-cai-tang-va-an-tang\/$/, {
    timeout: 20_000,
  });
  await expect(page.locator("h1")).toContainText("Phân biệt mộ cải táng và mộ an táng");
  await expect(page.locator("main time").first()).toHaveAttribute("datetime", /^2026-01-11/);

  const nodes = (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  ).flatMap((t) => JSON.parse(t)) as { "@type": string; [k: string]: unknown }[];
  const article = nodes.find((n) => n["@type"] === "Article");
  expect(article).toMatchObject({
    headline: expect.stringContaining("Phân biệt mộ cải táng"),
    datePublished: expect.stringMatching(/^2026-01-11/),
    mainEntityOfPage: expect.stringMatching(/\/tin-tuc\/mau-phan-biet-mo-cai-tang-va-an-tang\/$/),
  });

  const others = page.getByRole("region", { name: "Bài viết khác" });
  await expect(others.locator("article")).toHaveCount(2);
});

test("unknown article returns 404", async ({ page }) => {
  const res = await page.goto("/tin-tuc/khong-co-bai-nay/");
  expect(res?.status()).toBe(404);
});

test("photo library lists each gallery image once with a source link", async ({ page }) => {
  const res = await page.goto("/thu-vien-hinh-anh/");
  expect(res?.status()).toBe(200);
  const thumbs = page.getByRole("button", { name: /^Xem ảnh lớn/ });
  await expect(thumbs).toHaveCount(7);
  await expect(page.getByRole("link", { name: /^Xem: / }).first()).toHaveAttribute(
    "href",
    /^\/(cong-trinh\/)?[a-z0-9-]+\/$/,
  );
  await thumbs.first().click();
  await expect(page.locator(".yarl__root")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".yarl__root")).toBeHidden();
});
