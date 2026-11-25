import { expect, test } from "@playwright/test";

// Seeded admin credentials live in the local .env (SEED_ADMIN_EMAIL/PASSWORD).
try {
  process.loadEnvFile(".env");
} catch {
  // CI provides them as environment variables.
}
const EMAIL = process.env.SEED_ADMIN_EMAIL ?? "";
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "";

test.describe.configure({ mode: "serial" });
test.skip(({ isMobile }) => isMobile, "auth flow is viewport independent");

let ipSeq = 0;
test.beforeEach(async ({ page }) => {
  // Separate fake IP per test so login rate limits never interfere.
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `10.88.${Date.now() % 250}.${++ipSeq}` });
});

test("admin pages redirect to login when signed out", async ({ page, request }) => {
  await page.goto("/admin/");
  await expect(page).toHaveURL(/\/admin\/login\/\?next=%2Fadmin%2F$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Đăng nhập quản trị");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  const session = await request.get("/api/auth/session");
  expect(await session.json()).toBeNull();
});

test("wrong password shows a generic error and keeps the email", async ({ page }) => {
  await page.goto("/admin/login/");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Mật khẩu").fill("wrong-password-123");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByRole("form", { name: "Đăng nhập" }).getByRole("alert")).toHaveText(
    "Email hoặc mật khẩu không đúng.",
  );
  await expect(page.getByLabel("Email")).toHaveValue(EMAIL);
});

test("staff can sign in, see the panel and sign out", async ({ page }) => {
  expect(EMAIL && PASSWORD, "SEED_ADMIN_EMAIL/PASSWORD must be set").toBeTruthy();
  await page.goto("/admin/login/?next=https://evil.example/");
  await page.getByLabel("Email").fill(EMAIL.toUpperCase());
  await page.getByLabel("Mật khẩu").fill(PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  // External "next" values are ignored: we land on the admin home.
  await expect(page).toHaveURL(/\/admin\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Xin chào");
  const res = await page.request.get("/admin/");
  expect(res.headers()["x-robots-tag"]).toBe("noindex, nofollow");

  // Signed-in users visiting the login page go straight to the panel.
  await page.goto("/admin/login/");
  await expect(page).toHaveURL(/\/admin\/$/);

  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await expect(page).toHaveURL(/\/admin\/login\/$/);
  await page.goto("/admin/");
  await expect(page).toHaveURL(/\/admin\/login\//);
});

test("locks out after 10 failed attempts for the same email", async ({ page }) => {
  test.setTimeout(120_000);
  const email = `nobody-${Date.now()}@example.com`;
  await page.goto("/admin/login/");
  for (let i = 1; i <= 11; i++) {
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mật khẩu").fill(`guess-${i}`);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    const expected = i <= 10 ? "Email hoặc mật khẩu không đúng." : /sai quá nhiều lần/;
    await expect(page.getByRole("form", { name: "Đăng nhập" }).getByRole("alert")).toHaveText(
      expected,
    );
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeEnabled();
  }
});
