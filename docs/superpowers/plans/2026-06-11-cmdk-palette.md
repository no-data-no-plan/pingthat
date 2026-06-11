# Cmd+K Command Palette — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site-wide Cmd/Ctrl+K command palette (grouped by category, tools-only, EN+ES) per spec `docs/superpowers/specs/2026-06-11-cmdk-palette-design.md`.

**Architecture:** One pure scoring lib (`palette-match.ts`, vitest), one self-contained Astro component (`CmdkPalette.astro` = SSR'd `<dialog>` markup + scoped styles + vanilla behavior script — NO Svelte runtime), wired into `Layout.astro` (all tool/static pages) AND both standalone home pages (`index.astro`, `es/index.astro` — the home does NOT use Layout). Filter-only grouped list: scores gate visibility, selection = first visible item.

**Tech Stack:** Astro 6, vanilla TS, vitest, Playwright e2e (config exists: port 4392, webServer auto-starts preview). Branch: `stage3/cmdk-palette` (created, spec committed `48fd682`).

---

### Task 1: `src/lib/palette-match.ts` — pure match scoring (TDD)

**Files:**
- Create: `src/lib/palette-match.ts`
- Test: `src/lib/palette-match.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/palette-match.test.ts
import { describe, it, expect } from 'vitest';
import { normalize, scoreMatch, matchTool } from './palette-match';

describe('normalize', () => {
  it('lowercases and strips diacritics', () => {
    expect(normalize('Resolución DNS')).toBe('resolucion dns');
    expect(normalize('Huella Canvas')).toBe('huella canvas');
  });
});

describe('scoreMatch tiers', () => {
  it('empty query is the match-all sentinel (0)', () => {
    expect(scoreMatch('', 'anything')).toBe(0);
    expect(scoreMatch('   ', 'anything')).toBe(0);
  });
  it('exact prefix -> 4', () => {
    expect(scoreMatch('dns look', 'DNS Lookup')).toBe(4);
  });
  it('word-boundary prefix -> 3', () => {
    expect(scoreMatch('look', 'DNS Lookup')).toBe(3);
  });
  it('substring -> 2', () => {
    expect(scoreMatch('ooku', 'DNS Lookup')).toBe(2);
  });
  it('in-order subsequence -> 1', () => {
    expect(scoreMatch('dlp', 'DNS Lookup')).toBe(1); // d..l..p in order
  });
  it('no match -> null', () => {
    expect(scoreMatch('xyz', 'DNS Lookup')).toBeNull();
  });
  it('diacritic-insensitive both ways', () => {
    expect(scoreMatch('resolucion', 'Resolución de Pantalla')).toBe(4);
    expect(scoreMatch('huella', 'Huella Canvas')).toBe(4);
  });
  it('case-insensitive', () => {
    expect(scoreMatch('SSL', 'ssl checker')).toBe(4);
  });
});

describe('matchTool', () => {
  it('returns the best score across fields', () => {
    expect(matchTool('jwt', ['Decodificador JWT', 'jwt decoder', 'token'])).toBe(4);
  });
  it('returns null when no field matches', () => {
    expect(matchTool('zzz9', ['DNS Lookup', 'dns', 'network'])).toBeNull();
  });
  it('empty query matches everything with 0', () => {
    expect(matchTool('', ['DNS Lookup'])).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/palette-match.test.ts`
Expected: FAIL — `Cannot find module './palette-match'`

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/palette-match.ts
// Match scoring for the Cmd+K palette. Pure + unit-tested.
// Tiers: exact prefix 4 > word-boundary prefix 3 > substring 2 > in-order
// subsequence 1 > null. The palette consumes match-or-null (visibility only,
// grouped layout keeps DOM order); the tiers exist so a future ranked mode
// can reuse them without re-deriving the scale.

export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function scoreMatch(query: string, haystack: string): number | null {
  const q = normalize(query).trim();
  if (!q) return 0; // match-all sentinel: empty query shows everything
  const h = normalize(haystack);
  if (h.startsWith(q)) return 4;
  if (h.split(/[^a-z0-9]+/).some((w) => w.startsWith(q))) return 3;
  if (h.includes(q)) return 2;
  let i = 0;
  for (const ch of h) {
    if (ch === q[i]) i++;
    if (i === q.length) return 1;
  }
  return null;
}

export function matchTool(query: string, fields: ReadonlyArray<string>): number | null {
  let best: number | null = null;
  for (const f of fields) {
    const s = scoreMatch(query, f);
    if (s !== null && (best === null || s > best)) best = s;
  }
  return best;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/palette-match.test.ts`
Expected: PASS (12 tests). Note the subsequence test 'dlp': d(ns) l(ookup) p — verify mentally: h='dns lookup', q='dlp' → d✓ l✓ p✓ → 1. ('ooku' is a substring but NOT a word-boundary prefix → 2.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/palette-match.ts src/lib/palette-match.test.ts
git commit -m "feat(cmdk): pure match-scoring lib (prefix/word/substring/subsequence tiers)"
```

---

### Task 2: i18n keys in `src/i18n/common.ts` (EN + ES)

**Files:**
- Modify: `src/i18n/common.ts` (add to BOTH `common.en` and `common.es`; `CommonStrings = typeof common.en` at line ~156, and `src/lib/i18n.test.ts` enforces EN/ES parity for getCommon)

- [ ] **Step 1: Add EN keys** — inside `common.en`, after the `cancelled: "Cancelled",` line:

```ts
    // Cmd+K palette (stage-3 #4)
    paletteLabel: "Command palette",
    paletteOpen: "Open command palette",
    palettePlaceholder: "Jump to a tool…",
    paletteEmpty: "No tools match",
    paletteNavigate: "navigate",
    paletteGo: "open",
    paletteClose: "close",
```

- [ ] **Step 2: Add ES keys** — same position inside `common.es`:

```ts
    // Cmd+K palette (stage-3 #4)
    paletteLabel: "Paleta de comandos",
    paletteOpen: "Abrir la paleta de comandos",
    palettePlaceholder: "Salta a una herramienta…",
    paletteEmpty: "Ninguna herramienta coincide",
    paletteNavigate: "navegar",
    paletteGo: "abrir",
    paletteClose: "cerrar",
```

- [ ] **Step 3: Verify parity + suite**

Run: `npx vitest run src/lib/i18n.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/i18n/common.ts
git commit -m "feat(cmdk): palette i18n strings (EN+ES)"
```

---

### Task 3: `src/components/CmdkPalette.astro` — dialog markup + styles + behavior

**Files:**
- Create: `src/components/CmdkPalette.astro`

Mirror `Sidebar.astro`'s data pattern exactly (`groups` order, `toolNamesI18n[tool.id]?.[lang] ?? tool.name`, `langPrefix = lang === "es" ? "/es" : ""`). Complete file:

- [ ] **Step 1: Create the component**

```astro
---
import { tools, groups } from "../lib/tools";
import type { Lang } from "../i18n/index";
import { getCommon } from "../i18n/common";
import { toolNamesI18n, groupLabelsI18n } from "../i18n/pages";

interface Props { lang?: Lang; }
const { lang = "en" } = Astro.props;
const c = getCommon(lang);
const langPrefix = lang === "es" ? "/es" : "";
---

<dialog id="cmdk" aria-label={c.paletteLabel}>
  <div class="cmdk-box">
    <div class="cmdk-head">
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M14 14l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      <input
        id="cmdk-input"
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="cmdk-list"
        aria-activedescendant=""
        aria-autocomplete="list"
        aria-label={c.paletteLabel}
        placeholder={c.palettePlaceholder}
        autocomplete="off"
        spellcheck="false"
      />
      <span class="cmdk-kbd" aria-hidden="true">esc</span>
    </div>
    <div id="cmdk-list" role="listbox" aria-label={c.paletteLabel}>
      {groups.map((group) => (
        <div class="cmdk-group" data-cmdk-group>
          <div class="cmdk-group-label" aria-hidden="true">{groupLabelsI18n[group.label]?.[lang] ?? group.label}</div>
          {group.ids.map((id) => {
            const tool = tools.find((t) => t.id === id);
            if (!tool) return null;
            const name = toolNamesI18n[tool.id]?.[lang] ?? tool.name;
            return (
              <div
                role="option"
                id={`cmdk-opt-${tool.id}`}
                class="cmdk-item"
                aria-selected="false"
                data-cmdk-item
                data-path={`${langPrefix}${tool.path}`}
                data-haystack={[name, tool.name, ...tool.keywords, group.label].join("|")}
              >
                <span class="cmdk-ico" aria-hidden="true">{tool.icon}</span>
                <span class="cmdk-name">{name}</span>
                <span class="cmdk-enter" aria-hidden="true">↵</span>
              </div>
            );
          })}
        </div>
      ))}
      <div id="cmdk-empty" role="status" hidden>{c.paletteEmpty}</div>
    </div>
    <div class="cmdk-foot" aria-hidden="true">
      <span>↑↓ {c.paletteNavigate}</span>
      <span>↵ {c.paletteGo}</span>
      <span>esc {c.paletteClose}</span>
    </div>
  </div>
</dialog>

<style>
  dialog#cmdk {
    margin: 12vh auto auto;
    width: min(560px, calc(100vw - 32px));
    padding: 0;
    border: 1px solid var(--color-border2);
    border-radius: 12px;
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  }
  dialog#cmdk::backdrop { background: rgba(10, 9, 8, 0.65); }
  @media (prefers-reduced-motion: no-preference) {
    dialog#cmdk[open] { animation: cmdk-in 120ms ease-out; }
    @keyframes cmdk-in { from { opacity: 0; transform: translateY(-6px); } }
  }
  .cmdk-head {
    display: flex; align-items: center; gap: 10px;
    padding: 13px 16px; border-bottom: 1px solid var(--color-border);
    color: var(--color-text-muted);
  }
  .cmdk-head input {
    flex: 1; min-width: 0; background: none; border: none; outline: none;
    font-size: 14px; color: var(--color-text);
  }
  .cmdk-head input::placeholder { color: var(--color-text-dim); }
  .cmdk-kbd {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: var(--color-text-muted); border: 1px solid var(--color-border2);
    border-radius: 5px; padding: 2px 6px;
  }
  #cmdk-list { max-height: min(320px, 50vh); overflow-y: auto; padding: 6px 0; }
  .cmdk-group-label {
    font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--color-text-dim); padding: 8px 16px 4px;
  }
  .cmdk-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 16px; cursor: pointer;
    border-left: 2px solid transparent;
    color: var(--color-text-muted); font-size: 13px;
  }
  .cmdk-item[aria-selected="true"] {
    background: var(--color-surface2);
    border-left-color: var(--color-accent);
    color: var(--color-text);
  }
  .cmdk-item .cmdk-ico {
    font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600;
    color: var(--color-text-muted); border: 1px solid var(--color-border);
    border-radius: 5px; padding: 3px 5px; background: var(--color-bg);
  }
  .cmdk-item[aria-selected="true"] .cmdk-ico { color: var(--color-accent-fg); }
  .cmdk-item .cmdk-enter { margin-left: auto; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--color-text-dim); visibility: hidden; }
  .cmdk-item[aria-selected="true"] .cmdk-enter { visibility: visible; }
  #cmdk-empty { padding: 18px 16px; font-size: 12px; color: var(--color-text-muted); }
  .cmdk-foot {
    display: flex; gap: 14px; padding: 9px 16px;
    border-top: 1px solid var(--color-border);
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: var(--color-text-dim);
  }
</style>

<script>
  import { matchTool } from "../lib/palette-match";

  const dialog = document.getElementById("cmdk") as HTMLDialogElement | null;
  const input = document.getElementById("cmdk-input") as HTMLInputElement | null;
  const list = document.getElementById("cmdk-list");
  const empty = document.getElementById("cmdk-empty");
  const openBtn = document.getElementById("cmdk-open");

  if (dialog && input && list && typeof dialog.showModal === "function") {
    const items = Array.from(list.querySelectorAll<HTMLElement>("[data-cmdk-item]"));
    const groupEls = Array.from(list.querySelectorAll<HTMLElement>("[data-cmdk-group]"));
    let selected: HTMLElement | null = null;

    const visibleItems = () => items.filter((el) => !el.hidden);

    function select(el: HTMLElement | null) {
      if (selected) selected.setAttribute("aria-selected", "false");
      selected = el;
      if (el) {
        el.setAttribute("aria-selected", "true");
        input!.setAttribute("aria-activedescendant", el.id);
        el.scrollIntoView({ block: "nearest" });
      } else {
        input!.setAttribute("aria-activedescendant", "");
      }
    }

    function applyFilter() {
      const q = input!.value;
      for (const el of items) {
        el.hidden = matchTool(q, (el.dataset.haystack || "").split("|")) === null;
      }
      for (const g of groupEls) {
        g.hidden = g.querySelectorAll("[data-cmdk-item]:not([hidden])").length === 0;
      }
      const vis = visibleItems();
      if (empty) empty.hidden = vis.length > 0;
      select(vis[0] ?? null);
    }

    function openPalette() {
      input!.value = "";
      applyFilter();
      dialog!.showModal();
      input!.focus();
    }

    function go(el: HTMLElement | null) {
      const path = el?.dataset.path;
      if (path) {
        dialog!.close();
        window.location.href = path;
      }
    }

    input.addEventListener("input", applyFilter);
    input.addEventListener("keydown", (e) => {
      const vis = visibleItems();
      if (!vis.length) return;
      const idx = selected ? vis.indexOf(selected) : -1;
      if (e.key === "ArrowDown") { e.preventDefault(); select(vis[(idx + 1) % vis.length]); }
      else if (e.key === "ArrowUp") { e.preventDefault(); select(vis[(idx - 1 + vis.length) % vis.length]); }
      else if (e.key === "Enter") { e.preventDefault(); go(selected); }
    });

    list.addEventListener("click", (e) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>("[data-cmdk-item]");
      if (item) go(item);
    });
    list.addEventListener("mousemove", (e) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>("[data-cmdk-item]");
      if (item && item !== selected) select(item);
    });

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close(); // backdrop click
    });

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog!.open) dialog!.close();
        else openPalette();
      }
    });

    // Header trigger button (rendered hidden in Layout; absent on home — guard).
    if (openBtn) {
      openBtn.hidden = false;
      const plat = navigator.platform || "";
      const kbd = openBtn.querySelector("[data-cmdk-kbd]");
      if (kbd) kbd.textContent = /mac|iphone|ipad/i.test(plat) ? "⌘K" : "Ctrl K";
      openBtn.addEventListener("click", openPalette);
    }
  }
</script>
```

- [ ] **Step 2: Verify the component compiles**

Run: `npm run build`
Expected: green (the component isn't rendered anywhere yet — this just catches syntax errors via the build's type/compile pass; if the build doesn't compile unused components, skip and rely on Task 4's build).

- [ ] **Step 3: Commit**

```bash
git add src/components/CmdkPalette.astro
git commit -m "feat(cmdk): palette component (SSR dialog + vanilla behavior, no framework JS)"
```

---

### Task 4: wire-in — Layout + both standalone home pages

**Files:**
- Modify: `src/layouts/Layout.astro` (~line 387 header right side; component render near `<Sidebar>` ~line 371)
- Modify: `src/pages/index.astro` (component import/render + REMOVE the Cmd+K branch from its keydown handler, lines ~548-555)
- Modify: `src/pages/es/index.astro` (same two changes — it mirrors index.astro)

- [ ] **Step 1: Layout — import + render the palette**

Add to Layout.astro frontmatter imports: `import CmdkPalette from "../components/CmdkPalette.astro";`
Render it right after `<Sidebar activeToolId={activeToolId} lang={lang} />`:

```astro
<CmdkPalette lang={lang} />
```

- [ ] **Step 2: Layout — header trigger button**

In the header right-side div (`<div class="flex items-center gap-2 shrink-0" style="min-height: 28px;">`, ~line 387), insert BEFORE `<LangToggle`:

```astro
<button id="cmdk-open" hidden aria-haspopup="dialog" aria-label={c.paletteOpen}>
  <span data-cmdk-kbd>Ctrl K</span>
</button>
```

And add to the existing `<style is:global>` block right below the header (the one with the `.header-badge` media rule):

```css
#cmdk-open { display: none; align-items: center; min-height: 28px; padding: 0 10px;
  border: 1px solid var(--color-border); border-radius: 6px; background: var(--color-surface);
  color: var(--color-text-muted); cursor: pointer; }
#cmdk-open:not([hidden]) { display: inline-flex; }
#cmdk-open:hover { color: var(--color-text); }
#cmdk-open [data-cmdk-kbd] { font-family: 'JetBrains Mono', monospace; font-size: 10px; }
@media (max-width: 639px) { #cmdk-open { display: none !important; } }
```

(`hidden` attr = no-JS story: the script unhides it; the media query keeps it off phones where the hamburger+sidebar serve navigation.)

- [ ] **Step 3: Home pages — render palette + drop the duplicate Cmd+K handler**

In `src/pages/index.astro`:
1. Add import `import CmdkPalette from "../components/CmdkPalette.astro";` and render `<CmdkPalette lang="en" />` immediately before the closing `</body>` (or next to CookieConsent — wherever other components sit at document end).
2. In the home keydown handler (~lines 548-555), DELETE the Cmd+K branch, keeping `/`:

```js
document.addEventListener('keydown', (e) => {
  const ae = document.activeElement as HTMLElement | null;
  const typing = ae && ['INPUT', 'TEXTAREA'].includes(ae.tagName);
  if (e.key === '/' && !typing) { e.preventDefault(); heroInput.focus(); }
});
```

(The palette's own listener now owns Cmd/Ctrl+K everywhere. Leaving the old branch would double-handle the event: both fire, the dialog opens AND the hero gets focus/select — remove it.)

In `src/pages/es/index.astro`: same two changes (`<CmdkPalette lang="es" />`; the ES home mirrors the EN script — find its identical keydown handler and remove the same branch).

- [ ] **Step 4: Build + suite**

Run: `npx vitest run && npm run build`
Expected: all tests pass, build green. If `public/sitemap.xml` gets a lastmod diff from the prebuild, leave it uncommitted (deploy step owns it).

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Layout.astro src/pages/index.astro src/pages/es/index.astro
git commit -m "feat(cmdk): wire palette into layout + standalone home pages, header trigger"
```

---

### Task 5: e2e coverage

**Files:**
- Create: `e2e/cmdk.spec.ts`

The Playwright config (port 4392) auto-builds nothing — it runs `astro preview`, so `npm run build` MUST have run first (Task 4 did).

- [ ] **Step 1: Write the e2e spec**

```ts
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
```

- [ ] **Step 2: Run e2e**

Run: `npx playwright test e2e/cmdk.spec.ts`
Expected: 6/6 pass. If the "fuga" test selects an unexpected first match, inspect which earlier item matched (subsequence tier) and tighten the query to "fugas" — the assertion stays on the webrtc URL.

- [ ] **Step 3: Run the FULL e2e suite (regression)**

Run: `npx playwright test`
Expected: all pass (pre-existing specs in `e2e/` keep passing — the dialog must not interfere with other pages' tests).

- [ ] **Step 4: Commit**

```bash
git add e2e/cmdk.spec.ts
git commit -m "test(cmdk): e2e coverage (open/filter/navigate/ES/home coexistence)"
```

---

### Task 6: gates — full suite, build, axe with the palette OPEN

- [ ] **Step 1: Full suite + build**

Run: `npx vitest run && npm run build`
Expected: green (~279 tests: 267 + 12 new).

- [ ] **Step 2: axe sweep with the palette open**

```bash
npm i -D --no-save axe-core
npx astro preview --port 4321 >/tmp/preview-cmdk.log 2>&1 &
sleep 3
cat > /tmp/axe-cmdk.cjs <<'JS'
const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const path of ['/ssl-checker/', '/es/ssl-checker/', '/', '/es/']) {
    const p = await b.newPage();
    await p.goto('http://localhost:4321' + path, { waitUntil: 'networkidle' });
    await p.keyboard.press('Control+k');
    await p.waitForTimeout(400);
    await p.addScriptTag({ path: require.resolve('/home/vant/dev/pingthat/node_modules/axe-core/axe.min.js') });
    const r = await p.evaluate(() => axe.run());
    const serious = r.violations.filter(v => ['serious', 'critical'].includes(v.impact));
    console.log(path, '(palette open) ->', serious.length, 'serious/critical');
    for (const v of serious) { bad++; console.log(' ', v.id, v.impact, JSON.stringify(v.nodes.map(n => n.target).slice(0, 5))); }
    await p.close();
  }
  await b.close();
  process.exit(bad ? 1 : 0);
})();
JS
node /tmp/axe-cmdk.cjs
```

Expected: 0 serious/critical on all four. Watch specifically: combobox ARIA (`aria-activedescendant` pointing at a hidden option = violation — selection must always be a VISIBLE option or empty), contrast of `.cmdk-group-label` / `.cmdk-kbd` (`--color-text-dim` on `--color-surface` — if axe flags contrast on them, bump to `--color-text-muted`), and the `role="status"` empty div. Fix on the NEW surfaces, re-run until clean, commit as `fix(cmdk): a11y fixes from axe gate`. Pre-existing issues elsewhere: report, don't fix. Kill the preview when done.

---

### Task 7: merge + deploy + live verify (main session, NOT a subagent)

- [ ] **Step 1:** `git checkout master && git merge --no-ff stage3/cmdk-palette -m "merge: stage-3 #4 Cmd+K command palette"`
- [ ] **Step 2:** `npm run build` + commit the sitemap lastmod bump if present
- [ ] **Step 3:** `npx wrangler pages deploy dist/ --project-name=pingthat --branch=main --commit-message="stage-3 #4 cmdk palette"`
- [ ] **Step 4:** Live verify on pingthat.dev (tool page + home + ES: open, filter, navigate, button, no console/CSP errors — the palette ships zero external requests so prod CSP is untouched) + prod axe quick pass (bypassCSP context)
- [ ] **Step 5:** `git push origin master` (CI), delete branch, update memory.

---

## Self-review (done at write time)

- **Spec coverage:** §1 trigger/button/overlay/keyboard/focus → T3 script + T4 button; §2 content/i18n → T3 markup (Sidebar data pattern) + T2 keys; §3 architecture (pure lib / SSR markup / vanilla script) → T1+T3; §4 a11y → T3 (dialog/combobox/listbox/status) + T6 axe-open gate; §5 edge cases → T3 (`showModal` guard, hidden button), T4 (home handler dedup; home-not-in-Layout covered by rendering in both index pages); §6 testing → T1 unit, T5 e2e, T6 gates; §7 out-of-scope respected.
- **Placeholders:** none; all code complete.
- **Type consistency:** `normalize`/`scoreMatch`/`matchTool` defined T1, imported in T3 (`matchTool` only); i18n keys `paletteLabel/paletteOpen/palettePlaceholder/paletteEmpty/paletteNavigate/paletteGo/paletteClose` defined T2 = consumed T3/T4 (`c.paletteOpen` in Layout button); ids `cmdk/cmdk-input/cmdk-list/cmdk-empty/cmdk-open` consistent across T3 markup, T3 script, T4 button, T5 e2e, T6 axe script.
