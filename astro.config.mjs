import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [svelte()],
  // Inline ALL CSS bundles as <style> blocks. Single CSSOM build during head
  // parse, no second-pass recalc, no network round-trip for CSS. Big-tech
  // (Netflix 204KB, X 15KB, Airbnb 67KB) ships full-inline at 4-15× our scale.
  // CSP-safe (style-src 'unsafe-inline' covers <style>). JS-disabled compatible.
  build: { inlineStylesheets: "always" },
  vite: { plugins: [tailwindcss()] },
});
