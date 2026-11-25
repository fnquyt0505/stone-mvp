import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.skip(({ isMobile }) => isMobile, "editor is used on desktop");

test("format text, add a table and an image, then preview the sanitized result", async ({
  page,
}) => {
  await loginAsAdmin(page, "/admin/dev/editor/");
  const editor = page.getByRole("textbox", { name: "Nội dung" });
  await expect(editor).toBeVisible();

  await editor.click();
  await page.getByRole("button", { name: "Tiêu đề lớn" }).click();
  await page.keyboard.type("Mộ đá đôi xanh rêu");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Đậm" }).click();
  await page.keyboard.type("Chất liệu bền");
  await page.getByRole("button", { name: "Đậm" }).click();
  await page.keyboard.press("Enter");

  // Table with header-less 3×2 grid; type into the first cell.
  await page.getByRole("button", { name: "Chèn bảng" }).click();
  await page.keyboard.type("Kích thước");
  await expect(page.getByRole("button", { name: "+ Hàng" })).toBeVisible();

  // Insert a seeded sample image from the library.
  await editor.press("Control+End");
  await page.getByRole("button", { name: "Chèn ảnh" }).click();
  const picker = page.getByRole("dialog", { name: "Chèn ảnh" });
  await picker.getByRole("button", { name: /Ảnh minh họa công trình đá số 2/ }).click();
  await expect(picker).toBeHidden();

  await page.getByRole("button", { name: "Xem trước" }).click();
  const preview = page.getByRole("region", { name: "Bản xem trước" });
  await expect(
    preview.getByRole("heading", { level: 2, name: "Mộ đá đôi xanh rêu" }),
  ).toBeVisible();
  await expect(preview.locator("strong", { hasText: "Chất liệu bền" })).toBeVisible();
  await expect(preview.getByRole("cell", { name: "Kích thước" })).toBeVisible();
  await expect(preview.getByRole("img", { name: /Ảnh minh họa công trình đá số 2/ })).toBeVisible();

  const json = JSON.parse((await page.getByTestId("sanitized-json").textContent()) ?? "null");
  const image = JSON.stringify(json).match(/"type":"image","attrs":(\{[^}]+\})/)?.[1];
  expect(JSON.parse(image ?? "{}")).toMatchObject({
    src: "/samples/mau-2.jpg",
    width: 1200,
    height: 900,
  });
});

test("link button rejects unsafe URLs", async ({ page }) => {
  await loginAsAdmin(page, "/admin/dev/editor/");
  const editor = page.getByRole("textbox", { name: "Nội dung" });
  await editor.click();
  await page.keyboard.type("liên kết");
  await page.keyboard.press("Shift+Home");
  const dialogs: string[] = [];
  page.on("dialog", async (d) => {
    dialogs.push(d.message());
    if (d.type() === "prompt") await d.accept("javascript:alert(1)");
    else await d.accept();
  });
  await page.getByRole("button", { name: "Liên kết" }).click();
  await expect.poll(() => dialogs).toContain("Liên kết không hợp lệ.");
  await expect(editor.locator("a")).toHaveCount(0);
});
