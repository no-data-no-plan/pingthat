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
}

/** Returned by /api/ssl-checker */
export interface SslCheckerResult {
  domain: string;
  httpsStatus: number;
  httpsOk: boolean;
  responseTime: number;
  hsts: string | null;
  server: string | null;
  certificates: SslCertificate[];
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
