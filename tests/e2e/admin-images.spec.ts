import { readFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

const db = new PrismaClient();
const RUN = `E2E-img-${Date.now().toString(36)}`;
// A real JPEG from the seeded sample images (1200×900).
const JPEG = readFileSync(path.join(process.cwd(), "public", "samples", "mau-2.jpg"));

test.describe.configure({ mode: "serial" });
test.skip(({ isMobile }) => isMobile, "admin upload runs once on desktop");

test.afterAll(async () => {
  const images = await db.image.findMany({ where: { alt: { startsWith: RUN } } });
  for (const img of images) {
    if (img.url.startsWith("/uploads/")) {
      await rm(path.join(process.cwd(), "public", img.url), { force: true });
    }
  }
  await db.image.deleteMany({ where: { alt: { startsWith: RUN } } });
  await db.$disconnect();
});

test("upload API requires a staff session", async ({ request }) => {
  expect((await request.post("/api/upload")).status()).toBe(401);
  expect((await request.post("/api/upload/local")).status()).toBe(401);
});

test("uploading needs an alt text and saves the image", async ({ page }) => {
  await loginAsAdmin(page, "/admin/images/");
  await page
    .getByLabel("Chọn ảnh")
    .setInputFiles({ name: "mo-da.jpg", mimeType: "image/jpeg", buffer: JPEG });

  const upload = page.getByRole("button", { name: /Tải lên 1 ảnh/ });
  await expect(upload).toBeDisabled();
  await page.getByLabel("Mô tả ảnh 1 (bắt buộc)").fill(`${RUN} Mộ đá đôi mẫu`);
  await expect(upload).toBeEnabled();
  await upload.click();
  await expect(page.getByRole("status").filter({ hasText: "Đã tải lên 1 ảnh." })).toBeVisible({
    timeout: 20_000,
  });

  const saved = await db.image.findFirst({ where: { alt: `${RUN} Mộ đá đôi mẫu` } });
  expect(saved).toMatchObject({ width: 1200, height: 900 });
  expect(saved?.url).toMatch(/^\/uploads\/\d{4}\/\d{2}\/[0-9a-f-]+\.jpg$/);
  // The stored file is actually served.
  expect((await page.request.get(saved?.url ?? "")).status()).toBe(200);
  await expect(page.getByText(`${RUN} Mộ đá đôi mẫu`)).toBeVisible();
});

test("files that are not real images are rejected", async ({ page }) => {
  await loginAsAdmin(page, "/admin/images/");
  await page.getByLabel("Chọn ảnh").setInputFiles({
    name: "fake.png",
    mimeType: "image/png",
    buffer: Buffer.from("not an image at all"),
  });
  await page.getByLabel("Mô tả ảnh 1 (bắt buộc)").fill(`${RUN} giả`);
  await page.getByRole("button", { name: /Tải lên 1 ảnh/ }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Tệp không phải ảnh hợp lệ." }),
  ).toBeVisible();
  expect(await db.image.count({ where: { alt: `${RUN} giả` } })).toBe(0);

  await page.getByLabel("Chọn ảnh").setInputFiles({
    name: "logo.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg/>"),
  });
  await expect(page.getByText(/logo\.svg: Chỉ nhận ảnh JPG, PNG, WebP hoặc AVIF/)).toBeVisible();
});
