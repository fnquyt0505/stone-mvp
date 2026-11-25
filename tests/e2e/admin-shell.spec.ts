import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("dashboard shows lead and content statistics", async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Xin chào");
  for (const name of ["Yêu cầu báo giá", "Yêu cầu gần nhất", "Nội dung đang hiển thị"]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  // Seed data: 6 published projects and 3 testimonials.
  const content = page.getByRole("region", { name: "Nội dung đang hiển thị" });
  await expect(content.getByRole("link", { name: /Công trình\s*6/ })).toBeVisible();
  await expect(content.getByRole("link", { name: /Đánh giá\s*3/ })).toBeVisible();
});

test("sidebar lists every section and highlights the current one", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop sidebar");
  await loginAsAdmin(page);
  const nav = page.getByRole("navigation", { name: "Menu quản trị" });
  await expect(nav.getByRole("link")).toHaveCount(9);
  await expect(nav.getByRole("link", { name: "Tổng quan" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await nav.getByRole("link", { name: "Danh mục" }).click();
  await expect(page).toHaveURL(/\/admin\/categories\/$/);
  await expect(nav.getByRole("link", { name: "Danh mục" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Danh mục");
});

test("mobile menu opens, navigates and closes", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile menu");
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Mở menu quản trị" }).click();
  const menu = page.getByRole("navigation", { name: "Menu quản trị (di động)" });
  await menu.getByRole("link", { name: "Công trình" }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/$/);
  await expect(page.getByRole("dialog")).toBeHidden();
});
