import { isValidDomain, jsonResponse, errorResponse, parseBody, isBodyTooLarge } from "./_shared";
import { getLang, getApiErrors } from "./_i18n";

export async function onRequestPost(context: { request: Request }) {
  const url = new URL(context.request.url);
  const e = getApiErrors(getLang(url));

  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse(e.bodyTooLarge, 413);
  if (!body || typeof body.domain !== "string") return errorResponse(e.missingDomain);

  const domain = body.domain.trim().toLowerCase();
  if (!isValidDomain(domain)) return errorResponse(e.invalidDomain);

  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(10000),
      headers: { Accept: "application/rdap+json" },
    });

    if (!res.ok) {
      return jsonResponse({
        domain,
        found: false,
        error: res.status === 404 ? e.domainNotFoundInRdap : e.rdapError(res.status),
      });
    }

    // Bound response body size to prevent memory exhaustion
    const maxBytes = 200 * 1024; // 200 KB
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      return errorResponse(e.responseTooLarge, 502);
    }
    const text = await res.text();
    if (text.length > maxBytes) {
      return errorResponse(e.responseTooLarge, 502);
    }
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return errorResponse(e.invalidRdapResponse, 502);
    }

    const registrar = data.entities?.find((ent: any) => ent.roles?.includes("registrar"));
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
      rdapLink: (() => { const href = data.links?.find((l: any) => l.rel === "self")?.href; return href && /^https?:\/\//.test(href) ? href : null; })(),
    });
  } catch (err: any) {
    if (err?.name === "AbortError" || err?.message?.includes("timeout")) {
      return errorResponse(e.requestTimedOut, 504);
    }
    if (err instanceof TypeError) {
      return errorResponse(e.dnsOrNetwork, 502);
    }
    return errorResponse(e.whoisLookupFailed, 502);
  }
}
