import { test, expect } from "@playwright/test";

test.describe("Infrastructure", () => {
  test("404 page renders for an unknown URL", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist-abc123/", {
      waitUntil: "domcontentloaded",
    });
    // Astro preview serves 404.astro with a 404 status.
    expect(res?.status()).toBe(404);
    await expect(page.locator("body")).toContainText(/404|not found/i);
  });

  test("sitemap.xml is reachable and XML-shaped", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/^<\?xml/);
    expect(body).toContain("<urlset");
    expect(body).toContain("pingthat.dev");
  });

  test("robots.txt is reachable and mentions sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/sitemap/i);
  });
});
