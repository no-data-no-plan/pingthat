import { isValidDomain, jsonResponse, errorResponse, parseBody } from "./_shared";

export async function onRequestPost(context: { request: Request }) {
  const body = await parseBody(context.request);
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

    const data = await res.json() as any;

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
    return errorResponse("WHOIS lookup failed", 502);
  }
}
