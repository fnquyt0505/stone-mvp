import { defineConfig, devices } from "@playwright/test";

// Own port + build dir so e2e never reuses (or overwrites) a server you are running.
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;
/** Locally we reuse installed Edge; CI installs Playwright's Chromium. */
const channel = process.env.CI ? undefined : (process.env.E2E_CHANNEL ?? "msedge");

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    locale: "vi-VN",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel } },
  ],
  // Tests run against a production build: closer to real traffic and free of
  // dev-mode on-demand compilation and cache races.
  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 300_000,
    env: { NEXT_DIST_DIR: ".next-e2e", ALLOW_LOCAL_UPLOADS: "1" },
  },
});
