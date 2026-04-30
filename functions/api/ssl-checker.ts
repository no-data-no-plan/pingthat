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

    // CT log lookup: certspotter primary, crt.sh fallback.
    //
    // Pre-Nielsen-audit (2026-04-30, F1): only crt.sh was queried, with errors
    // silently swallowed → empty `certificates: []` for popular domains where
    // crt.sh returns 502 (e.g. google.com, microsoft.com, cloudflare.com). The
    // tool was effectively dead despite the H1 promising "certificate
    // transparency logs". certspotter's API is more reliable, returns smaller
    // payloads, and still provides issuer + validity + SANs.
    let certs: any[] = [];
    let ctSourceTried: string[] = [];
    let ctError: string | null = null;
    // Track per-source success/failure (Nielsen audit Round-2 review fix
    // 2026-04-30). Without separate flags, certspotter 429 + crt.sh
    // clean-empty-200 was misdiagnosed as "logs unavailable" even though
    // crt.sh definitively reported "no entries". Surface "unavailable"
    // ONLY when every queried source errored.
    //
    // Certspotter free tier limit is ~100 queries/day (not per-hour) shared
    // across the CF Worker egress IP. PT will exhaust this under any real
    // traffic — long-term plan is either an authenticated key or to swap
    // primary back to crt.sh. Today's behavior: when certspotter 429s the
    // crt.sh fallback runs, and only if THAT also fails do we tell the user
    // "unavailable".
    let certspotterFailed = false;
    let crtShSucceeded = false;
    let crtShFailed = false;

    // Source 1: certspotter (primary). Reliable for popular domains; returns
    // unexpired issuances by default and a manageable payload size.
    try {
      ctSourceTried.push("certspotter");
      const csRes = await fetch(
        `https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(domain)}` +
          `&include_subdomains=false&expand=dns_names&expand=issuer`,
        {
          signal: AbortSignal.timeout(8000),
          headers: { "User-Agent": "PingThat/1.0 (https://pingthat.dev)" },
        }
      );
      if (csRes.ok) {
        const csCerts = (await csRes.json()) as any[];
        if (Array.isArray(csCerts) && csCerts.length > 0) {
          // Sort by not_before desc so the freshest issuance is first.
          csCerts.sort((a, b) => {
            const ta = Date.parse(a.not_before || "");
            const tb = Date.parse(b.not_before || "");
            return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
          });
          certs = csCerts.slice(0, 5).map((c: any) => ({
            issuer: c.issuer?.friendly_name || c.issuer?.name || "Unknown",
            commonName: domain,
            notBefore: c.not_before || null,
            notAfter: c.not_after || null,
            serialNumber: null, // certspotter doesn't expose serial directly
            sans: Array.isArray(c.dns_names) ? c.dns_names : [],
            daysRemaining: daysBetween(c.not_after),
          }));
        }
      } else {
        // 4xx (incl. 429 rate-limit) or 5xx — treat as transient unavailability.
        certspotterFailed = true;
      }
    } catch {
      // certspotter timeout/network — fall through to crt.sh
      certspotterFailed = true;
    }

    // Source 2: crt.sh fallback. Less reliable (502s on popular domains) but
    // useful when certspotter returns nothing for niche subdomains.
    if (certs.length === 0) {
      try {
        ctSourceTried.push("crt.sh");
        const MAX_CRT_BYTES = 1 * 1024 * 1024;
        const crtRes = await fetch(
          `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json&exclude=expired&limit=50`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (crtRes.ok) {
          const contentLength = crtRes.headers.get("content-length");
          if (contentLength && parseInt(contentLength, 10) > MAX_CRT_BYTES) {
            throw new Error("crt.sh response too large");
          }
          const text = await crtRes.text();
          if (text.length > MAX_CRT_BYTES) throw new Error("crt.sh response too large");
          const allCerts = JSON.parse(text) as any[];
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
          // crt.sh returned 200 OK; whether `allCerts` was empty or not, the
          // CT corpus has been definitively probed for this domain.
          crtShSucceeded = true;
        } else {
          crtShFailed = true;
        }
      } catch {
        crtShFailed = true;
      }
    }

    if (certs.length === 0) {
      // Surface "temporarily unavailable" ONLY when every queried source
      // errored. If certspotter 429s but crt.sh returns clean-empty-200,
      // we know the domain genuinely has no current CT entries — say so
      // instead of misleading the user.
      const allFailed =
        certspotterFailed && (crtShFailed || (!crtShSucceeded && !crtShFailed));
      ctError = allFailed ? e.ctLogsUnavailable : e.noCertificatesFound;
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
      // Surface ctSourceTried only when ctError is set — diagnostic info
      // useful in error states, noise on successful responses (Round-2
      // review fix 2026-04-30: avoid leaking internal source names to
      // every API consumer / scraper).
      ...(ctError ? { ctError, ctSourceTried } : {}),
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
