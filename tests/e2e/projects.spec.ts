import { expect, test } from "@playwright/test";

test("lists all published projects", async ({ page }) => {
  const res = await page.goto("/cong-trinh/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("Công trình đã thi công");
  await expect(page.getByRole("status")).toHaveText("Có 6 công trình.");
  await expect(page.locator("main article")).toHaveCount(6);
  // 6 projects fit on one page.
  await expect(page.getByRole("navigation", { name: "Phân trang" })).toHaveCount(0);
});

test("filters by province and type with a shareable URL", async ({ page }) => {
  await page.goto("/cong-trinh/");
  const form = page.getByRole("form", { name: "Lọc công trình" });
  await form.getByLabel("Tỉnh / thành").selectOption({ label: "Ninh Bình" });
  await form.getByRole("button", { name: "Lọc" }).click();

  await expect(page).toHaveURL(/\/cong-trinh\/\?tinh=ninh-binh/);
  await expect(page.getByRole("status")).toHaveText("Có 1 công trình tại Ninh Bình.");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  await page.goto("/cong-trinh/?loai=lang-mo-da");
  // Mộ đá đôi + Lăng thờ đá + Khu lăng mộ đá are all children of "Lăng mộ đá".
  await expect(page.locator("main article")).toHaveCount(3);
  await page.getByRole("link", { name: "Xóa lọc" }).click();
  await expect(page).toHaveURL(/\/cong-trinh\/$/);
});

test("unknown filter values fall back to all projects", async ({ page }) => {
  await page.goto("/cong-trinh/?tinh=khong-co&trang=99");
  await expect(page.locator("main article")).toHaveCount(6);
});

test("project detail shows meta, gallery and breadcrumb", async ({ page }) => {
  await page.goto("/cong-trinh/");
  await page.getByRole("link", { name: /Mộ đá đôi tại Ninh Bình/ }).click();
  // First visit compiles the route in dev, so allow extra time.
  await expect(page).toHaveURL(/\/cong-trinh\/mau-mo-da-doi-ninh-binh\/$/, { timeout: 20_000 });
  await expect(page.locator("h1")).toContainText("Mộ đá đôi tại Ninh Bình");
  await expect(page.getByRole("link", { name: "Ninh Bình" })).toHaveAttribute(
    "href",
    "/cong-trinh/?tinh=ninh-binh",
  );
  await expect(page.getByRole("link", { name: "Mộ đá đôi", exact: true }).last()).toHaveAttribute(
    "href",
    "/mo-da-doi/",
  );
  const gallery = page.getByRole("region", { name: "Hình ảnh công trình" });
  await expect(gallery.getByRole("button", { name: /^Xem ảnh lớn/ })).toHaveCount(4);
});

test("unknown project returns 404", async ({ page }) => {
  const res = await page.goto("/cong-trinh/khong-ton-tai/");
  expect(res?.status()).toBe(404);
});
