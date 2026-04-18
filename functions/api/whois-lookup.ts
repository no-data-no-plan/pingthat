import { isValidDomain, isBlockedHost, jsonResponse, errorResponse, parseBody, isBodyTooLarge } from "./_shared";
import { getLang, getApiErrors } from "./_i18n";

const TLD_RDAP: Record<string, string> = {
  app: "https://pubapi.registry.google/rdap/",
  dev: "https://pubapi.registry.google/rdap/",
  com: "https://rdap.verisign.com/com/v1/",
  net: "https://rdap.verisign.com/net/v1/",
  org: "https://rdap.publicinterestregistry.org/rdap/",
  info: "https://rdap.identitydigital.services/rdap/",
  ai: "https://rdap.identitydigital.services/rdap/",
  io: "https://rdap.identitydigital.services/rdap/",
  co: "https://rdap.identitydigital.services/rdap/",
  me: "https://rdap.identitydigital.services/rdap/",
  xyz: "https://rdap.centralnic.com/xyz/",
  tv: "https://rdap.nic.tv/",
  blog: "https://rdap.blog.fury.ca/rdap/",
  site: "https://rdap.radix.host/rdap/",
  online: "https://rdap.radix.host/rdap/",
  store: "https://rdap.radix.host/rdap/",
  tech: "https://rdap.radix.host/rdap/",
};

const MAX_RDAP_BYTES = 200 * 1024;
const RDAP_TIMEOUT_MS = 10_000;
const MAX_REDIRECT_HOPS = 4;

async function fetchRdap(rdapUrl: string): Promise<Response> {
  let current = rdapUrl;
  for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop++) {
    let parsed: URL;
    try { parsed = new URL(current); } catch { return new Response(null, { status: 502 }); }
    if (!/^https?:$/.test(parsed.protocol)) return new Response(null, { status: 502 });
    if (isBlockedHost(parsed.hostname)) return new Response(null, { status: 502 });
    const res = await fetch(parsed.toString(), {
      signal: AbortSignal.timeout(RDAP_TIMEOUT_MS),
      redirect: "manual",
      headers: { Accept: "application/rdap+json, application/json" },
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return res;
      try {
        current = new URL(loc, parsed).toString();
      } catch {
        return new Response(null, { status: 502 });
      }
      continue;
    }
    return res;
  }
  return new Response(null, { status: 508 });
}

export async function onRequestPost(context: { request: Request }) {
  const url = new URL(context.request.url);
  const e = getApiErrors(getLang(url));

  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse(e.bodyTooLarge, 413);
  if (!body || typeof body.domain !== "string") return errorResponse(e.missingDomain);

  const domain = body.domain.trim().toLowerCase();
  if (!isValidDomain(domain)) return errorResponse(e.invalidDomain);

  const tld = domain.split(".").pop() || "";
  const primary = TLD_RDAP[tld] ? `${TLD_RDAP[tld]}domain/${encodeURIComponent(domain)}` : null;
  const fallback = `https://rdap.org/domain/${encodeURIComponent(domain)}`;

  try {
    let res: Response | null = null;
    const attempts = primary ? [primary, fallback] : [fallback];
    let lastStatus = 0;
    for (const attempt of attempts) {
      try {
        const r = await fetchRdap(attempt);
        if (r.ok) { res = r; break; }
        lastStatus = r.status;
        if (r.status === 404) {
          return jsonResponse({ domain, found: false, error: e.domainNotFoundInRdap });
        }
      } catch { /* try next */ }
    }

    if (!res) {
      return jsonResponse({ domain, found: false, error: e.rdapError(lastStatus || 0) });
    }

    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_RDAP_BYTES) {
      return errorResponse(e.responseTooLarge, 502);
    }
    const text = await res.text();
    if (text.length > MAX_RDAP_BYTES) {
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
    if (err?.name === "AbortError" || err?.name === "TimeoutError" || err?.message?.includes("timeout")) {
      return errorResponse(e.requestTimedOut, 504);
    }
    if (err instanceof TypeError) {
      return errorResponse(e.dnsOrNetwork, 502);
    }
    return errorResponse(e.whoisLookupFailed, 502);
  }
}
