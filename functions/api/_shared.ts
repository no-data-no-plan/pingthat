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
    h === "::1" ||
    h === "::ffff:127.0.0.1" ||
    /^::ffff:(127\.|10\.|192\.168\.|0\.)/.test(h) ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h === "metadata.google.internal" ||
    h === "metadata.internal"
  );
}

// TODO: Configure Cloudflare WAF rate limiting rule for /api/* endpoints
// (e.g. 10 req/10s per IP, matching the CompoundVision setup)

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
