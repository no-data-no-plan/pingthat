import { describe, it, expect } from 'vitest';
import { levelIcon, levelAria, type Level } from './severity';

describe('severity', () => {
  const levels: Level[] = ['ok', 'warn', 'bad', 'info'];

  it('returns a distinct icon glyph per level', () => {
    expect(levelIcon('ok')).toBe('✓');
    expect(levelIcon('warn')).toBe('!');
    expect(levelIcon('bad')).toBe('✕');
    expect(levelIcon('info')).toBe('i');
    expect(new Set(levels.map(levelIcon)).size).toBe(levels.length);
  });

  it('returns a localized aria label per level', () => {
    expect(levelAria('ok', 'en')).toBe('OK');
    expect(levelAria('ok', 'es')).toBe('Correcto');
    expect(levelAria('bad', 'es')).toBe('Problema');
    expect(levelAria('warn', 'es')).toBe('Advertencia');
    expect(levelAria('info', 'es')).toBe('Información');
  });

  it('defaults the aria label to English', () => {
    expect(levelAria('warn')).toBe('Warning');
  });

  it('never returns a color/hex string (presentation = icon + aria only)', () => {
    for (const l of levels) expect(levelIcon(l)).not.toMatch(/#|var\(|rgb/);
  });
});
