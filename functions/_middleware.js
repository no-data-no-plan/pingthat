import { ES_PATHS } from './_es-paths.gen.js';

// AdSense/Google image hosts — needed for ad creatives to render under tightened img-src
const AD_IMG = "https://*.googlesyndication.com https://*.doubleclick.net https://*.googleusercontent.com https://*.gstatic.com https://*.google.com https://*.ggpht.com https://*.adtrafficquality.google";

// Paths the geo-redirect must never touch — anything API/asset/probe-related
// the Astro build emits, plus paths Cloudflare itself controls.
const GEO_REDIRECT_BYPASS_PREFIXES = [
  '/api/',
  '/_astro/',
  '/_app/',
  '/cdn-cgi/',
  '/.well-known/',
  '/functions/',
];
const GEO_REDIRECT_BYPASS_EXACT = new Set([
  '/sitemap.xml',
  '/sitemap-index.xml',
  '/robots.txt',
  '/llms.txt',
  '/llms-full.txt',
  '/manifest.json',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon.svg',
]);
const GEO_REDIRECT_BYPASS_SUFFIXES = ['.txt', '.xml', '.json', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico', '.woff', '.woff2', '.css', '.js', '.map'];

// Bot UA fragments — keep search/AI crawlers on the canonical EN URL so we
// don't fragment ranking signals across locales for the same content. The
// language banner (Phase 1B) will give human ES visitors a one-click out
// in the future redesign; for now we redirect them silently.
const BOT_UA_HINTS = [
  'bot', 'crawler', 'spider', 'slurp', 'archiver', 'preview',
  'fetch', 'monitor', 'scan', 'curl/', 'wget/', 'python-requests',
  'go-http-client', 'httpclient', 'lighthouse', 'pagespeed',
  'headlesschrome', 'phantomjs',
];

function isBot(ua) {
  if (!ua) return true; // missing UA → treat as bot (probes, scripts)
  const low = ua.toLowerCase();
  return BOT_UA_HINTS.some(h => low.includes(h));
}

function prefersSpanish(acceptLanguage) {
  if (!acceptLanguage) return false;
  // Accept-Language is a comma-list of weighted entries. The first non-zero
  // weighted entry that starts with "es" is what the user prefers most.
  const entries = acceptLanguage.split(',').map(part => {
    const [tag, ...params] = part.trim().split(';');
    const q = params.find(p => p.startsWith('q='));
    return {
      tag: (tag || '').trim().toLowerCase(),
      q: q ? parseFloat(q.slice(2)) : 1.0,
    };
  }).filter(e => e.q > 0).sort((a, b) => b.q - a.q);
  if (entries.length === 0) return false;
  return entries[0].tag.startsWith('es');
}

function shouldGeoRedirect(url, request) {
  const path = url.pathname;
  // Already on /es/* → no redirect
  if (path.startsWith('/es/') || path === '/es') return false;
  // Bypass paths
  if (GEO_REDIRECT_BYPASS_EXACT.has(path)) return false;
  if (GEO_REDIRECT_BYPASS_PREFIXES.some(p => path.startsWith(p))) return false;
  if (GEO_REDIRECT_BYPASS_SUFFIXES.some(s => path.endsWith(s))) return false;
  // Cookie override — visitor explicitly chose EN
  const cookie = request.headers.get('cookie') || '';
  if (cookie.includes('pt_lang_pref=en')) return false;
  // Bot bypass — preserve EN canonical signals for search engines
  if (isBot(request.headers.get('user-agent'))) return false;
  // Spanish preference required
  if (!prefersSpanish(request.headers.get('accept-language'))) return false;
  // Validate ES counterpart exists — never 302 to a 404
  if (!ES_PATHS.has(path)) return false;
  return true;
}

// Shared script allowlist
const SCRIPT_ALLOW = "https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.googletagservices.com https://adservice.google.com https://adservice.google.es https://fundingchoicesmessages.google.com https://*.adtrafficquality.google https://static.cloudflareinsights.com https://www.googletagmanager.com";

// Enforcing CSP (strict) for HTML — no 'unsafe-inline'. Requires per-request nonce on
// every <script> tag, which HTMLRewriter stamps below.
function buildCSP(nonce) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${SCRIPT_ALLOW}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    `img-src 'self' data: blob: ${AD_IMG} https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com`,
    "connect-src 'self' https://pagead2.googlesyndication.com https://csi.gstatic.com https://formspree.io https://ipapi.co https://api.ipify.org https://cloudflare-dns.com https://*.google.com https://*.adtrafficquality.google https://*.cloudflareinsights.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
    "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://www.google.com https://*.adtrafficquality.google https://fundingchoicesmessages.google.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://formspree.io",
    "frame-ancestors 'none'",
    "report-to csp",
    "report-uri https://csp.pingthat.dev/r",
    "upgrade-insecure-requests",
  ].join('; ');
}

// Static fallback CSP for non-HTML responses — no nonce needed.
const CSP_STATIC = [
  "default-src 'self'",
  `script-src 'self' ${SCRIPT_ALLOW}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  `img-src 'self' data: blob: ${AD_IMG} https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com`,
  "connect-src 'self' https://pagead2.googlesyndication.com https://csi.gstatic.com https://formspree.io https://ipapi.co https://api.ipify.org https://cloudflare-dns.com https://*.google.com https://*.adtrafficquality.google https://*.cloudflareinsights.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://www.google.com https://*.adtrafficquality.google https://fundingchoicesmessages.google.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://formspree.io",
  "frame-ancestors 'none'",
  "report-to csp",
  "report-uri https://csp.pingthat.dev/r",
  "upgrade-insecure-requests",
].join('; ');

const PERMISSIONS_POLICY = [
  'accelerometer=()',
  'ambient-light-sensor=()',
  'autoplay=()',
  'battery=()',
  'camera=()',
  'display-capture=()',
  'document-domain=()',
  'encrypted-media=()',
  'fullscreen=(self)',
  'gamepad=()',
  'geolocation=()',
  'gyroscope=()',
  'hid=()',
  'idle-detection=()',
  'magnetometer=()',
  'microphone=()',
  'midi=()',
  'payment=()',
  'picture-in-picture=(self "https://googleads.g.doubleclick.net")',
  'publickey-credentials-get=()',
  'screen-wake-lock=()',
  'serial=()',
  'usb=()',
  'web-share=()',
  'xr-spatial-tracking=()',
].join(', ');

// HTMLRewriter handler: stamp a nonce on every <script> tag in HTML responses.
class NonceInjector {
  constructor(nonce) { this.nonce = nonce; }
  element(element) { element.setAttribute('nonce', this.nonce); }
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname.endsWith('.pages.dev')) {
    return new Response(null, {
      status: 301,
      headers: { 'Location': 'https://pingthat.dev' + url.pathname + url.search }
    });
  }

  if (url.pathname === '/privacy/' || url.pathname === '/privacy') {
    return Response.redirect('https://pingthat.dev/privacy-policy/' + url.search, 301);
  }
  if (url.pathname === '/es/privacy/' || url.pathname === '/es/privacy') {
    return Response.redirect('https://pingthat.dev/es/privacy-policy/' + url.search, 301);
  }

  // Spanish-preference geo redirect (CW audit 2026-05-03 finding B):
  // 24/51 PT users 28d are Spain landing on EN URLs because GSC ranks the
  // EN canonical for queries like "calculadora subneteo". A 302 (not 301)
  // sends them to the equivalent /es/{path} only when:
  //   - Accept-Language starts with es*
  //   - the visitor is not a bot (preserve EN ranking signals)
  //   - the path actually has an /es/ counterpart in this build
  //   - no pt_lang_pref=en cookie is set (visitor opted out)
  if (shouldGeoRedirect(url, context.request)) {
    const target = 'https://pingthat.dev/es' + url.pathname + url.search;
    return new Response(null, {
      status: 302,
      headers: {
        'Location': target,
        // Vary on these headers so CDNs don't pollute one visitor's cache
        // with another's locale decision.
        'Vary': 'Accept-Language, Cookie',
        'Cache-Control': 'no-store',
      },
    });
  }

  let response = await context.next();

  const contentType = response.headers.get('content-type') || '';
  const isHtml = contentType.includes('text/html');
  const nonce = crypto.randomUUID().replace(/-/g, '');

  if (isHtml) {
    response = new HTMLRewriter()
      .on('script', new NonceInjector(nonce))
      .transform(response);
  }

  const newHeaders = new Headers(response.headers);
  newHeaders.delete('Access-Control-Allow-Origin');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', PERMISSIONS_POLICY);
  newHeaders.set('Reporting-Endpoints', 'csp="https://csp.pingthat.dev/r"');
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  newHeaders.set('Content-Security-Policy', isHtml ? buildCSP(nonce) : CSP_STATIC);
  newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  newHeaders.set('Cross-Origin-Resource-Policy', 'same-site');
  newHeaders.set('X-Permitted-Cross-Domain-Policies', 'none');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
