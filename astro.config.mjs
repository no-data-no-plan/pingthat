import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [svelte()],
  // 'auto' inlines stylesheets <4KB. Larger chunks stay external; we use
  // Cloudflare Early Hints 103 (Pattern C, see scripts/early-hints.mjs) to
  // preload them during origin think-time. Pattern A (`'always'`) was
  // shipped earlier today but introduced 47 W3C Nu Validator errors from
  // the inlined CSS (@layer/@property/scrollbar-gutter false positives) —
  // migrated 2026-04-28 evening. See feedback_css_delivery_pattern_a.md.
  build: { inlineStylesheets: "auto" },
  vite: { plugins: [tailwindcss()] },
});
