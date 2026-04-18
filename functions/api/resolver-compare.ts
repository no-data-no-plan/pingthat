import { isValidDomain, jsonResponse, errorResponse, parseBody, isBodyTooLarge } from "./_shared";
import { getLang, getApiErrors } from "./_i18n";

interface Resolver {
  id: string;
  name: string;
  url: (name: string, type: string) => string;
  operator: string;
}

const RESOLVERS: Resolver[] = [
  {
    id: "cloudflare",
    name: "Cloudflare",
    operator: "1.1.1.1",
    url: (n, t) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(n)}&type=${t}`,
  },
  {
    id: "google",
    name: "Google",
    operator: "8.8.8.8",
    url: (n, t) => `https://dns.google/resolve?name=${encodeURIComponent(n)}&type=${t}`,
  },
  {
    id: "adguard",
    name: "AdGuard",
    operator: "94.140.14.14",
    url: (n, t) => `https://dns.adguard-dns.com/resolve?name=${encodeURIComponent(n)}&type=${t}`,
  },
  {
    id: "nextdns",
    name: "NextDNS",
    operator: "anycast.dns.nextdns.io",
    url: (n, t) => `https://dns.nextdns.io/trial?name=${encodeURIComponent(n)}&type=${t}`,
  },
];

const SUPPORTED_TYPES = new Set(["A", "AAAA", "MX", "TXT", "NS", "CNAME"]);

interface ResolverResult {
  id: string;
  name: string;
  operator: string;
  ok: boolean;
  status: number | null;
  responseMs: number;
  answers: Array<{ data: string; ttl: number }>;
  error?: string;
}

async function queryResolver(resolver: Resolver, name: string, type: string): Promise<ResolverResult> {
  const start = Date.now();
  try {
    const res = await fetch(resolver.url(name, type), {
      headers: { Accept: "application/dns-json" },
      signal: AbortSignal.timeout(5000),
    });
    const elapsed = Date.now() - start;
    if (!res.ok) {
      return { id: resolver.id, name: resolver.name, operator: resolver.operator, ok: false, status: res.status, responseMs: elapsed, answers: [], error: `HTTP ${res.status}` };
    }
    const data = await res.json() as { Status?: number; Answer?: Array<{ data: string; TTL?: number; ttl?: number; type?: number }> };
    const answers = (data.Answer || []).map((a) => ({ data: a.data, ttl: a.TTL ?? a.ttl ?? 0 }));
    return { id: resolver.id, name: resolver.name, operator: resolver.operator, ok: true, status: data.Status ?? null, responseMs: elapsed, answers };
  } catch (e: any) {
    const elapsed = Date.now() - start;
    const msg = e?.name === "AbortError" || e?.name === "TimeoutError" ? "timeout" : "network error";
    return { id: resolver.id, name: resolver.name, operator: resolver.operator, ok: false, status: null, responseMs: elapsed, answers: [], error: msg };
  }
}

export async function onRequestPost(context: { request: Request }) {
  const url = new URL(context.request.url);
  const e = getApiErrors(getLang(url));

  const body = await parseBody(context.request);
  if (isBodyTooLarge(body)) return errorResponse(e.bodyTooLarge, 413);
  if (!body || typeof body.domain !== "string") return errorResponse(e.missingDomain);

  const domain = body.domain.trim().toLowerCase();
  if (!isValidDomain(domain)) return errorResponse(e.invalidDomain);

  const rawType = typeof body.type === "string" ? body.type.toUpperCase() : "A";
  const type = SUPPORTED_TYPES.has(rawType) ? rawType : "A";

  const results = await Promise.all(RESOLVERS.map((r) => queryResolver(r, domain, type)));

  // Compute consistency: collapse each resolver's answers to sorted set of data
  const answerSets = results
    .filter((r) => r.ok)
    .map((r) => [...r.answers.map((a) => a.data)].sort().join("|"));
  const unique = new Set(answerSets);
  const consistent = unique.size <= 1;

  return jsonResponse({
    domain,
    type,
    consistent,
    divergentCount: unique.size,
    results,
  });
}
