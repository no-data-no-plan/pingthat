import { isValidUrl, jsonResponse, errorResponse, parseBody, isBodyTooLarge, fetchWithManualRedirects } from "./_shared";
import { getLang, getApiErrors } from "./_i18n";

const SAMPLES = 5;
const GAP_MS = 150;
const TIMEOUT_MS = 5000;

export async function onRequestPost(context: { request: Request }) {
  const url = new URL(context.request.url);
  const e = getApiErrors(getLang(url));

  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse(e.bodyTooLarge, 413);
  if (!body || typeof body.url !== "string") return errorResponse(e.missingUrl);

  const target = isValidUrl(body.url);            // SSRF-safe: null for blocked/internal/invalid
  if (!target) return errorResponse(e.invalidOrBlockedUrl);

  const redirectI18n = {
    tooManyRedirects: e.tooManyRedirects,
    invalidRedirectTarget: e.invalidRedirectTarget,
    redirectToNonHttp: e.redirectToNonHttp,
    redirectToBlockedHost: e.redirectToBlockedHost,
  };

  const samples: number[] = [];
  let lastStatus = 0;
  let lastError: string | null = null;

  for (let i = 0; i < SAMPLES; i++) {
    const start = Date.now();
    try {
      let fr = await fetchWithManualRedirects(
        target,
        { method: "HEAD", signal: AbortSignal.timeout(TIMEOUT_MS), headers: { "User-Agent": "PingThat/1.0 (https://pingthat.dev)" } },
        5,
        redirectI18n
      );
      // Some servers reject HEAD (405/501) — fall back to GET once for this sample.
      if (!("error" in fr) && (fr.response.status === 405 || fr.response.status === 501)) {
        fr = await fetchWithManualRedirects(
          target,
          { method: "GET", signal: AbortSignal.timeout(TIMEOUT_MS), headers: { "User-Agent": "PingThat/1.0 (https://pingthat.dev)" } },
          5,
          redirectI18n
        );
      }
      const elapsed = Date.now() - start;
      if ("error" in fr) { lastError = fr.error; }
      else { samples.push(elapsed); lastStatus = fr.response.status; }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.message?.includes("timeout")) lastError = e.requestTimedOut;
      else if (err instanceof TypeError) lastError = e.dnsOrNetwork;
      else lastError = e.connectionFailed;
    }
    if (i < SAMPLES - 1) await new Promise((r) => setTimeout(r, GAP_MS));
  }

  if (samples.length === 0) {
    return jsonResponse({ host: target, sent: SAMPLES, received: 0, samples: [], status: 0, error: lastError ?? e.unreachable });
  }
  return jsonResponse({ host: target, sent: SAMPLES, received: samples.length, samples, status: lastStatus });
}
