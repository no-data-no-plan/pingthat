import { isValidUrl, jsonResponse, errorResponse, parseBody, isBodyTooLarge, fetchWithManualRedirects } from "./_shared";
import { getLang, getApiErrors } from "./_i18n";

export async function onRequestPost(context: { request: Request }) {
  const url = new URL(context.request.url);
  const e = getApiErrors(getLang(url));

  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse(e.bodyTooLarge, 413);
  if (!body || typeof body.url !== "string") return errorResponse(e.missingUrl);

  const target = isValidUrl(body.url);
  if (!target) return errorResponse(e.invalidOrBlockedUrl);

  const redirectI18n = {
    tooManyRedirects: e.tooManyRedirects,
    invalidRedirectTarget: e.invalidRedirectTarget,
    redirectToNonHttp: e.redirectToNonHttp,
    redirectToBlockedHost: e.redirectToBlockedHost,
  };

  const start = Date.now();
  try {
    const fetchResult = await fetchWithManualRedirects(
      target,
      {
        method: "HEAD",
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "PingThat/1.0 (https://pingthat.dev)" },
      },
      5,
      redirectI18n
    );
    const elapsed = Date.now() - start;
    if ("error" in fetchResult) {
      return jsonResponse({
        url: target,
        status: 0,
        statusText: fetchResult.error,
        responseTime: elapsed,
        server: null,
        contentType: null,
        up: false,
        error: fetchResult.error,
      });
    }
    const res = fetchResult.response;

    return jsonResponse({
      url: target,
      status: res.status,
      statusText: res.statusText,
      responseTime: elapsed,
      server: res.headers.get("server") || null,
      contentType: res.headers.get("content-type") || null,
      up: res.status < 500,
    });
  } catch (err: any) {
    const elapsed = Date.now() - start;
    let errMsg = e.connectionFailed;
    let statusText = e.unreachable;
    if (err?.name === "AbortError" || err?.message?.includes("timeout")) {
      errMsg = e.requestTimedOut;
      statusText = e.timedOut;
    } else if (err instanceof TypeError) {
      errMsg = e.dnsOrNetwork;
      statusText = e.unreachable;
    }
    return jsonResponse({
      url: target,
      status: 0,
      statusText,
      responseTime: elapsed,
      server: null,
      contentType: null,
      up: false,
      error: errMsg,
    });
  }
}
