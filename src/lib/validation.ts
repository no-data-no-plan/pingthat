/**
 * Client-side input validation helpers.
 * These mirror the validation in functions/api/_shared.ts so users get
 * instant feedback before sending a request to the backend.
 *
 * NOTE: These are the first line of defense only. The backend re-validates
 * everything — never trust client-side validation for security decisions.
 */

// Max domain length per DNS spec (RFC 1035).
const MAX_DOMAIN_LENGTH = 253;

/**
 * Validates a domain name (e.g., "example.com").
 * Rejects: IPs, localhost, underscores, IDN/unicode, empty strings.
 * Allows: subdomains, hyphens mid-label, 2+ letter TLD.
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') return false;
  const d = domain.trim().toLowerCase();
  if (d.length === 0 || d.length > MAX_DOMAIN_LENGTH) return false;
  // RFC 1035-ish: labels start/end alphanumeric, may contain hyphens; TLD 2+ letters.
  const re = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;
  return re.test(d);
}

/**
 * Validates a URL. If no scheme is present, assumes https://.
 * Returns the normalized URL string, or null if invalid.
 * Rejects non-http(s) schemes, empty strings, and malformed URLs.
 * Does NOT check for private IPs — that's the backend's job.
 */
export function normalizeUrl(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname) return null;
    return url.href;
  } catch {
    return null;
  }
}

/**
 * Quick check: is this string a valid URL (http/https)?
 */
export function isValidUrl(input: string): boolean {
  return normalizeUrl(input) !== null;
}

/**
 * Localized validation error messages.
 */
export function getValidationError(kind: 'domain' | 'url', lang: 'en' | 'es'): string {
  if (kind === 'domain') {
    return lang === 'es'
      ? 'Introduce un nombre de dominio válido (ej. ejemplo.com).'
      : 'Please enter a valid domain name (e.g., example.com).';
  }
  return lang === 'es'
    ? 'Introduce una URL válida (http:// o https://).'
    : 'Please enter a valid URL (http:// or https://).';
}
