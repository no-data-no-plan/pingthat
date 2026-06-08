# A-F Grade Badges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an A-F letter grade (SSL Labs / SecurityHeaders.com convention) to `ssl-checker` + `http-headers`, derived honestly from already-computed data, rendered as a prominent screenshot-shareable tile.

**Architecture:** A pure helper `src/lib/grade.ts` computes `{letter, level}` from existing result data (no new analysis). A dumb `GradeBadge.svelte` primitive renders the B1 tile (color via CSS class-map, like stage-2's StatusBadge). The 2 components compute the grade and render the badge at the top of the result; the GradeBadge replaces the stage-2 StatusBadge there, while the VerdictBanner still escalates on grade F.

**Tech Stack:** Astro 6, Svelte 5.55 (runes), Tailwind 4, Vitest 4 (node env). No new deps.

**Spec:** `docs/superpowers/specs/2026-06-04-pt-stage3-grade-badges-design.md`. **Branch:** `stage3/grade-badges` (already created off master).

---

## Testing approach (same constraints as stage-2)

Vitest is **node-env** (no jsdom) → `grade.ts` gets real unit tests; the Svelte `GradeBadge` is verified via `npm run build` (compile) + a11y/visual check at the merge gate on a `wrangler pages dev` instance (http-headers + ssl-checker need `/api`, which `astro preview` does NOT run — so their rendered badge is checked on wrangler, mirroring the stage-2 Checkpoint). Baseline: **230 vitest green**.

## File Structure

**Create:**
- `src/lib/grade.ts` — `Letter` type + `gradeFromHeaders()` + `gradeFromSsl()` + `letterLevel()`. Pure.
- `src/lib/grade.test.ts` — unit tests.
- `src/components/ui/GradeBadge.svelte` — the B1 tile primitive.

**Modify:**
- `src/components/HttpHeaders.svelte` — grade badge (replaces StatusBadge; VerdictBanner on F).
- `src/components/SslChecker.svelte` — grade badge (same).
- `src/i18n/components.ts` — add `gradeTip` + `gradeAria` keys to the `http-headers` and `ssl-checker` blocks (EN+ES).

---

## Task 1: grade.ts helper + unit tests

**Files:** Create `src/lib/grade.ts`; Create `src/lib/grade.test.ts`.

- [ ] **Step 1: Write the failing test** — `src/lib/grade.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { gradeFromHeaders, gradeFromSsl, type Letter } from './grade';

describe('gradeFromHeaders (count of 6 recommended headers)', () => {
  const cases: [number, Letter, string][] = [
    [6, 'A', 'ok'], [5, 'B', 'ok'], [4, 'C', 'warn'], [3, 'D', 'bad'], [2, 'F', 'bad'], [1, 'F', 'bad'], [0, 'F', 'bad'],
  ];
  for (const [score, letter, level] of cases) {
    it(`${score}/6 -> ${letter} (${level})`, () => {
      expect(gradeFromHeaders(score, 6)).toEqual({ letter, level });
    });
  }
  it('never returns a score above the band (clamps missing at 0)', () => {
    expect(gradeFromHeaders(7, 6).letter).toBe('A');
  });
});

describe('gradeFromSsl (HTTPS hardening)', () => {
  const ssl = (over: Record<string, unknown>) => ({
    httpsOk: true, hstsDetails: null, activeCertificate: { daysRemaining: 90 }, ...over,
  }) as any;
  it('no HTTPS -> F', () => expect(gradeFromSsl(ssl({ httpsOk: false })).letter).toBe('F'));
  it('expired cert -> F', () => expect(gradeFromSsl(ssl({ activeCertificate: { daysRemaining: -1 } })).letter).toBe('F'));
  it('valid but expires in 5 days -> D', () => expect(gradeFromSsl(ssl({ activeCertificate: { daysRemaining: 5 } })).letter).toBe('D'));
  it('valid, no HSTS, plenty of time -> C', () => expect(gradeFromSsl(ssl({ hstsDetails: null, activeCertificate: { daysRemaining: 90 } })).letter).toBe('C'));
  it('valid + HSTS but expires in 20 days -> B', () => expect(gradeFromSsl(ssl({ hstsDetails: { maxAge: 1 }, activeCertificate: { daysRemaining: 20 } })).letter).toBe('B'));
  it('valid + HSTS + >30 days -> A', () => expect(gradeFromSsl(ssl({ hstsDetails: { maxAge: 1 }, activeCertificate: { daysRemaining: 90 } })).letter).toBe('A'));
  it('valid + HSTS + null daysRemaining (long-lived) -> A', () => expect(gradeFromSsl(ssl({ hstsDetails: { maxAge: 1 }, activeCertificate: { daysRemaining: null } })).letter).toBe('A'));
  it('boundary: exactly 7 days -> D', () => expect(gradeFromSsl(ssl({ hstsDetails: { maxAge: 1 }, activeCertificate: { daysRemaining: 7 } })).letter).toBe('D'));
  it('boundary: exactly 30 days + HSTS -> B', () => expect(gradeFromSsl(ssl({ hstsDetails: { maxAge: 1 }, activeCertificate: { daysRemaining: 30 } })).letter).toBe('B'));
  it('maps letters to levels: A/B->ok, C->warn, D/F->bad', () => {
    expect(gradeFromSsl(ssl({ hstsDetails: { maxAge: 1 } })).level).toBe('ok');
    expect(gradeFromSsl(ssl({ hstsDetails: null })).level).toBe('warn');
    expect(gradeFromSsl(ssl({ httpsOk: false })).level).toBe('bad');
  });
});
```

- [ ] **Step 2: Run to verify it fails** — `cd /home/vant/dev/pingthat && npx vitest run src/lib/grade.test.ts` → FAIL (cannot resolve `./grade`).

- [ ] **Step 3: Minimal implementation** — `src/lib/grade.ts`:
```ts
import type { Level } from './severity';
import type { SslCheckerResult } from './api-types';

export type Letter = 'A' | 'B' | 'C' | 'D' | 'F';

/** A/B -> ok, C -> warn, D/F -> bad. Reuses the stage-2 severity colour scale. */
export function letterLevel(letter: Letter): Level {
  if (letter === 'A' || letter === 'B') return 'ok';
  if (letter === 'C') return 'warn';
  return 'bad';
}

/** http-headers: grade by how many of the `max` (=6) recommended headers are present.
 *  missing 0 -> A, 1 -> B, 2 -> C, 3 -> D, 4+ -> F. */
export function gradeFromHeaders(score: number, max: number): { letter: Letter; level: Level } {
  const missing = Math.max(0, max - score);
  const letter: Letter = missing === 0 ? 'A' : missing === 1 ? 'B' : missing === 2 ? 'C' : missing === 3 ? 'D' : 'F';
  return { letter, level: letterLevel(letter) };
}

/** SSL: "HTTPS hardening" grade from cert validity/expiry + HSTS. Evaluated F->D->C->B->A. */
export function gradeFromSsl(result: SslCheckerResult): { letter: Letter; level: Level } {
  const days = result.activeCertificate?.daysRemaining ?? null;
  let letter: Letter;
  if (!result.httpsOk || (days !== null && days < 0)) letter = 'F';
  else if (days !== null && days <= 7) letter = 'D';
  else if (!result.hstsDetails) letter = 'C';
  else if (days !== null && days <= 30) letter = 'B';
  else letter = 'A';
  return { letter, level: letterLevel(letter) };
}
```
(Verify `SslCheckerResult` is exported from `src/lib/api-types.ts` with `httpsOk: boolean`, `hstsDetails: HstsDetails | null`, `activeCertificate: { daysRemaining: number | null } | null`. If field names differ, adjust + report.)

- [ ] **Step 4: Run to verify pass** — `npx vitest run src/lib/grade.test.ts` → PASS.

- [ ] **Step 5: Full suite** — `npm test` → green (230 + grade tests).

- [ ] **Step 6: Commit**
```bash
git add src/lib/grade.ts src/lib/grade.test.ts
git commit -m "$(printf 'feat(stage3): grade.ts A-F rubric helper + unit tests\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 2: GradeBadge.svelte primitive

**Files:** Create `src/components/ui/GradeBadge.svelte`.

- [ ] **Step 1: Create the component**
```svelte
<script lang="ts">
  import type { Lang } from '../../i18n/index';
  import type { Level } from '../../lib/severity';
  import type { Letter } from '../../lib/grade';

  interface Props {
    letter: Letter;
    level: Level;
    ratio?: string;      // e.g. "4/6"; omitted for SSL
    ariaLabel?: string;  // full localized accessible name
    lang?: Lang;
  }
  let { letter, level, ratio = '', ariaLabel = '' }: Props = $props();
</script>

<div class="grade-badge is-{level}" role="img" aria-label={ariaLabel || `Grade ${letter}`}>
  <span class="grade-letter" aria-hidden="true">{letter}</span>
  {#if ratio}<span class="grade-chip" aria-hidden="true">{ratio}</span>{/if}
</div>

<style>
  .grade-badge { position: relative; width: 58px; height: 58px; border-radius: 12px; display: grid; place-items: center; flex: none; border: 1px solid; }
  .grade-letter { font-weight: 800; font-size: 30px; line-height: 1; color: var(--color-bg); }
  .grade-chip { position: absolute; top: -7px; right: -7px; background: var(--color-bg); border: 1px solid;
    border-radius: 999px; font-size: 10px; font-weight: 700; padding: 2px 6px; font-family: 'JetBrains Mono', monospace; }

  .grade-badge.is-ok   { background: var(--color-ok);   border-color: var(--color-ok-edge); }
  .grade-badge.is-warn { background: var(--color-warn); border-color: var(--color-warn-edge); }
  .grade-badge.is-bad  { background: var(--color-bad);  border-color: var(--color-bad-edge); }
  .grade-badge.is-info { background: var(--color-info); border-color: var(--color-info-edge); }

  .grade-badge.is-ok   .grade-chip { color: var(--color-ok);   border-color: var(--color-ok-edge); }
  .grade-badge.is-warn .grade-chip { color: var(--color-warn); border-color: var(--color-warn-edge); }
  .grade-badge.is-bad  .grade-chip { color: var(--color-bad);  border-color: var(--color-bad-edge); }
  .grade-badge.is-info .grade-chip { color: var(--color-info); border-color: var(--color-info-edge); }
</style>
```
(Letter = near-black `--color-bg` ink on the solid `--color-{level}` fill → high contrast for large bold text. Chip = `--color-{level}` text on `--color-bg`. Color resolves via the `is-{level}` class-map, NOT inline style — strict CSP, same pattern as StatusBadge.)

- [ ] **Step 2: Build** — `cd /home/vant/dev/pingthat && npm run build` → succeeds, no Svelte/TS errors. Report any unused-CSS warnings verbatim (the `.is-*` dynamic classes are used at runtime; do not delete them).

- [ ] **Step 3: Tests stay green** — `npm test` → green.

- [ ] **Step 4: Commit**
```bash
git add src/components/ui/GradeBadge.svelte
git commit -m "$(printf 'feat(stage3): GradeBadge B1 tile primitive (class-map, CSP-safe)\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 3: i18n strings (gradeTip + gradeAria) for both tools

**Files:** Modify `src/i18n/components.ts` (the `http-headers` and `ssl-checker` blocks, both `en` + `es`).

Read the file to find each tool's block (it's one `as const` object per tool with `en`/`es`). Add these keys to each block, matching the existing indentation/style:

- [ ] **Step 1: http-headers block — add (EN + ES):**
```ts
// en
gradeTip: 'The grade reflects how many of 6 recommended security headers are present — see the list below.',
gradeAriaTpl: 'Grade {letter}, {score} of 6 security headers present',
// es
gradeTip: 'La nota refleja cuántas de las 6 cabeceras de seguridad recomendadas están presentes — mira la lista de abajo.',
gradeAriaTpl: 'Grado {letter}, {score} de 6 cabeceras de seguridad presentes',
```

- [ ] **Step 2: ssl-checker block — add (EN + ES):**
```ts
// en
gradeTip: 'The grade reflects HTTPS reachability, certificate validity/expiry and HSTS — not a full TLS cipher/protocol audit.',
gradeAriaTpl: 'Grade {letter}, HTTPS hardening',
// es
gradeTip: 'La nota refleja accesibilidad HTTPS, validez/caducidad del certificado y HSTS — no es un audit completo de cifrado/protocolo TLS.',
gradeAriaTpl: 'Grado {letter}, endurecimiento HTTPS',
```
(If a block is typed via an interface/type that enumerates keys, add the keys there too so it typechecks. `{letter}`/`{score}` are placeholders the component fills with `.replace()`.)

- [ ] **Step 3: Build + tests** — `npm run build && npm test` → green.

- [ ] **Step 4: Commit**
```bash
git add src/i18n/components.ts
git commit -m "$(printf 'i18n(stage3): grade tooltip + aria strings for ssl + http-headers (EN+ES)\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 4: wire http-headers

**Files:** Modify `src/components/HttpHeaders.svelte`.

Context: post-stage-2 this component has a `$derived verdict` (from `gradeFromHeaders`-equivalent ratio), renders a `StatusBadge` header + a `VerdictBanner` when `verdict.escalate`, inside an `aria-live` region, plus the per-header ✓/✕ list. READ IT FIRST.

- [ ] **Step 1: Imports** (top of `<script>`): add
```ts
import GradeBadge from './ui/GradeBadge.svelte';
import { gradeFromHeaders } from '../lib/grade';
// keep VerdictBanner import; the StatusBadge import can be removed if no longer used in this file (check first)
```

- [ ] **Step 2: Replace the verdict derivation** with the grade:
```ts
const grade = $derived.by(() => {
  if (!result || !result.maxScore) return null;
  return gradeFromHeaders(result.securityScore, result.maxScore);
});
const escalate = $derived(grade?.letter === 'F');
```

- [ ] **Step 3: Replace the header block** (the old `{#if verdict.escalate}<VerdictBanner>…</VerdictBanner>{:else}<StatusBadge/>{/if}`) with the grade badge + escalation, INSIDE the existing `aria-live` region, and add the caveat InfoTip as a SIBLING (never nested in a button):
```svelte
{#if grade}
  <div style="display:flex; align-items:center; gap:14px;">
    <GradeBadge letter={grade.letter} level={grade.level} ratio={`${result.securityScore}/${result.maxScore}`}
      ariaLabel={t.gradeAriaTpl.replace('{letter}', grade.letter).replace('{score}', String(result.securityScore))} {lang} />
    <div>
      <div style="font-size:11px; text-transform:uppercase; letter-spacing:.1em; color:var(--color-text-dim);">
        {t.securityScore} <InfoTip text={t.gradeTip} {lang} />
      </div>
      <div style="font-size:13px; color:var(--color-text-muted);">{result.securityScore} / {result.maxScore}</div>
    </div>
  </div>
  {#if escalate}
    <VerdictBanner level="bad" title={t.bannerTitle} explanation={t.bannerExp} />
  {/if}
{/if}
```
(Reuse existing `t.securityScore`, `t.bannerTitle`, `t.bannerExp`, `t.gradeTip`, `t.gradeAriaTpl`. The result card keeps `class="card sev-accent is-{grade.level}"` — replace any `verdict.level` reference with `grade.level`. Confirm `InfoTip` is already imported; if not, add `import InfoTip from './InfoTip.svelte';`.)

- [ ] **Step 4: Cleanup** — remove the now-dead `verdict` `$derived` and the `StatusBadge` import if unused in this file. Per-header ✓/✕ list stays unchanged.

- [ ] **Step 5: Build + tests + grep** — `npm run build && npm test` → green; `grep -nE "verdict\." src/components/HttpHeaders.svelte` → no stale references.

- [ ] **Step 6: Commit**
```bash
git add src/components/HttpHeaders.svelte
git commit -m "$(printf 'feat(stage3): http-headers A-F grade badge (replaces StatusBadge; banner on F)\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 5: wire ssl-checker

**Files:** Modify `src/components/SslChecker.svelte`.

Context: post-stage-2 it has a `$derived verdict` (secure/expiring/invalid) + `StatusBadge` + `VerdictBanner` on escalate, the `expiryLabel()` helper, the active-cert card, the HSTS card. READ IT FIRST.

- [ ] **Step 1: Imports**:
```ts
import GradeBadge from './ui/GradeBadge.svelte';
import { gradeFromSsl } from '../lib/grade';
```

- [ ] **Step 2: Replace the verdict derivation** with the grade:
```ts
const grade = $derived(result ? gradeFromSsl(result) : null);
const escalate = $derived(grade?.letter === 'F');
```

- [ ] **Step 3: Replace the SSL-status header block** with the grade badge (NO ratio chip for SSL) + escalation, inside the `aria-live` region:
```svelte
{#if grade}
  <div style="display:flex; align-items:center; gap:14px;">
    <GradeBadge letter={grade.letter} level={grade.level}
      ariaLabel={t.gradeAriaTpl.replace('{letter}', grade.letter)} {lang} />
    <div>
      <div style="font-size:11px; text-transform:uppercase; letter-spacing:.1em; color:var(--color-text-dim);">
        {t.sslStatus} <InfoTip text={t.gradeTip} {lang} />
      </div>
      <div style="font-size:13px; color:var(--color-text-muted);">
        {result.httpsOk ? t.secure : t.insecure} · {expiryLabel(result.activeCertificate?.daysRemaining ?? null)}
      </div>
    </div>
  </div>
  {#if escalate}
    <VerdictBanner level="bad" title={t.insecure} explanation={expiryLabel(result.activeCertificate?.daysRemaining ?? null)} />
  {/if}
{/if}
```
(Reuse existing `t.secure`, `t.insecure`, `t.sslStatus`, `expiryLabel()`, `t.gradeTip`, `t.gradeAriaTpl`. The active-cert card keeps its `sev-accent is-{grade.level}` accent — replace any `verdict.level` with `grade.level`. Confirm `InfoTip` import exists; add if missing.)

- [ ] **Step 4: Cleanup** — remove the dead `verdict` `$derived` + the `StatusBadge` import if now unused. The active-cert card, HSTS card, cert-history all stay.

- [ ] **Step 5: Build + tests + grep** — `npm run build && npm test` → green; `grep -nE "verdict\." src/components/SslChecker.svelte` → none stale.

- [ ] **Step 6: Commit**
```bash
git add src/components/SslChecker.svelte
git commit -m "$(printf 'feat(stage3): ssl-checker A-F grade badge (replaces StatusBadge; banner on F)\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 6: verification gate

- [ ] **Step 1: Full unit suite** — `npm test` → 230 baseline + grade tests, all green.

- [ ] **Step 2: Production build** — `npm run build` → clean.

- [ ] **Step 3: Token/CSP sanity** — `grep -rn "style=.*var(--color-(ok|warn|bad)" src/components/ui/GradeBadge.svelte` → none (colors via class-map only).

- [ ] **Step 4: Live a11y/visual on a wrangler instance** (http-headers + ssl need `/api`, so use `wrangler pages dev dist/` not `astro preview`). Start it, then on `/http-headers/` (run a real lookup, e.g. a site with few headers → C/D/F) and `/ssl-checker/` (e.g. `github.com` → A; `expired.badssl.com` → F): inject axe-core (the stage-2 harness pattern, via a `bypassCSP` Playwright context since prod CSP blocks inline-script injection) and verify **0 serious/critical**. Confirm: the grade tile renders with the right colour + letter; the chip shows `N/6` on http-headers and is absent on SSL; the `aria-label` announces the grade; on F the VerdictBanner also shows. Contrast: the letter (`--color-bg` on solid `--color-{level}`) and chip pass AA.

- [ ] **Step 5: 3-agent review gate** — before merge, dispatch the stage-2 review pattern (code-reviewer + spec-compliance) on the diff `master..stage3/grade-badges`.

- [ ] **Step 6:** Branch ready for merge → deploy (`--branch=main --project-name=pingthat`, honest sitemap via the build prebuild, verify live) — Marco-gated, same as stage-2.

---

## Self-review notes (author)

- **Spec coverage:** scope (§1) → Tasks 4-5 (only ssl+http-headers); rubrics (§2) → Task 1 (grade.ts, exact bands + boundaries tested); badge B1 + chip rules (§3) → Task 2 + the wiring (ratio on headers, none on SSL); architecture + StatusBadge-replacement + banner-on-F (§4) → Tasks 4-5; honesty caveats + i18n (§5) → Task 3 (gradeTip) + InfoTip placement; out-of-scope (§6) honored (no OG-image, 2 tools, no A+); testing + a11y (§7) → Task 1 unit tests + Task 6 axe/contrast.
- **No-placeholder:** all code shown; the only "read the file" steps are for the 2 component wirings (the implementer needs the live markup) but the grade derivation + badge usage + escalation are fully specified.
- **Type consistency:** `Letter`, `gradeFromHeaders(score,max)`, `gradeFromSsl(result)`, `letterLevel`, `Level` (from severity.ts), `GradeBadge` props (`letter/level/ratio/ariaLabel/lang`) consistent across tasks.
- **Open discretion:** exact SSL subtitle wording; whether http-headers keeps a separate "N/M" line below the badge vs only the chip (both are fine — the chip is the canonical N/6).
