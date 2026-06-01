# PT Stage-2 Step 4 — Shared Severity Pattern (G4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Roll out one shared 2-level severity pattern (a `StatusBadge` primitive + a `VerdictBanner` escalation) across the 15 verdict tool components, plus a warm-dark color-token sweep, so tool results render a consistent, WCAG-AA, calm-by-default verdict language.

**Architecture:** A pure helper `src/lib/severity.ts` returns presentation (icon glyph + localized aria label — never color strings). Two dumb Svelte 5 primitives in `src/components/ui/` resolve color via a CSS class-map (`.is-{level}`) for CSP-safety. Each tool keeps its own domain logic and maps its already-computed state → `{ level, escalate }` locally, against a shared rubric. Banner (level 2) escalates only for 5 security tools at their critical state.

**Tech Stack:** Astro 6, Svelte 5.55 (runes), Tailwind 4, Vitest 4 (node env), Playwright (port 4392). No new runtime deps.

**Spec:** `docs/superpowers/specs/2026-06-01-pt-stage2-step4-severity-design.md` (read it; this plan implements it).

---

## Testing approach (read first — infra reality)

PT's Vitest runs in **node env** (`vitest.config.ts`), include `src/**/*.test.ts` only — **no jsdom / testing-library**, so Svelte components cannot be unit-tested without adding deps (against PT's "no extra libs" ethos). Therefore:

- **Logic** → `severity.ts` gets real Vitest unit tests (node).
- **Primitive compile/typecheck** → `npm run build` (Astro build compiles + typechecks every `.svelte`) must stay green after each component task.
- **Real-render smoke** → ONE Playwright e2e assertion on `password-strength` (the only pure-client verdict tool; deterministic in `astro preview`) validates the badge renders with the right class + accessible name end-to-end (Task 18).
- **Cross-tool visual + a11y** → **Checkpoint A** (after the 5 escalation tools) and **Checkpoint B** (after the rest) run an axe-core a11y pass against a local instance, plus the step-5 merge gates.
- **Regression guard** → `npm test` (226 baseline) green + `npm run test:e2e` green at every commit.

This is a deliberate, documented deviation from the spec §7 wording "primitives get unit tests": the *testable logic* is extracted to `severity.ts` (fully unit-tested); the primitives are presentation-only and verified via build + e2e + a11y checkpoints.

---

## File Structure

**Create:**
- `src/lib/severity.ts` — `Level` type + `levelIcon()` + `levelAria()`. Pure, no color strings.
- `src/lib/severity.test.ts` — unit tests for the above.
- `src/components/ui/StatusBadge.svelte` — LED + icon + label primitive (+ `dotOnly` mode).
- `src/components/ui/VerdictBanner.svelte` — level-2 tinted banner with `{@render children()}`.

**Modify:**
- `src/styles/global.css` — add `.sr-only` + `.sev-accent` class-map (no `.sr-only` exists today).
- 15 verdict components in `src/components/*.svelte` (see Tasks 5-18).
- 8 informational components — token sweep only (Task 19).
- i18n: add banner copy keys for `http-headers` + `email-auth` in `src/i18n/components.ts` (EN+ES).
- `e2e/tools.spec.ts` — add password-strength badge assertion (Task 18).

---

## Migration Recipe (referenced by every component task)

Every verdict-component task applies this transformation. The per-task table gives the tool's exact state→`{level, escalate}` mapping; the mechanics below are identical.

**A. Imports** (top of `<script>`):
```ts
import StatusBadge from './ui/StatusBadge.svelte';
// escalation tools only:
import VerdictBanner from './ui/VerdictBanner.svelte';
import type { Level } from '../lib/severity';
```

**B. Classification** — add a `$derived` that maps the component's EXISTING computed state to a verdict. Never invent new analysis; switch on what the tool already computes. Shape:
```ts
const verdict = $derived<{ level: Level; escalate: boolean; label: string }>(
  /* map from existing state per the task's mapping table */
);
```

**C. Header badge** — replace the ad-hoc status header (emoji + colored text) with:
```svelte
<StatusBadge level={verdict.level} label={verdict.label} {lang} />
```

**D. Escalation (5 tools only)** — render the badge inside a banner at the critical state:
```svelte
{#if verdict.escalate}
  <VerdictBanner level={verdict.level} title={/* existing status string */} explanation={/* existing explanation string */} {lang}>
    <StatusBadge level={verdict.level} label={verdict.label} size="sm" {lang} />
  </VerdictBanner>
{:else}
  <StatusBadge level={verdict.level} label={verdict.label} {lang} />
{/if}
```

**E. Accent bar** — where a result `.card` used an ad-hoc severity `border-left`, replace the inline color with the class-map: add `class="card sev-accent is-{verdict.level}"` and DELETE the inline `style="border-left: 3px solid {adHocColor}"`.

**F. Error card** — keep the existing error card structure, but change `var(--color-red)` → `var(--color-bad)`. Do NOT give it a badge or banner — "tool failed" ≠ "result is bad".

**G. Cleanup** — delete the now-dead ad-hoc severity helpers (`expiryColor()`-style functions) and any `var(--color-yellow, …)` / `var(--color-green|red, …)` *severity* usages. Leave decorative non-severity colors alone.

**Per-row status (opt-in only):** if a row genuinely has independent status, use `<StatusBadge level={…} dotOnly label={…} {lang} />` AND keep the row's existing glyph/value (the dot is decorative). Do NOT replace a glyph+text row with a bare dot.

**Commit message:** `redesign(stage2): <tool> severity badge` (+ `+ banner` for escalation tools).

---

## Task 1: severity.ts helper + unit tests

**Files:**
- Create: `src/lib/severity.ts`
- Test: `src/lib/severity.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/severity.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { levelIcon, levelAria, type Level } from './severity';

describe('severity', () => {
  const levels: Level[] = ['ok', 'warn', 'bad', 'info'];

  it('returns a distinct icon glyph per level', () => {
    expect(levelIcon('ok')).toBe('✓');   // ✓
    expect(levelIcon('warn')).toBe('!');
    expect(levelIcon('bad')).toBe('✕');  // ✕
    expect(levelIcon('info')).toBe('i');
    expect(new Set(levels.map(levelIcon)).size).toBe(levels.length);
  });

  it('returns a localized aria label per level', () => {
    expect(levelAria('ok', 'en')).toBe('OK');
    expect(levelAria('ok', 'es')).toBe('Correcto');
    expect(levelAria('bad', 'es')).toBe('Problema');
    expect(levelAria('warn', 'es')).toBe('Advertencia');
    expect(levelAria('info', 'es')).toBe('Información');
  });

  it('defaults the aria label to English', () => {
    expect(levelAria('warn')).toBe('Warning');
  });

  it('never returns a color/hex string (presentation = icon + aria only)', () => {
    for (const l of levels) expect(levelIcon(l)).not.toMatch(/#|var\(|rgb/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/vant/dev/pingthat && npx vitest run src/lib/severity.test.ts`
Expected: FAIL — cannot resolve `./severity`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/severity.ts`:
```ts
import type { Lang } from '../i18n/index';

export type Level = 'ok' | 'warn' | 'bad' | 'info';

const ICON: Record<Level, string> = {
  ok: '✓',   // ✓
  warn: '!',
  bad: '✕',  // ✕
  info: 'i',
};

const ARIA: Record<Level, Record<Lang, string>> = {
  ok:   { en: 'OK',      es: 'Correcto' },
  warn: { en: 'Warning', es: 'Advertencia' },
  bad:  { en: 'Problem', es: 'Problema' },
  info: { en: 'Info',    es: 'Información' },
};

export function levelIcon(level: Level): string {
  return ICON[level];
}

export function levelAria(level: Level, lang: Lang = 'en'): string {
  return ARIA[level][lang] ?? ARIA[level].en;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/severity.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the full suite (no regressions)**

Run: `npm test`
Expected: all green (226 baseline + 4 new).

- [ ] **Step 6: Commit**

```bash
git add src/lib/severity.ts src/lib/severity.test.ts
git commit -m "feat(stage2): severity.ts presentation helper + unit tests"
```

---

## Task 2: Global CSS additions (.sr-only + .sev-accent)

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add the utilities**

Append near the other utility blocks in `src/styles/global.css`:
```css
/* Stage-2 severity (G4): screen-reader-only text + result-card accent bar.
   Accent uses the class-map (not inline style) for strict-CSP safety. */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.sev-accent { border-left: 3px solid transparent; }
.sev-accent.is-ok   { border-left-color: var(--color-ok); }
.sev-accent.is-warn { border-left-color: var(--color-warn); }
.sev-accent.is-bad  { border-left-color: var(--color-bad); }
.sev-accent.is-info { border-left-color: var(--color-info); }
```

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`
Expected: build succeeds (CSS is valid, no Astro errors).

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(stage2): add .sr-only + .sev-accent class-map utilities"
```

---

## Task 3: StatusBadge.svelte primitive

**Files:**
- Create: `src/components/ui/StatusBadge.svelte`

- [ ] **Step 1: Create the component**

`src/components/ui/StatusBadge.svelte`:
```svelte
<script lang="ts">
  import type { Lang } from '../../i18n/index';
  import { levelIcon, levelAria, type Level } from '../../lib/severity';

  interface Props {
    level: Level;
    label?: string;
    size?: 'md' | 'sm';
    dotOnly?: boolean;
    lang?: Lang;
  }
  let { level, label = '', size = 'md', dotOnly = false, lang = 'en' }: Props = $props();
  const icon = $derived(levelIcon(level));
  const aria = $derived(levelAria(level, lang));
</script>

{#if dotOnly}
  <span class="sev-dot is-{level} size-{size}" aria-hidden="true"></span>
  <span class="sr-only">{label || aria}</span>
{:else}
  <span class="sev-badge is-{level} size-{size}">
    <span class="sev-led" aria-hidden="true"></span>
    <span class="sev-icon" aria-hidden="true">{icon}</span>
    <span class="sev-label">{label || aria}</span>
  </span>
{/if}

<style>
  .sev-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; padding: 3px 9px; border-radius: 999px; border: 1px solid; }
  .sev-badge.size-sm { font-size: 10px; padding: 2px 7px; }
  .sev-led { width: 8px; height: 8px; border-radius: 50%; flex: none; }
  .sev-icon { font-weight: 700; }
  .sev-label { white-space: nowrap; }
  .sev-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
  .sev-dot.size-sm { width: 7px; height: 7px; }

  .sev-badge.is-ok   { color: var(--color-ok);   background: var(--color-ok-dim);   border-color: var(--color-ok-edge); }
  .sev-badge.is-warn { color: var(--color-warn); background: var(--color-warn-dim); border-color: var(--color-warn-edge); }
  .sev-badge.is-bad  { color: var(--color-bad);  background: var(--color-bad-dim);  border-color: var(--color-bad-edge); }
  .sev-badge.is-info { color: var(--color-info); background: var(--color-info-dim); border-color: var(--color-info-edge); }

  .sev-badge.is-ok   .sev-led { background: var(--color-ok); }
  .sev-badge.is-warn .sev-led { background: var(--color-warn); }
  .sev-badge.is-bad  .sev-led { background: var(--color-bad); }
  .sev-badge.is-info .sev-led { background: var(--color-info); }

  .sev-dot.is-ok   { background: var(--color-ok); }
  .sev-dot.is-warn { background: var(--color-warn); }
  .sev-dot.is-bad  { background: var(--color-bad); }
  .sev-dot.is-info { background: var(--color-info); }
</style>
```

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`
Expected: build succeeds; no Svelte/TS errors for the new file.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/StatusBadge.svelte
git commit -m "feat(stage2): StatusBadge primitive (LED + icon + label, dotOnly + sr-only)"
```

---

## Task 4: VerdictBanner.svelte primitive

**Files:**
- Create: `src/components/ui/VerdictBanner.svelte`

- [ ] **Step 1: Create the component**

`src/components/ui/VerdictBanner.svelte`:
```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { levelIcon, type Level } from '../../lib/severity';

  interface Props {
    level: Level;
    title: string;
    explanation?: string;
    children?: Snippet;
  }
  let { level, title, explanation = '', children }: Props = $props();
  const icon = $derived(levelIcon(level));
</script>

<div class="sev-banner is-{level}" role="group">
  <span class="sev-banner-ico" aria-hidden="true">{icon}</span>
  <div class="sev-banner-text">
    <div class="sev-banner-title">{title}</div>
    {#if explanation}<div class="sev-banner-exp">{explanation}</div>{/if}
  </div>
  {#if children}<div class="sev-banner-badge">{@render children()}</div>{/if}
</div>

<style>
  .sev-banner { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: 10px; border: 1px solid var(--color-border); }
  /* solid left bar (NOT the -edge token, which fails 1.4.11 in isolation) */
  .sev-banner.is-ok   { background: var(--color-ok-dim);   border-left: 3px solid var(--color-ok); }
  .sev-banner.is-warn { background: var(--color-warn-dim); border-left: 3px solid var(--color-warn); }
  .sev-banner.is-bad  { background: var(--color-bad-dim);  border-left: 3px solid var(--color-bad); }
  .sev-banner.is-info { background: var(--color-info-dim); border-left: 3px solid var(--color-info); }
  .sev-banner-ico { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 13px; font-weight: 700; flex: none; color: var(--color-bg); }
  .sev-banner.is-ok   .sev-banner-ico { background: var(--color-ok); }
  .sev-banner.is-warn .sev-banner-ico { background: var(--color-warn); }
  .sev-banner.is-bad  .sev-banner-ico { background: var(--color-bad); }
  .sev-banner.is-info .sev-banner-ico { background: var(--color-info); }
  .sev-banner-title { font-size: 14px; font-weight: 600; color: var(--color-text); }
  .sev-banner-exp { font-size: 12px; color: var(--color-text-muted); margin-top: 3px; }
  .sev-banner-badge { margin-left: auto; }
</style>
```

- [ ] **Step 2: Verify build compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/VerdictBanner.svelte
git commit -m "feat(stage2): VerdictBanner primitive (level-2 tinted banner, solid bar)"
```

---

## Task 5: ssl-checker (escalation) — WORKED EXAMPLE

**Files:**
- Modify: `src/components/SslChecker.svelte`

**Mapping** (from existing `result.httpsOk` + `result.activeCertificate.daysRemaining`):
| Condition | level | escalate |
|---|---|---|
| `!result.httpsOk` OR `daysRemaining < 0` (expired/invalid) | `bad` | **yes** |
| `daysRemaining != null && 0 <= daysRemaining <= 30` | `warn` | no |
| otherwise (secure, >30d or null) | `ok` | no |

Badge label: `result.httpsOk ? t.secure : t.insecure`. Banner (escalate) `title`: `t.insecure`; `explanation`: `expiryLabel(ac?.daysRemaining ?? null)` (reuse existing strings — no new i18n).

- [ ] **Step 1: Add imports + classification** (after line 14 `const t = …`):
```ts
import StatusBadge from './ui/StatusBadge.svelte';
import VerdictBanner from './ui/VerdictBanner.svelte';
import type { Level } from '../lib/severity';
// ...
const verdict = $derived.by<{ level: Level; escalate: boolean; label: string }>(() => {
  if (!result) return { level: 'info', escalate: false, label: '' };
  const days = result.activeCertificate?.daysRemaining ?? null;
  if (!result.httpsOk || (days !== null && days < 0)) return { level: 'bad', escalate: true, label: t.insecure };
  if (days !== null && days <= 30) return { level: 'warn', escalate: false, label: t.secure };
  return { level: 'ok', escalate: false, label: t.secure };
});
```

- [ ] **Step 2: Replace the SSL-status header** — swap the emoji+label block (current lines 158-161) for:
```svelte
{#if verdict.escalate}
  <VerdictBanner level={verdict.level} title={t.insecure} explanation={expiryLabel(result.activeCertificate?.daysRemaining ?? null)}>
    <StatusBadge level={verdict.level} label={verdict.label} size="sm" {lang} />
  </VerdictBanner>
{:else}
  <StatusBadge level={verdict.level} label={verdict.label} {lang} />
{/if}
```

- [ ] **Step 3: Migrate severity colors** — in `expiryColor()` (lines 85-91) replace `--color-red`→`--color-bad`, `--color-yellow`→`--color-warn`, `--color-green`→`--color-ok` (and drop the hex fallbacks). Change the active-cert card (line 179) and the error card (line 152) `border-left` to use the semantic tokens; migrate the line-170 `--color-yellow` and line-214/222/231 `--color-green`/`--color-red`/`--color-yellow` to semantic tokens.

- [ ] **Step 4: Build + suite**

Run: `npm run build && npm test`
Expected: build OK; 226+4 tests green.

- [ ] **Step 5: Grep for residual non-semantic severity tokens in this file**

Run: `grep -nE "color-(yellow|green|red)\b" src/components/SslChecker.svelte`
Expected: no matches (only `--color-ok/warn/bad/info` remain for severity).

- [ ] **Step 6: Commit**

```bash
git add src/components/SslChecker.svelte
git commit -m "redesign(stage2): ssl-checker severity badge + banner"
```

---

## Task 6: dnssec-check (escalation)

**Files:** Modify `src/components/DnssecCheck.svelte`. Apply the Recipe.

**Mapping** (from existing `state.overall: "secure"|"bogus"|"insecure"|"partial"`):
| overall | level | escalate | label |
|---|---|---|---|
| `secure` | `ok` | no | `t.statusSecure` |
| `partial` | `warn` | no | `t.statusPartial` |
| `insecure` | `info` | no | `t.statusInsecure` |
| `bogus` | `bad` | **yes** | `t.statusBogus` |

Banner (bogus) `title`: `t.statusBogus`; `explanation`: `t.explainBogus`. (All strings exist.) `insecure` → `info` (unsigned is normal, neutral — NOT bad).
Migrate `overallColor()` (lines 163-168) + the check-row colors (lines 231/240/249) + error card (208): `--color-green`→`ok`, `--color-red`→`bad`, `--color-yellow`→`warn`, `--color-text-muted` for `insecure`/none stays muted (or `info`). Per-row status (DNSKEY/DS/validation) is opt-in `dotOnly` keeping the existing `✓ N`/word glyphs.

- [ ] Step 1: Apply Recipe A-G with the mapping above.
- [ ] Step 2: `npm run build && npm test` → green.
- [ ] Step 3: `grep -nE "color-(yellow|green|red)\b" src/components/DnssecCheck.svelte` → no matches.
- [ ] Step 4: Commit `redesign(stage2): dnssec-check severity badge + banner`.

---

## Task 7: http-headers (escalation) — needs i18n banner copy

**Files:** Modify `src/components/HttpHeaders.svelte`; add keys in `src/i18n/components.ts`.

**Mapping** (from existing `securityScore / maxScore`, ratio `r`):
| ratio | level | escalate |
|---|---|---|
| `r >= 0.8` | `ok` | no |
| `0.5 <= r < 0.8` | `warn` | no |
| `r < 0.5` | `bad` | **yes** |

Badge label: ```${securityScore}/${maxScore}` ``. Banner copy does NOT exist → add to the `httpHeaders` i18n block:
```ts
// EN
bannerTitle: 'Weak security headers',
bannerExp: 'Critical response headers are missing — this widens the attack surface.',
// ES (terse, technical per ES native-voice plan)
bannerTitle: 'Cabeceras de seguridad débiles',
bannerExp: 'Faltan cabeceras de respuesta críticas; eso amplía la superficie de ataque.',
```

- [ ] Step 1: Add the 2 i18n keys (EN+ES) to the `http-headers` block in `src/i18n/components.ts`.
- [ ] Step 2: Apply Recipe with the mapping; banner `title={t.bannerTitle}` `explanation={t.bannerExp}`. Per-header rows use opt-in `dotOnly` keeping the existing ✅/❌ + `aria-label`.
- [ ] Step 3: `npm run build && npm test` → green.
- [ ] Step 4: `grep -nE "color-(yellow|green|red)\b" src/components/HttpHeaders.svelte` → no matches.
- [ ] Step 5: Commit `redesign(stage2): http-headers severity badge + banner`.

---

## Task 8: email-auth (escalation) — derived spoofable state + i18n copy

**Files:** Modify `src/components/EmailAuth.svelte`; add keys in `src/i18n/components.ts`.

**Mapping** (per-record `assessment: 'pass'|'warning'|'fail'` already exists for `result.spf` / `result.dmarc` / `result.dkim`):
- Per-record badge: `pass`→`ok`, `warning`→`warn`, `fail`→`bad`.
- **Overall (accepted micro-derivation, spec §2):** `spoofable = result.spf?.assessment === 'fail' && result.dmarc?.assessment === 'fail'`.
| condition | level | escalate |
|---|---|---|
| `spoofable` | `bad` | **yes** |
| any record `fail`/`warning` (not spoofable) | `warn` | no |
| all `pass` | `ok` | no |

Banner copy (add to `email-auth` i18n block):
```ts
// EN
bannerTitle: 'Domain can be spoofed',
bannerExp: 'No SPF and no DMARC enforcement — anyone can forge mail from this domain.',
// ES
bannerTitle: 'El dominio puede ser suplantado',
bannerExp: 'Sin SPF ni DMARC aplicado: cualquiera puede falsificar correo de este dominio.',
```

- [ ] Step 1: Add the 2 i18n keys (EN+ES).
- [ ] Step 2: Apply Recipe; per-record rows get a `StatusBadge` (the assessment→level map); overall header uses `verdict`; banner on `spoofable`. Migrate `--color-green/red/yellow` → semantic tokens.
- [ ] Step 3: `npm run build && npm test` → green.
- [ ] Step 4: `grep -nE "color-(yellow|green|red)\b" src/components/EmailAuth.svelte` → no matches.
- [ ] Step 5: Commit `redesign(stage2): email-auth severity badges + spoofable banner`.

---

## Task 9: webrtc-leak-test (escalation) — "no leak" = info

**Files:** Modify `src/components/WebrtcLeakTest.svelte`.

**Mapping** (from existing `hasLeak`):
| condition | level | escalate | label |
|---|---|---|---|
| `hasLeak` | `bad` | **yes** | (existing leak label) |
| `!hasLeak` | **`info`** | no | (existing no-leak label) |

`!hasLeak` is `info` (NEUTRAL), NOT `ok` — the tool cannot confirm protection (component's own disclaimer, lines 113-114). Banner (leak): reuse the existing leak warning string for `title`/`explanation` (if only one string exists, pass it as `title` and leave `explanation` empty). Migrate `--color-green/red/yellow` → semantic (`green`→`info` for the no-leak path, NOT `ok`).

- [ ] Step 1: Apply Recipe with the mapping; ensure no-leak maps to `info`.
- [ ] Step 2: `npm run build && npm test` → green.
- [ ] Step 3: `grep -nE "color-(yellow|green|red)\b" src/components/WebrtcLeakTest.svelte` → no matches.
- [ ] Step 4: Commit `redesign(stage2): webrtc-leak severity (leak banner, no-leak=info)`.

---

## Task 10: CHECKPOINT A — a11y audit of the 5 escalation tools

**Goal:** lock the primitive contract before fan-out (spec §5).

- [ ] **Step 1: Start a local instance with API/network** (functions needed for ssl/email/http):

Run: `npx wrangler pages dev -- npm run build` is NOT how PT runs; use the dev server: `npm run dev` (Astro dev on its default port) in a background shell, OR `npm run build && npx wrangler pages dev dist` if functions must run. Note the URL.

- [ ] **Step 2: Run axe-core against the 5 tool pages** (manual or scripted). For each of `/ssl-checker/`, `/dnssec-check/`, `/http-headers/`, `/email-auth/`, `/webrtc-leak-test/` (and one `/es/...` variant): trigger a result, then run an axe scan (browser devtools axe extension, or a throwaway Playwright + `@axe-core/playwright` script). Verify:
  - 0 serious/critical a11y violations.
  - The badge/banner is announced (it lives inside the existing `aria-live` region).
  - No `dotOnly` row conveys status by color alone (each keeps glyph/text or has `sr-only`).
  - Error state (force a network error) renders the red-left error card with NO badge/banner.

- [ ] **Step 3: If any primitive-level issue is found, fix it in `severity.ts` / `StatusBadge` / `VerdictBanner` ONCE**, rebuild, re-audit. Commit the fix as `fix(stage2): <issue> in severity primitive (Checkpoint A)`.

- [ ] **Step 4: Record the audit result** in the spec/plan or a short note. Proceed only when the 5 are clean.

---

## Task 11: privacy-check + ipv6-check (level-1)

**Files:** Modify `src/components/PrivacyCheck.svelte`, `src/components/Ipv6Check.svelte`. Apply Recipe (no escalation).

**privacy-check** (existing `status: 'safe'|'exposed'|'note'`): `safe`→`ok`, `note`→`info`, `exposed`→`bad`.
**ipv6-check** (existing `score`/4): full→`ok`, partial(1-3)→`warn`, none(0)→`info`.

- [ ] Step 1: Apply Recipe to PrivacyCheck (per-factor rows opt-in `dotOnly` keeping glyph).
- [ ] Step 2: Apply Recipe to Ipv6Check.
- [ ] Step 3: `npm run build && npm test` → green.
- [ ] Step 4: `grep -nE "color-(yellow|green|red)\b" src/components/PrivacyCheck.svelte src/components/Ipv6Check.svelte` → no matches.
- [ ] Step 5: Commit `redesign(stage2): privacy-check + ipv6-check severity badges`.

---

## Task 12: port-scan + resolver-compare (level-1)

**Files:** Modify `src/components/PortScan.svelte`, `src/components/ResolverCompare.svelte`.

**port-scan** (per-port `open|closed|filtered`): per-row `dotOnly` — `closed`→`ok`, `filtered`→`warn`, `open`→`info` (a fact, not a verdict). Keep the existing port label/number as the row text. No single overall header badge unless the component already has an overall summary line; if so, map any-open→`info`, all-closed→`ok`.
**resolver-compare** (existing consistency): consistent→`ok`, diverge→`info` (resolvers can legitimately differ — NOT bad).

- [ ] Step 1: Apply Recipe to PortScan (per-row dotOnly + keep glyph).
- [ ] Step 2: Apply Recipe to ResolverCompare.
- [ ] Step 3: `npm run build && npm test` → green.
- [ ] Step 4: `grep -nE "color-(yellow|green|red)\b" src/components/PortScan.svelte src/components/ResolverCompare.svelte` → no matches.
- [ ] Step 5: Commit `redesign(stage2): port-scan + resolver-compare severity badges`.

---

## Task 13: redirect-checker + caa-lookup (level-1)

**Files:** Modify `src/components/RedirectChecker.svelte`, `src/components/CaaLookup.svelte`.

**redirect-checker** (per-hop by HTTP status): final `2xx`→`ok`; chain contains `4xx/5xx`→`bad`; loop / too-many-hops→`warn`; `3xx` hops→`info` (expected). **Scheme-downgrade detection is OUT OF SCOPE** (spec §6) — do not add it.
**caa-lookup** (existing no-policy / CA-allowed / not-allowed / `critical`): CA allowed + policy present→`ok`; no policy→`warn`; CA not-allowed / `critical`→`bad`. Level-1 (no banner).

- [ ] Step 1: Apply Recipe to RedirectChecker (per-hop dotOnly keeping the status code/url text).
- [ ] Step 2: Apply Recipe to CaaLookup.
- [ ] Step 3: `npm run build && npm test` → green.
- [ ] Step 4: `grep -nE "color-(yellow|green|red)\b" src/components/RedirectChecker.svelte src/components/CaaLookup.svelte` → no matches.
- [ ] Step 5: Commit `redesign(stage2): redirect-checker + caa-lookup severity badges`.

---

## Task 14: is-it-up + is-it-down (level-1)

**Files:** Modify `src/components/IsItUp.svelte`, `src/components/IsItDown.svelte`.

**is-it-up** (up/down): up→`ok`, down→`bad` (the answer — level-1, NO banner). 
**is-it-down** (down-for-everyone vs up): up/reachable→`ok`, down-for-everyone→`bad`, ambiguous/partial→`warn`.

- [ ] Step 1: Apply Recipe to both.
- [ ] Step 2: `npm run build && npm test` → green.
- [ ] Step 3: `grep -nE "color-(yellow|green|red)\b" src/components/IsItUp.svelte src/components/IsItDown.svelte` → no matches.
- [ ] Step 4: Commit `redesign(stage2): is-it-up + is-it-down severity badges`.

---

## Task 15: site-speed (level-1)

**Files:** Modify `src/components/SiteSpeed.svelte`.

**Mapping** (existing `Rating: 'good'|'needs-improvement'|'poor'`): good→`ok`, needs-improvement→`warn`, poor→`bad` (level-1 — a performance answer, no banner).

- [ ] Step 1: Apply Recipe.
- [ ] Step 2: `npm run build && npm test` → green.
- [ ] Step 3: `grep -nE "color-(yellow|green|red)\b" src/components/SiteSpeed.svelte` → no matches.
- [ ] Step 4: Commit `redesign(stage2): site-speed severity badge`.

---

## Task 16: password-strength (level-1) + e2e badge assertion

**Files:** Modify `src/components/PasswordStrength.svelte`; modify `e2e/tools.spec.ts`.

**Mapping** (existing 0-4 strength score): 0-1→`bad`, 2→`warn`, 3-4→`ok` (level-1 — user's own input, no banner per Rule A principle). Handle the orphan `#f97316` (line 164): map the 5-step `strengthColors` array onto `--color-bad`(0,1) / `--color-warn`(2) / `--color-ok`(3,4), removing the raw hex.

- [ ] **Step 1:** Apply Recipe (header badge from the strength score). Replace `strengthColors` raw hex/`--color-amber` with semantic tokens.

- [ ] **Step 2: Add the e2e render assertion** to `e2e/tools.spec.ts` (inside the `Tool flows (pure-client)` describe):
```ts
test("password-strength: weak vs strong shows correct severity badge", async ({ page }) => {
  await page.goto("/password-strength/");
  const input = page.locator("input[type='password'], input[type='text']").first();
  await input.fill("123");
  // weak → bad badge: the StatusBadge renders a .sev-badge.is-bad with an accessible label
  await expect(page.locator(".sev-badge.is-bad")).toBeVisible({ timeout: 5_000 });
  await input.fill("Tr0ub4dour&3-correct-horse-battery");
  await expect(page.locator(".sev-badge.is-ok")).toBeVisible({ timeout: 5_000 });
});
```

- [ ] **Step 3: Build + unit suite**

Run: `npm run build && npm test`
Expected: green.

- [ ] **Step 4: Run e2e**

Run: `npm run test:e2e -- tools.spec.ts`
Expected: the new test passes (and the existing pure-client tests stay green).

- [ ] **Step 5:** `grep -nE "color-(yellow|green|red|amber)\b|#f97316" src/components/PasswordStrength.svelte` → no severity matches.

- [ ] **Step 6: Commit**

```bash
git add src/components/PasswordStrength.svelte e2e/tools.spec.ts
git commit -m "redesign(stage2): password-strength severity badge + e2e render assertion"
```

---

## Task 17: Token sweep — 8 informational components

**Files:** Modify `MyIp.svelte`, `DnsLookup.svelte`, `ReverseDns.svelte`, `WhoisLookup.svelte`, `IpConverter.svelte`, `SubnetCalculator.svelte`, `UrlParser.svelte`, `JwtDecoder.svelte`.

These get **NO severity badge** (honest-ceiling). Only: replace any `var(--color-yellow, …)` → `--color-warn`, and migrate any ad-hoc `--color-green/red` *severity* coloring to semantic tokens. Keep purely decorative colors (syntax highlighting in jwt/ip-converter, subnet's descriptive private/public green/amber) — those are facts, not verdicts, so they may stay on their existing aliases; only the `--color-yellow` fallback bug MUST be killed everywhere it appears.

- [ ] **Step 1: Kill `--color-yellow` in each file that has it** (per §1: MyIp, ReverseDns are in this set):

Run: `grep -rln "color-yellow" src/components/{MyIp,DnsLookup,ReverseDns,WhoisLookup,IpConverter,SubnetCalculator,UrlParser,JwtDecoder}.svelte`
Then replace `var(--color-yellow, #eab308)` → `var(--color-warn)` in each match.

- [ ] **Step 2: Build + suite**

Run: `npm run build && npm test`
Expected: green.

- [ ] **Step 3: Commit**

```bash
git add src/components/MyIp.svelte src/components/DnsLookup.svelte src/components/ReverseDns.svelte src/components/WhoisLookup.svelte src/components/IpConverter.svelte src/components/SubnetCalculator.svelte src/components/UrlParser.svelte src/components/JwtDecoder.svelte
git commit -m "redesign(stage2): token sweep on informational tools (kill --color-yellow)"
```

---

## Task 18: `.badge-amber` global-utility decision + final hex sweep

**Files:** Modify `src/styles/global.css` (if remapping) + any stragglers.

- [ ] **Step 1: Audit remaining non-semantic severity references repo-wide**

Run: `grep -rnE "color-yellow|#eab308|#f59e0b|#f97316" src/`
Expected: 0 matches (every `--color-yellow` fallback and the orphan oranges are gone). Fix any stragglers (e.g. `RedirectChecker.svelte:82 #f59e0b` should already be handled by Task 13 — verify).

- [ ] **Step 2: Decide `.badge-amber` / `.text-amber`** (`global.css:201-206`): these are shared utilities. If their ONLY consumers were severity uses now migrated, remap their definition to `var(--color-warn)`; if any non-severity consumer remains, leave them. Run `grep -rn "badge-amber\|text-amber" src/` to decide, then act. Document the decision in the commit message.

- [ ] **Step 3: Build + suite**

Run: `npm run build && npm test`
Expected: green.

- [ ] **Step 4: Commit** (only if changes): `chore(stage2): resolve .badge-amber utility + final severity-hex sweep`.

---

## Task 19: CHECKPOINT B + full verification

- [ ] **Step 1: Slate/legacy residual grep (whole src)**

Run: `grep -rnE "color-(yellow|green|red)\b" src/components/ | grep -viE "ok|warn|bad|info"`
Expected: only intentional decorative (non-severity) uses remain; ZERO `--color-yellow`.

- [ ] **Step 2: Full unit suite**

Run: `npm test`
Expected: 226 baseline + severity tests, all green.

- [ ] **Step 3: Full e2e suite**

Run: `npm run test:e2e`
Expected: all green (pure-client specs + the new password-strength badge assertion).

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: success (incl. early-hints + es-paths scripts).

- [ ] **Step 5: axe-core a11y pass on a representative spread** (≥1 escalation tool, ≥1 level-1, ≥1 informational, ≥1 `/es/` page): 0 serious/critical violations.

- [ ] **Step 6: Visual spot-check** against the approved mockups (badge on header, accent bar, banner only on the 5 critical states, informational tools have no badge).

- [ ] **Step 7: Commit any final fixes**, then this step closes Step 4. The branch is ready for the step-5 merge gates (Lighthouse median-of-3, W3C Nu, prod-parity `wrangler pages dev`, 3-agent review gate, merge to master + deploy + `~/scripts/cv-purge-html-cache.sh` is CV-only; PT deploy uses the standard wrangler `--project-name=pingthat --branch=main`).

---

## Self-review notes (author)

- **Spec coverage:** every §5 verdict tool (15) has a task (5-16); §5 informational (8) → Task 17; `--color-yellow` kill spans both phases (Tasks 5-9, 11-16 per-file greps + Task 17 + Task 18 final sweep); state matrix (§4) enforced via Recipe F + Checkpoint A error-state check; class-map/CSP (§3) baked into the primitives + `.sev-accent`; contrast (§7) needs no token change (verified); checkpoints A (Task 10) + B (Task 19).
- **Deviation logged:** primitives are not node-unit-tested (infra is node-only); covered by build + the password-strength e2e + a11y checkpoints (see Testing approach).
- **Open implementer discretion:** exact per-row `dotOnly` adoption (keep glyph), and the `.badge-amber` remap decision (Task 18) — both bounded with explicit grep gates.
