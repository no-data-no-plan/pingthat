import { isValidUrl, jsonResponse, errorResponse, parseBody, isBodyTooLarge } from "./_shared";
import { getLang, getApiErrors } from "./_i18n";

interface Env { CRUX_API_KEY?: string; }

type FormFactor = "PHONE" | "DESKTOP" | "ALL_FORM_FACTORS";

interface MetricPercentiles { p75?: number; }
interface MetricHistogram { start: number | string; end?: number | string; density: number; }
interface Metric { histogram: MetricHistogram[]; percentiles: MetricPercentiles; }

const METRIC_KEYS = [
  "largest_contentful_paint",
  "interaction_to_next_paint",
  "cumulative_layout_shift",
  "first_contentful_paint",
  "experimental_time_to_first_byte",
] as const;

type MetricKey = typeof METRIC_KEYS[number];

const THRESHOLDS: Record<MetricKey, { good: number; poor: number; unit: "ms" | "cls" }> = {
  largest_contentful_paint: { good: 2500, poor: 4000, unit: "ms" },
  interaction_to_next_paint: { good: 200, poor: 500, unit: "ms" },
  cumulative_layout_shift: { good: 0.1, poor: 0.25, unit: "cls" },
  first_contentful_paint: { good: 1800, poor: 3000, unit: "ms" },
  experimental_time_to_first_byte: { good: 800, poor: 1800, unit: "ms" },
};

function ratingFor(key: MetricKey, p75: number): "good" | "needs-improvement" | "poor" {
  const th = THRESHOLDS[key];
  if (p75 <= th.good) return "good";
  if (p75 <= th.poor) return "needs-improvement";
  return "poor";
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const url = new URL(context.request.url);
  const e = getApiErrors(getLang(url));

  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse(e.bodyTooLarge, 413);
  if (!body || typeof body.url !== "string") return errorResponse(e.missingUrl);

  const normalized = isValidUrl(body.url.trim());
  if (!normalized) return errorResponse(e.invalidOrBlockedUrl);

  const apiKey = context.env?.CRUX_API_KEY;
  if (!apiKey) {
    return jsonResponse({
      error: "CrUX API key not configured",
      configMissing: true,
    }, 503);
  }

  const formFactor: FormFactor = body.formFactor === "DESKTOP" ? "DESKTOP" : "PHONE";
  // Try origin-level first (broader coverage), fall back to URL-level on 404
  const origin = (() => {
    try { return new URL(normalized).origin; } catch { return null; }
  })();

  const tryFetch = async (payload: Record<string, unknown>): Promise<Response> => {
    return fetch(`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, formFactor, metrics: METRIC_KEYS }),
      signal: AbortSignal.timeout(10000),
    });
  };

  try {
    let res: Response | null = null;
    let scope: "url" | "origin" = "url";
    // URL-level first
    res = await tryFetch({ url: normalized });
    if (res.status === 404 && origin) {
      // Fall back to origin-level
      res = await tryFetch({ origin });
      scope = "origin";
    } else if (res.ok) {
      scope = "url";
    } else if (!res.ok && origin) {
      const originRes = await tryFetch({ origin });
      if (originRes.ok) { res = originRes; scope = "origin"; }
    }

    if (!res.ok) {
      if (res.status === 404) {
        return jsonResponse({ url: normalized, notEnoughData: true, formFactor });
      }
      const errText = await res.text().catch(() => "");
      return jsonResponse({ error: `CrUX ${res.status}: ${errText.slice(0, 200)}` }, 502);
    }

    const data = await res.json() as { record?: { metrics?: Record<string, Metric>; key?: any; collectionPeriod?: any } };
    const metrics = data.record?.metrics || {};

    const parsed: Record<string, { p75: number | null; rating: string | null; histogram: MetricHistogram[] }> = {};
    for (const key of METRIC_KEYS) {
      const m = metrics[key];
      if (!m) { parsed[key] = { p75: null, rating: null, histogram: [] }; continue; }
      const rawP75 = m.percentiles?.p75;
      const p75 = typeof rawP75 === "number" ? rawP75 : typeof rawP75 === "string" ? parseFloat(rawP75) : null;
      parsed[key] = {
        p75: p75 !== null && !isNaN(p75) ? p75 : null,
        rating: p75 !== null && !isNaN(p75) ? ratingFor(key, p75) : null,
        histogram: m.histogram || [],
      };
    }

    return jsonResponse({
      url: normalized,
      scope,
      formFactor,
      collectionPeriod: data.record?.collectionPeriod || null,
      metrics: parsed,
    });
  } catch (err: any) {
    if (err?.name === "AbortError" || err?.name === "TimeoutError") {
      return errorResponse(e.requestTimedOut, 504);
    }
    if (err instanceof TypeError) {
      return errorResponse(e.dnsOrNetwork, 502);
    }
    return errorResponse("Site speed lookup failed", 502);
  }
}
