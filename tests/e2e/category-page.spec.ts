import { expect, test } from "@playwright/test";

test.describe("category page /mo-da-doi/", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/mo-da-doi/");
  });

  test("shows breadcrumb, single h1, price range and specs", async ({ page }) => {
    const crumbs = page.getByRole("navigation", { name: "Đường dẫn" });
    await expect(crumbs.getByRole("link", { name: "Lăng mộ đá" })).toHaveAttribute(
      "href",
      "/lang-mo-da/",
    );
    await expect(crumbs.getByText("Mộ đá đôi")).toHaveAttribute("aria-current", "page");

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText("20 – 50 triệu")).toBeVisible();
    await expect(page.getByText("không gồm phần móng").first()).toBeVisible();

    const specs = page.getByRole("table", { name: "Thông số Mộ đá đôi" });
    await expect(specs.getByRole("rowheader", { name: "Chất liệu" })).toBeVisible();
  });

  test("gallery opens a lightbox that closes on Esc", async ({ page }) => {
    const gallery = page.getByRole("region", { name: "Hình ảnh mộ đá đôi" });
    const thumbs = gallery.getByRole("button", { name: /^Xem ảnh lớn/ });
    await expect(thumbs).toHaveCount(7);

    await thumbs.first().click();
    const lightbox = page.locator(".yarl__root");
    await expect(lightbox).toBeVisible();
    await expect(lightbox.getByText("Mộ đá đôi — ảnh 1")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(lightbox).toBeHidden();
  });

  test("FAQ accordion keeps one item open and emits FAQPage JSON-LD", async ({ page }) => {
    const faq = page.getByRole("region", { name: "Câu hỏi thường gặp" });
    const first = faq.getByRole("button", { name: "Báo giá đã gồm những gì?" });
    const second = faq.getByRole("button", { name: /thước Lỗ Ban/ });

    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await second.click();
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "false");

    const types = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map((t) => JSON.parse(t))
      .flat()
      .map((d: { "@type": string }) => d["@type"]);
    expect(types).toEqual(expect.arrayContaining(["BreadcrumbList", "FAQPage", "LocalBusiness"]));
  });

  test("lists sibling categories but not itself", async ({ page }) => {
    const related = page.getByRole("region", { name: "Mẫu khác trong lăng mộ đá" });
    await expect(related.getByRole("article")).toHaveCount(4);
    await expect(related.getByRole("link", { name: "Mộ đá đơn" })).toBeVisible();
    await expect(related.getByRole("link", { name: "Mộ đá đôi" })).toHaveCount(0);
  });
});
