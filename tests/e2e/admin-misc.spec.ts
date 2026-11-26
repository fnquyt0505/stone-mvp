import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";
import bcrypt from "bcryptjs";
import { loginAsAdmin } from "./helpers/auth";

const db = new PrismaClient();
const RUN = Date.now().toString(36);
const EDITOR_EMAIL = `e2e-editor-${RUN}@example.com`;
const EDITOR_PASSWORD = `editor-${RUN}-password`;
let originalHours: unknown = null;

test.describe.configure({ mode: "serial" });
test.skip(({ isMobile }) => isMobile, "admin CRUD runs once on desktop");

test.beforeAll(async () => {
  originalHours =
    (await db.siteSetting.findUnique({ where: { key: "workingHours" } }))?.value ?? null;
  await db.user.create({
    data: {
      email: EDITOR_EMAIL,
      name: "E2E Biên tập",
      role: "EDITOR",
      passwordHash: await bcrypt.hash(EDITOR_PASSWORD, 10),
    },
  });
});

test.afterAll(async () => {
  // Restore the setting changed by the test and remove test-only rows.
  if (originalHours !== null) {
    await db.siteSetting.update({
      where: { key: "workingHours" },
      data: { value: originalHours as string },
    });
  }
  await db.testimonial.deleteMany({ where: { name: { startsWith: "E2E" } } });
  await db.banner.deleteMany({ where: { title: { startsWith: "E2E" } } });
  await db.user.deleteMany({ where: { email: EDITOR_EMAIL } });
  await db.$disconnect();
});

test("testimonial: a published review appears on the home page; delete", async ({ page }) => {
  const name = `E2E Khách ${RUN}`;
  await loginAsAdmin(page, "/admin/testimonials/new/");
  const form = page.getByRole("form", { name: "Thông tin đánh giá" });
  await form.getByLabel("Tên khách hàng").fill(name);
  await form.getByLabel("Nội dung đánh giá").fill("Đánh giá thử nghiệm tự động, rất hài lòng.");
  await form.getByLabel("Số sao").selectOption("5");
  await form.getByLabel("Thứ tự").fill("0");
  await form.getByLabel("Hiển thị trên website").check();
  await form.getByRole("button", { name: "Lưu đánh giá" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu đánh giá." })).toBeVisible();

  await page.goto("/");
  const reviews = page.getByRole("region", { name: "Khách hàng nói về chúng tôi" });
  await expect(reviews.getByText(name)).toBeVisible();
  await expect(reviews.getByLabel("Đánh giá 5 trên 5 sao")).toBeVisible();

  const item = await db.testimonial.findFirstOrThrow({ where: { name } });
  await page.goto(`/admin/testimonials/${item.id}/`);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Xóa đánh giá" }).click();
  await expect(page).toHaveURL(/\/admin\/testimonials\/\?da-xoa=1$/);
});

test("banner: unsafe links are rejected; a valid banner is saved", async ({ page }) => {
  await loginAsAdmin(page, "/admin/banners/new/");
  const form = page.getByRole("form", { name: "Thông tin banner" });
  await form.getByLabel("Tiêu đề").fill(`E2E Banner ${RUN}`);
  await form.getByLabel("Chữ trên nút").fill("Xem");
  await form.getByLabel("Liên kết của nút").fill("javascript:alert(1)");
  await form.getByRole("button", { name: "Lưu banner" }).click();
  await expect(form.getByText("Liên kết phải bắt đầu bằng tel:, https:// hoặc /")).toBeVisible();
  await form.getByLabel("Liên kết của nút").fill("/lien-he/");
  await form.getByRole("button", { name: "Lưu banner" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu banner." })).toBeVisible();

  await page.goto("/admin/banners/");
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: `E2E Banner ${RUN}` })
      .getByText("Đang tắt"),
  ).toBeVisible();
});

test("settings: admins update the site instantly", async ({ page }) => {
  const hours = `E2E 6:30 – 22:00 (${RUN})`;
  await loginAsAdmin(page, "/admin/settings/");
  const form = page.getByRole("form", { name: "Cài đặt website" });
  await form.getByLabel("Hotline").fill("123");
  await form.getByRole("button", { name: "Lưu cài đặt" }).click();
  await expect(form.getByText(/Hotline chưa đúng/)).toBeVisible();
  // Typed values survive the error.
  await form.getByLabel("Hotline").fill("0900 000 000");
  await form.getByLabel("Giờ làm việc").fill(hours);
  await form.getByRole("button", { name: "Lưu cài đặt" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu cài đặt." })).toBeVisible();

  await page.goto("/lien-he/");
  await expect(page.getByText(hours).first()).toBeVisible();
});

test("editors cannot open site settings", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `10.44.${Date.now() % 250}.9` });
  await page.goto("/admin/login/");
  await page.getByLabel("Email").fill(EDITOR_EMAIL);
  await page.getByLabel("Mật khẩu").fill(EDITOR_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/admin\/$/);
  const nav = page.getByRole("navigation", { name: "Menu quản trị" });
  await expect(nav.getByRole("link", { name: "Danh mục" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Cài đặt" })).toHaveCount(0);

  await page.goto("/admin/settings/");
  await expect(page).not.toHaveURL(/\/admin\/settings\//);
});
