import { isValidUrl, isBlockedHost, jsonResponse, errorResponse, parseBody, isBodyTooLarge } from "./_shared";
import { getLang, getApiErrors } from "./_i18n";

export async function onRequestPost(context: { request: Request }) {
  const url = new URL(context.request.url);
  const e = getApiErrors(getLang(url));

  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse(e.bodyTooLarge, 413);
  if (!body || typeof body.url !== "string") return errorResponse(e.missingUrl);

  let target = isValidUrl(body.url);
  if (!target) return errorResponse(e.invalidOrBlockedUrl);

  const chain: { url: string; status: number; statusText: string; location: string | null }[] = [];
  const maxRedirects = 10;
  let current = target;

  try {
    for (let i = 0; i < maxRedirects; i++) {
      const res = await fetch(current, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "PingThat/1.0 (https://pingthat.dev)" },
      });

      const location = res.headers.get("location");
      chain.push({
        url: current,
        status: res.status,
        statusText: res.statusText,
        location,
      });

      if (!location || (res.status < 300 || res.status >= 400)) break;

      // Resolve relative redirects and validate against blocklist
      try {
        const nextUrl = new URL(location, current);
        if (!['http:', 'https:'].includes(nextUrl.protocol) || isBlockedHost(nextUrl.hostname)) {
          chain.push({
            url: nextUrl.href,
            status: 0,
            statusText: "Blocked",
            location: null,
          });
          return jsonResponse({
            originalUrl: target,
            finalUrl: nextUrl.href,
            redirectCount: chain.length - 1,
            chain,
            error: e.redirectToBlockedHost,
          });
        }
        current = nextUrl.href;
      } catch {
        break;
      }
    }

    return jsonResponse({
      originalUrl: target,
      finalUrl: chain[chain.length - 1]?.url || target,
      redirectCount: chain.length - 1,
      chain,
    });
  } catch (err: any) {
    if (err?.name === "AbortError" || err?.message?.includes("timeout")) {
      return errorResponse(e.requestTimedOut, 504);
    }
    if (err instanceof TypeError) {
      return errorResponse(e.dnsOrNetwork, 502);
    }
    return errorResponse(e.redirectCheckFailed, 502);
  }
}
