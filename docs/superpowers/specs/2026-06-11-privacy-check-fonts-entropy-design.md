# PT Stage-3 #3 — privacy-check enhancement: fonts + identifiability tiers + honest verdict

**Date:** 2026-06-11
**Branch:** `stage3/privacy-fp` (off master, current HEAD `b8febb5`)
**Status:** design approved (brainstorm 2026-06-09 → 2026-06-11; Marco delegated remaining approvals "tira sin confirmación")
**Frame:** Inspired by EFF CoverYourTracks (Panopticlick). PT's existing `privacy-check` already collects nearly every EFF signal — the gap is (a) **font detection** and (b) an **identifiability axis** telling the user WHICH signals make them trackable. Enhancement of the existing tool, NOT a new tool/page (decided in brainstorm vs. building a separate fingerprint tool).

---

## 1. The honesty constraint (decisive)

EFF compares your browser against ~1M real visitors and can honestly say "1 in X browsers share your fingerprint". **PingThat has no population dataset** — any "you are unique among N" claim would be fabrication. Approved framing (option C):

- Per-signal **qualitative tier** chip: `IDENTIFIES: HIGH / MEDIUM / LOW` ("IDENTIFICA: ALTA / MEDIA / BAJA").
- The hard numbers live in the **InfoTip**, citing the published estimate verbatim with its source and its limits.
- A **summary VerdictBanner**: "Your browser exposes N high-identifiability signals" — derived only from counting our own tier classifications. Never "unique among X".
- Same honest pattern as the ssl-checker grade badge (rubric + limits declared in tooltip) and net-ping's ICMP caveat.

## 2. Verified entropy data (fact-checked 2026-06-11 against the papers)

Sources (both PDFs read, tables extracted):

- **Eckersley 2010**, "How Unique Is Your Web Browser?", PETS 2010 — Table 2 (p.17), *mean surprisal per variable*: plugins 15.4 bits · **fonts 13.9** (full system list via Flash/Java) · user agent 10.0 · http_accept 6.09 · video/screen 4.83 · timezone 3.04 · supercookies 2.12 · cookies_enabled 0.353. Already cited in `src/data/sources.ts` under `privacy-check`.
- **Laperdrix et al. 2016**, "Beauty and the Beast", IEEE S&P 2016 — Appendix A, *normalized Shannon entropy, All column* (N=118,934 → H_max = log2(N) ≈ 16.86 bits): user agent 0.580 · plugins 0.656 · **fonts (Flash) 0.497** · **canvas 0.491** · content language 0.351 · screen (JS) 0.290 · **WebGL renderer 0.202** · timezone 0.198 · platform (JS) 0.137 · WebGL vendor 0.127 · DNT 0.056 · cookies 0.015 · local/session storage 0.024. **To be ADDED to sources.ts.**

### Tier rubric (pure, data-driven — the data overruled intuition: WebGL renderer is MEDIUM, not HIGH)

Thresholds on Laperdrix normalized entropy (All): **HIGH ≥ 0.4 · MEDIUM 0.1–0.4 · LOW < 0.1**.

| Signal key | Tier | Published anchor (goes in InfoTip) |
|---|---|---|
| `fonts` (NEW) | HIGH | 0.497 norm (Laperdrix 2016); 13.9 bits full-list (Eckersley 2010). Caveat: those measure the FULL system list; we width-test a ~120-font subset. |
| `canvas` | HIGH | 0.491 norm (Laperdrix 2016) |
| `language` | MEDIUM | 0.351 norm (content language, Laperdrix 2016) |
| `screen` | MEDIUM | 0.290 norm (Laperdrix 2016) |
| `webgl` | MEDIUM | 0.202 norm — renderer (Laperdrix 2016) |
| `timezone` | MEDIUM | 0.198 norm (Laperdrix 2016) |
| `platform` | MEDIUM | 0.137 norm (Laperdrix 2016) |
| `dnt` | LOW | 0.056 norm (Laperdrix 2016) |
| `cookies` | LOW | 0.015 norm (Laperdrix 2016) |
| `audio` | LOW | No comparable published estimate for what WE measure (API availability only — a ~binary signal). Tooltip says so. |
| `cores`, `memory`, `touch` | LOW | No per-attribute estimate in the cited papers; few possible values. Tooltip says so. |
| `webrtc` | — (no tier) | Leak check, not an entropy signal. Card unchanged. |

## 3. Approved UX (visual-companion mockups, tokens = real warm-dark)

1. **Fonts card** (option B): value "47 of 120 checked" + disclosure "show all 47" expanding the full detected list. Card sits in the normal grid (`grid-row: span 2` NOT needed — natural height when expanded).
2. **Tier chip placement** (option A): card footer — hairline `border-top: 1px solid var(--color-border)` row with a subtle outlined chip: colored dot (`--color-warn` HIGH / `--color-info` MEDIUM / `--color-ok` LOW) + `IDENTIFIES: HIGH`. StatusBadge (safe/exposed/note) stays top-right untouched — two orthogonal axes, visually separated. The chip is deliberately NOT a filled StatusBadge so "orange = alarm" isn't duplicated.
3. **VerdictBanner** (existing component, used by 5 tools) between the header card and the explainer note: title "Your browser exposes N high-identifiability signals", sub explaining recognizability across visits without cookies + "classification based on published estimates (EFF 2010, AmIUnique 2016), not a measurement of you". Level: `warn` if N>0, `ok` if N=0 (title then: "No high-identifiability signals exposed").
4. Existing per-signal InfoTips keep working; tier tooltips are additive.

## 4. Architecture (pure libs + thin component — the grade.ts / ping-stats.ts pattern)

| File | Responsibility |
|---|---|
| `src/lib/font-detect.ts` (NEW) | PURE + injectable. `FONT_CANDIDATES: readonly string[]` (~120 curated: Windows core, macOS, Linux, office/Adobe, developer fonts). `type MeasureFn = (fontStack: string) => number`. `detectFonts(measure: MeasureFn): { detected: string[]; tested: number }` — candidate F is detected iff width of `"F", <baseline>` differs from baseline-only width for ANY of the 3 baselines (`monospace`, `sans-serif`, `serif`); test string `"mmmMMMwwlfi10O"` @ 72px. `createCanvasMeasure(): MeasureFn | null` — the only DOM-bound piece (canvas 2D `measureText`); returns `null` when unavailable → caller renders "Not available" with status `note`. Unit tests use a fake `MeasureFn`. |
| `src/lib/fp-tiers.ts` (NEW) | PURE. `type IdentTier = 'high'|'medium'|'low'`. `type SignalKey = 'dnt'|'cookies'|'webrtc'|'canvas'|'audio'|'webgl'|'timezone'|'screen'|'language'|'cores'|'memory'|'touch'|'platform'|'fonts'`. `TIERS: Partial<Record<SignalKey, IdentTier>>` (webrtc absent). `summarizeIdentifiability(items: {key: SignalKey; status: 'safe'|'exposed'|'note'}[]): { highExposed: number; level: Level }` — counts signals with tier `high` AND status `exposed`; level `warn` if >0 else `ok`. Unit tests for the mapping + the summary. |
| `src/components/PrivacyCheck.svelte` | **Targeted refactor:** `CheckItem` gains stable `key: SignalKey` (today `getStatus()` string-compares localized labels — fragile; tiers must not key off labels). Add fonts collection in the existing `onMount` (sync, ~120×3 `measureText`, <50ms; status `exposed` if detected>0, `note` if detected==0 — an empty list is rare/Tor-like, not "safe" — and `note` + "Not available" if no canvas). Add footer tier-chip row to cards whose key has a tier; expandable fonts list (button + conditional render, `aria-expanded`); VerdictBanner wired to `summarizeIdentifiability`; `copyReport` lines gain ` {IDENT: HIGH}` marker + banner summary line at top. |
| `src/i18n/components.ts` | `privacyCheckI18n` EN+ES additions: fonts labels (label, "N of M checked", show/hide all, not available), tier words (identifies/high/medium/low), banner title (count-templated) + sub, per-signal tier tooltips **with the verified figures baked in** (fonts tooltip carries the subset caveat; audio/cores/memory/touch tooltips say "no comparable published estimate"). |
| `src/data/sources.ts` | Add Laperdrix et al. 2016 ("Beauty and the Beast: Diverting Modern Web Browsers to Build Unique Browser Fingerprints", IEEE S&P 2016, pp. 878–894) to `privacy-check`. |
| `src/i18n/pages.ts` | +1 FAQ EN+ES on `privacy-check`: "What does 'identifiability' mean?" — honest answer: qualitative tiers from published population studies; PT does not maintain a visitor dataset and cannot say "1 in X". |
| `src/lib/tools.ts` | `privacy-check` keywords += `font fingerprint`, `browser entropy` (description unchanged). |

**No new page → no sitemap entry needed** (the prebuild lastmod-bumps the existing privacy-check entries; the hand-maintained-sitemap gotcha does NOT bite here).
**No network calls → CSP `connect-src` constraint irrelevant; no Pages Function.**

## 5. Edge cases + risks

- **No canvas / measureText throws** → `createCanvasMeasure()` returns null → fonts card "Not available", status `note`; everything else unaffected.
- **Webfont false positives:** the page itself loads webfonts; if a candidate name collides with a loaded webfont it would measure as "installed". Mitigation: detection runs against generic-family baselines and PT's UI stack is system-ui; the value label says "checked by measurement" (declared method, not absolute truth). Accepted noise.
- **Mobile:** few fonts detected → honest low count; tier chip still HIGH (the *signal class* is high-identifiability, not this user's count) — tooltip explains the class framing.
- **i18n regression:** existing `getStatus` refactor to keys touches every signal — covered by keeping the visible EN/ES strings identical (only the comparison mechanism changes).
- **A11y:** disclosure button needs `aria-expanded` + visible focus; tier chip text must pass contrast on `--color-surface` (muted text + border, dot is decorative `aria-hidden`); banner is text (VerdictBanner already accessible). Axe sweep EN+ES gates the merge (stage-2/3 precedent: axe has caught real bugs every round).

## 6. Testing + gates

- **Unit (vitest):** `font-detect.test.ts` — FONT_CANDIDATES sanity (no dups, non-empty strings, 100–150 count); `detectFonts` with fake measures (detected iff any baseline differs; none detected when all equal; deterministic order). `fp-tiers.test.ts` — every SignalKey except `webrtc` has a tier; rubric consistency (HIGH set = {fonts, canvas} per the verified data); `summarizeIdentifiability` (0 high-exposed → `ok`; counts only `high`+`exposed`, ignores `note`).
- **Suite:** all existing tests stay green (254+).
- **Gates (stage-3 flow):** `npm run build` green → axe EN+ES on `/privacy-check/` 0 serious/critical → merge `--no-ff` → CF Pages deploy → live verify (banner renders, fonts count + expand works, tier chips + tooltips, copy report).

## 7. Out of scope (YAGNI, explicit)

- No population dataset, no "1 in X" claims, no uniqueness scoring.
- No `queryLocalFonts` (permission prompt, Chromium-only).
- No plugins/UA-string signals (plugins API is dead in modern browsers; platform covers the OS axis).
- No grid reordering by tier (option discarded in brainstorm).
- WebRTC card untouched.
