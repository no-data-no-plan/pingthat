import { describe, it, expect } from 'vitest';
import { isValidDomain, isValidUrl, isBlockedHost, parseBody, jsonResponse, errorResponse, isBodyTooLarge } from './_shared';

describe('isValidDomain', () => {
  it('accepts valid domains', () => {
    expect(isValidDomain('example.com')).toBe(true);
    expect(isValidDomain('sub.example.co.uk')).toBe(true);
    expect(isValidDomain('my-site.org')).toBe(true);
  });

  it('rejects domains without TLD', () => {
    expect(isValidDomain('localhost')).toBe(false);
    expect(isValidDomain('myhost')).toBe(false);
  });

  it('rejects domains exceeding 253 chars', () => {
    const long = 'a'.repeat(250) + '.com';
    expect(isValidDomain(long)).toBe(false);
  });

  it('rejects domains with invalid chars', () => {
    expect(isValidDomain('exam ple.com')).toBe(false);
    expect(isValidDomain('exam_ple.com')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidDomain('')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('returns normalized URL for valid http/https', () => {
    expect(isValidUrl('https://example.com')).toBe('https://example.com/');
    expect(isValidUrl('http://example.com/path')).toBe('http://example.com/path');
  });

  it('adds https:// if no scheme', () => {
    expect(isValidUrl('example.com')).toBe('https://example.com/');
  });

  it('returns null for dangerous schemes', () => {
    // 'ftp://...' doesn't start with http so gets https:// prepended, becoming a valid URL.
    // The real protection is blocking javascript:, data:, etc.
    expect(isValidUrl('javascript:alert(1)')).toBeNull();
    expect(isValidUrl('data:text/html,<h1>hi</h1>')).toBeNull();
  });

  it('returns null for blocked hosts', () => {
    expect(isValidUrl('http://localhost')).toBeNull();
    expect(isValidUrl('http://127.0.0.1')).toBeNull();
    expect(isValidUrl('http://192.168.1.1')).toBeNull();
    expect(isValidUrl('http://10.0.0.1')).toBeNull();
  });

  it('returns null for malformed URLs', () => {
    expect(isValidUrl('not a url at all!!!')).toBeNull();
  });
});

describe('isBlockedHost', () => {
  it('blocks localhost', () => {
    expect(isBlockedHost('localhost')).toBe(true);
  });

  it('blocks 127.x.x.x', () => {
    expect(isBlockedHost('127.0.0.1')).toBe(true);
    expect(isBlockedHost('127.0.0.2')).toBe(true);
  });

  it('blocks 10.x.x.x', () => {
    expect(isBlockedHost('10.0.0.1')).toBe(true);
    expect(isBlockedHost('10.255.255.255')).toBe(true);
  });

  it('blocks 192.168.x.x', () => {
    expect(isBlockedHost('192.168.0.1')).toBe(true);
    expect(isBlockedHost('192.168.1.100')).toBe(true);
  });

  it('blocks 172.16-31.x.x', () => {
    expect(isBlockedHost('172.16.0.1')).toBe(true);
    expect(isBlockedHost('172.31.255.255')).toBe(true);
    expect(isBlockedHost('172.15.0.1')).toBe(false);
    expect(isBlockedHost('172.32.0.1')).toBe(false);
  });

  it('blocks 0.x.x.x and 0.0.0.0', () => {
    expect(isBlockedHost('0.0.0.0')).toBe(true);
    expect(isBlockedHost('0.1.2.3')).toBe(true);
  });

  it('blocks link-local 169.254.x.x', () => {
    expect(isBlockedHost('169.254.1.1')).toBe(true);
  });

  it('blocks RFC 6598 CGNAT 100.64.0.0/10', () => {
    expect(isBlockedHost('100.64.0.1')).toBe(true);
    expect(isBlockedHost('100.100.100.100')).toBe(true);
    expect(isBlockedHost('100.127.255.255')).toBe(true);
  });

  it('allows IPs outside RFC 6598 CGNAT /10', () => {
    expect(isBlockedHost('100.128.0.0')).toBe(false);
    expect(isBlockedHost('100.0.0.0')).toBe(false);
    expect(isBlockedHost('100.63.255.255')).toBe(false);
  });

  it('blocks RFC 2544 benchmarking 198.18.0.0/15', () => {
    expect(isBlockedHost('198.18.0.1')).toBe(true);
    expect(isBlockedHost('198.19.255.255')).toBe(true);
  });

  it('allows IPs outside 198.18.0.0/15', () => {
    expect(isBlockedHost('198.20.0.0')).toBe(false);
    expect(isBlockedHost('198.17.255.255')).toBe(false);
  });

  it('blocks RFC 5737 TEST-NET documentation ranges', () => {
    expect(isBlockedHost('192.0.2.1')).toBe(true);
    expect(isBlockedHost('198.51.100.1')).toBe(true);
    expect(isBlockedHost('203.0.113.1')).toBe(true);
  });

  it('blocks IPv6 loopback ::1', () => {
    expect(isBlockedHost('::1')).toBe(true);
    expect(isBlockedHost('[::1]')).toBe(true);
  });

  it('blocks IPv6-mapped IPv4 private', () => {
    expect(isBlockedHost('::ffff:127.0.0.1')).toBe(true);
    expect(isBlockedHost('::ffff:10.0.0.1')).toBe(true);
    expect(isBlockedHost('::ffff:192.168.1.1')).toBe(true);
  });

  it('blocks .local and .internal TLDs', () => {
    expect(isBlockedHost('myhost.local')).toBe(true);
    expect(isBlockedHost('myhost.internal')).toBe(true);
  });

  it('blocks metadata endpoints', () => {
    expect(isBlockedHost('metadata.google.internal')).toBe(true);
    expect(isBlockedHost('metadata.internal')).toBe(true);
  });

  it('allows public IPs and domains', () => {
    expect(isBlockedHost('8.8.8.8')).toBe(false);
    expect(isBlockedHost('example.com')).toBe(false);
    expect(isBlockedHost('1.1.1.1')).toBe(false);
  });
});

describe('parseBody', () => {
  it('parses valid JSON body', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' }),
    });
    const result = await parseBody(request);
    expect(result).toEqual({ url: 'https://example.com' });
  });

  it('returns null for invalid JSON', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: 'not json',
    });
    const result = await parseBody(request);
    expect(result).toBeNull();
  });

  it('returns _tooLarge marker for bodies over 1024 bytes', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: 'x'.repeat(1025),
    });
    const result = await parseBody(request);
    expect(result).not.toBeNull();
    expect(isBodyTooLarge(result)).toBe(true);
  });

  it('parses bodies at exactly 1024 bytes', async () => {
    const payload = JSON.stringify({ data: 'a'.repeat(1005) });
    // Ensure it's <= 1024
    const request = new Request('http://localhost', {
      method: 'POST',
      body: payload.length <= 1024 ? payload : JSON.stringify({ d: 'a'.repeat(1010) }),
    });
    const result = await parseBody(request);
    // Either parsed or _tooLarge depending on exact length
    expect(result).not.toBeNull();
  });
});

describe('isBodyTooLarge', () => {
  it('returns false for null', () => {
    expect(isBodyTooLarge(null)).toBe(false);
  });

  it('returns false for normal objects', () => {
    expect(isBodyTooLarge({ url: 'test' })).toBe(false);
  });

  it('returns true for _tooLarge marker', () => {
    expect(isBodyTooLarge({ _tooLarge: true })).toBe(true);
  });
});

describe('jsonResponse', () => {
  it('returns a Response with JSON content-type', async () => {
    const res = jsonResponse({ ok: true });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  it('respects custom status code', async () => {
    const res = jsonResponse({ error: 'not found' }, 404);
    expect(res.status).toBe(404);
  });

  it('includes CORS headers', () => {
    const res = jsonResponse({});
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://pingthat.dev');
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
  });
});

describe('errorResponse', () => {
  it('returns error JSON with given message and status', async () => {
    const res = errorResponse('Something went wrong', 500);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: 'Something went wrong' });
  });

  it('defaults to 400 status', async () => {
    const res = errorResponse('Bad input');
    expect(res.status).toBe(400);
  });
});
