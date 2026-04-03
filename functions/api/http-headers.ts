import { isValidUrl, jsonResponse, errorResponse, parseBody } from "./_shared";

export async function onRequestPost(context: { request: Request }) {
  const body = await parseBody(context.request);
  if (!body || typeof body.url !== "string") return errorResponse("Missing url");

  const target = isValidUrl(body.url);
  if (!target) return errorResponse("Invalid or blocked URL");

  try {
    const res = await fetch(target, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "PingThat/1.0 (https://pingthat.dev)" },
    });

    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => { headers[key] = value; });

    const security = {
      hsts: !!headers["strict-transport-security"],
      csp: !!headers["content-security-policy"],
      xFrameOptions: !!headers["x-frame-options"],
      xContentType: !!headers["x-content-type-options"],
      referrerPolicy: !!headers["referrer-policy"],
      permissionsPolicy: !!headers["permissions-policy"],
    };

    return jsonResponse({
      url: target,
      status: res.status,
      headers,
      security,
      securityScore: Object.values(security).filter(Boolean).length,
      maxScore: Object.keys(security).length,
    });
  } catch (e: any) {
    return errorResponse("Could not fetch headers", 502);
  }
}
