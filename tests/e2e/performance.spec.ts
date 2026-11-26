import { expect, test, type Page } from "@playwright/test";

/**
 * Lighthouse-like mobile conditions on the production build: slow 4G
 * (150 ms RTT, 1.6 Mbps down) and 4× CPU slowdown. Checks layout stability,
 * largest contentful paint and the JavaScript shipped by the main pages.
 */
const PAGES = ["/", "/mo-da-doi/", "/cong-trinh/", "/lien-he/"];
const JS_BUDGET_BYTES = 260 * 1024; // compressed transfer size
const LCP_BUDGET_MS = 4000; // generous: local machine timings vary
const CLS_BUDGET = 0.1;

async function throttle(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
}

test.skip(({ isMobile }) => !isMobile, "measured with mobile emulation only");

for (const path of PAGES) {
  test(`performance budget: ${path}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.addInitScript(() => {
      const w = window as unknown as { __lcp: number; __cls: number };
      w.__lcp = 0;
      w.__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) w.__lcp = e.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as (PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
        })[]) {
          if (!e.hadRecentInput) w.__cls += e.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await throttle(page);
    await page.goto(path, { waitUntil: "load" });
    await page.waitForTimeout(1500); // let late shifts / LCP candidates settle

    const metrics = await page.evaluate(() => {
      const w = window as unknown as { __lcp: number; __cls: number };
      const scripts = performance
        .getEntriesByType("resource")
        .filter((r) => (r as PerformanceResourceTiming).initiatorType === "script")
        .reduce((sum, r) => sum + (r as PerformanceResourceTiming).transferSize, 0);
      return { lcp: Math.round(w.__lcp), cls: Number(w.__cls.toFixed(3)), jsBytes: scripts };
    });
    console.log(
      `${path}: LCP ${metrics.lcp} ms · CLS ${metrics.cls} · JS ${(metrics.jsBytes / 1024).toFixed(0)} KB`,
    );

    expect(metrics.cls, "cumulative layout shift").toBeLessThan(CLS_BUDGET);
    expect(metrics.lcp, "largest contentful paint").toBeLessThan(LCP_BUDGET_MS);
    expect(metrics.jsBytes, "compressed JavaScript").toBeLessThan(JS_BUDGET_BYTES);
  });
}
