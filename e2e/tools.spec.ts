import { test, expect } from "@playwright/test";

// Focus on PURE-CLIENT tools (no network/API dependencies) so tests are
// deterministic in preview mode where /api/* endpoints aren't wired:
//   - ip-converter (binary/hex/integer conversion — pure client-side)
//   - jwt-decoder (base64 + JSON parse — pure client-side)
//   - password-strength (zxcvbn-style entropy — pure client-side)
//
// Network-dependent tools (port-scan, email-auth, dns-lookup, ssl-checker,
// my-ip) are skipped here because they need /api/* endpoints behind CF
// middleware that aren't available in `astro preview` mode. Add those in a
// follow-up if/when the preview server can stub the API surface.

test.describe("Tool flows (pure-client)", () => {
  test("ip-converter: enter IP → see hex / integer / binary outputs", async ({ page }) => {
    await page.goto("/ip-converter/");
    await expect(page.locator("h1").first()).toContainText(/IP.*Converter/i);

    // Input the canonical IPv4 example. The page placeholder mentions binary/
    // hex/integer as input formats, so we assert the corresponding outputs.
    const input = page
      .locator("input[type='text'], input:not([type])")
      .filter({ hasNot: page.locator("input[placeholder*='Search']") })
      .first();
    await input.fill("192.168.1.1");
    // Blur to trigger reactive computation if the component debounces on change.
    await input.press("Tab");

    // Outputs vary by render strategy; anchor on stable values that always
    // appear when 192.168.1.1 is decoded:
    //   - integer: 3232235777
    //   - hex (any case, with or without 0x prefix): "c0a80101" / "C0A80101" / "0xc0a80101"
    //   - binary: "11000000.10101000.00000001.00000001" with dots
    const body = page.locator("body");
    await expect(body).toContainText("3232235777", { timeout: 5_000 });
    await expect(body).toContainText(/c0a80101/i);
  });

  test("jwt-decoder: paste JWT → header + payload rendered", async ({ page }) => {
    await page.goto("/jwt-decoder/");
    await expect(page.locator("h1").first()).toContainText(/JWT/i);

    // Standard test JWT (HS256, payload contains {"sub": "1234567890", "name": "John Doe", ...}).
    const SAMPLE_JWT =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ." +
      "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    // Find the JWT input — could be <textarea> or contenteditable. Try
    // textarea first; fall back to the first visible editable element.
    const textarea = page.locator("textarea").first();
    if (await textarea.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await textarea.fill(SAMPLE_JWT);
    } else {
      // CodeMirror or contenteditable fallback
      const editor = page.locator("[contenteditable='true']").first();
      await editor.click();
      await page.keyboard.insertText(SAMPLE_JWT);
    }

    // Decoded payload should contain "John Doe" + "1234567890" (sub).
    const body = page.locator("body");
    await expect(body).toContainText(/John Doe/i, { timeout: 5_000 });
    await expect(body).toContainText("1234567890");

    // Algorithm from header — "HS256" should appear.
    await expect(body).toContainText("HS256");
  });

  test("password-strength: weak input shows weak indicator", async ({ page }) => {
    await page.goto("/password-strength/");
    await expect(page.locator("h1").first()).toContainText(/Password.*Strength/i);

    // Target the actual password input by its placeholder text (set in
    // src/i18n/components.ts: placeholderPassword = "Type or paste a password...").
    // This avoids matching the search bar (placeholder "Search tools...").
    const input = page.getByPlaceholder(/Type or paste a password/i);
    await input.fill("password123");

    // zxcvbn analysis renders one of the labels from src/i18n/components.ts:
    //   veryWeak | weak | fair | strong | veryStrong
    // For "password123" (very common, top zxcvbn dictionary), score is 0
    // → label "Very weak". Anchor on that exact phrase to avoid matching
    // the educational copy elsewhere on the page that contains "weak"
    // descriptively (e.g. "weaker than this number suggests").
    await expect(page.getByText(/Very weak/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test("password-strength: weak vs strong shows correct severity badge class-map", async ({ page }) => {
    await page.goto("/password-strength/");

    // Use the password input identified by its placeholder (avoids search bar).
    const input = page.getByPlaceholder(/Type or paste a password/i);

    // "123" → digits only, length 3, entropy ≈ 9.97 bits (< 25 threshold),
    // length < 6 clamps score to 0 → level "bad".
    await input.fill("123");
    await expect(page.locator(".sev-badge.is-bad")).toBeVisible({ timeout: 5_000 });

    // Long passphrase: length 42, upper+lower+digits+special → charset 95,
    // entropy ≈ 275 bits (≥ 80 threshold) → score 4 → level "ok".
    await input.fill("Tr0ub4dour&3-correct-horse-battery-staple");
    await expect(page.locator(".sev-badge.is-ok")).toBeVisible({ timeout: 5_000 });
  });
});
