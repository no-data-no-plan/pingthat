import { describe, it, expect } from 'vitest';
import { gradeFromHeaders, gradeFromSsl, type Letter } from './grade';

describe('gradeFromHeaders (count of 6 recommended headers)', () => {
  const cases: [number, Letter, string][] = [
    [6, 'A', 'ok'], [5, 'B', 'ok'], [4, 'C', 'warn'], [3, 'D', 'bad'], [2, 'F', 'bad'], [1, 'F', 'bad'], [0, 'F', 'bad'],
  ];
  for (const [score, letter, level] of cases) {
    it(`${score}/6 -> ${letter} (${level})`, () => {
      expect(gradeFromHeaders(score, 6)).toEqual({ letter, level });
    });
  }
  it('never returns a score above the band (clamps missing at 0)', () => {
    expect(gradeFromHeaders(7, 6).letter).toBe('A');
  });
});

describe('gradeFromSsl (HTTPS hardening)', () => {
  const ssl = (over: Record<string, unknown>) => ({
    httpsOk: true, hstsDetails: null, activeCertificate: { daysRemaining: 90 }, ...over,
  }) as any;
  it('no HTTPS -> F', () => expect(gradeFromSsl(ssl({ httpsOk: false })).letter).toBe('F'));
  it('expired cert -> F', () => expect(gradeFromSsl(ssl({ activeCertificate: { daysRemaining: -1 } })).letter).toBe('F'));
  it('valid but expires in 5 days -> D', () => expect(gradeFromSsl(ssl({ activeCertificate: { daysRemaining: 5 } })).letter).toBe('D'));
  it('valid, no HSTS, plenty of time -> C', () => expect(gradeFromSsl(ssl({ hstsDetails: null, activeCertificate: { daysRemaining: 90 } })).letter).toBe('C'));
  it('valid + HSTS but expires in 20 days -> B', () => expect(gradeFromSsl(ssl({ hstsDetails: { maxAge: 1 }, activeCertificate: { daysRemaining: 20 } })).letter).toBe('B'));
  it('valid + HSTS + >30 days -> A', () => expect(gradeFromSsl(ssl({ hstsDetails: { maxAge: 1 }, activeCertificate: { daysRemaining: 90 } })).letter).toBe('A'));
  it('valid + HSTS + null daysRemaining (long-lived) -> A', () => expect(gradeFromSsl(ssl({ hstsDetails: { maxAge: 1 }, activeCertificate: { daysRemaining: null } })).letter).toBe('A'));
  it('boundary: exactly 7 days -> D', () => expect(gradeFromSsl(ssl({ hstsDetails: { maxAge: 1 }, activeCertificate: { daysRemaining: 7 } })).letter).toBe('D'));
  it('boundary: exactly 30 days + HSTS -> B', () => expect(gradeFromSsl(ssl({ hstsDetails: { maxAge: 1 }, activeCertificate: { daysRemaining: 30 } })).letter).toBe('B'));
  it('maps letters to levels: A/B->ok, C->warn, D/F->bad', () => {
    expect(gradeFromSsl(ssl({ hstsDetails: { maxAge: 1 } })).level).toBe('ok');
    expect(gradeFromSsl(ssl({ hstsDetails: null })).level).toBe('warn');
    expect(gradeFromSsl(ssl({ httpsOk: false })).level).toBe('bad');
  });
});
