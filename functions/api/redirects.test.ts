import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithManualRedirects, isBlockedHost } from './_shared';

// Helper to create a redirect Response
function redirectResponse(status: number, location: string): Response {
  return new Response(null, {
    status,
    headers: { Location: location },
  });
}

// Helper to create a final (non-redirect) Response
function okResponse(body = 'OK'): Response {
  return new Response(body, { status: 200 });
}

describe('fetchWithManualRedirects', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  const mockFetch = () => vi.mocked(globalThis.fetch);

  it('returns response for non-redirect status', async () => {
    mockFetch().mockResolvedValueOnce(okResponse());

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('response' in result).toBe(true);
    if ('response' in result) {
      expect(result.response.status).toBe(200);
      expect(result.finalUrl).toBe('https://example.com');
    }
  });

  it('follows a single redirect to a public host', async () => {
    mockFetch()
      .mockResolvedValueOnce(redirectResponse(301, 'https://other.example.com/page'))
      .mockResolvedValueOnce(okResponse());

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('response' in result).toBe(true);
    if ('response' in result) {
      expect(result.response.status).toBe(200);
      expect(result.finalUrl).toBe('https://other.example.com/page');
    }
  });

  it('follows multiple redirects to a public host', async () => {
    mockFetch()
      .mockResolvedValueOnce(redirectResponse(302, 'https://hop1.example.com'))
      .mockResolvedValueOnce(redirectResponse(301, 'https://hop2.example.com'))
      .mockResolvedValueOnce(okResponse());

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('response' in result).toBe(true);
    if ('response' in result) {
      expect(result.finalUrl).toBe('https://hop2.example.com/');
    }
  });

  // --- Blocked host tests ---

  it('rejects redirect to 127.0.0.1 (loopback)', async () => {
    mockFetch().mockResolvedValueOnce(redirectResponse(301, 'http://127.0.0.1/evil'));

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to blocked host');
      expect(result.status).toBe(400);
    }
  });

  it('rejects redirect to 169.254.x.x (link-local)', async () => {
    mockFetch().mockResolvedValueOnce(redirectResponse(302, 'http://169.254.169.254/metadata'));

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to blocked host');
    }
  });

  it('rejects redirect to 10.x.x.x (private class A)', async () => {
    mockFetch().mockResolvedValueOnce(redirectResponse(301, 'http://10.0.0.1/internal'));

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to blocked host');
    }
  });

  it('rejects redirect to 192.168.x.x (private class C)', async () => {
    mockFetch().mockResolvedValueOnce(redirectResponse(301, 'http://192.168.1.1/admin'));

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to blocked host');
    }
  });

  it('rejects redirect to IPv6 loopback (::1)', async () => {
    mockFetch().mockResolvedValueOnce(redirectResponse(301, 'http://[::1]/'));

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to blocked host');
    }
  });

  it('rejects redirect to localhost', async () => {
    mockFetch().mockResolvedValueOnce(redirectResponse(302, 'http://localhost:8080/api'));

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to blocked host');
    }
  });

  it('rejects redirect to .internal TLD', async () => {
    mockFetch().mockResolvedValueOnce(redirectResponse(301, 'http://metadata.google.internal/'));

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to blocked host');
    }
  });

  it('rejects redirect to 172.16.x.x (private class B)', async () => {
    mockFetch().mockResolvedValueOnce(redirectResponse(301, 'http://172.16.0.1/'));

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to blocked host');
    }
  });

  // --- Redirect chain: public -> public -> private ---

  it('catches blocked host at end of redirect chain (public -> public -> private)', async () => {
    mockFetch()
      .mockResolvedValueOnce(redirectResponse(301, 'https://hop1.example.com'))
      .mockResolvedValueOnce(redirectResponse(302, 'http://192.168.0.1/admin'));

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to blocked host');
    }
  });

  it('catches blocked host in the middle of a redirect chain', async () => {
    mockFetch()
      .mockResolvedValueOnce(redirectResponse(301, 'http://10.0.0.1/internal'));
    // Should not follow further

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to blocked host');
    }
  });

  // --- Max redirects ---

  it('stops after max redirects (default 5)', async () => {
    // 6 redirects: indices 0..5, the 6th redirect (i=5) hits the limit
    for (let i = 0; i < 6; i++) {
      mockFetch().mockResolvedValueOnce(redirectResponse(301, `https://hop${i}.example.com`));
    }

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Too many redirects');
      expect(result.status).toBe(400);
    }
  });

  it('stops after custom max redirects', async () => {
    mockFetch()
      .mockResolvedValueOnce(redirectResponse(301, 'https://hop1.example.com'))
      .mockResolvedValueOnce(redirectResponse(301, 'https://hop2.example.com'))
      .mockResolvedValueOnce(redirectResponse(301, 'https://hop3.example.com'));

    const result = await fetchWithManualRedirects('https://example.com', {}, 2);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Too many redirects');
    }
  });

  it('succeeds at exactly the max redirect limit', async () => {
    // maxRedirects=2: allows redirects at i=0 and i=1, then final response at i=2
    mockFetch()
      .mockResolvedValueOnce(redirectResponse(301, 'https://hop1.example.com'))
      .mockResolvedValueOnce(redirectResponse(302, 'https://hop2.example.com'))
      .mockResolvedValueOnce(okResponse());

    const result = await fetchWithManualRedirects('https://example.com', {}, 2);
    expect('response' in result).toBe(true);
    if ('response' in result) {
      expect(result.finalUrl).toBe('https://hop2.example.com/');
    }
  });

  // --- Protocol downgrade ---

  it('allows https -> http redirect to public host', async () => {
    mockFetch()
      .mockResolvedValueOnce(redirectResponse(301, 'http://example.com/page'))
      .mockResolvedValueOnce(okResponse());

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('response' in result).toBe(true);
    if ('response' in result) {
      expect(result.finalUrl).toBe('http://example.com/page');
    }
  });

  it('rejects redirect to non-HTTP protocol (ftp://)', async () => {
    mockFetch().mockResolvedValueOnce(redirectResponse(301, 'ftp://files.example.com/data'));

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to non-HTTP protocol');
      expect(result.status).toBe(400);
    }
  });

  it('rejects redirect to javascript: protocol', async () => {
    mockFetch().mockResolvedValueOnce(redirectResponse(301, 'javascript:alert(1)'));

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to non-HTTP protocol');
    }
  });

  it('rejects redirect to data: protocol', async () => {
    mockFetch().mockResolvedValueOnce(redirectResponse(301, 'data:text/html,<h1>hi</h1>'));

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to non-HTTP protocol');
    }
  });

  // --- Invalid redirect targets ---

  it('rejects redirect to file:// protocol', async () => {
    mockFetch().mockResolvedValueOnce(redirectResponse(301, 'file:///etc/passwd'));

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Redirect to non-HTTP protocol');
      expect(result.status).toBe(400);
    }
  });

  // --- Relative redirect ---

  it('resolves relative redirect Location against current URL', async () => {
    mockFetch()
      .mockResolvedValueOnce(redirectResponse(301, '/new-path'))
      .mockResolvedValueOnce(okResponse());

    const result = await fetchWithManualRedirects('https://example.com/old', {});
    expect('response' in result).toBe(true);
    if ('response' in result) {
      expect(result.finalUrl).toBe('https://example.com/new-path');
    }
  });

  // --- Custom i18n ---

  it('uses custom i18n messages', async () => {
    mockFetch().mockResolvedValueOnce(redirectResponse(301, 'http://127.0.0.1/'));

    const result = await fetchWithManualRedirects('https://example.com', {}, 5, {
      tooManyRedirects: 'Demasiadas redirecciones',
      invalidRedirectTarget: 'Destino no valido',
      redirectToNonHttp: 'Protocolo no HTTP',
      redirectToBlockedHost: 'Host bloqueado',
    });
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Host bloqueado');
    }
  });

  // --- Passes options through to fetch ---

  it('passes request options to fetch with redirect: manual', async () => {
    mockFetch().mockResolvedValueOnce(okResponse());

    await fetchWithManualRedirects('https://example.com', {
      method: 'GET',
      headers: { 'User-Agent': 'test' },
    });

    expect(mockFetch()).toHaveBeenCalledWith('https://example.com', {
      method: 'GET',
      headers: { 'User-Agent': 'test' },
      redirect: 'manual',
    });
  });

  // --- 3xx without Location header ---

  it('treats 3xx without Location header as final response', async () => {
    const noLocationRedirect = new Response(null, { status: 301 });
    mockFetch().mockResolvedValueOnce(noLocationRedirect);

    const result = await fetchWithManualRedirects('https://example.com', {});
    expect('response' in result).toBe(true);
    if ('response' in result) {
      expect(result.response.status).toBe(301);
    }
  });
});
