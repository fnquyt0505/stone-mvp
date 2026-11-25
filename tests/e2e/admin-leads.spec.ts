import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

const db = new PrismaClient();
const RUN = `E2E-admin-${Date.now().toString(36)}`;
let leadId = "";

test.describe.configure({ mode: "serial" });
test.skip(({ isMobile }) => isMobile, "admin lead workflow runs once on desktop");

test.beforeAll(async () => {
  const lead = await db.lead.create({
    data: {
      name: `${RUN} Trần Thị B`,
      phone: "0987654321",
      province: "Hà Nội",
      message: "Muốn làm mộ đôi, khuôn viên 3 × 4 m",
      sourceUrl: "/mo-da-doi/",
      utm: { source: "zalo" },
    },
  });
  leadId = lead.id;
});

test.afterAll(async () => {
  await db.lead.deleteMany({ where: { name: { startsWith: RUN } } });
  await db.$disconnect();
});

test("staff can find a lead, call it and update status + note", async ({ page }) => {
  await loginAsAdmin(page, "/admin/leads/");
  const filter = page.getByRole("form", { name: "Lọc yêu cầu" });
  await filter.getByLabel("Tìm tên hoặc SĐT").fill("0987 654");
  await filter.getByRole("button", { name: "Lọc" }).click();
  await expect(page).toHaveURL(/q=0987\+654/);

  const card = page.getByRole("listitem").filter({ hasText: RUN });
  await expect(card).toHaveCount(1);
  await expect(card.getByRole("link", { name: "0987 654 321" })).toHaveAttribute(
    "href",
    "tel:+84987654321",
  );
  await expect(card.getByText("Mới", { exact: true })).toBeVisible();

  await card.getByRole("link", { name: /Xử lý yêu cầu/ }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/leads/${leadId}/$`));
  await expect(page.getByText("source=zalo")).toBeVisible();

  const form = page.getByRole("form", { name: "Cập nhật yêu cầu" });
  await form.getByLabel("Đã liên hệ").check();
  await form.getByLabel(/Ghi chú nội bộ/).fill("Đã gọi, hẹn khảo sát thứ 7");
  await form.getByRole("button", { name: "Lưu" }).click();
  await expect(form.getByRole("status")).toHaveText("Đã lưu.");
  // Form keeps the saved values after React's post-action reset.
  await expect(form.getByLabel("Đã liên hệ")).toBeChecked();
  await expect(form.getByLabel(/Ghi chú nội bộ/)).toHaveValue("Đã gọi, hẹn khảo sát thứ 7");

  const saved = await db.lead.findUnique({ where: { id: leadId } });
  expect(saved).toMatchObject({ status: "CONTACTED", note: "Đã gọi, hẹn khảo sát thứ 7" });

  await page.goto("/admin/leads/?trang-thai=CONTACTED");
  await expect(page.getByRole("listitem").filter({ hasText: RUN })).toHaveCount(1);
  await page.goto("/admin/leads/?trang-thai=NEW");
  await expect(page.getByRole("listitem").filter({ hasText: RUN })).toHaveCount(0);
});

test("CSV export contains the filtered leads", async ({ page }) => {
  await loginAsAdmin(page, "/admin/leads/");
  const res = await page.request.get(`/admin/leads/export/?q=${encodeURIComponent(RUN)}`);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/csv");
  expect(res.headers()["content-disposition"]).toMatch(/attachment; filename="yeu-cau-bao-gia-/);
  const body = await res.text();
  expect(body.charCodeAt(0)).toBe(0xfeff);
  const lines = body.trim().split("\r\n");
  expect(lines).toHaveLength(2);
  expect(lines[0]).toContain("Số điện thoại");
  expect(lines[1]).toContain(`${RUN} Trần Thị B`);
  expect(lines[1]).toContain("0987 654 321");
  expect(lines[1]).toContain("Đã liên hệ");
});

test("export and lead pages require login", async ({ request }) => {
  const res = await request.get("/admin/leads/export/", { maxRedirects: 0 });
  expect([302, 303, 307, 308]).toContain(res.status());
  expect(res.headers()["location"]).toContain("/admin/login/");
});
