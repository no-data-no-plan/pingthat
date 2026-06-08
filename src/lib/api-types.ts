/**
 * Typed interfaces for all PingThat API responses.
 * These match the exact JSON shapes returned by the Cloudflare Pages Functions
 * in functions/api/*.ts.
 */

/** Returned by /api/check-site — used by IsItDown and IsItUp */
export interface CheckSiteResult {
  url: string;
  status: number;
  statusText: string;
  responseTime: number;
  server: string | null;
  contentType: string | null;
  up: boolean;
  error?: string;
}

/** Returned by /api/http-headers */
export interface HttpHeadersSecurityChecks {
  hsts: boolean;
  csp: boolean;
  xFrameOptions: boolean;
  xContentType: boolean;
  referrerPolicy: boolean;
  permissionsPolicy: boolean;
}

export interface HttpHeadersResult {
  url: string;
  status: number;
  headers: Record<string, string>;
  filteredCount: number;
  security: HttpHeadersSecurityChecks;
  securityScore: number;
  maxScore: number;
}

/** Certificate entry returned within SslCheckerResult */
export interface SslCertificate {
  issuer: string;
  commonName: string;
  notBefore: string | null;
  notAfter: string | null;
  serialNumber: string | null;
  sans: string[];
  daysRemaining: number | null;
}

export interface HstsDetails {
  raw: string;
  maxAge: number | null;
  includeSubDomains: boolean;
  preload: boolean;
  preloadEligible: boolean;
}

/** Returned by /api/ssl-checker */
export interface SslCheckerResult {
  domain: string;
  httpsStatus: number;
  httpsOk: boolean;
  responseTime: number;
  hsts: string | null;
  hstsDetails: HstsDetails | null;
  server: string | null;
  certificates: SslCertificate[];
  activeCertificate: SslCertificate | null;
  /** Sources tried for CT log lookup, in order. Surfaced for diagnostics. */
  ctSourceTried?: string[];
  /** Non-fatal: CT log lookup failed or returned no certs. HTTPS/HSTS data
   *  still valid. */
  ctError?: string;
  error?: string;
}

/** Single hop in a redirect chain */
export interface RedirectChainStep {
  url: string;
  status: number;
  statusText: string;
  location: string | null;
}

/** Returned by /api/redirect-checker */
export interface RedirectCheckerResult {
  originalUrl: string;
  finalUrl: string;
  redirectCount: number;
  chain: RedirectChainStep[];
  error?: string;
}

/** Returned by /api/email-auth */
export interface EmailAuthResult {
  domain: string;
  spf: { found: boolean; record: string | null; assessment: "pass" | "warning" | "fail" };
  dmarc: { found: boolean; record: string | null; policy: string | null; assessment: "pass" | "warning" | "fail" };
  dkim: { found: boolean; selectors: Array<{ selector: string; record: string }>; assessment: "pass" | "warning" | "fail" };
  error?: string;
}

/** Single port scan entry returned within PortScanResult */
export interface PortScanEntry {
  port: number;
  status: "open" | "closed" | "filtered" | "unverifiable";
  service: string;
}

/** Returned by /api/port-scan */
export interface PortScanResult {
  host: string;
  results: PortScanEntry[];
  error?: string;
}

/** Returned by /api/ping */
export interface PingResult {
  host: string;
  sent: number;
  received: number;
  samples: number[];   // per-successful-request latency in ms (from CF edge)
  status: number;      // final HTTP status (0 if all failed)
  error?: string;
}

/** Returned by /api/whois-lookup */
export interface WhoisLookupResult {
  domain: string;
  found: boolean;
  registrar?: string | null;
  created?: string | null;
  updated?: string | null;
  expires?: string | null;
  nameservers?: string[];
  statuses?: string[];
  rdapLink?: string | null;
  error?: string;
}
