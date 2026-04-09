import { describe, it, expect } from 'vitest';
import { isValidDomain, normalizeUrl, isValidUrl, getValidationError } from './validation';

describe('isValidDomain', () => {
  it('accepts simple domains', () => {
    expect(isValidDomain('example.com')).toBe(true);
    expect(isValidDomain('google.co.uk')).toBe(true);
    expect(isValidDomain('sub.domain.example.org')).toBe(true);
  });

  it('accepts domains with hyphens mid-label', () => {
    expect(isValidDomain('my-site.com')).toBe(true);
    expect(isValidDomain('a-b-c.example.io')).toBe(true);
  });

  it('accepts domains with leading/trailing whitespace (trimmed internally)', () => {
    expect(isValidDomain('  example.com  ')).toBe(true);
  });

  it('accepts uppercase (normalized internally)', () => {
    expect(isValidDomain('Example.COM')).toBe(true);
  });

  it('rejects empty strings', () => {
    expect(isValidDomain('')).toBe(false);
  });

  it('rejects non-string input', () => {
    // @ts-expect-error testing invalid input
    expect(isValidDomain(null)).toBe(false);
    // @ts-expect-error testing invalid input
    expect(isValidDomain(undefined)).toBe(false);
    // @ts-expect-error testing invalid input
    expect(isValidDomain(123)).toBe(false);
  });

  it('rejects domains without TLD', () => {
    expect(isValidDomain('localhost')).toBe(false);
    expect(isValidDomain('myhost')).toBe(false);
  });

  it('rejects single-letter TLD', () => {
    expect(isValidDomain('example.c')).toBe(false);
  });

  it('rejects domains with underscores', () => {
    expect(isValidDomain('my_site.com')).toBe(false);
  });

  it('rejects IP addresses', () => {
    expect(isValidDomain('192.168.1.1')).toBe(false);
    expect(isValidDomain('127.0.0.1')).toBe(false);
  });

  it('rejects labels starting or ending with hyphens', () => {
    expect(isValidDomain('-example.com')).toBe(false);
    expect(isValidDomain('example-.com')).toBe(false);
  });

  it('rejects domains exceeding 253 chars', () => {
    const long = 'a'.repeat(64) + '.' + 'b'.repeat(64) + '.' + 'c'.repeat(64) + '.' + 'd'.repeat(60) + '.com';
    expect(long.length).toBeGreaterThan(253);
    expect(isValidDomain(long)).toBe(false);
  });

  it('rejects domains with spaces inside', () => {
    expect(isValidDomain('ex ample.com')).toBe(false);
  });

  it('rejects numeric-only TLD', () => {
    expect(isValidDomain('example.123')).toBe(false);
  });
});

describe('normalizeUrl', () => {
  it('adds https:// if no scheme present', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com/');
  });

  it('preserves http:// scheme', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com/');
  });

  it('preserves https:// scheme', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com/');
  });

  it('preserves paths and query strings', () => {
    const result = normalizeUrl('https://example.com/path?q=1');
    expect(result).toBe('https://example.com/path?q=1');
  });

  it('returns null for empty string', () => {
    expect(normalizeUrl('')).toBeNull();
  });

  it('returns null for non-string input', () => {
    // @ts-expect-error testing invalid input
    expect(normalizeUrl(null)).toBeNull();
    // @ts-expect-error testing invalid input
    expect(normalizeUrl(undefined)).toBeNull();
  });

  it('returns null for non-http schemes when properly prefixed', () => {
    // Note: 'ftp://example.com' doesn't start with http so gets https:// prepended
    // resulting in a valid (albeit weird) URL. The real protection is that the
    // protocol check after URL parsing catches javascript:, data:, etc.
    expect(normalizeUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeUrl('data:text/html,<h1>hi</h1>')).toBeNull();
  });

  it('returns null for overly long input (>2048 chars)', () => {
    const long = 'https://example.com/' + 'a'.repeat(2048);
    expect(normalizeUrl(long)).toBeNull();
  });

  it('trims whitespace', () => {
    expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com/');
  });

  it('returns null for malformed URLs', () => {
    expect(normalizeUrl('://broken')).toBeNull();
  });

  it('handles case-insensitive scheme detection', () => {
    expect(normalizeUrl('HTTP://example.com')).toBe('http://example.com/');
    expect(normalizeUrl('HTTPS://example.com')).toBe('https://example.com/');
  });
});

describe('isValidUrl', () => {
  it('returns true for valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com/path')).toBe(true);
    expect(isValidUrl('example.com')).toBe(true);
  });

  it('returns false for invalid URLs', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('getValidationError', () => {
  it('returns English domain error', () => {
    const msg = getValidationError('domain', 'en');
    expect(msg).toContain('valid domain');
    expect(msg).toContain('example.com');
  });

  it('returns Spanish domain error', () => {
    const msg = getValidationError('domain', 'es');
    expect(msg).toContain('dominio');
    expect(msg).toContain('ejemplo.com');
  });

  it('returns English URL error', () => {
    const msg = getValidationError('url', 'en');
    expect(msg).toContain('valid URL');
  });

  it('returns Spanish URL error', () => {
    const msg = getValidationError('url', 'es');
    expect(msg).toContain('URL');
  });
});
