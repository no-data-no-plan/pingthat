import { test, expect } from "@playwright/test";
import { collectConsoleErrors } from "./_helpers";

// PT home (`/`) renders a landing with a hero + categorized tool grid (h2s:
// "Network", "Security", "Speed & Uptime", etc.). The lang toggle landmark
// follows the portfolio-wide pattern (aria-label "Language" on EN locale,
// "Idioma" on ES locale) — same convention as JC + OI + AY.

test.describe("Home + i18n", () => {
  test("EN home loads without console errors", async ({ page }) => {
    const { errors } = collectConsoleErrors(page);

    await page.goto("/");
    await expect(page).toHaveTitle(/PingThat/i);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    // Hero h1 + at least one category h2 visible.
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /Network/i }).first()).toBeVisible();

    // LangToggle landmark is rendered (aria-label "Language" on EN locale per
    // LangToggle.astro: navLabel = lang === "es" ? "Idioma" : "Language").
    await expect(page.getByRole("navigation", { name: "Language" })).toBeVisible();

    expect(errors, `unexpected console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("ES home loads with Spanish UI + hreflang alternate to EN", async ({ page }) => {
    const { errors } = collectConsoleErrors(page);

    await page.goto("/es/");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.locator("h1").first()).toBeVisible();

    // LangToggle landmark relabeled to Spanish.
    await expect(page.getByRole("navigation", { name: "Idioma" })).toBeVisible();

    // hreflang EN alternate points to root.
    const hreflangEn = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(hreflangEn).toHaveAttribute("href", /pingthat\.dev\/$/);

    expect(errors, `unexpected console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("Language switch from EN home → /es/ and UI becomes Spanish", async ({ page }) => {
    await page.goto("/");

    // The ES link lives inside the Language nav landmark (EN locale labels it
    // "Language"; the link inside has Spanish aria-label "Cambiar a español").
    const langNav = page.getByRole("navigation", { name: "Language" });
    await langNav.getByRole("link", { name: "Cambiar a español" }).click();

    await expect(page).toHaveURL(/\/es\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Idioma" })).toBeVisible();
  });
});
