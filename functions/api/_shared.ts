export function isValidDomain(domain: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(domain) && domain.length <= 253;
}

export function isValidUrl(input: string): string | null {
  try {
    const url = new URL(input.startsWith("http") ? input : `https://${input}`);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (isBlockedHost(url.hostname)) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function isBlockedHost(hostname: string): boolean {
  const h = hostname.replace(/^\[|\]$/g, ""); // strip IPv6 brackets
  return (
    h === "localhost" ||
    h.startsWith("127.") ||
    h.startsWith("10.") ||
    h.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(h) ||
    h.startsWith("0.") ||
    h === "0.0.0.0" ||
    h.startsWith("169.254.") ||
    // RFC 6598 Carrier-Grade NAT (Shared Address Space): 100.64.0.0/10
    // Matches 100.64.x.x through 100.127.x.x
    /^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\./.test(h) ||
    // RFC 2544 / RFC 5737 benchmarking: 198.18.0.0/15 (198.18.x.x - 198.19.x.x)
    /^198\.(18|19)\./.test(h) ||
    // RFC 5737 documentation ranges (TEST-NET-1, TEST-NET-2, TEST-NET-3)
    h.startsWith("192.0.2.") ||
    h.startsWith("198.51.100.") ||
    h.startsWith("203.0.113.") ||
    h === "::1" ||
    h === "::ffff:127.0.0.1" ||
    /^::ffff:(127\.|10\.|192\.168\.|0\.)/.test(h) ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h === "metadata.google.internal" ||
    h === "metadata.internal"
  );
}

// Rate limiting: configured at Cloudflare edge level (10 req/10s per IP on /api/*)

const CORS_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://pingthat.dev",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS,
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

export async function parseBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const text = await request.text();
    if (text.length > 1024) return { _tooLarge: true } as Record<string, unknown>;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function isBodyTooLarge(body: Record<string, unknown> | null): body is Record<string, unknown> {
  return body !== null && "_tooLarge" in body;
}

export type ManualRedirectResult =
  | { response: Response; finalUrl: string }
  | { error: string; status: number };

export interface RedirectI18n {
  tooManyRedirects: string;
  invalidRedirectTarget: string;
  redirectToNonHttp: string;
  redirectToBlockedHost: string;
}

const defaultRedirectI18n: RedirectI18n = {
  tooManyRedirects: "Too many redirects",
  invalidRedirectTarget: "Invalid redirect target",
  redirectToNonHttp: "Redirect to non-HTTP protocol",
  redirectToBlockedHost: "Redirect to blocked host",
};

export async function fetchWithManualRedirects(
  initialUrl: string,
  options: RequestInit,
  maxRedirects = 5,
  i18n: RedirectI18n = defaultRedirectI18n
): Promise<ManualRedirectResult> {
  let currentUrl = initialUrl;
  for (let i = 0; i <= maxRedirects; i++) {
    const res = await fetch(currentUrl, { ...options, redirect: "manual" });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      if (i === maxRedirects) return { error: i18n.tooManyRedirects, status: 400 };
      const loc = res.headers.get("location")!;
      let nextUrl: URL;
      try {
        nextUrl = new URL(loc, currentUrl);
      } catch {
        return { error: i18n.invalidRedirectTarget, status: 400 };
      }
      if (!["http:", "https:"].includes(nextUrl.protocol)) {
        return { error: i18n.redirectToNonHttp, status: 400 };
      }
      if (isBlockedHost(nextUrl.hostname)) {
        return { error: i18n.redirectToBlockedHost, status: 400 };
      }
      currentUrl = nextUrl.href;
      continue;
    }
    return { response: res, finalUrl: currentUrl };
  }
  return { error: i18n.tooManyRedirects, status: 400 };
}
