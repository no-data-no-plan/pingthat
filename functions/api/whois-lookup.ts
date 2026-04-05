import { isValidDomain, jsonResponse, errorResponse, parseBody, isBodyTooLarge } from "./_shared";

export async function onRequestPost(context: { request: Request }) {
  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse("Request body too large", 413);
  if (!body || typeof body.domain !== "string") return errorResponse("Missing domain");

  const domain = body.domain.trim().toLowerCase();
  if (!isValidDomain(domain)) return errorResponse("Invalid domain");

  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(10000),
      headers: { Accept: "application/rdap+json" },
    });

    if (!res.ok) {
      return jsonResponse({
        domain,
        found: false,
        error: res.status === 404 ? "Domain not found in RDAP" : `RDAP error: ${res.status}`,
      });
    }

    // Bound response body size to prevent memory exhaustion
    const maxBytes = 200 * 1024; // 200 KB
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      return errorResponse("Response too large", 502);
    }
    const text = await res.text();
    if (text.length > maxBytes) {
      return errorResponse("Response too large", 502);
    }
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return errorResponse("Invalid RDAP response", 502);
    }

    const registrar = data.entities?.find((e: any) => e.roles?.includes("registrar"));
    const registrarName = registrar?.vcardArray?.[1]?.find((v: any) => v[0] === "fn")?.[3] || registrar?.handle || null;

    const events: Record<string, string> = {};
    for (const ev of data.events || []) {
      events[ev.eventAction] = ev.eventDate;
    }

    const nameservers = (data.nameservers || []).map((ns: any) => ns.ldhName || ns.handle).filter(Boolean);

    const statuses = data.status || [];

    return jsonResponse({
      domain,
      found: true,
      registrar: registrarName,
      created: events.registration || null,
      updated: events["last changed"] || null,
      expires: events.expiration || null,
      nameservers,
      statuses,
      rdapLink: data.links?.find((l: any) => l.rel === "self")?.href || null,
    });
  } catch (e: any) {
    if (e?.name === "AbortError" || e?.message?.includes("timeout")) {
      return errorResponse("Request timed out", 504);
    }
    if (e instanceof TypeError) {
      return errorResponse("Could not reach target (DNS or network)", 502);
    }
    return errorResponse("WHOIS lookup failed", 502);
  }
}
