import { expect, test } from "@playwright/test";

const STATIC_PAGES = [
  ["/gioi-thieu/", "Giới thiệu"],
  ["/chinh-sach-bao-mat/", "Chính sách bảo mật"],
  ["/dieu-khoan-su-dung/", "Điều khoản sử dụng"],
  ["/chinh-sach-cookie/", "Chính sách cookie"],
  ["/mien-tru-trach-nhiem/", "Miễn trừ trách nhiệm"],
] as const;

for (const [path, title] of STATIC_PAGES) {
  test(`static page ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(title);
    await expect(page.locator("main h2").first()).toBeVisible();
  });
}

test("order guide lists the 7 steps and the foundation note", async ({ page }) => {
  await page.goto("/huong-dan-dat-hang/");
  await expect(page.locator("h1")).toHaveText("Hướng dẫn đặt hàng");
  await expect(
    page.getByRole("list", { name: "Các bước đặt hàng" }).getByRole("listitem"),
  ).toHaveCount(7);
  await expect(page.getByRole("heading", { name: /Báo giá trọn gói/ })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Lưu ý về báo giá" })).toContainText(
    "không gồm phần móng",
  );
});

test("contact page shows call, Zalo and map placeholder", async ({ page }) => {
  await page.goto("/lien-he/");
  const info = page.getByRole("list", { name: "Thông tin liên hệ" });
  await expect(info.getByRole("link", { name: /^\d{4} \d{3} \d{3}$/ })).toHaveAttribute(
    "href",
    /^tel:\+84/,
  );
  await expect(info.getByRole("link", { name: /Nhắn Zalo/ })).toHaveAttribute("href", /zalo\.me/);
  await expect(page.getByText("Bản đồ sẽ hiển thị khi có địa chỉ xưởng chính thức.")).toBeVisible();
  await expect(page.locator("#bao-gia")).toBeVisible();
});

test("every header and footer link opens a page", async ({ page, request, isMobile }) => {
  test.skip(isMobile, "same links on both viewports");
  await page.goto("/");
  const hrefs = await page
    .locator("header a[href^='/'], footer a[href^='/']")
    .evaluateAll((els) => [...new Set(els.map((a) => a.getAttribute("href") ?? ""))]);
  expect(hrefs.length).toBeGreaterThan(10);
  for (const href of hrefs) {
    const res = await request.get(href.split("#")[0] ?? href);
    expect(res.status(), href).toBe(200);
  }
});
