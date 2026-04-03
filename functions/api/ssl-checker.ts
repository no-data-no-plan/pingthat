import { isValidDomain, isBlockedHost, jsonResponse, errorResponse, parseBody } from "./_shared";

export async function onRequestPost(context: { request: Request }) {
  const body = await parseBody(context.request);
  if (!body || typeof body.domain !== "string") return errorResponse("Missing domain");

  const domain = body.domain.trim().toLowerCase();
  if (!isValidDomain(domain)) return errorResponse("Invalid domain");
  if (isBlockedHost(domain)) return errorResponse("Blocked domain");

  try {
    // Check HTTPS connectivity
    const start = Date.now();
    const httpsRes = await fetch(`https://${domain}`, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "PingThat/1.0 (https://pingthat.dev)" },
    });
    const elapsed = Date.now() - start;

    const hsts = httpsRes.headers.get("strict-transport-security");

    // Query Certificate Transparency logs
    let certs: any[] = [];
    try {
      const crtRes = await fetch(
        `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json&exclude=expired`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (crtRes.ok) {
        const allCerts = await crtRes.json() as any[];
        certs = allCerts.slice(0, 5).map((c: any) => ({
          issuer: c.issuer_name || "Unknown",
          commonName: c.common_name || domain,
          notBefore: c.not_before || null,
          notAfter: c.not_after || null,
          serialNumber: c.serial_number || null,
        }));
      }
    } catch {
      // crt.sh may be slow/unavailable
    }

    return jsonResponse({
      domain,
      httpsStatus: httpsRes.status,
      httpsOk: httpsRes.ok,
      responseTime: elapsed,
      hsts: hsts || null,
      server: httpsRes.headers.get("server") || null,
      certificates: certs,
    });
  } catch (e: any) {
    return jsonResponse({
      domain,
      httpsStatus: 0,
      httpsOk: false,
      responseTime: 0,
      hsts: null,
      server: null,
      certificates: [],
      error: "HTTPS connection failed",
    });
  }
}
