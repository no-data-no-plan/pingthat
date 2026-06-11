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
  const fake = (widths: Record<string, number>): MeasureFn =>
    (stack: string) => widths[stack] ?? 100;

  it('detects a candidate when ANY baseline width differs', () => {
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
    expect(detected).toEqual(['Arial', 'Verdana']);
  });
});
