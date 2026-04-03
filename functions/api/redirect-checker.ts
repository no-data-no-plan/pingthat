import { isValidUrl, isBlockedHost, jsonResponse, errorResponse, parseBody } from "./_shared";

export async function onRequestPost(context: { request: Request }) {
  const body = await parseBody(context.request);
  if (!body || typeof body.url !== "string") return errorResponse("Missing url");

  let target = isValidUrl(body.url);
  if (!target) return errorResponse("Invalid or blocked URL");

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
        if (isBlockedHost(nextUrl.hostname)) {
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
            error: "Redirect to blocked host",
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
  } catch (e: any) {
    return errorResponse("Redirect check failed", 502);
  }
}
