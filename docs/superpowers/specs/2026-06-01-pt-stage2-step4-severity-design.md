# PT redesign — Stage-2 Step 4: shared severity pattern (G4)

**Date:** 2026-06-01
**Branch:** `redesign/warm-dark-stage2` (off master `91c638a`; steps 1-3 committed: `17130b0`, `6a0319a`, `5d6879b`)
**Status:** design approved + **revised after 3-agent review (2026-06-01)** — ready for implementation plan
**Frame:** Stage-2 *craft/polish* (Marco's build loop). NOT a metric/engagement play. Visual-only — no new features, no new judgments (one accepted micro-exception, see §2). Sweep-pause does not apply (UX, not AEO).

> **Review note:** this spec was fact-checked + pre-mortem'd + a11y/contrast-reviewed by 3 parallel agents on 2026-06-01. Their findings are integrated below; the changelog is §9. All empirical claims in §1 were independently confirmed against code.

---

## 1. Context & scope correction (verified against code)

The 2-day-old memory described step 4 as *"severity pattern (G4) + chain-grid (G2, wire real `?host=`)"*. Verified against current code (and re-confirmed by review agent):

- **G2 (chain-grid + `?host=` carry) is ALREADY DONE.** `src/components/SeoContent.astro:57-68` renders a 2-column related-tools chip grid (name + description); `:122-164` is the lazy per-link param-carry script (`CARRY_KEYS = ['domain','host','url']`, bound on pointerdown/focus/mouseenter/touchstart/click). **23 of 30** top-level pages pass `relatedToolIds` (the 7 that don't are 404/about/contact/index/methodology/privacy/terms — all non-tool). The orphaned `RelatedTools.astro` (memory's reference) is used ONLY in `docs/[...slug].astro` + `es/docs/[...slug].astro`. → **G2 out of scope for step 4.**
- **Severity tokens ALREADY EXIST** (step 1, `src/styles/global.css:68-71`): `--color-ok/warn/bad/info` each with `-dim` and `-edge`. Comment `:66` = *"drives tool-result severity (LED + badge)"*.
- **Components do NOT yet use them consistently.** Each verdict component renders ad-hoc severity (e.g. `DnssecCheck.svelte:212` `border-left: 3px solid {overallColor}`, custom `overallColor()` → `--color-green/red/yellow`).
- **Latent bug:** `--color-yellow` is **never defined** as a token, yet referenced as `var(--color-yellow, #eab308)` in **10 components** — `CaaLookup, DnssecCheck, EmailAuth, Ipv6Check, MyIp, PortScan, ResolverCompare, ReverseDns, SiteSpeed, SslChecker` — falling back to a hardcoded amber outside the warm-dark palette. (NOTE: these span BOTH the verdict and informational buckets, so the `--color-yellow` kill is not confined to one rollout phase — see §5.)

**Net:** Step 4 = **G4 only** — one shared severity pattern across the verdict components + a color-token sweep.

---

## 2. The pattern — 2-level system over one primitive

A single `LED + badge` primitive, two levels:

- **Level 1 (default):** badge (LED dot + icon `✓ / ! / ✕` + label) in the result header + a **subtle 3px severity-tinted left accent bar** on the result card. Calm, dense, scannable — the common case.
  - **Per-row LEDs are NOT a level-1 default** (review M5: three stacked color cues — badge + bar + per-row dots — over-encodes on a low-chroma warm palette). Per-row status is **opt-in**, only where a row carries genuinely independent status (e.g. HttpHeaders' per-header list), and even then the row **keeps its existing glyph/text** (the LED is decorative reinforcement, `aria-hidden`).
- **Level 2 (escalated):** the **same** badge inside a tinted banner. Banner identity = `-dim` background + **solid** `--color-{level}` left bar (NOT the `-edge` border — it fails 1.4.11 as a sole cue, see §7) + an icon disc + colored title + explanation. Reserved for critical findings. Level 2 = "the primitive + tint", not a separate pattern.

The icon inside the badge (`✓`/`!`/`✕`) means status is never conveyed by **color alone** → WCAG 1.4.1. (This must also hold for any per-row indicator and any `dotOnly` use — see §3.)

### Severity rubric (shared semantics — review M4)

Presentation lives in `severity.ts`; **semantics** get a shared one-line definition so locally-classifying tools don't drift:

- **`ok`** — no action needed.
- **`warn`** — sub-optimal / incomplete / degrades over time; **not currently exploitable**.
- **`bad`** — broken now or actively unsafe.
- **`info`** — a neutral fact with no good/bad judgment (used where a tool genuinely cannot assert safety — see below).

### Escalation rule (Rule A — approved)

> **Banner (level 2) = a finding that is (1) a security/privacy RISK to the user AND (2) actionable.**
> A plain negative *answer* (site down, slow, no IPv6, expired JWT) stays a **level-1 red badge** — it is the answer the user asked for, not an alarm.
>
> **Principle (review M3):** level-2 is reserved for risks the user discovers about a **third-party asset they were about to trust**. A tool whose entire purpose is to evaluate the **user's own input** (e.g. password strength) stays level-1, even when the finding is a real, actionable user risk — its dedicated UI (the strength meter) already carries the signal and a banner would fight it.

Only **5 tools** can escalate to a banner:

| Tool | State that escalates to banner | Note |
|---|---|---|
| `ssl-checker` | expired / invalid cert (`SslChecker.svelte:87,95,159`) | browsing there is unsafe |
| `dnssec-check` | `bogus` **only** (`DnssecCheck.svelte:131,135`) | active-attack indicator; `insecure` (unsigned) = normal → badge |
| `webrtc-leak-test` | leak detected (`WebrtcLeakTest.svelte:101`) | VPN not protecting user. **"No leak" = `info`, NOT `ok`** (review H3: the component itself disclaims it cannot confirm protection — a green ✓ would over-claim) |
| `email-auth` | SPF fail **AND** DMARC fail (spoofable) | **Accepted micro-judgment (review C2):** per-record `assessment` exists (`EmailAuth.svelte:31,111,128`) but the *combined* "spoofable" verdict is a small derivation (`spf.fail && dmarc.fail`), not a pre-computed state. This is the one accepted exception to "no new judgments" — it only combines existing fields, adds no new analysis. |
| `http-headers` | poor posture / low score (`HttpHeaders.svelte:143`) | attack surface |

---

## 3. Architecture — small, testable units

Results render in Svelte 5 (runes; `client:only` for 13/14 tools, `client:load` for password-strength). The primitive is Svelte + a pure TS helper.

| New file | Responsibility | API |
|---|---|---|
| `src/lib/severity.ts` | `type Level = 'ok' \| 'warn' \| 'bad' \| 'info'` + **presentation, no color strings**: returns the level, the icon glyph, and a localized aria-label. **Does NOT return hex/`var()` strings** (review A3: colors resolve via CSS class-map, not inline injection). Pure functions → unit-testable. | `levelIcon(level)`, `levelAria(level, lang)` |
| `src/components/ui/StatusBadge.svelte` | The primitive: LED dot + icon + label. | props: `level: Level`, `label: string`, `size?: 'md' \| 'sm'` (default `md`), `dotOnly?: boolean` |
| `src/components/ui/VerdictBanner.svelte` | Level-2 banner: icon disc + title + explanation + a **`{@render children()}` snippet** (Svelte 5.55 idiom, not legacy `<slot>`) for the badge. | props: `level: Level`, `title: string`, `explanation: string` |

**Color via CSS class-map, not inline style (review A3 — CSP-critical).** PT ships a strict CSP. Inline `style="color: var(--color-bad)"` would need `style-src 'unsafe-inline'`. Instead: component binds `class="badge is-{level}"` (driven by `$derived`), and scoped `<style>` holds `.is-ok { color: var(--color-ok); background: var(--color-ok-dim); border-color: var(--color-ok-edge); }` etc. Keeps the per-level token triplet co-located, reactive, and CSP-safe. The new primitives are the chance to NOT deepen the existing inline-style dependency.

**`dotOnly` a11y contract (review H1 — mandatory, not discretionary).** A bare colored dot is color-only (1.4.1 fail). So `dotOnly` mode MUST render a visually-hidden label via `levelAria(level, lang)` (`sr-only` span) so the status is announced. Per §2, per-row use is opt-in AND keeps the visible glyph/text — the LED is then decorative + `aria-hidden`.

**`info` is load-bearing, not dead (review M1).** It is used for: webrtc-leak "no leak" (neutral, can't assert safety) and resolver-compare "resolvers diverge but none wrong". If during implementation neither materializes, `info` is removed from the union (don't ship it defined-but-unused).

**Responsibility split:** helper = presentation; each tool maps its own **domain states → `{ level, escalate }`** locally, against the §2 rubric. Domain logic stays where it lives (`DnssecCheck` keeps deciding what `bogus` is).

**Non-interactive invariant (review L4 / A-44px):** `StatusBadge`/`VerdictBanner` render as non-interactive `<span>`/`<div>` — no `onclick`, `tabindex`, or `role`. (44px / focus-visible only apply if interactive; if a future "learn more" trigger is added, it must be a real `<button>` with `min-height:44px`, reusing the existing `.btn-*` pattern.)

**Keep the badge inside the existing `aria-live` region (review A4)** so a verdict change is announced (components already wrap results in `aria-live="polite"`, e.g. `DnssecCheck.svelte:206`).

**Rejected alternatives:** mega `ToolResult.svelte` (tool bodies vary too much); CSS-only utility classes (loses prop API, repeats markup, harder to test).

---

## 4. Token & state policy

- Severity uses the **semantic tokens** `--color-ok/warn/bad/info` (+ `-dim`/`-edge`), not legacy aliases.
- **Kill** `var(--color-yellow, #eab308)` → `--color-warn` across all **10** referrers (§1).
- **Sweep must grep raw hex too (review L2)**, not only `var(--color-*)`: e.g. `RedirectChecker.svelte:82 #f59e0b`, `PasswordStrength.svelte:164 #f97316` (orange — has **no** token; decide its mapping: likely a 5-step strength scale needs an explicit token or collapse to `--color-warn`).
- **`.badge-amber` / `.text-amber` are shared global utilities (review L3):** decide explicitly whether to remap their severity uses to `-warn` (PasswordStrength uses `var(--color-amber)` directly for warn-severity findings → those move) vs leave the global class for non-severity consumers. Don't blanket-rename the utility.
- **Error cards (review H2):** existing error states render `border-left: 3px solid var(--color-red)` (DnssecCheck:208, SslChecker:152, HttpHeaders:139, RedirectChecker:123, WebrtcLeakTest:143). Migrate `--color-red` → `--color-bad` for palette consistency, but they stay a **distinct, badge-less, banner-less** visual — "the tool failed" ≠ "the result is bad".

### State matrix (review H2 — was unspecified)

| State | Treatment |
|---|---|
| loading | existing spinner only — no badge, no banner |
| error (network/parse failure) | existing red-left error card, migrated to `--color-bad`, **no badge, no VerdictBanner** |
| empty / initial | nothing |
| classified success | badge (level 1) + accent bar; **VerdictBanner only here**, only for the 5 escalation tools at their critical state |

---

## 5. Rollout scope

**15 verdict components** adopt `StatusBadge` (the 5 from §2 also use `VerdictBanner`):
`privacy-check, ipv6-check, port-scan, dnssec-check, ssl-checker, http-headers, redirect-checker, is-it-up, is-it-down, site-speed, password-strength, email-auth, webrtc-leak-test, resolver-compare, caa-lookup`.

> `caa-lookup` moved from informational → verdict (review C3): it computes no-policy (warn) / CA-allowed (ok) / not-allowed (bad) + a `critical` badge. Level-1 (CAA posture isn't an actionable third-party-trust alarm → no banner).
> `resolver-compare` borderline: consistent=`ok`, diverge=`info` (resolvers can legitimately differ — not `bad`).

**8 informational components** — color-token cleanup **only, no severity badge** (Decision 3 / honest-ceiling: no fabricated "OK ✓"):
`my-ip, dns-lookup, reverse-dns, whois-lookup, ip-converter, subnet-calculator, url-parser, jwt-decoder`.

> `jwt-decoder` shows `exp`/signature state, but that's a **token attribute**, not a user-risk verdict — stays informational. `subnet-calculator`'s private/public green/amber is descriptive (a fact, not a judgment) — stays informational.

**i18n:** components already receive `lang` and pull labels from `src/i18n/components` — **no separate ES components**, so one change covers EN + ES. Primitives take `label`/`title` as props; `levelAria(level, lang)` is the only string the helper localizes.

**Build order + checkpoints (review M7 — verify before fan-out):**
1. `severity.ts` + `StatusBadge.svelte` + `VerdictBanner.svelte` + unit tests.
2. The **5 escalation tools** → **Checkpoint A:** a11y re-audit on these 5 only (H1 dotOnly, H2 error/banner collision, H3 webrtc-info all bite here). Lock the primitive contract before copying it 10 more times.
3. Remaining 10 verdict tools.
4. Token sweep on the 8 informational components + kill `--color-yellow` everywhere it remains → **Checkpoint B.**

The 226-vitest baseline stays green at every commit.

---

## 6. Out of scope (explicit)

- **G2 chain-grid / `?host=` carry** — already in `SeoContent.astro`. No new inline chain CTA.
- **`redirect-checker` HTTPS→HTTP downgrade detection (review M2):** a real risk, but the component does **not** compute scheme-downgrade today (`RedirectChecker.svelte:81` classifies by status code only). Adding it = a **new judgment** → **deferred, NOT part of this visual step** (and would otherwise illegitimately become a 6th banner tool).
- **No other new verdicts** — severity is a visual layer over states each tool already computes (sole exception: the email-auth field-combination in §2).
- **No stage-3 features** (live-readout hero, `net/ping`, A-F grade badges, Cmd+K overlay, CF geo-redirect).
- **Print styles** — none exist; non-goal for this site (review L5).

---

## 7. Testing, a11y & gates

**Contrast — independently computed, all PASS (review A1/A2), no token change needed:**

| Severity color (as ~11px text) | on `--color-surface` #232120 | on composited `-dim` tint |
|---|---|---|
| `ok` #43d6a3 | 8.69:1 ✓ | 6.80:1 ✓ |
| `warn` #e8b13d | 8.24:1 ✓ | 6.47:1 ✓ |
| `bad` #f0776a | 5.77:1 ✓ | **4.72:1 ✓ (thin margin)** |
| `info` #5fa8f0 | 6.37:1 ✓ | 5.23:1 ✓ |

- **Pin the pill background alpha; do NOT lift it on hover for `bad`** (4.72:1 margin would cross below 4.5 at ~0.18 alpha).
- **LED dot** (solid token) passes 1.4.11 (3:1). The **`-edge` border FAILS 1.4.11 in isolation** (1.66–1.88:1) → it must never be the sole cue; banner uses a **solid** bar + icon + colored title (all pass).
- **Reduced motion:** `global.css:15-22` already forces all animation/transition to ~0 with `!important`. Implement any LED glow as **static `box-shadow` or CSS `@keyframes`** (never JS animation) so the existing global block covers it. Do not add a new reduced-motion block.
- CLS: `main > astro-island { min-height: 80vh }` (`global.css:89-92`) already reserves island space; no new CLS rule needed for `client:only` badges.

**New unit tests** for `severity.ts` + both primitives. Merge gates (step 5, unchanged): Lighthouse median-of-3 vs baseline, W3C Nu, a11y re-audit, prod-parity `wrangler pages dev dist/`, 3-agent review gate, then merge to master + deploy.

---

## 8. Open questions

None blocking. Resolved during review: `resolver-compare` → `info` on diverge (§5); `info` level has two concrete homes (§3). The only accepted scope nuance is the email-auth field-combination (§2), logged explicitly.

---

## 9. Changelog — post-review revisions (2026-06-01)

Integrated from 3-agent review (fact-check / pre-mortem / frontend-a11y):
- **C1** `--color-yellow` referrers corrected: 10 components (not "DnssecCheck/PasswordStrength"); kill spans both rollout phases (§1, §5).
- **C2** email-auth "spoofable" logged as an accepted field-combination micro-judgment, not a pre-existing state (§2).
- **C3** `caa-lookup` moved informational → verdict (computes real verdicts) → 15 verdict / 8 informational (§5).
- **H1** `dotOnly` a11y contract made mandatory (sr-only `levelAria`); per-row LEDs demoted to opt-in + keep-glyph (§2, §3).
- **H2** state matrix added (loading/error/empty/success); error cards stay distinct from verdicts; `VerdictBanner` only on classified success (§4).
- **H3** webrtc "no leak" = `info` not `ok` (no false-safety) (§2).
- **M1** `info` level made load-bearing (webrtc no-leak, resolver diverge) or removed (§3).
- **M2** redirect HTTPS→HTTP downgrade declared out-of-scope new-judgment (§6).
- **M3** Rule A principle clause: third-party-asset risk vs user's-own-input (§2).
- **M4** shared ok/warn/bad/info rubric added (§2).
- **M5** per-row LED de-defaulted (over-encoding) (§2).
- **M7** Checkpoints A/B added inside step 4 (§5).
- **A1/A2** contrast computed: all severity text PASSES AA; `-edge` fails 1.4.11 in isolation → solid bar for banner (§7).
- **A3** CSS class-map (`.is-{level}`) over inline style (CSP); `severity.ts` returns no color strings (§3).
- **A-misc** `{@render children()}` over `<slot>`; non-interactive invariant; keep badge in aria-live; pin pill alpha (§3, §7).
- **L2/L3** sweep raw hex too (`#f97316` orphan); `.badge-amber` shared-utility decision (§4).
