import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

const db = new PrismaClient();
const RUN = Date.now().toString(36);

test.describe.configure({ mode: "serial" });
test.skip(({ isMobile }) => isMobile, "admin CRUD runs once on desktop");

test.afterAll(async () => {
  await db.project.deleteMany({ where: { slug: { startsWith: "e2e-" } } });
  await db.post.deleteMany({ where: { slug: { startsWith: "e2e-" } } });
  await db.page.deleteMany({ where: { slug: { startsWith: "e2e-" } } });
  await db.$disconnect();
});

test("project: create with gallery, appears in the list and filters; delete", async ({ page }) => {
  const title = `E2E Công trình ${RUN}`;
  const slug = `e2e-cong-trinh-${RUN}`;
  await loginAsAdmin(page, "/admin/projects/new/");
  const form = page.getByRole("form", { name: "Thông tin công trình" });
  await form.getByLabel("Tên công trình").fill(title);
  await expect(form.getByLabel("Đường dẫn")).toHaveValue(slug);
  await form.getByRole("button", { name: "Lưu công trình" }).click();
  await expect(form.getByText("Vui lòng chọn tỉnh/thành.")).toBeVisible();

  await form.getByLabel("Tỉnh / thành").selectOption("Quảng Ninh");
  await form.getByLabel("Loại sản phẩm").selectOption({ label: "Mộ đá đôi" });
  await form.getByLabel("Ngày hoàn thành").fill("2026-03-15");
  await form.getByLabel("Tóm tắt").fill("Công trình thử nghiệm tự động.");
  await form.getByRole("button", { name: "Thêm ảnh" }).click();
  const picker = page.getByRole("dialog", { name: "Thêm ảnh vào thư viện" });
  await picker.getByRole("button", { name: /công trình đá số 5/ }).click();
  await page.keyboard.press("Escape");
  await form.getByLabel("Hiển thị trên website").check();
  await form.getByRole("button", { name: "Lưu công trình" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu công trình." })).toBeVisible();

  await page.goto("/cong-trinh/?tinh=quang-ninh");
  await expect(page.getByRole("link", { name: title })).toBeVisible();
  await page.goto(`/cong-trinh/${slug}/`);
  await expect(page.locator("h1")).toHaveText(title);
  await expect(page.getByText("Hoàn thành năm 2026")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Xem ảnh lớn/ })).toHaveCount(1);

  const project = await db.project.findUniqueOrThrow({ where: { slug } });
  await page.goto(`/admin/projects/${project.id}/`);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Xóa công trình" }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/\?da-xoa=1$/);
  expect((await page.request.get(`/cong-trinh/${slug}/`)).status()).toBe(404);
});

test("post: draft is hidden, scheduled is hidden, published is visible", async ({ page }) => {
  const title = `E2E Bài viết ${RUN}`;
  const slug = `e2e-bai-viet-${RUN}`;
  await loginAsAdmin(page, "/admin/posts/new/");
  const form = page.getByRole("form", { name: "Thông tin bài viết" });
  await form.getByRole("textbox", { name: /^Tiêu đề \*$/ }).fill(title);
  await form.getByLabel("Tóm tắt").fill("Tóm tắt thử.");
  await form.getByRole("button", { name: "Lưu bài viết" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu bài viết." })).toBeVisible();
  expect((await page.request.get(`/tin-tuc/${slug}/`)).status()).toBe(404);

  await form.getByLabel(/Ngày giờ đăng/).fill("2099-01-01T08:00");
  await form.getByRole("button", { name: "Lưu bài viết" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu bài viết." })).toBeVisible();
  await page.goto("/admin/posts/");
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: title })
      .getByText(/Hẹn đăng/),
  ).toBeVisible();
  expect((await page.request.get(`/tin-tuc/${slug}/`)).status()).toBe(404);

  const post = await db.post.findUniqueOrThrow({ where: { slug } });
  await page.goto(`/admin/posts/${post.id}/`);
  await page.getByLabel(/Ngày giờ đăng/).fill("2026-01-05T08:00");
  await page.getByRole("button", { name: "Lưu bài viết" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu bài viết." })).toBeVisible();
  const res = await page.goto(`/tin-tuc/${slug}/`);
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText(title);
});

test("page: reserved and category slugs are rejected; a new page is served at /slug/", async ({
  page,
}) => {
  await loginAsAdmin(page, "/admin/pages/new/");
  const form = page.getByRole("form", { name: "Thông tin trang" });
  await form.getByLabel("Tiêu đề trang").fill("Liên hệ mới");
  await form.getByLabel("Đường dẫn").fill("lien-he");
  await form.getByRole("button", { name: "Lưu trang" }).click();
  await expect(form.getByText("Đường dẫn này dành cho trang có sẵn của website.")).toBeVisible();

  await form.getByLabel("Đường dẫn").fill("mo-da-doi");
  await form.getByRole("button", { name: "Lưu trang" }).click();
  await expect(form.getByText('Đường dẫn đã dùng cho danh mục "Mộ đá đôi".')).toBeVisible();

  const slug = `e2e-trang-${RUN}`;
  await form.getByLabel("Tiêu đề trang").fill(`E2E Trang ${RUN}`);
  await form.getByLabel("Đường dẫn").fill(slug);
  await form.getByRole("button", { name: "Lưu trang" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu trang." })).toBeVisible();
  const res = await page.goto(`/${slug}/`);
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText(`E2E Trang ${RUN}`);
});

test("category slugs that collide with dedicated routes are rejected", async ({ page }) => {
  await loginAsAdmin(page, "/admin/categories/new/");
  const form = page.getByRole("form", { name: "Thông tin danh mục" });
  await form.getByLabel("Tên danh mục").fill("Tin tức");
  await form.getByRole("button", { name: "Lưu danh mục" }).click();
  await expect(form.getByText("Đường dẫn này dành cho trang có sẵn của website.")).toBeVisible();
});
