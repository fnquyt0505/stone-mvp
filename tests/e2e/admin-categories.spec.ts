import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

const db = new PrismaClient();
const RUN = Date.now().toString(36);
const NAME = `E2E Mộ đá thử ${RUN}`;
const SLUG = `e2e-mo-da-thu-${RUN}`;

test.describe.configure({ mode: "serial" });
test.skip(({ isMobile }) => isMobile, "admin CRUD runs once on desktop");

test.afterAll(async () => {
  await db.category.deleteMany({ where: { slug: { startsWith: "e2e-" } } });
  await db.$disconnect();
});

async function save(page: Page) {
  await page.getByRole("button", { name: "Lưu danh mục" }).click();
}

test("create a child category with specs, FAQ and gallery; it shows on the site", async ({
  page,
}) => {
  await loginAsAdmin(page, "/admin/categories/new/");
  const form = page.getByRole("form", { name: "Thông tin danh mục" });
  await form.getByLabel("Tên danh mục").fill(NAME);
  await expect(form.getByLabel("Đường dẫn")).toHaveValue(SLUG);
  await form.getByLabel("Thuộc nhóm").selectOption({ label: "Kiến trúc đá" });
  await form.getByLabel("Mô tả ngắn").fill("Mẫu thử tự động.");
  await form.getByLabel("Giá từ (triệu đồng)").fill("35");
  await form.getByLabel("Giá đến (triệu đồng)").fill("1,5");
  await save(page);
  // Reversed prices are rejected and nothing typed is lost.
  await expect(form.getByText("Giá đến phải lớn hơn hoặc bằng giá từ.")).toBeVisible();
  await expect(form.getByLabel("Tên danh mục")).toHaveValue(NAME);
  await form.getByLabel("Giá đến (triệu đồng)").fill("70");

  await form.getByRole("button", { name: "Thêm thông số" }).click();
  await form.getByLabel("Tên thông số").fill("Chất liệu");
  await form.getByLabel("Giá trị").fill("Đá xanh rêu");
  await form.getByRole("button", { name: "Thêm câu hỏi" }).click();
  await form.getByLabel("Câu hỏi", { exact: true }).fill("Có bảo hành không?");
  await form.getByLabel("Trả lời").fill("Có, theo hợp đồng.");

  await form.getByRole("button", { name: "Thêm ảnh" }).click();
  const picker = page.getByRole("dialog", { name: "Thêm ảnh vào thư viện" });
  await picker.getByRole("button", { name: /công trình đá số 3/ }).click();
  await picker.getByRole("button", { name: /công trình đá số 4/ }).click();
  await page.keyboard.press("Escape");
  await expect(form.getByText("2 ảnh.", { exact: false })).toBeVisible();
  await form.getByLabel("Chú thích ảnh 1").fill("Ảnh đầu");
  await form.getByRole("button", { name: "Đưa ảnh 1 xuống" }).click();
  await expect(form.getByLabel("Chú thích ảnh 2")).toHaveValue("Ảnh đầu");

  await form.getByLabel("Hiển thị trên website").check();
  await save(page);
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu danh mục." })).toBeVisible();

  const saved = await db.category.findUnique({
    where: { slug: SLUG },
    include: { parent: true, gallery: { orderBy: { order: "asc" }, include: { image: true } } },
  });
  expect(saved).toMatchObject({ priceFrom: 35_000_000, priceTo: 70_000_000, isPublished: true });
  expect(saved?.parent?.slug).toBe("kien-truc-da");
  expect(saved?.gallery.map((g) => g.caption)).toEqual([null, "Ảnh đầu"]);

  const res = await page.goto(`/${SLUG}/`);
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText(NAME);
  await expect(page.getByText("35 – 70 triệu")).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "Chất liệu" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Có bảo hành không?" })).toBeVisible();
  // Menu (cached by tag) shows the new child right away.
  await page.getByRole("button", { name: "Sản phẩm" }).click();
  await expect(page.getByRole("banner").getByRole("link", { name: NAME })).toBeVisible();
});

test("slugs used by a static page are rejected", async ({ page }) => {
  const category = await db.category.findUniqueOrThrow({ where: { slug: SLUG } });
  await loginAsAdmin(page, `/admin/categories/${category.id}/`);
  const form = page.getByRole("form", { name: "Thông tin danh mục" });
  await form.getByLabel("Đường dẫn").fill("gioi-thieu");
  await save(page);
  await expect(form.getByText('Đường dẫn đã dùng cho trang "Giới thiệu".')).toBeVisible();
});

test("unpublishing hides the page; delete removes it", async ({ page }) => {
  const category = await db.category.findUniqueOrThrow({ where: { slug: SLUG } });
  await loginAsAdmin(page, `/admin/categories/${category.id}/`);
  const form = page.getByRole("form", { name: "Thông tin danh mục" });
  await form.getByLabel("Hiển thị trên website").uncheck();
  await save(page);
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu danh mục." })).toBeVisible();
  expect((await page.request.get(`/${SLUG}/`)).status()).toBe(404);

  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Xóa danh mục" }).click();
  await expect(page).toHaveURL(/\/admin\/categories\/\?da-xoa=1$/);
  expect(await db.category.count({ where: { slug: SLUG } })).toBe(0);
});

test("a group with children cannot be deleted", async ({ page }) => {
  const group = await db.category.findUniqueOrThrow({ where: { slug: "lang-mo-da" } });
  await loginAsAdmin(page, `/admin/categories/${group.id}/`);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Xóa danh mục" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Hãy chuyển hoặc xóa các danh mục con trước." }),
  ).toBeVisible();
  expect(await db.category.count({ where: { slug: "lang-mo-da" } })).toBe(1);
});
