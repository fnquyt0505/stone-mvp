import { expect, test } from "@playwright/test";

test("home page shows every section with a single h1", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("h1")).toHaveCount(1);
  for (const name of [
    "Sản phẩm của chúng tôi",
    "Công trình tiêu biểu",
    "Quy trình đặt hàng",
    "Khách hàng nói về chúng tôi",
    "Nhận tư vấn và báo giá miễn phí",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }

  // Six category groups, each linking to its category page.
  const categories = page.getByRole("region", { name: "Sản phẩm của chúng tôi" });
  await expect(categories.getByRole("article")).toHaveCount(6);
  await expect(categories.getByRole("link", { name: "Lăng mộ đá" })).toHaveAttribute(
    "href",
    "/lang-mo-da/",
  );

  // 7-step process keeps the "excluding foundation" wording.
  await expect(page.getByText("không gồm phần móng").first()).toBeVisible();

  // Hero CTAs.
  const hero = page.locator("section").first();
  await expect(hero.getByRole("link", { name: "Nhận báo giá" })).toBeVisible();
  await expect(hero.getByRole("link", { name: /Gọi ngay/ })).toHaveAttribute("href", /^tel:/);
});

test("home page has canonical and description metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/$/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Lỗ Ban/);
});
