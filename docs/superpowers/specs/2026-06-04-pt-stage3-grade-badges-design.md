# PT Stage-3 #1 — A-F grade badges (SSL + Security Headers)

**Date:** 2026-06-04
**Branch:** (new, off master — current HEAD has stage-2 + a11y fixes + glow fix shipped to prod)
**Status:** design approved — ready for implementation plan
**Frame:** Stage-3 feature. Strategic fit = the *shareable artifact* (screenshot-able grade) → backlinks → authority, which is PT's real lever (ranking pos ~85), NOT engagement. Extends the stage-2 severity system.

---

## 1. Scope (approved)

A-F letter grade on **2 tools only**: `ssl-checker` + `http-headers` — the tools with the recognized A-F convention (SSL Labs / SecurityHeaders.com). NOT dnssec (pass/fail/bogus, not a spectrum), NOT email-auth (deferred), NOT password-strength (has its own 0-4 meter). No `A+` — clean A-F.

## 2. Rubrics (approved — honest, computable, no hidden weighting)

**http-headers** — grade = how many of the 6 already-computed recommended headers are present (`securityScore`/`maxScore` from `functions/api/http-headers.ts`; the 6 = hsts, csp, x-frame-options, x-content-type-options, referrer-policy, permissions-policy):

| Present | Grade | Level (color) |
|---|---|---|
| 6/6 | A | ok |
| 5/6 | B | ok |
| 4/6 | C | warn |
| 3/6 | D | bad |
| 0–2/6 | F | bad |

**ssl-checker** — "HTTPS hardening" grade from existing cert facts (`httpsOk`, `activeCertificate.daysRemaining`, `hstsDetails`):

| Condition | Grade | Level |
|---|---|---|
| no HTTPS (`!httpsOk`) / expired (`daysRemaining < 0`) / invalid | F | bad |
| valid HTTPS, cert `daysRemaining ≤ 7` | D | bad |
| valid HTTPS, no HSTS (`!hstsDetails`) | C | warn |
| valid HTTPS + HSTS, but `daysRemaining ≤ 30` | B | ok |
| valid HTTPS + HSTS + `daysRemaining > 30` (or null/long) | A | ok |

> Evaluate F-conditions first, then D, then C/B/A. `daysRemaining === null` (no active cert parsed but httpsOk) → treat as not-expiring for the >30 branch, but if `!httpsOk` it's already F.

**Color mapping:** A/B → `ok`, C → `warn`, D/F → `bad` (reuses stage-2 severity tokens). The **letter** carries the precision within a band (B slightly softer than A via opacity is a visual nicety, optional). Status is never color-only — the letter A-F is the signal.

## 3. The badge (B1, approved visual)

Solid colored square tile (~58-60px, rounded ~11px), big bold letter centered (ink-colored letter on solid `--color-{level}` → high contrast), optional **"N/6" chip** in the top-right corner.
- **http-headers:** chip = `{score}/6`.
- **ssl-checker:** **no chip** (no clean ratio) — the cert detail lives in the subtitle line (e.g. "valid · HSTS · expires in 67 days").
- Always accompanied by: the tool name + domain + a one-line subtitle, and the existing per-item list (http-headers' ✓/✕ header rows; SSL's cert/HSTS cards) — so the grade is never the *only* information (no hidden weighting; the user sees exactly what drove it).

## 4. Architecture (small, testable units)

| File | Responsibility | API |
|---|---|---|
| `src/lib/grade.ts` | PURE rubric helpers → `{ letter: Letter; level: Level }` (`Letter = 'A'|'B'|'C'|'D'|'F'`; `Level` reused from `severity.ts`). Unit-testable. | `gradeFromHeaders(score: number, max: number)`, `gradeFromSsl(result: SslCheckerResult)` |
| `src/components/ui/GradeBadge.svelte` | The B1 tile primitive. Color via CSS class-map `.is-{level}` (CSP-safe, like StatusBadge/VerdictBanner). | props: `letter: Letter`, `level: Level`, `ratio?: string`, `lang?: Lang` |

**Wiring:**
- `HttpHeaders.svelte`: compute `gradeFromHeaders(result.securityScore, result.maxScore)`, render `GradeBadge` (ratio=`${score}/${max}`) at the top of the result.
- `SslChecker.svelte`: compute `gradeFromSsl(result)`, render `GradeBadge` (no ratio) at the top.

**Relationship to the stage-2 StatusBadge / VerdictBanner (these 2 tools only):**
- The `GradeBadge` **replaces** the stage-2 `StatusBadge` as the top-of-result verdict here (it carries strictly more info: letter + ratio + color). Remove the StatusBadge from these 2 result headers.
- The `VerdictBanner` **still escalates** on the F-critical states (SSL expired/invalid/no-HTTPS; http-headers F = very poor posture) — there you see the F tile **and** the banner with the actionable explanation. They are complementary (tile = the grade; banner = the why/what-to-do). For A/B/C/D → tile only, no banner.
- The other 21 tools' stage-2 severity treatment is untouched.

## 5. Honesty (honest-ceiling)

- An info tooltip (existing `InfoTip`) next to the grade + a line on `/methodology` states the limits explicitly:
  - **SSL grade = "HTTPS reachable + valid cert + HSTS", NOT a TLS cipher/protocol audit** (PT does a HEAD + cert check, no full handshake — unlike SSL Labs). Do not imply "A = perfect TLS".
  - **http-headers grade = N of 6 recommended response headers present** (the ✓/✕ list shows which).
- New i18n strings (EN + ES): the subtitle templates + the two tooltip caveats. A-F letters are universal. Follow the ES native-voice plan (terse, technical).

## 6. Out of scope (explicit)

- **No automated OG-image / screenshot generation** — the on-page tile IS the shareable artifact (user screenshots it). Auto-OG-image is a separate v2 feature.
- Only `ssl-checker` + `http-headers`. No `A+`. No grade on other tools.
- No change to the score/cert computation itself (visual + derivation layer only; the underlying `securityScore`/cert data already exist).

## 7. Testing & a11y

- `grade.ts` → **unit tests** for every band + boundary: headers 0/6→F, 2/6→F, 3/6→D, 4/6→C, 5/6→B, 6/6→A; SSL each rubric row incl. boundaries (`daysRemaining` = 7, 30, -1, null; `!httpsOk`; HSTS present/absent). Baseline **230 vitest green**.
- `GradeBadge` → verified via `npm run build` + an **e2e assertion** (extend `e2e/tools.spec.ts` — http-headers isn't pure-client, but the grade *logic* is unit-tested; the badge render can be asserted on a pure-client harness or via the a11y sweep).
- **a11y:** the letter A-F is the non-color signal (WCAG 1.4.1 OK). `aria-label` like "Grade C, 4 of 6 security headers". Contrast: ink letter on solid `--color-{level}` and the chip (`--color-{level}` text on `--color-bg`) must pass AA — verify in the axe sweep (the stage-2 axe harness pattern). Non-interactive tile (no nested-interactive).

## 8. Open questions

None blocking. Minor implementer discretion: the SSL subtitle wording, and whether to keep the B-softer-than-A opacity nicety (cosmetic).
