import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

/**
 * The core business flow end to end (docs/TASKS.md T28):
 * visitor views a category → requests a quote → the lead shows up in admin →
 * staff moves it to "Đã báo giá" with a note.
 */
const db = new PrismaClient();
const RUN = `E2E-journey-${Date.now().toString(36)}`;
const PHONE = `09${String(Date.now()).slice(-8)}`;

test.skip(({ isMobile }) => !isMobile, "the visitor journey is the mobile one");
test.setTimeout(120_000);

test.afterAll(async () => {
  await db.lead.deleteMany({ where: { name: { startsWith: RUN } } });
  await db.$disconnect();
});

test("category view → quote request → lead handled in admin", async ({ page, browser }) => {
  // 1. Visitor on a phone reads the category page and sends the quote form.
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `10.33.${Date.now() % 250}.7` });
  await page.goto("/mo-da-doi/");
  await expect(page.locator("h1")).toHaveText("Mộ đá đôi");
  await expect(page.getByText("20 – 50 triệu")).toBeVisible();

  const form = page.locator("#bao-gia").getByRole("form", { name: "Yêu cầu báo giá" });
  await form.scrollIntoViewIfNeeded();
  await expect(form.getByLabel("Loại sản phẩm").locator("option:checked")).toHaveText("Mộ đá đôi");
  await form.getByLabel(/Họ và tên/).fill(`${RUN} Nguyễn Văn Ẩn`);
  await form.getByLabel(/Số điện thoại/).fill(PHONE);
  await form.getByLabel("Tỉnh / thành").selectOption("Thanh Hóa");
  await form.getByLabel(/Kích thước/).fill("Mộ đôi đá xanh rêu, khuôn viên 3 × 4 m");
  await expect(form.locator('input[name="cf-turnstile-response"]')).not.toHaveValue("", {
    timeout: 20_000,
  });
  await form.getByRole("button", { name: "Gửi yêu cầu báo giá" }).click();
  await expect(form.getByText(/Đã nhận yêu cầu của Quý khách/)).toBeVisible({ timeout: 20_000 });

  // 2. Staff signs in on a desktop browser and sees the new lead.
  const staff = await (
    await browser.newContext({ viewport: { width: 1280, height: 900 } })
  ).newPage();
  await loginAsAdmin(staff, "/admin/");
  await expect(
    staff.getByRole("region", { name: "Yêu cầu gần nhất" }).getByText(`${RUN} Nguyễn Văn Ẩn`),
  ).toBeVisible();

  await staff.goto(`/admin/leads/?q=${PHONE}`);
  const card = staff.getByRole("listitem").filter({ hasText: RUN });
  await expect(card.getByText("Mới", { exact: true })).toBeVisible();
  await expect(card).toContainText("Mộ đá đôi");
  await expect(card).toContainText("Thanh Hóa");

  // 3. Staff records the quote.
  await card.getByRole("link", { name: /Xử lý yêu cầu/ }).click();
  await expect(staff.getByText("/mo-da-doi/")).toBeVisible();
  const update = staff.getByRole("form", { name: "Cập nhật yêu cầu" });
  await update.getByLabel("Đã báo giá").check();
  await update
    .getByLabel(/Ghi chú nội bộ/)
    .fill("Đã gửi báo giá trọn gói (không gồm phần móng) qua Zalo.");
  await update.getByRole("button", { name: "Lưu" }).click();
  await expect(update.getByRole("status")).toHaveText("Đã lưu.");

  const lead = await db.lead.findFirstOrThrow({
    where: { phone: PHONE },
    include: { category: true },
  });
  expect(lead).toMatchObject({ status: "QUOTED", province: "Thanh Hóa", sourceUrl: "/mo-da-doi/" });
  expect(lead.category?.slug).toBe("mo-da-doi");

  await staff.goto("/admin/leads/?trang-thai=QUOTED");
  await expect(staff.getByRole("listitem").filter({ hasText: RUN })).toHaveCount(1);
  await staff.context().close();
});
