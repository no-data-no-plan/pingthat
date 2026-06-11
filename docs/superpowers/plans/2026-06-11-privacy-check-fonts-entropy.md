# privacy-check fonts + identifiability tiers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add font detection + an honest per-signal "identifiability" tier axis + a summary VerdictBanner to the existing `privacy-check` tool (EN+ES), per the approved spec `docs/superpowers/specs/2026-06-11-privacy-check-fonts-entropy-design.md`.

**Architecture:** Two new PURE libs (`fp-tiers.ts` tier rubric + summary; `font-detect.ts` width-measurement detection with injectable measurer), consumed by a reworked `PrivacyCheck.svelte` (stable `key` per signal replaces fragile label string-comparison). No network, no new page, no sitemap change.

**Tech Stack:** Astro 6 + Svelte 5 runes, vitest, Playwright (+ axe-core for the gate). Branch: `stage3/privacy-fp` (already created, spec committed `f48d163`).

**Verified figures (do NOT alter — fact-checked against the papers 2026-06-11):** Laperdrix 2016 Appendix A normalized entropy: fonts 0.497, canvas 0.491, language 0.351, screen 0.290, webgl-renderer 0.202, timezone 0.198, platform 0.137, dnt 0.056, cookies 0.015. Eckersley 2010 Table 2: fonts 13.9 bits (full list). AmIUnique N=118,934.

---

### Task 1: `src/lib/fp-tiers.ts` — tier rubric + summary (TDD)

**Files:**
- Create: `src/lib/fp-tiers.ts`
- Test: `src/lib/fp-tiers.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/fp-tiers.test.ts
import { describe, it, expect } from 'vitest';
import { TIERS, NORMALIZED, summarizeIdentifiability, type SignalKey } from './fp-tiers';

const ALL_KEYS: SignalKey[] = [
  'dnt', 'cookies', 'webrtc', 'canvas', 'audio', 'webgl', 'timezone',
  'screen', 'language', 'cores', 'memory', 'touch', 'platform', 'fonts',
];

describe('TIERS mapping', () => {
  it('every signal except webrtc has a tier; webrtc has none (leak check, not entropy)', () => {
    for (const k of ALL_KEYS.filter((k) => k !== 'webrtc')) {
      expect(TIERS[k], `TIERS missing "${k}"`).toBeDefined();
    }
    expect(TIERS.webrtc).toBeUndefined();
  });

  it('high tier is exactly {fonts, canvas} (per verified Laperdrix 2016 data)', () => {
    const high = ALL_KEYS.filter((k) => TIERS[k] === 'high').sort();
    expect(high).toEqual(['canvas', 'fonts']);
  });

  it('tier matches the published-entropy rubric (>=0.4 high, 0.1-0.4 medium, <0.1 low)', () => {
    for (const [key, norm] of Object.entries(NORMALIZED) as [SignalKey, number][]) {
      const expected = norm >= 0.4 ? 'high' : norm >= 0.1 ? 'medium' : 'low';
      expect(TIERS[key], `rubric mismatch for "${key}" (norm ${norm})`).toBe(expected);
    }
  });

  it('signals without published estimate (audio/cores/memory/touch) are low and have no NORMALIZED entry', () => {
    for (const k of ['audio', 'cores', 'memory', 'touch'] as SignalKey[]) {
      expect(TIERS[k]).toBe('low');
      expect(NORMALIZED[k]).toBeUndefined();
    }
  });
});

describe('summarizeIdentifiability', () => {
  it('empty -> 0 high, level ok', () => {
    expect(summarizeIdentifiability([])).toEqual({ highExposed: 0, level: 'ok' });
  });

  it('counts only high-tier AND exposed', () => {
    const r = summarizeIdentifiability([
      { key: 'fonts', status: 'exposed' },   // high + exposed -> counts
      { key: 'canvas', status: 'note' },     // high + note -> no
      { key: 'screen', status: 'exposed' },  // medium -> no
      { key: 'webrtc', status: 'exposed' },  // no tier -> no
    ]);
    expect(r).toEqual({ highExposed: 1, level: 'warn' });
  });

  it('two high exposed -> 2, warn', () => {
    const r = summarizeIdentifiability([
      { key: 'fonts', status: 'exposed' },
      { key: 'canvas', status: 'exposed' },
    ]);
    expect(r).toEqual({ highExposed: 2, level: 'warn' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/fp-tiers.test.ts`
Expected: FAIL — `Cannot find module './fp-tiers'`

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/fp-tiers.ts
// Qualitative identifiability tiers for privacy-check signals — derived from
// published population studies, NOT from any PingThat dataset (we have none;
// claiming "1 in X" would be fabrication — see the 2026-06-11 spec).
//
// Rubric on normalized Shannon entropy (Laperdrix et al. 2016, IEEE S&P,
// "Beauty and the Beast", Appendix A, "All" column, N=118,934):
//   high >= 0.4 · medium 0.1-0.4 · low < 0.1
// Signals we check only as availability/few-valued (audio, cores, memory,
// touch) have no comparable published estimate -> 'low', tooltip says so.
import type { Level } from './severity';

export type IdentTier = 'high' | 'medium' | 'low';

export type SignalKey =
  | 'dnt' | 'cookies' | 'webrtc' | 'canvas' | 'audio' | 'webgl'
  | 'timezone' | 'screen' | 'language' | 'cores' | 'memory'
  | 'touch' | 'platform' | 'fonts';

/** Normalized entropy where a published per-attribute estimate exists. */
export const NORMALIZED: Partial<Record<SignalKey, number>> = {
  fonts: 0.497,    // also 13.9 bits full-list (Eckersley 2010, Table 2)
  canvas: 0.491,
  language: 0.351, // content language
  screen: 0.290,
  webgl: 0.202,    // renderer
  timezone: 0.198,
  platform: 0.137,
  dnt: 0.056,
  cookies: 0.015,
};

export const TIERS: Partial<Record<SignalKey, IdentTier>> = {
  fonts: 'high',
  canvas: 'high',
  language: 'medium',
  screen: 'medium',
  webgl: 'medium',
  timezone: 'medium',
  platform: 'medium',
  dnt: 'low',
  cookies: 'low',
  audio: 'low',
  cores: 'low',
  memory: 'low',
  touch: 'low',
  // webrtc intentionally absent — leak check, not an entropy signal
};

export interface IdentSummary { highExposed: number; level: Level; }

export function summarizeIdentifiability(
  items: ReadonlyArray<{ key: SignalKey; status: 'safe' | 'exposed' | 'note' }>,
): IdentSummary {
  const highExposed = items.filter(
    (i) => TIERS[i.key] === 'high' && i.status === 'exposed',
  ).length;
  return { highExposed, level: highExposed > 0 ? 'warn' : 'ok' };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/fp-tiers.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/fp-tiers.ts src/lib/fp-tiers.test.ts
git commit -m "feat(privacy-check): identifiability tier rubric from published entropy data"
```

---

### Task 2: `src/lib/font-detect.ts` — width-measurement font detection (TDD)

**Files:**
- Create: `src/lib/font-detect.ts`
- Test: `src/lib/font-detect.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/font-detect.test.ts
import { describe, it, expect } from 'vitest';
import { FONT_CANDIDATES, detectFonts, type MeasureFn } from './font-detect';

describe('FONT_CANDIDATES', () => {
  it('has 100-150 curated fonts', () => {
    expect(FONT_CANDIDATES.length).toBeGreaterThanOrEqual(100);
    expect(FONT_CANDIDATES.length).toBeLessThanOrEqual(150);
  });

  it('has no duplicates', () => {
    expect(new Set(FONT_CANDIDATES).size).toBe(FONT_CANDIDATES.length);
  });

  it('every entry is a non-empty trimmed string without quotes', () => {
    for (const f of FONT_CANDIDATES) {
      expect(f.length).toBeGreaterThan(0);
      expect(f).toBe(f.trim());
      expect(f).not.toMatch(/["']/);
    }
  });
});

describe('detectFonts', () => {
  // Fake measurer: every font stack measures 100 except the stacks we mark.
  const fake = (widths: Record<string, number>): MeasureFn =>
    (stack: string) => widths[stack] ?? 100;

  it('detects a candidate when ANY baseline width differs', () => {
    // "Arial" differs only against serif -> still detected
    const measure = fake({ ['"Arial", serif']: 142 });
    const { detected, tested } = detectFonts(measure);
    expect(detected).toEqual(['Arial']);
    expect(tested).toBe(FONT_CANDIDATES.length);
  });

  it('detects nothing when every stack measures the same', () => {
    const { detected, tested } = detectFonts(fake({}));
    expect(detected).toEqual([]);
    expect(tested).toBe(FONT_CANDIDATES.length);
  });

  it('preserves FONT_CANDIDATES order in results', () => {
    const measure = fake({
      ['"Verdana", monospace']: 130,
      ['"Arial", monospace']: 120,
    });
    const { detected } = detectFonts(measure);
    expect(detected).toEqual(['Arial', 'Verdana']); // Arial comes first in the list
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/font-detect.test.ts`
Expected: FAIL — `Cannot find module './font-detect'`

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/font-detect.ts
// Font detection by width measurement: render a test string with
// `"<candidate>", <generic>` and compare against the generic family alone.
// If the width differs for ANY of the three generic baselines, the candidate
// is installed. No permissions, works in every browser (queryLocalFonts was
// rejected in the spec: permission prompt + Chromium-only).
//
// The measurer is injected so the logic is unit-testable; the only DOM-bound
// piece is createCanvasMeasure().

export type MeasureFn = (fontStack: string) => number;

const TEST_STRING = 'mmmMMMwwlfi10O';
const TEST_SIZE = '72px';
const BASELINES = ['monospace', 'sans-serif', 'serif'] as const;

// ~120 curated candidates: Windows core, macOS, Linux, office/classic,
// developer fonts (the last group is the most identifying in practice).
export const FONT_CANDIDATES: readonly string[] = [
  // Windows
  'Arial', 'Arial Black', 'Arial Narrow', 'Bahnschrift', 'Calibri', 'Cambria',
  'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New',
  'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'Impact',
  'Ink Free', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic',
  'Microsoft YaHei', 'MS Gothic', 'MV Boli', 'Nirmala UI', 'Palatino Linotype',
  'Segoe Print', 'Segoe Script', 'Segoe UI', 'SimSun', 'Sylfaen', 'Tahoma',
  'Times New Roman', 'Trebuchet MS', 'Verdana', 'Yu Gothic',
  // macOS
  'American Typewriter', 'Andale Mono', 'Apple Chancery', 'Avenir',
  'Avenir Next', 'Baskerville', 'Big Caslon', 'Bradley Hand', 'Brush Script MT',
  'Chalkboard SE', 'Charter', 'Cochin', 'Copperplate', 'Courier', 'Didot',
  'Futura', 'Geneva', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Hoefler Text',
  'Lucida Grande', 'Marker Felt', 'Menlo', 'Monaco', 'Noteworthy', 'Optima',
  'Palatino', 'Papyrus', 'Rockwell', 'Snell Roundhand', 'Times', 'Zapfino',
  // Linux
  'Bitstream Vera Sans', 'Cantarell', 'DejaVu Sans', 'DejaVu Sans Mono',
  'DejaVu Serif', 'Droid Sans', 'FreeMono', 'FreeSans', 'FreeSerif',
  'Liberation Mono', 'Liberation Sans', 'Liberation Serif', 'Nimbus Roman',
  'Nimbus Sans', 'Noto Sans', 'Noto Serif', 'Ubuntu', 'Ubuntu Mono',
  // Office / classic
  'Book Antiqua', 'Bookman Old Style', 'Century', 'Century Gothic', 'Garamond',
  'Goudy Old Style', 'Haettenschweiler', 'Lucida Bright', 'Lucida Handwriting',
  'Mistral', 'Monotype Corsiva', 'MS Reference Sans Serif', 'Perpetua',
  'Segoe UI Symbol',
  // Developer
  'Cascadia Code', 'Cascadia Mono', 'Fira Code', 'Fira Mono', 'Fira Sans',
  'Hack', 'Inconsolata', 'Iosevka', 'JetBrains Mono', 'Roboto',
  'Roboto Condensed', 'Roboto Mono', 'SF Mono', 'SF Pro Display', 'SF Pro Text',
  'Source Code Pro', 'Source Sans Pro', 'Victor Mono',
];

export interface FontDetectResult { detected: string[]; tested: number; }

export function detectFonts(measure: MeasureFn): FontDetectResult {
  const base: Record<string, number> = {};
  for (const b of BASELINES) base[b] = measure(b);
  const detected: string[] = [];
  for (const candidate of FONT_CANDIDATES) {
    for (const b of BASELINES) {
      if (measure(`"${candidate}", ${b}`) !== base[b]) {
        detected.push(candidate);
        break;
      }
    }
  }
  return { detected, tested: FONT_CANDIDATES.length };
}

/** DOM-bound measurer factory. Returns null when canvas 2D is unavailable. */
export function createCanvasMeasure(): MeasureFn | null {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return (fontStack: string) => {
      ctx.font = `${TEST_SIZE} ${fontStack}`;
      return ctx.measureText(TEST_STRING).width;
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/font-detect.test.ts`
Expected: PASS (6 tests). If the 100-150 count assertion fails, count the list — it should be 120.

- [ ] **Step 5: Commit**

```bash
git add src/lib/font-detect.ts src/lib/font-detect.test.ts
git commit -m "feat(privacy-check): width-measurement font detection lib (~120 curated candidates)"
```

---

### Task 3: i18n additions (EN + ES)

**Files:**
- Modify: `src/i18n/components.ts` (privacyCheckI18n: en block ends ~line 361, es block ends ~line 401)

`src/lib/i18n.test.ts` enforces EN/ES key parity automatically — add ALL keys to BOTH languages.

- [ ] **Step 1: Add the EN keys** — inside `privacyCheckI18n.en`, after `unknown: "Unknown",`:

```ts
    // Fonts signal (stage-3 #3)
    fontsDetected: "Fonts Detected",
    fontsOf: "of",
    fontsChecked: "checked",
    showAllFonts: "Show all",
    hideAllFonts: "Hide list",
    fontsTip: "Sites can probe installed fonts by measuring text widths. The full system font list is one of the strongest fingerprinting signals: 13.9 bits of entropy (EFF Panopticlick, 2010) and 0.497 normalized entropy (AmIUnique, 2016). Those are published estimates for the full list — this tool width-tests a ~120-font subset, and nothing is measured about you personally.",
    // Identifiability tier chip + tooltips
    identifies: "Identifies",
    tierHigh: "High",
    tierMedium: "Medium",
    tierLow: "Low",
    tierTipNorm: "Published population estimate: {norm} normalized entropy out of 1.0 (AmIUnique dataset, 118,934 fingerprints — Laperdrix et al., IEEE S&P 2016). It rates this signal class in general, not you specifically.",
    tierTipNone: "No comparable published estimate for this check — it exposes only a few possible values, so its identifying power is low.",
    // Summary banner
    bannerNone: "No high-identifiability signals exposed",
    bannerHighOne: "Your browser exposes 1 high-identifiability signal",
    bannerHighMany: "Your browser exposes {n} high-identifiability signals",
    bannerExp: "The more distinctive signals your browser exposes, the easier it is to recognize across visits — even without cookies. Tiers are based on published estimates (EFF 2010, AmIUnique 2016), not on a measurement of you.",
```

- [ ] **Step 2: Add the ES keys** — inside `privacyCheckI18n.es`, after `unknown: "Desconocido",`:

```ts
    // Fonts signal (stage-3 #3)
    fontsDetected: "Fuentes Detectadas",
    fontsOf: "de",
    fontsChecked: "comprobadas",
    showAllFonts: "Ver todas",
    hideAllFonts: "Ocultar lista",
    fontsTip: "Los sitios pueden sondear las fuentes instaladas midiendo anchos de texto. La lista completa de fuentes del sistema es una de las señales de fingerprinting más potentes: 13.9 bits de entropía (EFF Panopticlick, 2010) y 0.497 de entropía normalizada (AmIUnique, 2016). Son estimaciones publicadas sobre la lista completa — esta herramienta comprueba por medición un subconjunto de ~120 fuentes, y no se mide nada sobre ti personalmente.",
    // Identifiability tier chip + tooltips
    identifies: "Identifica",
    tierHigh: "Alta",
    tierMedium: "Media",
    tierLow: "Baja",
    tierTipNorm: "Estimación poblacional publicada: {norm} de entropía normalizada sobre 1.0 (dataset AmIUnique, 118.934 huellas — Laperdrix et al., IEEE S&P 2016). Clasifica esta señal en general, no a ti en concreto.",
    tierTipNone: "No hay una estimación publicada comparable para esta comprobación — expone pocos valores posibles, así que su capacidad identificadora es baja.",
    // Summary banner
    bannerNone: "Sin señales de alta capacidad identificadora expuestas",
    bannerHighOne: "Tu navegador expone 1 señal de alta capacidad identificadora",
    bannerHighMany: "Tu navegador expone {n} señales de alta capacidad identificadora",
    bannerExp: "Cuantas más señales distintivas expone tu navegador, más fácil es reconocerlo entre visitas — incluso sin cookies. Los niveles se basan en estimaciones publicadas (EFF 2010, AmIUnique 2016), no en una medición sobre ti.",
```

- [ ] **Step 3: Verify parity + suite**

Run: `npx vitest run src/lib/i18n.test.ts`
Expected: PASS (the EN/ES key-parity assertions cover the new keys)

- [ ] **Step 4: Commit**

```bash
git add src/i18n/components.ts
git commit -m "feat(privacy-check): i18n for fonts signal, tier chips and summary banner (EN+ES)"
```

---

### Task 4: rework `src/components/PrivacyCheck.svelte`

**Files:**
- Modify: `src/components/PrivacyCheck.svelte` (265 lines today; read it fully first)

Changes: stable `key` on CheckItem (kills the label string-comparison anti-pattern), fonts signal, footer tier chips with InfoTip, VerdictBanner, expandable fonts list, enriched copyReport.

- [ ] **Step 1: Update the script section**

Replace the imports + CheckItem + getStatus region (top of `<script>` through the end of the current `getStatus`) so it reads:

```ts
import { onMount } from "svelte";
import InfoTip from './InfoTip.svelte';
import StatusBadge from './ui/StatusBadge.svelte';
import VerdictBanner from './ui/VerdictBanner.svelte';
import type { Lang } from '../i18n/index';
import type { Level } from '../lib/severity';
import { getPrivacyCheck } from '../i18n/components';
import { getCommon } from '../i18n/common';
import { copyAndNotify } from '../lib/notify';
import { useToolComplete } from "../lib/tool-complete.svelte";
import { TIERS, NORMALIZED, summarizeIdentifiability, type SignalKey, type IdentTier } from '../lib/fp-tiers';
import { detectFonts, createCanvasMeasure } from '../lib/font-detect';

interface Props { lang?: Lang; }
let { lang = "en" }: Props = $props();
const c = $derived(getCommon(lang as 'en' | 'es'));
const t = $derived(getPrivacyCheck(lang));

type CheckStatus = "safe" | "exposed" | "note";

interface CheckItem {
  key: SignalKey;
  label: string;
  value: string;
  status: CheckStatus;
}

let checks = $state<CheckItem[]>([]);
let loading = $state(true);
let copied = $state(false);
let fontsDetected = $state<string[]>([]);
let fontsOpen = $state(false);

function itemLevel(status: CheckItem['status']): Level {
  if (status === 'safe') return 'ok';
  if (status === 'exposed') return 'warn';
  return 'info';
}

const overallLevel = $derived.by<Level>(() => {
  if (checks.some(c => c.status === 'exposed')) return 'warn';
  if (checks.some(c => c.status === 'note')) return 'info';
  return 'ok';
});

const ident = $derived(summarizeIdentifiability(checks));
const bannerTitle = $derived(
  ident.highExposed === 0 ? t.bannerNone
  : ident.highExposed === 1 ? t.bannerHighOne
  : t.bannerHighMany.replace('{n}', String(ident.highExposed)));

const tierWord = $derived<Record<IdentTier, string>>({
  high: t.tierHigh, medium: t.tierMedium, low: t.tierLow,
});
const TIER_DOT: Record<IdentTier, string> = {
  high: 'var(--color-warn)', medium: 'var(--color-info)', low: 'var(--color-ok)',
};
function tierTip(key: SignalKey): string {
  const norm = NORMALIZED[key];
  return norm !== undefined
    ? t.tierTipNorm.replace('{norm}', norm.toFixed(3))
    : t.tierTipNone;
}

function getStatus(key: SignalKey, value: string): CheckStatus {
  const lower = value.toLowerCase();
  switch (key) {
    case 'dnt': return lower === t.enabled.toLowerCase() ? "safe" : "note";
    case 'cookies': return lower === t.yes.toLowerCase() ? "note" : "safe";
    case 'webrtc': return lower.includes(t.noLeakDetected.toLowerCase()) ? "safe" : "exposed";
    case 'canvas': return "exposed";
    case 'audio': return lower === t.notSupported.toLowerCase() ? "safe" : "exposed";
    case 'webgl': return lower === t.notAvailable.toLowerCase() ? "safe" : "exposed";
    case 'memory': return lower === t.notAvailable.toLowerCase() ? "safe" : "exposed";
    default: return "note";
  }
}
```

(`checkWebRTC`, `getCanvasFingerprint`, `getAudioFingerprint`, `getWebGLVendor` stay exactly as they are.)

- [ ] **Step 2: Rewrite `onMount` with keys + the fonts signal**

```ts
onMount(async () => {
  const items: CheckItem[] = [];

  const dnt = navigator.doNotTrack === "1" ? t.enabled : t.disabled;
  items.push({ key: 'dnt', label: t.doNotTrack, value: dnt, status: getStatus('dnt', dnt) });

  const cookies = navigator.cookieEnabled ? t.yes : t.no;
  items.push({ key: 'cookies', label: t.cookiesEnabled, value: cookies, status: getStatus('cookies', cookies) });

  const webrtc = await checkWebRTC();
  items.push({ key: 'webrtc', label: t.webrtcLeak, value: webrtc, status: getStatus('webrtc', webrtc) });

  const canvas = getCanvasFingerprint();
  items.push({ key: 'canvas', label: t.canvasFingerprint, value: canvas, status: getStatus('canvas', canvas) });

  const measure = createCanvasMeasure();
  if (measure) {
    const { detected, tested } = detectFonts(measure);
    fontsDetected = detected;
    items.push({
      key: 'fonts',
      label: t.fontsDetected,
      value: `${detected.length} ${t.fontsOf} ${tested} ${t.fontsChecked}`,
      status: detected.length > 0 ? 'exposed' : 'note',
    });
  } else {
    items.push({ key: 'fonts', label: t.fontsDetected, value: t.notAvailable, status: 'note' });
  }

  const audio = getAudioFingerprint();
  items.push({ key: 'audio', label: t.audioFingerprint, value: audio, status: getStatus('audio', audio) });

  const webgl = getWebGLVendor();
  items.push({ key: 'webgl', label: t.webglVendor, value: webgl, status: getStatus('webgl', webgl) });

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  items.push({ key: 'timezone', label: t.timezone, value: tz, status: "note" });

  const screen = `${window.screen.width} x ${window.screen.height}`;
  items.push({ key: 'screen', label: t.screenResolution, value: screen, status: "note" });

  items.push({ key: 'language', label: t.language, value: navigator.language || t.unknown, status: "note" });

  const cores = navigator.hardwareConcurrency?.toString() || t.unknown;
  items.push({ key: 'cores', label: t.hardwareConcurrency, value: `${cores} ${t.cores}`, status: getStatus('cores', cores) });

  const mem = (navigator as any).deviceMemory;
  const memStr = mem ? `${mem} GB` : t.notAvailable;
  items.push({ key: 'memory', label: t.deviceMemory, value: memStr, status: getStatus('memory', memStr) });

  const touch = navigator.maxTouchPoints;
  items.push({ key: 'touch', label: t.touchSupport, value: touch > 0 ? `${t.yes} (${touch} ${t.points})` : t.no, status: "note" });

  items.push({ key: 'platform', label: t.platform, value: navigator.platform || t.unknown, status: "note" });

  checks = items;
  loading = false;
});
```

- [ ] **Step 3: Enrich `copyReport`**

```ts
async function copyReport() {
  const text = checks.map((c) => {
    const tier = TIERS[c.key];
    const tag = tier ? ` {${t.identifies.toUpperCase()}: ${tierWord[tier].toUpperCase()}}` : '';
    return `${c.label}: ${c.value} [${c.status.toUpperCase()}]${tag}`;
  }).join("\n");
  if (await copyAndNotify(`${t.clipboardTitle}\n${bannerTitle}\n${"=".repeat(40)}\n${text}`, c.copied, c.copyFailed)) {
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
}
```

- [ ] **Step 4: Update the markup**

(a) Insert the VerdictBanner directly AFTER the header card `</div>` (the one with `card sev-accent is-{overallLevel}`) and BEFORE the explanatory-note card:

```svelte
<VerdictBanner level={ident.level} title={bannerTitle} explanation={t.bannerExp} />
```

(b) In the per-card markup: switch the InfoTip conditions from label comparison to key comparison, and add the fonts label tip:

```svelte
{#if check.key === 'canvas'}<InfoTip text={t.canvasTip} {lang} />{/if}
{#if check.key === 'fonts'}<InfoTip text={t.fontsTip} {lang} />{/if}
{#if check.key === 'webrtc'}<InfoTip text={t.webrtcTip} {lang} />{/if}
{#if check.key === 'dnt'}<InfoTip text={t.dntTip} {lang} />{/if}
```

(c) After the value `<div>` inside each card body, add the fonts disclosure + the tier footer row:

```svelte
{#if check.key === 'fonts' && fontsDetected.length > 0}
  <button
    class="btn-secondary"
    style="margin-top: 8px; font-size: 11px;"
    aria-expanded={fontsOpen}
    onclick={() => (fontsOpen = !fontsOpen)}
  >
    {fontsOpen ? t.hideAllFonts : `${t.showAllFonts} (${fontsDetected.length})`}
  </button>
  {#if fontsOpen}
    <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 8px; line-height: 1.7; word-break: break-word;">
      {fontsDetected.join(' · ')}
    </div>
  {/if}
{/if}
{#if TIERS[check.key]}
  {@const tier = TIERS[check.key]!}
  <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--color-border); display: flex; align-items: center; gap: 6px;">
    <span style="font-size: 10px; color: var(--color-text-muted); border: 1px solid var(--color-border2); border-radius: 999px; padding: 2px 8px;">
      <span style="color: {TIER_DOT[tier]};" aria-hidden="true">●</span>
      {t.identifies}: {tierWord[tier]}
    </span>
    <InfoTip text={tierTip(check.key)} {lang} />
  </div>
{/if}
```

- [ ] **Step 5: Verify it builds + full suite**

Run: `npx vitest run && npm run build`
Expected: all tests PASS, build green (no TS/Svelte errors)

- [ ] **Step 6: Commit**

```bash
git add src/components/PrivacyCheck.svelte
git commit -m "feat(privacy-check): fonts signal, identifiability tier chips and honest summary banner"
```

---

### Task 5: sources + FAQ + keywords

**Files:**
- Modify: `src/data/sources.ts` (privacy-check array, line ~124)
- Modify: `src/i18n/pages.ts` (privacy-check faqs, EN ~line 102 + the matching ES block)
- Modify: `src/lib/tools.ts` (privacy-check keywords, line ~34)

- [ ] **Step 1: Add Laperdrix 2016 to sources.ts** — append to the `"privacy-check"` array:

```ts
{ authors: "Laperdrix, P., Rudametkin, W., & Baudry, B.", year: "2016", title: "Beauty and the Beast: Diverting Modern Web Browsers to Build Unique Browser Fingerprints", venue: "IEEE Symposium on Security and Privacy (S&P) 2016, pp. 878–894 — AmIUnique dataset, N = 118,934 fingerprints" },
```

- [ ] **Step 2: Add ONE FAQ to pages.ts privacy-check** — EN faqs array gets:

```ts
{ q: "What does the 'Identifies' tier mean?", a: "A qualitative rating (High / Medium / Low) of how much each signal narrows you down, derived from published population studies — Eckersley's Panopticlick (PETS 2010) and the AmIUnique dataset (IEEE S&P 2016). PingThat keeps no visitor dataset, so unlike EFF's Cover Your Tracks it cannot honestly say you are '1 in X' — the tiers rate the signal class, not you personally." },
```

ES faqs array gets:

```ts
{ q: "¿Qué significa el nivel 'Identifica'?", a: "Una clasificación cualitativa (Alta / Media / Baja) de cuánto te acota cada señal, derivada de estudios poblacionales publicados — el Panopticlick de Eckersley (PETS 2010) y el dataset AmIUnique (IEEE S&P 2016). PingThat no guarda ningún dataset de visitantes, así que a diferencia del Cover Your Tracks de la EFF no puede decir honestamente que eres '1 entre X' — los niveles clasifican la señal en general, no a ti en concreto." },
```

- [ ] **Step 3: Extend tools.ts keywords** — privacy-check keywords become:

```ts
keywords: ["browser privacy check", "privacy test", "tracking protection", "fingerprint test", "font fingerprint", "browser entropy"],
```

- [ ] **Step 4: Verify + commit**

Run: `npx vitest run` (i18n completeness tests re-validate pages/tools coherence)
Expected: PASS

```bash
git add src/data/sources.ts src/i18n/pages.ts src/lib/tools.ts
git commit -m "feat(privacy-check): Laperdrix 2016 source, identifiability FAQ (EN+ES), fingerprint keywords"
```

---

### Task 6: gates — full suite, build, axe sweep

- [ ] **Step 1: Full suite + build**

Run: `npx vitest run && npm run build`
Expected: ALL tests pass (254 pre-existing + ~17 new), build green. If `npm run build` produces a sitemap lastmod diff for privacy-check pages, that is the honest prebuild doing its job — include it in the final commit.

- [ ] **Step 2: axe sweep on the changed pages (EN+ES)**

`astro preview` does not run Pages Functions → no CSP locally → axe injection works.

```bash
npm i -D --no-save axe-core
npx astro preview --port 4321 &
sleep 3
cat > /tmp/axe-privacy.cjs <<'JS'
const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const path of ['/privacy-check/', '/es/privacy-check/']) {
    const p = await b.newPage();
    await p.goto('http://localhost:4321' + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(4000); // WebRTC check can take ~3s before results render
    await p.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const r = await p.evaluate(() => axe.run());
    const serious = r.violations.filter(v => ['serious', 'critical'].includes(v.impact));
    console.log(path, '->', serious.length, 'serious/critical');
    for (const v of serious) { bad++; console.log(' ', v.id, v.impact, v.nodes.length, 'nodes'); }
    await p.close();
  }
  await b.close();
  process.exit(bad ? 1 : 0);
})();
JS
node /tmp/axe-privacy.cjs
```

Expected: `0 serious/critical` on BOTH pages. Stage-2/3 precedent: axe catches real bugs (contrast, nesting) — fix anything it reports before proceeding. Watch the tier-chip muted text and the fonts disclosure button contrast specifically.

Kill the preview afterwards (`kill %1` or pkill -f "astro preview").

- [ ] **Step 3: Commit any fixes**

```bash
git add -A && git commit -m "fix(privacy-check): a11y fixes from axe gate" # only if fixes were needed
```

---

### Task 7: merge + deploy + live verify (main session, NOT a subagent)

- [ ] **Step 1:** `git checkout master && git merge --no-ff stage3/privacy-fp -m "merge: stage-3 #3 privacy-check fonts + identifiability tiers"`
- [ ] **Step 2:** `npm run build` on master (sitemap lastmod honest bump) + commit if diff
- [ ] **Step 3:** `npx wrangler pages deploy dist/ --project-name=pingthat --branch=main --commit-message="stage-3 #3 privacy-check fonts+tiers"`
- [ ] **Step 4:** Live verify on https://pingthat.dev/privacy-check/ + /es/: banner renders with correct count, fonts card counts + expandable list works, tier chips + tooltips, copy report includes tier tags, axe quick pass on PROD, no CSP violations in console (the tool stays 100% client-side).
- [ ] **Step 5:** Delete the branch, update memory (MEMORY.md PT line + topic file).

---

## Self-review (done at write time)

- **Spec coverage:** §1 framing → T3 i18n + T4 chips/banner; §2 data → T1 NORMALIZED/TIERS; §3 UX → T4 markup (footer chip A, fonts disclosure B, VerdictBanner); §4 architecture → T1/T2 libs + T4 component + T5 sources/FAQ/keywords; §5 edge cases → T2 createCanvasMeasure null + T4 fonts note path + axe gate; §6 testing → T1/T2 unit, T6 gates; §7 out-of-scope respected (no new page, no reorder, webrtc untouched).
- **Placeholders:** none — all code complete.
- **Type consistency:** `SignalKey`/`IdentTier`/`NORMALIZED`/`TIERS`/`summarizeIdentifiability` defined in T1, imported with same names in T4; `MeasureFn`/`detectFonts`/`createCanvasMeasure` defined in T2, consumed in T4; i18n keys added in T3 are exactly the ones referenced in T4 (`fontsDetected, fontsOf, fontsChecked, showAllFonts, hideAllFonts, fontsTip, identifies, tierHigh/Medium/Low, tierTipNorm, tierTipNone, bannerNone, bannerHighOne, bannerHighMany, bannerExp`).
