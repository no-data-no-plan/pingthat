# PingThat v2 — implementation spec

Source: design bundle from claude.ai/design (2026-04-30 chat) + 2026-05-03 engagement audit (5-agent CW).

## Why this redesign

PT engagement rate **0% over 51 users 28d** (vs AY 11%, OP 30%). 5-agent CW
audit identified 8 SEV-2 themes mapped to specific UI gaps. This bundle
addresses 6/8 directly; the remaining 2 (production-only: CF Worker geo
redirect + production tool wiring) ship in the migration commits.

## Lead variant: V1 — live network readout

Out of three homepage drafts, **V1** is the recommended primary because:

- Live tile grid (8 readouts: IP, ASN, resolver, TLS, leaks) shows the
  visitor *their own data* above the fold → strongest engagement bait for
  a 0% baseline.
- Tile structure absorbs the new pill row + lang banner cleanly.
- Compatible with the new `net/ping` tool surface (becomes the 9th tile,
  resolves brand-feature mismatch).

V2 (terminal hero) → relocate as `/about/` content for a "what this site
runs" demo.

V3 (command palette) → wire as a `Cmd+K` overlay over every page, not as
the homepage default.

## Scoring against 8 SEV-2 findings

| # | Finding | Bundle status |
|---|---|---|
| A | Above-fold tool widget | ⚠️ V1 readout + pills resolve "0 clickables", but production must add an actual interactive primary tool (subnet input or DNS lookup) above the fold — not just live data |
| B | ES geo-redirect / banner | ✅ added: `<LangBanner lang="es" />` mock in shared.jsx + CSS. **Production: CF Worker on `Accept-Language: es` returning a 200 with banner injected (or 302 to /es/)** |
| C | Chain feature visible | ✅ tool page `related-grid` (5 cards) is the canonical surface. Subnet tool page also uses it. Homepage hero copy now mentions "Results carry between tools — check DNS, then SSL, then headers on the same domain without retyping" |
| D | Trust signals | ✅ Footer identity strip: GitHub link, `hello@pingthat.dev`, "since 2025", "last verified may 2026". **Production: actually create the email address + a /changelog/ route** |
| E | H1 task-anchored + pill row | ✅ V1 H1 "Network tools that don't phone home" + new `.hero-pills` row scannable to 5 top tools |
| F | Ping tool | ✅ added `net/ping` to tools-data.js. **Production: build SubnetCalculator-equivalent component using `fetch(host, {method:'HEAD'})` + `performance.now()` deltas** |
| G | Color-coded results / shareable | ⚠️ infra (LED ok/warn/bad) is correct, but production should add A-F grade badges to SSL Checker + Security Headers (the SecurityHeaders.com pattern that produces a screenshot-shareable artifact) |
| H | Unified CIDR input subnet | ✅ new `tool-page-subnet.jsx` with single field accepting `192.168.1.0/24` or `192.168.1.0`. Result grid 8 tiles. Chain CTA prompts ip-converter, my-ip, ipv6-check, reverse-dns, port-scan |

**Production-only work (not in design bundle):**

1. CF Worker `Accept-Language: es` detection
2. `net/ping` Svelte component
3. Subnet calculator unified-input parse logic refactor
4. SSL/Security headers A-F grade computation
5. `/about/` rewrite incorporating V2 terminal demo
6. `Cmd+K` overlay using V3 palette markup
7. Activate orphaned `RelatedTools.astro` on every tool page (replaces tiny SEO footer pill row)
8. Fix `?domain` ↔ `?url` param normalization between domain-type and URL-type tools (silent chain failure flagged in CW)

## Files in this bundle

| File | Status |
|---|---|
| `README.md` | original (handoff instructions) |
| `chats/chat1.md` | original chat transcript |
| `project/PingThat Redesign.html` | modified — added subnet tool artboard |
| `project/styles.css` | original |
| `project/styles-pages.css` | modified — lang banner, hero pills, footer identity, subnet tool CSS |
| `project/shared.jsx` | modified — Footer identity strip, new `LangBanner` component |
| `project/tools-data.js` | modified — added `net/ping` |
| `project/home-v1.jsx` | modified — lang banner, hero pills, chain pitch in lede |
| `project/home-v2.jsx` | original |
| `project/home-v3.jsx` | original |
| `project/tool-page.jsx` | original (DNS Lookup, already has chain section) |
| `project/tool-page-subnet.jsx` | **NEW** — Subnet Calculator with unified CIDR input |
| `project/docs-page.jsx` | original |
| `project/design-canvas.jsx` | original |

## Migration plan (next session)

**Phase 1 — Foundation (1 session)**
- Layout rewrite to V1 + lang banner above topbar
- New `Layout.astro` skeleton with Geist + JetBrains Mono via @font-face
- CSS variables migration: `--bg`, `--fg`, `--accent`, namespace prefixes
- New homepage with live readout (8 tiles), pill row, hero copy with chain
  pitch, full 24-tool table grouped by `net/sec/perf/calc`
- Footer identity strip with real email, GitHub link
- Tests preservation: PT vitest baseline 226 must stay green

**Phase 2 — Per-tool surfaces (1 session)**
- Subnet Calculator: unified CIDR input refactor (parser regex
  `/^([\d.]+)(?:\s*\/\s*(\d+))?$/`), result grid 8 tiles
- DNS Lookup, SSL Checker, HTTP Headers, JWT Decoder, etc: tool-page
  template with breadcrumbs, head meta, form, result, related grid
- Activate `RelatedTools.astro` on every tool page (replaces SEO pill row)
- Fix `?domain` ↔ `?url` param normalization

**Phase 3 — Trust + branding (1 short session)**
- Ship `net/ping` (HTTP HEAD latency check)
- CF Worker `Accept-Language: es` redirect
- A-F grade badge for SSL Checker + Security Headers
- Activate `/changelog/` route generated from git log

**Phase 4 — Polish (1 short session)**
- `Cmd+K` palette overlay (V3 markup)
- V2 terminal demo on `/about/`
- Mobile density tightening (per Agent 1 finding: `p-3 gap-2.5`)
- Search placeholder rotation with Spanish terms

## Don't lose

- Existing tests (PT vitest 226/226 baseline)
- A11y baselines (already WCAG 2.2 AA per audit_wcag22_manual_pingthat_2026_05_01.md)
- ePrivacy compliance (consent_default + update_logic identical across portfolio)
- URL state contract (12 tools wired in CW Phase 0+0c — preserve `?host=` chain)
- All 23 existing tools — none get cut, `net/ping` is the 24th
