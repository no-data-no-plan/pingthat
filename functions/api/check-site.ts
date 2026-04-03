import { isValidUrl, jsonResponse, errorResponse, parseBody } from "./_shared";

export async function onRequestPost(context: { request: Request }) {
  const body = await parseBody(context.request);
  if (!body || typeof body.url !== "string") return errorResponse("Missing url");

  const target = isValidUrl(body.url);
  if (!target) return errorResponse("Invalid or blocked URL");

  const start = Date.now();
  try {
    const res = await fetch(target, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "PingThat/1.0 (https://pingthat.dev)" },
    });
    const elapsed = Date.now() - start;

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
    return jsonResponse({
      url: target,
      status: 0,
      statusText: "Unreachable",
      responseTime: elapsed,
      server: null,
      contentType: null,
      up: false,
      error: "Connection failed",
    });
  }
}
