import { PrismaClient } from "@prisma/client";
import { expect, test, type Locator } from "@playwright/test";

const db = new PrismaClient();
const RUN = `E2E-popup-${Date.now().toString(36)}`;

test.afterAll(async () => {
  await db.lead.deleteMany({ where: { name: { startsWith: RUN } } });
  await db.$disconnect();
});

async function waitForTurnstile(scope: Locator) {
  await expect(scope.locator('input[name="cf-turnstile-response"]')).not.toHaveValue("", {
    timeout: 15_000,
  });
}

test("any quote CTA opens the popup without leaving the page", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop hero CTA");
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `10.77.${Date.now() % 250}.1` });
  await page.goto("/");
  await page.locator("section").first().getByRole("link", { name: "Nhận báo giá" }).click();

  const dialog = page.getByRole("dialog", { name: "Nhận báo giá miễn phí" });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(dialog.getByLabel("Loại sản phẩm")).toHaveValue("");

  const name = `${RUN} Home`;
  await dialog.getByLabel(/Họ và tên/).fill(name);
  await dialog.getByLabel(/Số điện thoại/).fill(`09${String(Date.now()).slice(-8)}`);
  await waitForTurnstile(dialog);
  await dialog.getByRole("button", { name: "Gửi yêu cầu báo giá" }).click();
  await expect(dialog.getByText(/Đã nhận yêu cầu/)).toBeVisible({ timeout: 15_000 });

  const lead = await db.lead.findFirst({ where: { name } });
  expect(lead?.sourceUrl).toBe("/");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("popup on a category page preselects that category", async ({ page, isMobile }) => {
  test.skip(!isMobile, "uses the mobile bottom bar");
  await page.goto("/mo-da-doi/");
  await page
    .getByRole("navigation", { name: "Liên hệ nhanh" })
    .getByRole("link", { name: "Báo giá" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Nhận báo giá miễn phí" });
  await expect(dialog).toBeVisible();
  const select = dialog.getByLabel("Loại sản phẩm");
  await expect(select.locator("option:checked")).toHaveText("Mộ đá đôi");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/mo-da-doi\/$/);
});

test("modifier-click keeps normal link behaviour (opens contact page)", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop only");
  await page.goto("/");
  const link = page.locator("section").first().getByRole("link", { name: "Nhận báo giá" });
  await expect(link).toHaveAttribute("href", "/lien-he/#bao-gia");
  const [popup] = await Promise.all([
    page.context().waitForEvent("page"),
    link.click({ modifiers: ["ControlOrMeta"] }),
  ]);
  await expect(popup).toHaveURL(/\/lien-he\/#bao-gia$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
