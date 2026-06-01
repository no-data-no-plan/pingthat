# PT redesign — Stage-2 Step 4: shared severity pattern (G4)

**Date:** 2026-06-01
**Branch:** `redesign/warm-dark-stage2` (off master `91c638a`; steps 1-3 committed: `17130b0`, `6a0319a`, `5d6879b`)
**Status:** design approved — ready for implementation plan
**Frame:** Stage-2 *craft/polish* (Marco's build loop). NOT a metric/engagement play. Visual-only — no new judgments, no new features, no AEO sweep (sweep-pause does not apply).

---

## 1. Context & scope correction (verified against code, not memory)

The 2-day-old memory described step 4 as *"severity pattern (G4) + chain-grid (G2, wire real `?host=`)"*. Verified against current code:

- **G2 (chain-grid + `?host=` carry) is ALREADY DONE.** `src/components/SeoContent.astro` renders a 2-column related-tools chip grid (name + description) on every tool page (23/30 pages pass `relatedToolIds`), auto-pads to 6 cross-links, and carries `?host=`/`?domain=`/`?url=` across links via a lazy per-link rewrite script (CW-PT-04, 2026-05-02). The orphaned `RelatedTools.astro` the memory referenced is a *different*, docs-only component. → **G2 is out of scope for step 4.**
- **Severity tokens ALREADY EXIST** (added in step 1, `src/styles/global.css:66-71`): `--color-ok/warn/bad/info` each with `-dim` and `-edge` variants. The token comment reads *"drives tool-result severity (LED + badge)"* — the visual direction was pre-encoded.
- **Components do NOT yet use them consistently.** Each verdict component renders its own ad-hoc severity (e.g. `DnssecCheck.svelte` uses `border-left: 3px solid {overallColor}` with a custom `overallColor()` mapping to `--color-green/red/yellow`). ~21 components use legacy ad-hoc colors.
- **Latent bug:** `--color-yellow` does NOT exist as a token (0 definitions) but is referenced as `var(--color-yellow, #eab308)` in DnssecCheck/PasswordStrength → falls back to a hardcoded amber outside the warm-dark palette.

**Net:** Step 4 = **G4 only** — one shared severity pattern applied consistently across the verdict components, plus a color-token sweep.

---

## 2. The pattern — 2-level system over one primitive

A single `LED + badge` primitive, used at two levels:

- **Level 1 (default):** badge (LED dot + icon `✓ / ! / ✕` + label) in the result header, a subtle 3px severity-tinted left accent bar on the result card, and a LED per check-row. Calm, dense, scannable. The common case for ~90% of results.
- **Level 2 (escalated):** the **same** badge placed inside a tinted banner (`-dim` background, `-edge`/solid left border, icon disc). Reserved for critical findings. Level 2 = "the primitive + tint", not a separate pattern.

The icon inside the badge (`✓`/`!`/`✕`) means status is never conveyed by **color alone** → satisfies WCAG 1.4.1.

### Escalation rule (Rule A — approved)

> **Banner (level 2) = a finding that is (1) a security/privacy RISK to the user AND (2) actionable.**
> A plain negative *answer* (site down, slow, no IPv6, expired JWT) stays a **level-1 red badge** — it is the answer the user asked for, not an alarm.

Only **5 tools** can escalate to a banner; everything else stays level 1:

| Tool | State that escalates to banner | Why |
|---|---|---|
| `ssl-checker` | expired / invalid cert | browsing there is unsafe |
| `dnssec-check` | `bogus` **only** | active-attack indicator; `insecure` (unsigned) is normal → badge |
| `webrtc-leak-test` | leak detected | VPN is not protecting the user |
| `email-auth` | no SPF + no DMARC (spoofable) | the domain can be impersonated |
| `http-headers` | poor posture (critical security headers missing) | attack surface |

---

## 3. Architecture — small, testable units

Results render in Svelte (`client:only`), so the primitive is Svelte + a pure TS helper.

| New file | Responsibility | API |
|---|---|---|
| `src/lib/severity.ts` | `type Level = 'ok' \| 'warn' \| 'bad' \| 'info'` + **presentation only**: color token, icon glyph, base aria-label. Pure functions → unit-testable. | `levelToken(level)`, `levelIcon(level)`, `levelAria(level, lang)` |
| `src/components/ui/StatusBadge.svelte` | The primitive: LED dot + icon + label. | props: `level: Level`, `label: string`, `size?: 'md' \| 'sm'` (default `md`), `dotOnly?: boolean` |
| `src/components/ui/VerdictBanner.svelte` | Level-2 banner: icon disc + title + explanation + a `<slot>` for the badge. | props: `level: Level`, `title: string`, `explanation: string` |

**Responsibility split:** the helper provides **presentation** (which color/icon a level maps to); each tool maps its own **domain states → `{ level, escalate }`** locally. Domain logic stays where it lives (e.g. `DnssecCheck` keeps deciding what `bogus` is; `severity.ts` only says "bogus paints red with ✕"). This avoids a central god-mapping that would need to know every tool's semantics.

**Reuse:** `StatusBadge` appears in the header (full label), per-row (`dotOnly` / `size='sm'`), and inside `VerdictBanner`. One primitive, three placements.

**Rejected alternatives:**
- *Mega `ToolResult.svelte`* (takes verdict + rows, renders everything): rejected — tool bodies vary wildly (tables, lists, meters); a single layout would fight them.
- *CSS-only utility classes* (no components): rejected — loses the prop API, repeats markup across 14 components, harder to keep consistent and test.

---

## 4. Token policy

- Severity uses the **semantic tokens** `--color-ok/warn/bad/info` (+ `-dim`/`-edge`), **not** the legacy aliases.
- **Kill** `var(--color-yellow, #eab308)` → `--color-warn`.
- Migrate *severity* uses of ad-hoc `--color-green/red/amber` → semantic tokens. Decorative non-severity uses (syntax highlighting in `jwt-decoder` / `ip-converter`) keep their `--color-green/blue/...` aliases.

---

## 5. Rollout scope

**14 verdict components** adopt `StatusBadge` (the 5 critical ones from §2 additionally use `VerdictBanner`):

`privacy-check`, `ipv6-check`, `port-scan`, `dnssec-check`, `ssl-checker`, `http-headers`, `redirect-checker`, `is-it-up`, `is-it-down`, `site-speed`, `password-strength`, `email-auth`, `webrtc-leak-test`, `resolver-compare`.

> `resolver-compare` is borderline (consistency verdict: agree=ok / diverge=warn). If no clean ok/warn state emerges in implementation, the implementer may downgrade it to informational — note it in the plan, don't force a verdict.

**9 informational components** — color-token cleanup **only, no severity badge** (Decision 3 / honest-ceiling principle: don't fabricate an "OK ✓" where there is no judgment):

`my-ip`, `dns-lookup`, `reverse-dns`, `whois-lookup`, `caa-lookup`, `ip-converter`, `subnet-calculator`, `url-parser`, `jwt-decoder`.

> `jwt-decoder` shows `exp`/signature state, but that is a **token attribute**, not a user-risk verdict — it stays informational (a future neutral `info` chip is possible but deferred).

**i18n:** components already receive a `lang` prop and pull labels from `src/i18n/components` — there are **no separate ES components**, so one change covers EN + ES. Primitives take the label as a prop and never hardcode display text. `severity.ts` aria-helper takes `lang`.

**Build order (for the plan):**
1. `severity.ts` + `StatusBadge.svelte` + `VerdictBanner.svelte` + their unit tests.
2. The 5 escalation tools (highest value, exercise both levels).
3. Remaining verdict tools.
4. Token sweep on the 9 informational components + kill `--color-yellow`.

---

## 6. Out of scope (explicit)

- **G2 chain-grid / `?host=` carry** — already implemented in `SeoContent.astro`. No new inline chain CTA in this step (would be a separate enhancement).
- **No new verdicts/judgments** — severity is a **visual** layer over states each tool already computes.
- **No stage-3 features** (live-readout hero, `net/ping`, A-F grade badges, Cmd+K overlay, CF geo-redirect).

---

## 7. Testing & gates

- `severity.ts` and both primitives get **new unit tests**. The **226-vitest baseline stays green at every commit**; 0 slate-residual.
- Merge gates (step 5, unchanged): Lighthouse median-of-3 vs baseline, W3C Nu validator, a11y re-audit (2px focus-visible, 44px targets, AA contrast of the severity tokens against `--color-surface`/`--color-bg`), prod-parity via `wrangler pages dev dist/`, 3-agent review gate, then merge to master + deploy.

---

## 8. Open questions

None blocking. One implementer-discretion note: `resolver-compare` classification (§5).
