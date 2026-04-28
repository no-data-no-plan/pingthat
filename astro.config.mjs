import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [svelte()],
  // Inline small CSS bundles into HTML to eliminate render-blocking round-trips.
  // 'auto' inlines stylesheets <4KB. Saves 470-640ms FCP on home pages per
  // PSI 2026-04-28 (largest universal opportunity).
  build: { inlineStylesheets: "auto" },
  vite: { plugins: [tailwindcss()] },
});
