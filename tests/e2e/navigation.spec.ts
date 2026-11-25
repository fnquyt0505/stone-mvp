import { expect, test } from "@playwright/test";

test.describe("desktop mega menu", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");

  test("opens with the keyboard, navigates into the panel and closes on Esc", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Sản phẩm" });

    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const firstGroup = page.getByRole("link", { name: "Lăng mộ đá", exact: true });
    await expect(firstGroup).toBeVisible();
    await expect(page.getByRole("link", { name: "Mộ đá đôi" })).toBeVisible();

    // Tab moves focus from the trigger into the panel.
    await page.keyboard.press("Tab");
    await expect(firstGroup).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(firstGroup).toBeHidden();
  });

  test("links category pages with trailing slashes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Sản phẩm" }).click();
    await expect(page.getByRole("link", { name: "Mộ đá đôi" })).toHaveAttribute(
      "href",
      "/mo-da-doi/",
    );
  });
});

test.describe("mobile drawer", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("opens, expands a group as an accordion and closes on Esc", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Mở menu" }).click();

    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();

    const group = drawer.getByRole("button", { name: "Lăng mộ đá" });
    await group.click();
    await expect(group).toHaveAttribute("aria-expanded", "true");
    await expect(drawer.getByRole("link", { name: "Mộ đá đôi" })).toBeVisible();

    // Single-open accordion: opening another group collapses the first.
    await drawer.getByRole("button", { name: "Tượng đá" }).click();
    await expect(group).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });

  test("closes after choosing a link", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Mở menu" }).click();
    const drawer = page.getByRole("dialog");
    await drawer.getByRole("link", { name: "Liên hệ" }).click();
    await expect(drawer).toBeHidden();
  });
});
