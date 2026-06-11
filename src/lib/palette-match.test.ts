import { describe, it, expect } from 'vitest';
import { normalize, scoreMatch, matchTool } from './palette-match';

describe('normalize', () => {
  it('lowercases and strips diacritics', () => {
    expect(normalize('Resolución DNS')).toBe('resolucion dns');
    expect(normalize('Huella Canvas')).toBe('huella canvas');
  });
});

describe('scoreMatch tiers', () => {
  it('empty query is the match-all sentinel (0)', () => {
    expect(scoreMatch('', 'anything')).toBe(0);
    expect(scoreMatch('   ', 'anything')).toBe(0);
  });
  it('exact prefix -> 4', () => {
    expect(scoreMatch('dns look', 'DNS Lookup')).toBe(4);
  });
  it('word-boundary prefix -> 3', () => {
    expect(scoreMatch('look', 'DNS Lookup')).toBe(3);
  });
  it('substring -> 2', () => {
    expect(scoreMatch('ooku', 'DNS Lookup')).toBe(2);
  });
  it('in-order subsequence -> 1', () => {
    expect(scoreMatch('dlp', 'DNS Lookup')).toBe(1); // d..l..p in order
  });
  it('no match -> null', () => {
    expect(scoreMatch('xyz', 'DNS Lookup')).toBeNull();
  });
  it('diacritic-insensitive both ways', () => {
    expect(scoreMatch('resolucion', 'Resolución de Pantalla')).toBe(4);
    expect(scoreMatch('huella', 'Huella Canvas')).toBe(4);
  });
  it('case-insensitive', () => {
    expect(scoreMatch('SSL', 'ssl checker')).toBe(4);
  });
});

describe('matchTool', () => {
  it('returns the best score across fields', () => {
    expect(matchTool('jwt', ['Decodificador JWT', 'jwt decoder', 'token'])).toBe(4);
  });
  it('returns null when no field matches', () => {
    expect(matchTool('zzz9', ['DNS Lookup', 'dns', 'network'])).toBeNull();
  });
  it('empty query matches everything with 0', () => {
    expect(matchTool('', ['DNS Lookup'])).toBe(0);
  });
});
