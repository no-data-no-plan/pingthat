import { isValidUrl, jsonResponse, errorResponse, parseBody, isBodyTooLarge, fetchWithManualRedirects } from "./_shared";

export async function onRequestPost(context: { request: Request }) {
  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse("Request body too large", 413);
  if (!body || typeof body.url !== "string") return errorResponse("Missing url");

  const target = isValidUrl(body.url);
  if (!target) return errorResponse("Invalid or blocked URL");

  const start = Date.now();
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
  } catch (e: any) {
    const elapsed = Date.now() - start;
    let errMsg = "Connection failed";
    let statusText = "Unreachable";
    if (e?.name === "AbortError" || e?.message?.includes("timeout")) {
      errMsg = "Request timed out";
      statusText = "Timed out";
    } else if (e instanceof TypeError) {
      errMsg = "Could not reach target (DNS or network)";
      statusText = "Unreachable";
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
