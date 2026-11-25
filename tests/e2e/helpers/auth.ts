import { expect, type Page } from "@playwright/test";

try {
  process.loadEnvFile(".env");
} catch {
  // CI provides the variables directly.
}

export const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "";
export const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "";

let ipSeq = 0;

/** Signs in as the seeded admin, using a unique fake IP per call. */
export async function loginAsAdmin(page: Page, next = "/admin/"): Promise<void> {
  expect(ADMIN_EMAIL && ADMIN_PASSWORD, "SEED_ADMIN_EMAIL/PASSWORD must be set").toBeTruthy();
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `10.66.${Date.now() % 250}.${++ipSeq % 250}`,
  });
  await page.goto(`/admin/login/?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Mật khẩu").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(new RegExp(`${next.replace(/[/?]/g, "\\$&")}$`));
}
