import { isValidDomain, isBlockedHost, jsonResponse, errorResponse, parseBody, isBodyTooLarge, fetchWithManualRedirects } from "./_shared";
import { getLang, getApiErrors } from "./_i18n";

interface HstsDetails {
  raw: string;
  maxAge: number | null;
  includeSubDomains: boolean;
  preload: boolean;
  preloadEligible: boolean;
}

function parseHsts(raw: string | null): HstsDetails | null {
  if (!raw) return null;
  const maxAgeMatch = raw.match(/max-age\s*=\s*(\d+)/i);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : null;
  const includeSubDomains = /includeSubDomains/i.test(raw);
  const preload = /(^|;|\s)preload(\s|;|$)/i.test(raw);
  // Chrome HSTS preload requires max-age >= 31536000 (1 year), includeSubDomains, and preload token
  const preloadEligible = (maxAge ?? 0) >= 31536000 && includeSubDomains && preload;
  return { raw, maxAge, includeSubDomains, preload, preloadEligible };
}

function extractSans(nameValue: string | undefined): string[] {
  if (!nameValue) return [];
  return Array.from(
    new Set(
      nameValue
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

function daysBetween(notAfter: string | null): number | null {
  if (!notAfter) return null;
  const t = Date.parse(notAfter);
  if (isNaN(t)) return null;
  return Math.floor((t - Date.now()) / 86_400_000);
}

export async function onRequestPost(context: { request: Request }) {
  const url = new URL(context.request.url);
  const e = getApiErrors(getLang(url));

  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse(e.bodyTooLarge, 413);
  if (!body || typeof body.domain !== "string") return errorResponse(e.missingDomain);

  const domain = body.domain.trim().toLowerCase();
  if (!isValidDomain(domain)) return errorResponse(e.invalidDomain);
  if (isBlockedHost(domain)) return errorResponse(e.blockedDomain);

  const redirectI18n = {
    tooManyRedirects: e.tooManyRedirects,
    invalidRedirectTarget: e.invalidRedirectTarget,
    redirectToNonHttp: e.redirectToNonHttp,
    redirectToBlockedHost: e.redirectToBlockedHost,
  };

  try {
    const start = Date.now();
    const fetchResult = await fetchWithManualRedirects(
      `https://${domain}`,
      {
        method: "HEAD",
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "PingThat/1.0 (https://pingthat.dev)" },
      },
      5,
      redirectI18n
    );
    if ("error" in fetchResult) {
      return jsonResponse({
        domain,
        httpsStatus: 0,
        httpsOk: false,
        responseTime: 0,
        hsts: null,
        hstsDetails: null,
        server: null,
        certificates: [],
        activeCertificate: null,
        error: fetchResult.error,
      });
    }
    const httpsRes = fetchResult.response;
    const elapsed = Date.now() - start;

    const hstsRaw = httpsRes.headers.get("strict-transport-security");
    const hstsDetails = parseHsts(hstsRaw);

    let certs: any[] = [];
    try {
      // crt.sh can return multi-MB JSON for popular domains; cap body at 1 MB.
      // `limit=50` is also honoured by crt.sh as an upstream guard.
      const MAX_CRT_BYTES = 1 * 1024 * 1024;
      const crtRes = await fetch(
        `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json&exclude=expired&limit=50`,
        { signal: AbortSignal.timeout(15000) }
      );
      if (crtRes.ok) {
        const contentLength = crtRes.headers.get("content-length");
        if (contentLength && parseInt(contentLength, 10) > MAX_CRT_BYTES) {
          throw new Error("crt.sh response too large");
        }
        const text = await crtRes.text();
        if (text.length > MAX_CRT_BYTES) throw new Error("crt.sh response too large");
        const allCerts = JSON.parse(text) as any[];
        // Sort by not_before desc so most recent cert is first
        allCerts.sort((a, b) => {
          const ta = Date.parse(a.not_before || "");
          const tb = Date.parse(b.not_before || "");
          return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
        });
        certs = allCerts.slice(0, 5).map((c: any) => ({
          issuer: c.issuer_name || "Unknown",
          commonName: c.common_name || domain,
          notBefore: c.not_before || null,
          notAfter: c.not_after || null,
          serialNumber: c.serial_number || null,
          sans: extractSans(c.name_value),
          daysRemaining: daysBetween(c.not_after),
        }));
      }
    } catch {
      // crt.sh may be slow/unavailable
    }

    const activeCertificate = certs[0] || null;

    return jsonResponse({
      domain,
      httpsStatus: httpsRes.status,
      httpsOk: httpsRes.ok,
      responseTime: elapsed,
      hsts: hstsRaw || null,
      hstsDetails,
      server: httpsRes.headers.get("server") || null,
      certificates: certs,
      activeCertificate,
    });
  } catch (err: any) {
    let errMsg = e.httpsConnectionFailed;
    if (err?.name === "AbortError" || err?.message?.includes("timeout")) {
      errMsg = e.requestTimedOut;
    } else if (err instanceof TypeError) {
      errMsg = e.dnsOrNetwork;
    }
    return jsonResponse({
      domain,
      httpsStatus: 0,
      httpsOk: false,
      responseTime: 0,
      hsts: null,
      hstsDetails: null,
      server: null,
      certificates: [],
      activeCertificate: null,
      error: errMsg,
    });
  }
}
