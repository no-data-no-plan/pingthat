# net/ping ("HTTP Ping") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 24th tool, "HTTP Ping" — a server-side latency probe measuring HTTP(S) response time from Cloudflare's edge to a target (multi-sample min/avg/max/jitter), honestly framed (not ICMP, not from the user's device).

**Architecture:** A Pages Function (`functions/api/ping.ts`) mirrors the existing `check-site.ts` pattern: it validates the host through the existing `_shared` SSRF guard, fires 5 sequential timed `HEAD`(→`GET` fallback) requests via `fetchWithManualRedirects`, and returns the raw `samples[]`. A pure helper `src/lib/ping-stats.ts` derives min/avg/max/jitter (computed client-side in the component, so the function imports nothing from `src/lib`). `NetPing.svelte` renders the caveat + a severity `StatusBadge` + stat cards + sample bars.

**Tech Stack:** Astro 6, Svelte 5.55 (runes), Cloudflare Pages Functions, Vitest 4 (node env). No new deps.

**Spec:** `docs/superpowers/specs/2026-06-09-pt-stage3-net-ping-design.md`. **Branch:** `stage3/net-ping` (created off master).

---

## Testing approach

Vitest is node-env: `ping-stats.ts` gets real unit tests. The Pages Function reuses the already-tested `_shared` SSRF/validation/fetch helpers; its HEAD→GET + sampling logic is verified manually on a `wrangler pages dev` instance at the gate (functions aren't in the vitest include). `NetPing.svelte` → `npm run build` + a live axe pass on wrangler (it's an `/api` tool, not pure-client). Baseline **248 vitest green**.

## File Structure

**Create:**
- `src/lib/ping-stats.ts` + `src/lib/ping-stats.test.ts` — pure stats helper + tests.
- `functions/api/ping.ts` — the latency probe Pages Function.
- `src/components/NetPing.svelte` — the tool component.
- `src/pages/net-ping.astro` + `src/pages/es/net-ping.astro` — the tool pages.

**Modify:**
- `src/lib/tools.ts` — register the `net-ping` tool + add to the "Speed & Uptime" group.
- `src/lib/api-types.ts` — add the `PingResult` type.
- `src/i18n/components.ts` — `netPing` block (EN+ES).
- `src/i18n/pages.ts` — `net-ping` page meta/SEO/FAQ (EN+ES).
- `src/data/sources.ts` — a `net-ping` sources entry.

---

## Task 1: ping-stats.ts pure helper + tests

**Files:** Create `src/lib/ping-stats.ts`; Create `src/lib/ping-stats.test.ts`.

- [ ] **Step 1: failing test** `src/lib/ping-stats.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { computeStats } from './ping-stats';

describe('computeStats', () => {
  it('empty -> all zero', () => {
    expect(computeStats([])).toEqual({ min: 0, avg: 0, max: 0, jitter: 0 });
  });
  it('single sample -> min=avg=max=sample, jitter 0', () => {
    expect(computeStats([42])).toEqual({ min: 42, avg: 42, max: 42, jitter: 0 });
  });
  it('all equal -> jitter 0', () => {
    expect(computeStats([50, 50, 50])).toEqual({ min: 50, avg: 50, max: 50, jitter: 0 });
  });
  it('computes min/avg/max', () => {
    expect(computeStats([10, 20, 60])).toMatchObject({ min: 10, max: 60, avg: 30 });
  });
  it('jitter = mean of consecutive abs diffs', () => {
    // diffs: |30-10|=20, |10-40|=30 -> mean 25
    expect(computeStats([10, 30, 10, 40]).jitter).toBe(25);
  });
  it('rounds avg + jitter to integers', () => {
    expect(computeStats([10, 11]).avg).toBe(11); // 10.5 -> 11
  });
});
```

- [ ] **Step 2: verify fail** — `cd /home/vant/dev/pingthat && npx vitest run src/lib/ping-stats.test.ts` → FAIL (cannot resolve).

- [ ] **Step 3: implementation** `src/lib/ping-stats.ts`:
```ts
export interface PingStats {
  min: number;
  avg: number;
  max: number;
  /** mean absolute difference between consecutive samples (ms); 0 if <2 samples */
  jitter: number;
}

export function computeStats(samples: number[]): PingStats {
  if (samples.length === 0) return { min: 0, avg: 0, max: 0, jitter: 0 };
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
  let jitter = 0;
  if (samples.length > 1) {
    let sum = 0;
    for (let i = 1; i < samples.length; i++) sum += Math.abs(samples[i] - samples[i - 1]);
    jitter = Math.round(sum / (samples.length - 1));
  }
  return { min, avg, max, jitter };
}
```

- [ ] **Step 4: verify pass** — `npx vitest run src/lib/ping-stats.test.ts` → PASS.
- [ ] **Step 5: full suite** — `npm test` → green (248 + new).
- [ ] **Step 6: commit**
```bash
git add src/lib/ping-stats.ts src/lib/ping-stats.test.ts
git commit -m "$(printf 'feat(netping): ping-stats pure helper (min/avg/max/jitter) + tests\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 2: api-types — PingResult

**Files:** Modify `src/lib/api-types.ts`.

- [ ] **Step 1:** Add (near the other result types):
```ts
/** Returned by /api/ping */
export interface PingResult {
  host: string;
  sent: number;
  received: number;
  samples: number[];   // per-successful-request latency in ms (from CF edge)
  status: number;      // final HTTP status (0 if all failed)
  error?: string;
}
```
- [ ] **Step 2:** `npm run build` → typechecks. Commit:
```bash
git add src/lib/api-types.ts
git commit -m "$(printf 'feat(netping): PingResult api type\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 3: functions/api/ping.ts (the probe)

**Files:** Create `functions/api/ping.ts`.

Mirror `check-site.ts` exactly for validation/i18n/SSRF/redirect handling, but fire 5 sequential samples. Read `functions/api/check-site.ts` + `functions/api/_shared.ts` first to confirm `isValidUrl`/`parseBody`/`fetchWithManualRedirects`/`getApiErrors` signatures.

- [ ] **Step 1: create** `functions/api/ping.ts`:
```ts
import { isValidUrl, jsonResponse, errorResponse, parseBody, isBodyTooLarge, fetchWithManualRedirects } from "./_shared";
import { getLang, getApiErrors } from "./_i18n";

const SAMPLES = 5;
const GAP_MS = 150;
const TIMEOUT_MS = 5000;

export async function onRequestPost(context: { request: Request }) {
  const url = new URL(context.request.url);
  const e = getApiErrors(getLang(url));

  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse(e.bodyTooLarge, 413);
  if (!body || typeof body.url !== "string") return errorResponse(e.missingUrl);

  const target = isValidUrl(body.url);            // SSRF-safe: null for blocked/internal/invalid
  if (!target) return errorResponse(e.invalidOrBlockedUrl);

  const redirectI18n = {
    tooManyRedirects: e.tooManyRedirects,
    invalidRedirectTarget: e.invalidRedirectTarget,
    redirectToNonHttp: e.redirectToNonHttp,
    redirectToBlockedHost: e.redirectToBlockedHost,
  };

  const samples: number[] = [];
  let lastStatus = 0;
  let lastError: string | null = null;

  for (let i = 0; i < SAMPLES; i++) {
    const start = Date.now();
    try {
      let fr = await fetchWithManualRedirects(
        target,
        { method: "HEAD", signal: AbortSignal.timeout(TIMEOUT_MS), headers: { "User-Agent": "PingThat/1.0 (https://pingthat.dev)" } },
        5,
        redirectI18n
      );
      // Some servers reject HEAD (405/501) — fall back to GET once for this sample.
      if (!("error" in fr) && (fr.response.status === 405 || fr.response.status === 501)) {
        fr = await fetchWithManualRedirects(
          target,
          { method: "GET", signal: AbortSignal.timeout(TIMEOUT_MS), headers: { "User-Agent": "PingThat/1.0 (https://pingthat.dev)" } },
          5,
          redirectI18n
        );
      }
      const elapsed = Date.now() - start;
      if ("error" in fr) { lastError = fr.error; }
      else { samples.push(elapsed); lastStatus = fr.response.status; }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.message?.includes("timeout")) lastError = e.requestTimedOut;
      else if (err instanceof TypeError) lastError = e.dnsOrNetwork;
      else lastError = e.connectionFailed;
    }
    if (i < SAMPLES - 1) await new Promise((r) => setTimeout(r, GAP_MS));
  }

  if (samples.length === 0) {
    return jsonResponse({ host: target, sent: SAMPLES, received: 0, samples: [], status: 0, error: lastError ?? e.unreachable });
  }
  return jsonResponse({ host: target, sent: SAMPLES, received: samples.length, samples, status: lastStatus });
}
```
(Reuses existing `getApiErrors` keys — `bodyTooLarge`, `missingUrl`, `invalidOrBlockedUrl`, `requestTimedOut`, `dnsOrNetwork`, `connectionFailed`, `unreachable`, redirect keys. Confirm they exist in `functions/api/_i18n` (check-site uses the same set); if `unreachable` differs, use the real key.)

- [ ] **Step 2: build** — `npm run build` → succeeds (functions compile).
- [ ] **Step 3: smoke on wrangler** — `npx wrangler pages dev dist/ --ip 127.0.0.1 --port 8788 --compatibility-date=2024-09-23` (background), then:
  `curl -s -X POST -H "Content-Type: application/json" -d '{"url":"https://github.com"}' "http://127.0.0.1:8788/api/ping?lang=en"` → JSON with `received:5`, `samples:[...5 ms...]`, `status:200`. And an internal target `{"url":"http://127.0.0.1"}` → `invalidOrBlockedUrl` error (SSRF guard). Report both.
- [ ] **Step 4: commit**
```bash
git add functions/api/ping.ts
git commit -m "$(printf 'feat(netping): /api/ping probe — 5 timed HEAD->GET samples via _shared SSRF guard\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 4: i18n — netPing component strings + net-ping page

**Files:** Modify `src/i18n/components.ts` (+ `src/i18n/pages.ts`). READ both first to match the existing block shape (one `as const` object per component/page with `en`/`es`).

- [ ] **Step 1: `components.ts` — add a `netPing` block + its getter** mirroring an existing block (e.g. `isItUp`). Keys (EN+ES; ES per the native-voice plan — terse, technical, the caveat must NOT claim ICMP):
```ts
// netPing (en)
domainLabel: 'Host or URL', placeholder: 'github.com', check: 'Ping', checking: 'Pinging…',
caveat: 'Measures HTTP(S) response time from Cloudflare’s global edge to the target — not an ICMP ping, and not from your device. Includes the TLS handshake and the server’s processing time.',
min: 'Min', avg: 'Avg', max: 'Max', jitter: 'Jitter', reachability: 'Reachability', samplesLabel: 'Samples',
ratingFast: 'Fast', ratingModerate: 'Moderate', ratingSlow: 'Slow', unreachableLabel: 'Unreachable',
checkFailed: 'Ping failed. Check the host and try again.',
// netPing (es)
domainLabel: 'Host o URL', placeholder: 'github.com', check: 'Ping', checking: 'Haciendo ping…',
caveat: 'Mide el tiempo de respuesta HTTP(S) desde el edge global de Cloudflare al destino — no es un ping ICMP, ni desde tu dispositivo. Incluye el handshake TLS y el procesado del servidor.',
min: 'Mín', avg: 'Media', max: 'Máx', jitter: 'Jitter', reachability: 'Alcanzable', samplesLabel: 'Muestras',
ratingFast: 'Rápido', ratingModerate: 'Moderado', ratingSlow: 'Lento', unreachableLabel: 'Inalcanzable',
checkFailed: 'El ping falló. Revisa el host e inténtalo de nuevo.',
```
Add `export function getNetPing(lang: Lang) { return netPing[lang]; }` following the file's getter convention.

- [ ] **Step 2: `pages.ts` — add a `net-ping` page entry** (EN+ES) with the same field set the other tool pages use (confirm by reading the `is-it-up` entry): `title, description, seoHeading, seoText, howHeading, howSteps[], useCasesHeading, useCases[], faqHeading, faqs[{q,a}], seoBlockHeading, seoBlockText, seoFeatures[]`. Author real, honest copy (NOT placeholders) — every mention of "ping" must be qualified as HTTP-from-edge somewhere on the page; at least one FAQ = "Is this a real ICMP ping?" → answer: no, it's HTTP response time from Cloudflare's edge, here's why + use OS `ping` for device-level ICMP. Title e.g. `HTTP Ping — Latency Test` / `HTTP Ping — Test de Latencia`. Keep titles/descriptions in the ~55/155 char SEO range.

- [ ] **Step 3: build + tests** — `npm run build && npm test` → green (mismatched en/es keys break the `as const` type → fix if so).
- [ ] **Step 4: commit**
```bash
git add src/i18n/components.ts src/i18n/pages.ts
git commit -m "$(printf 'i18n(netping): netPing component strings + net-ping page meta/SEO/FAQ (EN+ES)\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 5: NetPing.svelte component

**Files:** Create `src/components/NetPing.svelte`. Mirror `src/components/IsItUp.svelte` (read it) for the input/fetch/race-guard/share-state/useToolComplete scaffolding; reuse the stage-2 `StatusBadge`.

- [ ] **Step 1: create** `src/components/NetPing.svelte`:
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import type { Level } from '../lib/severity';
  import type { PingResult } from '../lib/api-types';
  import { getNetPing } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { isValidUrl, getValidationError } from '../lib/validation';
  import { readQuery, updateQuery } from '../lib/share-state';
  import { computeStats } from '../lib/ping-stats';
  import { useToolComplete } from '../lib/tool-complete.svelte';
  import StatusBadge from './ui/StatusBadge.svelte';

  interface Props { lang?: Lang; }
  let { lang = 'en' }: Props = $props();
  const t = $derived(getNetPing(lang));
  const c = $derived(getCommon(lang));

  let host = $state('');
  let loading = $state(false);
  let error = $state('');
  let result = $state<PingResult | null>(null);
  let requestId = $state(0);

  const stats = $derived(result && result.samples.length ? computeStats(result.samples) : null);
  const verdict = $derived.by<{ level: Level; label: string } | null>(() => {
    if (!result) return null;
    if (result.received === 0) return { level: 'bad', label: t.unreachableLabel };
    const a = stats!.avg;
    if (a < 100) return { level: 'ok', label: t.ratingFast };
    if (a <= 400) return { level: 'warn', label: t.ratingModerate };
    return { level: 'bad', label: t.ratingSlow };
  });

  onMount(() => { const q = readQuery(['host']); if (q.host) { host = q.host; run(); } });

  async function run() {
    if (!host.trim()) return;
    if (!isValidUrl(host.trim())) { error = getValidationError('url', lang as 'en' | 'es'); result = null; return; }
    requestId++; const myId = requestId;
    loading = true; error = ''; result = null;
    updateQuery({ host: host.trim() });
    try {
      const res = await fetch(`/api/ping?lang=${lang}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: host.trim() }), signal: AbortSignal.timeout(20000),
      });
      if (myId !== requestId) return;
      const data = await res.json();
      if (myId !== requestId) return;
      if (!res.ok || data.error) { error = data?.error || t.checkFailed; if (data?.samples) result = data; }
      else result = data;
    } catch { if (myId === requestId) error = t.checkFailed; }
    finally { if (myId === requestId) loading = false; }
  }

  const fireToolComplete = useToolComplete('net-ping');
  let __ftc = true;
  $effect(() => { host; result; loading; error; requestId; if (__ftc) { __ftc = false; return; } if (error) { fireToolComplete('error'); return; } if (!result) return; fireToolComplete(); });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="ping-host" style="display:block; font-size:9px; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:.1em;">{t.domainLabel}</label>
      <input id="ping-host" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={host} placeholder={t.placeholder} onkeydown={(e) => e.key === 'Enter' && !e.isComposing && !loading && run()} style="width:100%;" />
      <button class="btn-primary" onclick={run} disabled={loading || !host.trim()}>{loading ? t.checking : t.check}</button>
      <p style="font-size:11px; color:var(--color-text-dim); margin:0; line-height:1.5;">{t.caveat}</p>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
    {#if error && !result}<div class="card" style="border-left:3px solid var(--color-bad);"><div class="card-body" style="color:var(--color-bad);">{error}</div></div>{/if}

    {#if result && verdict}
      <div class="card sev-accent is-{verdict.level}">
        <div class="card-body space-y-3">
          <div style="display:flex; align-items:center; gap:12px;">
            <StatusBadge level={verdict.level} label={verdict.label} />
            <span class="g-mono" style="font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--color-text-muted);">{result.host}</span>
          </div>
          {#if stats}
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px;">
              {#each [[t.min, stats.min], [t.avg, stats.avg], [t.max, stats.max], [t.jitter, stats.jitter]] as [lbl, val]}
                <div style="text-align:center;">
                  <div style="font-size:10px; text-transform:uppercase; letter-spacing:.1em; color:var(--color-text-dim);">{lbl}</div>
                  <div style="font-family:'JetBrains Mono',monospace; font-size:18px; color:var(--color-text);">{val}<span style="font-size:11px; color:var(--color-text-muted);">ms</span></div>
                </div>
              {/each}
            </div>
            <!-- sample bars: accessible — each bar has an aria-label; max sample scales to 100% -->
            <div role="img" aria-label={`${t.samplesLabel}: ${result.samples.join(', ')} ms`} style="display:flex; align-items:flex-end; gap:6px; height:48px;">
              {#each result.samples as s}
                <div title={`${s}ms`} style="flex:1; border-radius:3px 3px 0 0; background:var(--color-{verdict.level}); height:{Math.max(8, Math.round((s / stats.max) * 100))}%;"></div>
              {/each}
            </div>
          {/if}
          <div style="font-size:12px; color:var(--color-text-muted);">{t.reachability}: {result.received}/{result.sent}</div>
        </div>
      </div>
    {/if}
  </div>
</div>
```
NOTE on the bar `background:var(--color-{verdict.level})` — that is a Svelte template interpolation producing `var(--color-ok)` etc. **CSP check:** PT's CSP allows `style-src 'unsafe-inline'` (other tools use inline `style` with `var()`), so this is consistent — but if the reviewer prefers, move the bar color to a `.sev-bar.is-{level}` class-map (like `.sev-accent`). Implementer: confirm against the CSP and the stage-2 convention; the class-map is the safer choice — prefer adding `.sev-bar.is-{level}{background:var(--color-{level})}` to global.css and using `class="sev-bar is-{verdict.level}"` instead of inline.

- [ ] **Step 2: build** — `npm run build` → succeeds (report Svelte warnings verbatim).
- [ ] **Step 3: tests** — `npm test` → 248 + ping-stats green.
- [ ] **Step 4: commit**
```bash
git add src/components/NetPing.svelte
git commit -m "$(printf 'feat(netping): NetPing.svelte — caveat + severity badge + min/avg/max/jitter + sample bars\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 6: pages (EN + ES)

**Files:** Create `src/pages/net-ping.astro` + `src/pages/es/net-ping.astro`. Mirror `src/pages/is-it-up.astro` (+ its `es/` variant).

- [ ] **Step 1:** `src/pages/net-ping.astro`:
```astro
---
import Layout from "../layouts/Layout.astro";
import NetPing from "../components/NetPing.svelte";
import SeoContent from "../components/SeoContent.astro";
import SeoBlock from "../components/SeoBlock.astro";
import SourcesBlock from "../components/SourcesBlock.astro";
import ToolContent from "../components/ToolContent.astro";
import { pageI18n } from "../i18n/pages";

const p = pageI18n["net-ping"].en;
---

<Layout title={p.title} description={p.description} activeToolId="net-ping">
  <NetPing client:only="svelte" />
  <SeoContent heading={p.seoHeading} text={p.seoText} relatedToolIds={["is-it-up", "is-it-down", "site-speed", "dns-lookup"]} />
  <ToolContent howHeading={p.howHeading} howSteps={p.howSteps} useCasesHeading={p.useCasesHeading} useCases={p.useCases} faqHeading={p.faqHeading} faqs={p.faqs} />
  <SeoBlock heading={p.seoBlockHeading} text={p.seoBlockText} features={p.seoFeatures} />
  <SourcesBlock slug="net-ping" lang="en" />
</Layout>
```
- [ ] **Step 2:** `src/pages/es/net-ping.astro` — identical but `import Layout from "../../layouts/Layout.astro";` (and the other imports with `../../`), `const p = pageI18n["net-ping"].es;`, `<NetPing client:only="svelte" lang="es" />`, and `<SourcesBlock slug="net-ping" lang="es" />`. Confirm the depth + `lang="es"` against `src/pages/es/is-it-up.astro`.
- [ ] **Step 3: build** — `npm run build` → both pages build; `dist/net-ping/index.html` + `dist/es/net-ping/index.html` exist.
- [ ] **Step 4: commit**
```bash
git add src/pages/net-ping.astro src/pages/es/net-ping.astro
git commit -m "$(printf 'feat(netping): net-ping tool pages (EN + ES)\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 7: register tool + sources

**Files:** Modify `src/lib/tools.ts` + `src/data/sources.ts`.

- [ ] **Step 1: `tools.ts`** — add to the `groups` "Speed & Uptime" ids array: `"is-it-up", "is-it-down", "site-speed", "net-ping"`. Add the tool object (place near the other Speed & Uptime tools, matching the existing object shape):
```ts
{
  id: "net-ping",
  name: "HTTP Ping",
  path: "/net-ping",
  description: "Measure HTTP response latency (min/avg/max/jitter) from Cloudflare's edge to any host",
  icon: "Pg",
  keywords: ["ping test", "latency test", "http ping", "response time", "ping"],
  group: "Speed & Uptime",
},
```
(Confirm `tools.test.ts` doesn't assert an exact tool count that needs bumping — if it does, update the expected count.)

- [ ] **Step 2: `sources.ts`** — add a `net-ping` entry mirroring an existing slug's shape (read one, e.g. `is-it-up`): a short methodology blurb + 1-2 references (e.g. MDN `fetch`/`Performance`, an explainer on HTTP latency vs ICMP). The blurb must restate the honest framing (edge HTTP timing, not ICMP).

- [ ] **Step 3: build + tests** — `npm run build && npm test` → green; the homepage + search now list "HTTP Ping" under Speed & Uptime.
- [ ] **Step 4: commit**
```bash
git add src/lib/tools.ts src/data/sources.ts
git commit -m "$(printf 'feat(netping): register HTTP Ping tool (Speed & Uptime, 24th) + sources\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Task 8: verification gate

- [ ] **Step 1:** `npm test` → 248 baseline + ping-stats green. `npm run build` → clean.
- [ ] **Step 2: live functional + a11y on wrangler** — `npx wrangler pages dev dist/ --ip 127.0.0.1 --port 8788 --compatibility-date=2024-09-23` (bg). Then:
  - `curl POST /api/ping {"url":"https://github.com"}` → `received:5`, 5 samples, status 200. A slow/distant host → higher avg. An internal/blocked host → `invalidOrBlockedUrl` (SSRF holds).
  - Playwright (bypassCSP context, the grade-badge gate pattern): goto `/net-ping/`, fill `#ping-host` with `github.com`, Enter, wait for `.sev-accent` result; inject axe → **0 serious/critical**. Confirm: caveat text present, StatusBadge (Fast/Moderate/Slow) renders, the 4 stat cards + sample bars render, bars have an accessible label, reachability shows `5/5`. Repeat on `/es/net-ping/` (caveat in Spanish).
- [ ] **Step 3: 3-agent review** — dispatch the review pattern on `git diff master..stage3/net-ping` (code-reviewer + spec-compliance), focus: SSRF reuse correct, honesty caveat present + accurate (no ICMP claim), no logic regressions, a11y of bars.
- [ ] **Step 4:** Branch ready → merge + deploy (`--branch=main --project-name=pingthat`, honest sitemap via prebuild, verify live `/net-ping/` renders + a ping returns samples) — Marco-gated.

---

## Self-review notes (author)

- **Spec coverage:** server-side + SSRF reuse (§1) → Task 3; "HTTP Ping" + caveat (§1) → Task 4 (caveat string) + Task 5 (rendered); 5-sample HEAD→GET (§2) → Task 3; min/avg/max/jitter (§2) → Task 1 (computeStats) + Task 5 (rendered); reachability + StatusBadge severity + bars (§2) → Task 5; architecture files (§3) → Tasks 1-7; testing/a11y (§4) → Task 1 unit + Task 8 axe; out-of-scope (§5) honored (no ICMP/client-side/traceroute).
- **Deviation from spec (documented):** the spec listed `ping.ts` returning min/avg/max/jitter; the plan has `ping.ts` return raw `samples[]` and the COMPONENT derive the stats via `ping-stats.ts` — avoids a `functions/`→`src/lib/` import and keeps the function minimal. Same honest output.
- **Type consistency:** `PingResult` (host/sent/received/samples/status/error), `computeStats(samples)→{min,avg,max,jitter}`, `getNetPing`, tool id `net-ping`, path `/net-ping`, icon `Pg` — consistent across tasks.
- **Open discretion:** the SEO/FAQ prose (Task 4 step 2) + the sources blurb (Task 7) are implementer-authored content (honest framing required, not placeholders); the sample-bar color via class-map vs inline (Task 5 note).
