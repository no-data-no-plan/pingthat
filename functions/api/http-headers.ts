import { isValidUrl, jsonResponse, errorResponse, parseBody, isBodyTooLarge, fetchWithManualRedirects } from "./_shared";

const SAFE_HEADERS = new Set([
  'content-type', 'content-length', 'content-encoding', 'content-language',
  'cache-control', 'expires', 'last-modified', 'etag', 'pragma', 'age',
  'vary', 'server', 'x-powered-by',
  'strict-transport-security', 'content-security-policy', 'x-frame-options',
  'x-content-type-options', 'referrer-policy', 'permissions-policy',
  'x-xss-protection', 'access-control-allow-origin', 'access-control-allow-methods',
  'access-control-allow-headers', 'access-control-max-age',
  'x-robots-tag', 'link', 'alt-svc', 'cross-origin-opener-policy',
  'cross-origin-embedder-policy', 'cross-origin-resource-policy',
  'timing-allow-origin', 'x-dns-prefetch-control',
]);

export async function onRequestPost(context: { request: Request }) {
  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse("Request body too large", 413);
  if (!body || typeof body.url !== "string") return errorResponse("Missing url");

  const target = isValidUrl(body.url);
  if (!target) return errorResponse("Invalid or blocked URL");

  try {
    const fetchResult = await fetchWithManualRedirects(
      target,
      {
        method: "HEAD",
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "PingThat/1.0 (https://pingthat.dev)" },
      },
      5
    );
    if ("error" in fetchResult) {
      return errorResponse(fetchResult.error, fetchResult.status);
    }
    const res = fetchResult.response;

    // Collect all headers, then filter to safe whitelist for response
    const allHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => { allHeaders[key] = value; });

    const totalHeaders = Object.keys(allHeaders).length;
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(allHeaders)) {
      if (SAFE_HEADERS.has(key.toLowerCase())) {
        headers[key] = value;
      }
    }
    const filteredCount = totalHeaders - Object.keys(headers).length;

    // Security checks run against the unfiltered set so detection is unaffected
    const security = {
      hsts: !!allHeaders["strict-transport-security"],
      csp: !!allHeaders["content-security-policy"],
      xFrameOptions: !!allHeaders["x-frame-options"],
      xContentType: !!allHeaders["x-content-type-options"],
      referrerPolicy: !!allHeaders["referrer-policy"],
      permissionsPolicy: !!allHeaders["permissions-policy"],
    };

    return jsonResponse({
      url: target,
      status: res.status,
      headers,
      filteredCount,
      security,
      securityScore: Object.values(security).filter(Boolean).length,
      maxScore: Object.keys(security).length,
    });
  } catch (e: any) {
    if (e?.name === "AbortError" || e?.message?.includes("timeout")) {
      return errorResponse("Request timed out", 504);
    }
    if (e instanceof TypeError) {
      return errorResponse("Could not reach target (DNS or network)", 502);
    }
    return errorResponse("Could not fetch headers", 502);
  }
}
