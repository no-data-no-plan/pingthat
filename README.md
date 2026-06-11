# PingThat

**[pingthat.dev](https://pingthat.dev)** — 24 free network & security tools that run in your browser or at the edge. No signup, no tracking of query content, EN + ES.

## Tools

DNS lookup · DNSSEC check · CAA lookup · reverse DNS · resolver compare · email auth (SPF/DKIM/DMARC) · SSL checker with A–F grade · security-headers grade · HTTP headers · HTTP ping · port scan · WHOIS · redirect checker · is-it-down/up · site speed · subnet calculator · IP converter · IPv6 check · my IP · privacy check · WebRTC leak test · JWT decoder · password strength · URL parser

## Architecture

- **Astro + Svelte 5** static build on **Cloudflare Pages**; interactive tools are islands.
- **Edge middleware** (`functions/_middleware.js`): per-request nonce CSP (no `unsafe-inline`), strict security headers, locale geo-redirect with search-bot exemption, `304` pass-through guard so cached HTML never desyncs from its CSP nonces.
- **Server-side probes** (`functions/api/`): tools that reach user-supplied hosts (HTTP ping, port scan…) run as Pages Functions behind a shared SSRF guard — internal ranges and cloud metadata IPs blocked, every redirect hop re-validated.
- **Honest tooling**: each tool states its method and limits (e.g. HTTP ping is edge-HTTP latency, not ICMP — with an RFC-cited FAQ explaining the difference).
- **Quality gates**: axe-core accessibility sweeps (0 serious issues), Lighthouse 100/100/96/100, W3C-valid markup, per-URL honest `lastmod` derived from git history.

## Development

```sh
npm ci
npm run dev        # local dev server
npm run build      # static build + sitemap lastmod from git history
npm test           # vitest unit tests
```

Node ≥ 22.12. Clone with full history (the sitemap step reads per-file git dates).

## Status

Actively maintained. Built and operated by [Marco B.](https://pingthat.dev/about/)
