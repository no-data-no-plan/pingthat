# PT Stage-3 #4 — Cmd+K command palette (grouped, tools-only)

**Date:** 2026-06-11
**Branch:** `stage3/cmdk-palette` (off master, current HEAD `1a15dae`)
**Status:** design approved (brainstorm 2026-06-11; Marco picked: palette-first order, tools-only content, grouped-by-category style; standing delegation "tira sin confirmación")
**Frame:** Stage-3 craft/UX item, explicitly LOW SEO value (accepted). Today Cmd/Ctrl+K and `/` only exist on the homepage (they focus the hero search, which filters home cards); the 24 tool pages and 6 static pages have NO search and no fast tool-to-tool jump. This adds a site-wide command palette for the keyboard-centric dev audience.

---

## 1. Approved UX (visual-companion mockup, option A)

- **Trigger:** Cmd/Ctrl+K opens the palette on EVERY page, including the home (one mental model; the home's `/` shortcut keeps focusing the hero search — unchanged). Guard: ignore when focus is in INPUT/TEXTAREA only for `/`; Cmd/Ctrl+K always wins (matches current home handler semantics where Cmd+K works even while typing).
- **Discoverability:** a discreet "⌘K"/"Ctrl K" button in the tool-page sticky header, right side, BEFORE `LangToggle` (`src/layouts/Layout.astro` ~line 387). Detects platform client-side (`navigator.platform` contains Mac → "⌘K", else "Ctrl K"); SSR default "Ctrl K". Hidden below `sm` (mobile has the hamburger sidebar; the header is already tight — the privacy badge hides below 639px the same way). Button opens the palette on click; `aria-haspopup="dialog"`, `aria-label` EN/ES.
- **Overlay (mockup A):** centered box max-width 560px, backdrop dimmed. Top: search input (combobox) + `esc` kbd chip. Middle: results **grouped under category labels** (Network, Security, Speed & Uptime, Calculators — same mental map as sidebar/home); groups with no matching tools disappear while filtering. Selected row: `--color-surface2` background + 2px left border `--color-accent` + `↵` hint. Footer: `↑↓ navegar · ↵ abrir · esc cerrar` (localized) in JetBrains Mono 10px muted.
- **Keyboard:** ↑/↓ moves selection across visible items (wraps), Enter navigates to the selected tool's path, Esc closes (native dialog `cancel`), backdrop click closes. Typing filters live; selection resets to the first visible item on every input change. Open resets to empty query + all 24 visible.
- **Focus:** input autofocused on open; on close, focus returns to the element that had it (native `<dialog>` behavior covers this; verify).

## 2. Content + i18n

- Tools-only (the 24), from `src/lib/tools.ts` `groups` (display order) + `tools` (name, path, icon, keywords). NO nav entries, NO actions, NO recents (YAGNI — discarded in brainstorm).
- ES pages render ES names from `toolNamesI18n` (`src/i18n/pages.ts:1894`), ES group labels from `groupLabelsI18n` (`:1969`), and `/es`-prefixed paths (Layout convention `'/es' + tool.path`, see `Layout.astro:73-77`).
- New i18n strings (EN+ES) in `src/i18n/common.ts` (the palette is layout-level, not a tool component): placeholder ("Jump to a tool…" / "Salta a una herramienta…"), empty state ("No tools match" / "Ninguna herramienta coincide"), open-button aria-label ("Open command palette" / "Abrir paleta de comandos"), footer hints (navigate/open/close words).
- Matching runs over BOTH the localized name and the EN keywords/name (a Spanish user typing "dns" or "huella" must both work; keywords are EN-only — acceptable, declared).

## 3. Architecture (the perf-preserving decision)

| Unit | Responsibility |
|---|---|
| `src/lib/palette-match.ts` (NEW, pure) | `scoreMatch(query: string, haystack: string): number | null` — case/diacritic-insensitive (NFD strip); tiers: exact-prefix 4 > word-boundary-prefix 3 > substring 2 > in-order subsequence 1 > null. `matchTool(query, fields: string[]): number | null` = best score across fields. Unit-tested (vitest), incl. diacritics ("huella" matches "Huella Canvas", "resolucion" matches "Resolución"). |
| `Layout.astro` markup | SSR'd hidden `<dialog id="cmdk" aria-label=...>` rendered ONCE in Layout (all pages): combobox input + per-group `<div data-group>` label + `<ul role="listbox">` of `<li role="option" id="cmdk-opt-{id}" data-name data-keywords data-path>` items with icon chip + localized name. Zero client-side DOM construction. Also the header "⌘K" button. Styling: scoped `<style>` in Layout (or global.css section) using existing tokens; `prefers-reduced-motion` disables the open scale/fade. |
| Layout `<script>` (vanilla, ~100 lines) | The behavior module, following Layout's existing vanilla-script pattern (menu-toggle, `Layout.astro:501+`): global keydown (Cmd/Ctrl+K toggle), open/close (`dialog.showModal()`/`.close()`), input filtering via `matchTool` (imported — Astro bundles module scripts; NOT `is:inline`), show/hide items + empty groups via `hidden` attr, rank-independent DOM order (grouped layout = filter only, no reordering — group A's mockup), selection = first VISIBLE item after each input change (predictable; scores gate visibility only), arrow/enter/activedescendant management, platform-aware button label. **No Svelte runtime added to any page** — the 6 static pages keep zero framework JS; Lighthouse 100 untouched. |

Why not a Svelte island: it would ship the Svelte runtime + hydration to every page (including the 6 currently-zero-JS static pages) for ~100 lines of imperative behavior. Vanilla in Layout is the established pattern for layout-level behavior.

Why filter-only (no relevance reordering): grouped presentation (approved mockup A) keeps DOM order = sidebar order; `palette-match` scores are used as a VISIBILITY threshold (null = hide), and selection is simply the first visible item — predictable, no mid-list jumps. The score TIERS still exist in the lib (unit-tested) so a future flat/ranked mode can reuse them, but the palette only consumes match-or-null today.

## 4. A11y (where the axe gate will look)

- Native `<dialog>` + `showModal()`: focus trap, Esc, `::backdrop`, focus restore — free and correct.
- Input: `role="combobox"`, `aria-expanded="true"` (while open), `aria-controls="cmdk-list"`, `aria-activedescendant` pointing at the selected option id, `aria-autocomplete="list"`.
- Listbox container `id="cmdk-list"` `role="listbox"`; options `role="option"` + `aria-selected`. Group labels are presentational (`aria-hidden` + the option gets `data-group` — screen readers navigate the flat listbox; group headers as visual aid only). This avoids the `group`-in-listbox ARIA pattern that axe flags inconsistently across engines.
- Selected row never relies on color alone (left border + bg + the `↵` glyph).
- Empty state is a live region (`role="status"`) so SR users hear "No tools match".
- The header button: real `<button>`, visible focus, 44px min target.

## 5. Edge cases

- JS disabled: button hidden (it's rendered but does nothing → render it with `hidden` and unhide in the script), dialog never opens — site fully usable without it.
- Old browsers without `<dialog>`: `typeof dialog.showModal !== 'function'` → script no-ops entirely (button stays hidden). No polyfill (baseline support is universal since 2022).
- Home page: palette AND hero-search coexist; Cmd+K opens palette (replaces the current focus-hero behavior), `/` keeps focusing hero search. The old home handler (`index.astro:548-555`) drops its Cmd+K branch (now handled by Layout) and keeps `/`.
- ES diacritics + case handled in the pure lib (NFD normalize, lowercase).

## 6. Testing + gates

- **Unit (vitest):** `palette-match.test.ts` — tier ordering (prefix > word-boundary > substring > subsequence > null), diacritic/case insensitivity, multi-field `matchTool` best-of, empty query → null-or-max contract (empty query = show all: define `matchTool('', …) → 0` sentinel "match-all").
- **i18n:** new common.ts keys EN+ES (parity enforced by existing i18n completeness pattern if it covers common.ts — verify; if not, the keys ship in both langs by construction).
- **e2e (playwright, existing suite dir `e2e/`):** open-with-keyboard → type "dns" → Enter navigates to /dns-lookup/; Esc closes; works on a tool page AND on home; ES page navigates to `/es/...`.
- **Gates (stage-3 flow):** full vitest → `npm run build` → axe sweep EN+ES **with the palette open** (0 serious/critical) → merge --no-ff → deploy → live verify on pingthat.dev (+ GitHub CI green).

## 7. Out of scope (explicit)

- Nav/static-page entries, contextual actions, recents/frequency, fuzzy-highlight of matched chars, analytics events, mobile-specific palette UI (sidebar already serves mobile), Svelte rewrite of layout scripts.
