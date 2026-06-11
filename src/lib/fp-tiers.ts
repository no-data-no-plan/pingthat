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
