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
      { key: 'fonts', status: 'exposed' },
      { key: 'canvas', status: 'note' },
      { key: 'screen', status: 'exposed' },
      { key: 'webrtc', status: 'exposed' },
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
