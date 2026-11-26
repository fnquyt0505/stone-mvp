import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.skip(({ isMobile }) => isMobile, "editor is used on desktop");

test("format text, add a table and an image, then preview the sanitized result", async ({
  page,
}) => {
  await loginAsAdmin(page, "/admin/dev/editor/");
  const editor = page.getByRole("textbox", { name: "Nội dung" });
  await expect(editor).toBeVisible();

  // Slow CI runners drop keystrokes typed while the toolbar re-renders, so type
  // with a small delay and confirm each step in the editor before moving on.
  const type = (text: string) => page.keyboard.type(text, { delay: 30 });

  await editor.click();
  await page.getByRole("button", { name: "Tiêu đề lớn" }).click();
  await expect(page.getByRole("button", { name: "Tiêu đề lớn" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await type("Mộ đá đôi xanh rêu");
  await expect(editor.getByRole("heading", { level: 2 })).toHaveText("Mộ đá đôi xanh rêu");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Đậm" }).click();
  await expect(page.getByRole("button", { name: "Đậm" })).toHaveAttribute("aria-pressed", "true");
  await type("Chất liệu bền");
  await expect(editor.locator("strong")).toHaveText("Chất liệu bền");
  await page.getByRole("button", { name: "Đậm" }).click();
  await page.keyboard.press("Enter");

  // Table with a header-less 3×2 grid; click the first cell, then type.
  await page.getByRole("button", { name: "Chèn bảng" }).click();
  await expect(page.getByRole("button", { name: "+ Hàng" })).toBeVisible();
  await editor.locator("td").first().click();
  await type("Kích thước");
  await expect(editor.locator("td").first()).toHaveText("Kích thước");

  // Insert a seeded sample image from the library.
  await editor.press("Control+End");
  await page.getByRole("button", { name: "Chèn ảnh" }).click();
  const picker = page.getByRole("dialog", { name: "Chèn ảnh" });
  await picker.getByRole("button", { name: /Ảnh minh họa công trình đá số 2/ }).click();
  await expect(picker).toBeHidden();
  await expect(editor.locator("img")).toHaveCount(1);

  await page.getByRole("button", { name: "Xem trước" }).click();
  await expect(page.getByTestId("sanitized-json")).not.toBeEmpty({ timeout: 15_000 });
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
