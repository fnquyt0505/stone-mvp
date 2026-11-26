import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

/**
 * Quote form end-to-end: validation, saving a Lead, honeypot and rate limit.
 * Each test uses its own fake client IP (x-forwarded-for) and phone number so
 * rate limits never leak between tests. Leads created here carry a run marker
 * in their name and are the only rows removed afterwards.
 */
const db = new PrismaClient();
const RUN = `E2E-${Date.now().toString(36)}`;
let seq = 0;

function uniqueIp(): string {
  const n = Math.floor(Math.random() * 250) + 1;
  return `10.${(Date.now() >> 8) % 250}.${seq % 250}.${n}`;
}
function uniquePhone(): string {
  return `09${String(Date.now() % 100_000_000)
    .padStart(8, "0")
    .slice(0, 6)}${String(seq++ % 100).padStart(2, "0")}`;
}

async function openContactForm(page: Page, path = "/lien-he/") {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": uniqueIp() });
  await page.goto(path);
  return page.getByRole("form", { name: "Yêu cầu báo giá" });
}

/** Waits for a fresh Turnstile token (single-use) before submitting. */
async function submit(form: ReturnType<Page["getByRole"]>) {
  await expect(form.locator('input[name="cf-turnstile-response"]')).not.toHaveValue("", {
    timeout: 15_000,
  });
  await form.getByRole("button", { name: "Gửi yêu cầu báo giá" }).click();
}

test.afterAll(async () => {
  await db.lead.deleteMany({ where: { name: { startsWith: RUN } } });
  await db.$disconnect();
});

test("shows Vietnamese validation errors from the server", async ({ page }) => {
  const form = await openContactForm(page);
  await form.getByLabel(/Số điện thoại/).fill("12345");
  await submit(form);
  await expect(form.getByText("Vui lòng kiểm tra lại thông tin.")).toBeVisible();
  await expect(form.getByText("Vui lòng nhập họ tên.")).toBeVisible();
  await expect(form.getByText(/Số điện thoại chưa đúng/)).toBeVisible();
  await expect(form.getByLabel(/Số điện thoại/)).toHaveAttribute("aria-invalid", "true");
});

test("saves a lead with category, source page and UTM", async ({ page }) => {
  const form = await openContactForm(page, "/mo-da-doi/?utm_source=facebook&utm_campaign=t11");
  // Category page preselects its own category.
  await expect(form.getByLabel("Loại sản phẩm")).toHaveValue(/.+/);
  const name = `${RUN} Khách mẫu`;
  const phone = uniquePhone();
  await form.getByLabel(/Họ và tên/).fill(name);
  await form.getByLabel(/Số điện thoại/).fill(phone);
  await form.getByLabel("Tỉnh / thành").selectOption("Ninh Bình");
  await form.getByLabel(/Kích thước/).fill("Mộ đôi, khuôn viên 3 × 4 m");
  await submit(form);

  await expect(form.getByText(/Đã nhận yêu cầu của Quý khách/)).toBeVisible({ timeout: 15_000 });
  await expect(form.getByLabel(/Họ và tên/)).toHaveValue("");

  const lead = await db.lead.findFirst({ where: { name }, include: { category: true } });
  expect(lead).toMatchObject({
    phone,
    province: "Ninh Bình",
    status: "NEW",
    sourceUrl: "/mo-da-doi/?utm_source=facebook&utm_campaign=t11",
    utm: { source: "facebook", campaign: "t11" },
  });
  expect(lead?.category?.slug).toBe("mo-da-doi");
});

test("honeypot submissions look successful but are not saved", async ({ page }) => {
  const form = await openContactForm(page);
  const name = `${RUN} Bot`;
  await form.getByLabel(/Họ và tên/).fill(name);
  await form.getByLabel(/Số điện thoại/).fill(uniquePhone());
  await page
    .locator('input[name="website"]')
    .first()
    .evaluate((el: HTMLInputElement) => {
      el.value = "http://spam.example";
    });
  await submit(form);
  await expect(form.getByText(/Đã nhận yêu cầu/)).toBeVisible({ timeout: 15_000 });
  expect(await db.lead.count({ where: { name } })).toBe(0);
});

test("blocks the 6th submission in a row from the same IP", async ({ page, isMobile }) => {
  test.skip(isMobile, "server-side behaviour; one viewport is enough");
  test.setTimeout(90_000);
  const form = await openContactForm(page);
  const name = `${RUN} Rate`;

  for (let i = 1; i <= 6; i++) {
    await form.getByLabel(/Họ và tên/).fill(`${name} ${i}`);
    await form.getByLabel(/Số điện thoại/).fill(uniquePhone());
    await submit(form);
    const expected = i <= 5 ? /Đã nhận yêu cầu/ : /gửi nhiều yêu cầu trong thời gian ngắn/;
    await expect(form.getByRole("status")).toContainText(expected, { timeout: 15_000 });
    // Wait for the button to re-enable before the next round.
    await expect(form.getByRole("button", { name: "Gửi yêu cầu báo giá" })).toBeEnabled();
  }
  expect(await db.lead.count({ where: { name: { startsWith: name } } })).toBe(5);
});

test("keeps typed values after an error and keeps the source page on retry", async ({ page }) => {
  const form = await openContactForm(page, "/lien-he/?utm_source=zalo");
  const name = `${RUN} Retry`;
  await form.getByLabel(/Họ và tên/).fill(name);
  await form.getByLabel(/Số điện thoại/).fill("0912");
  await form.getByLabel("Tỉnh / thành").selectOption("Hà Nội");
  await form.getByLabel(/Kích thước/).fill("Lăng thờ ba mái");
  await submit(form);

  await expect(form.getByText(/Số điện thoại chưa đúng/)).toBeVisible({ timeout: 15_000 });
  await expect(form.getByLabel(/Họ và tên/)).toHaveValue(name);
  await expect(form.getByLabel(/Số điện thoại/)).toHaveValue("0912");
  await expect(form.getByLabel("Tỉnh / thành")).toHaveValue("Hà Nội");
  await expect(form.getByLabel(/Kích thước/)).toHaveValue("Lăng thờ ba mái");

  const phone = uniquePhone();
  await form.getByLabel(/Số điện thoại/).fill(phone);
  await submit(form);
  await expect(form.getByText(/Đã nhận yêu cầu/)).toBeVisible({ timeout: 15_000 });

  const lead = await db.lead.findFirst({ where: { name } });
  expect(lead).toMatchObject({
    phone,
    province: "Hà Nội",
    sourceUrl: "/lien-he/?utm_source=zalo",
    utm: { source: "zalo" },
  });
});

test("form inputs leave room for stacked Vietnamese diacritics", async ({ page }) => {
  await page.goto("/lien-he/");
  const name = page.getByRole("form", { name: "Yêu cầu báo giá" }).getByLabel(/Họ và tên/);
  // Single-line inputs clip to their line box: ≥ 3 × font size keeps Ẫ/Ỗ visible.
  const ratio = await name.evaluate((el) => {
    const style = getComputedStyle(el);
    return parseFloat(style.lineHeight) / parseFloat(style.fontSize);
  });
  expect(ratio).toBeGreaterThanOrEqual(3);
});
