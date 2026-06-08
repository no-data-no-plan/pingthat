# PT Stage-3 #2 — net/ping ("HTTP Ping" latency tool)

**Date:** 2026-06-09
**Branch:** `stage3/net-ping` (off master, current HEAD `a8bd2bc` = stage-2 + a11y + glow + grade-badges shipped)
**Status:** design approved — ready for implementation plan
**Frame:** Stage-3 feature. Strategic fit = a NEW indexable tool page → new SEO surface ("ping test" / "latency test" keywords), which serves PT's real lever (ranking surface). The 24th tool.

---

## 1. What it is + the honesty constraint (decisive)

A **server-side Cloudflare Pages Function** that measures **HTTP(S) response latency from Cloudflare's edge to a target host**, taking multiple samples and reporting a latency profile (min/avg/max/jitter).

**Why server-side, not client-side:** PT ships a strict CSP whose `connect-src` is `'self'` + a fixed allowlist (no arbitrary origins). A browser `fetch()` to a user-entered host is therefore **blocked by CSP** — client-side ping is impossible without gutting the security posture. So the measurement is unavoidably edge-based (like the existing `check-site` / is-it-up, which already times `responseTime` server-side via `Date.now()`).

**Honesty (honest-ceiling — non-negotiable):** named **"HTTP Ping"** (captures the "ping test" keyword) with a **prominent caveat** at the top of the result + on `/methodology`:
> "Measures HTTP(S) response time from Cloudflare's global edge to the target — this is NOT an ICMP ping, and NOT measured from your device. It includes the TLS handshake + the server's processing time."

Never claim ICMP, never imply it's the user's network latency. If a user wants a true device-level ICMP ping, the caveat says so and points to OS tools.

## 2. Output

- **5 sequential requests**, `HEAD` (fall back to `GET` if the server rejects HEAD), with a small gap (~150ms) between them; per-request timeout ~5s; total bounded (~10s worst case). Reuses the **SSRF guard + `fetchWithManualRedirects` from `functions/api/_shared.ts`** — CRITICAL: the host is user input, so the existing SSRF protection (blocks internal/private/loopback targets) MUST gate every request.
- **Stats:** `min` / `avg` / `max` / **`jitter`** (mean absolute difference between consecutive samples) + **reachability** `received/sent` (the packet-loss equivalent) + the final HTTP status + the resolved/normalized host.
- **Severity badge** — reuses the stage-2 `StatusBadge` (consistency): by `avg` latency — `< 100ms` fast (`ok`) · `100–400ms` moderate (`warn`) · `> 400ms` slow (`bad`) · 0 received → `bad`. Thresholds are honest **edge-based** values (documented as such, not user-network).
- **Sample sparkline:** the 5 samples as small bars, colored by severity, with an accessible numeric fallback (each bar labelled / a visually-hidden list of the values) — the data is never color/visual-only.

## 3. Architecture (small, testable units)

| File | Responsibility |
|---|---|
| `src/lib/ping-stats.ts` | PURE helper: `computeStats(samples: number[]): { min: number; avg: number; max: number; jitter: number }`. `jitter` = mean of `|samples[i] - samples[i-1]|` over consecutive pairs (0 if <2 samples). Rounds to integers (ms). Unit-testable. |
| `functions/api/ping.ts` | Pages Function. Input `{ host: string }` (or `url`). Validate via `_shared` (`isValidDomain`/`isValidUrl` + SSRF guard). Run 5 timed `HEAD`(→`GET` fallback) requests via `fetchWithManualRedirects`, collecting `samples[]` (ms) + success count. Return `{ host, sent, received, samples, min, avg, max, jitter, status }`. On total failure return a clean error envelope. |
| `src/components/NetPing.svelte` | Svelte 5 runes, `lang` prop. Input + run button + the result (caveat banner, StatusBadge by avg, stat cards, sample bars). Standard PT patterns: `card`, `aria-live="polite"` result region, `?host=` share-state (read/updateQuery), `useToolComplete`, cancel/abort + race guard (mirror SslChecker/IsItUp). |
| `src/pages/net-ping.astro` + `src/pages/es/net-ping.astro` | Tool page: `Layout` (activeToolId="net-ping") + `<NetPing client:only="svelte" lang>` + `SeoContent` (relatedToolIds: is-it-up, is-it-down, site-speed, dns-lookup) + `ToolContent` (how/use-cases/FAQ) + `SourcesBlock`. |
| `src/lib/tools.ts` | Register: `{ id: 'net-ping', name: 'HTTP Ping', path: '/net-ping', description, icon: 'Pg', keywords: ['ping test','latency test','http ping','response time'], group: 'Speed & Uptime' }` + add `net-ping` to the `groups` "Speed & Uptime" ids. |
| `src/i18n/components.ts` | `netPing` block (EN+ES): labels, the caveat, stat labels, severity words, error strings. |
| `src/i18n/pages.ts` | `net-ping` page meta (title/description/SEO heading/text/howSteps/useCases/faqs), EN+ES. |

The sitemap is auto-extended by the build prebuild (the honest `sitemap-lastmod-honest.sh`); the new page picks up its own lastmod. `functions/_es-paths.gen.js` regenerates on build.

## 4. Testing & a11y

- `ping-stats.ts` → **unit tests**: min/avg/max/jitter for typical samples; boundaries — single sample (jitter 0), all-equal (jitter 0), known jitter sequence, empty (guard). Baseline **248 vitest green**.
- `functions/api/ping.ts` → the SSRF rejection + the HEAD→GET fallback are the risk areas; covered by the `_shared` reuse (already tested) + manual verification on the wrangler instance. (Functions aren't in the node vitest include; the pure stat logic is what's unit-tested.)
- `NetPing.svelte` → `npm run build` (compile) + a live axe pass on a `wrangler pages dev` instance (it's an `/api` tool — not pure-client; mirror the grade-badge gate, bypassCSP Playwright context). 0 serious/critical.
- **a11y:** caveat is real text (not just an icon); StatusBadge carries the verdict (letter/word, not color-only); the sample bars expose their values to AT (aria-labels or a visually-hidden value list); result in the `aria-live` region; non-interactive bars.

## 5. Out of scope (explicit)

- **No ICMP** (impossible from a browser/CF Worker) and **no client-side measurement** (CSP) — the caveat states this and points to OS tools for a true device ping.
- No traceroute, no WebSocket/TCP-handshake ping, no continuous/streaming ping, no geographic multi-region sampling (single CF-edge origin).
- No new severity primitive — reuse the stage-2 `StatusBadge`.

## 6. Open questions

None blocking. Implementer discretion: the exact path slug (`/net-ping` vs `/ping` — `/net-ping` chosen for naming consistency; the title/keywords carry the "ping" SEO), sample count (5) and inter-sample gap, and the precise severity thresholds (documented edge-based estimates, tunable).
