// e2e/cmdk.spec.ts
import { test, expect } from "@playwright/test";

test.describe("cmdk palette", () => {
  test("Ctrl+K on a tool page, type, Enter navigates", async ({ page }) => {
    await page.goto("/ssl-checker/");
    await page.keyboard.press("Control+k");
    await expect(page.locator("#cmdk")).toBeVisible();
    await page.keyboard.type("dns look");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/dns-lookup\/?$/);
  });

  test("Escape closes the palette", async ({ page }) => {
    await page.goto("/jwt-decoder/");
    await page.keyboard.press("Control+k");
    await expect(page.locator("#cmdk")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#cmdk")).toBeHidden();
  });

  test("filtering hides empty groups and shows empty state", async ({ page }) => {
    await page.goto("/ssl-checker/");
    await page.keyboard.press("Control+k");
    await page.keyboard.type("subnet");
    // Calculators group visible, Network group hidden
    await expect(page.locator("#cmdk [data-cmdk-group]:visible")).toHaveCount(1);
    await page.keyboard.type("zzzzqqq");
    await expect(page.locator("#cmdk-empty")).toBeVisible();
  });

  test("header button opens the palette", async ({ page }) => {
    await page.goto("/ssl-checker/");
    const btn = page.locator("#cmdk-open");
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#cmdk")).toBeVisible();
  });

  test("ES page navigates to /es path with ES names", async ({ page }) => {
    await page.goto("/es/privacy-check/");
    await page.keyboard.press("Control+k");
    await page.keyboard.type("fuga");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/es\/webrtc-leak-test\/?$/);
  });

  test("home: Ctrl+K opens palette, '/' still focuses hero search", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    await expect(page.locator("#cmdk")).toBeVisible();
    await page.keyboard.press("Escape");
    await page.keyboard.press("/");
    await expect(page.locator("#home-search")).toBeFocused();
  });
});
