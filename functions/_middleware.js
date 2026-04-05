// AdSense/Google image hosts — needed for ad creatives to render under tightened img-src
const AD_IMG = "https://*.googlesyndication.com https://*.doubleclick.net https://*.googleusercontent.com https://*.gstatic.com https://*.google.com https://*.ggpht.com https://*.adtrafficquality.google";

// Shared script allowlist
const SCRIPT_ALLOW = "https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.googletagservices.com https://adservice.google.com https://adservice.google.es https://fundingchoicesmessages.google.com https://*.adtrafficquality.google https://static.cloudflareinsights.com";

// Enforcing CSP (strict) for HTML — no 'unsafe-inline'. Requires per-request nonce on
// every <script> tag, which HTMLRewriter stamps below.
function buildCSP(nonce) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${SCRIPT_ALLOW}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
    `img-src 'self' data: blob: ${AD_IMG}`,
    "connect-src 'self' https://pagead2.googlesyndication.com https://formspree.io https://ipapi.co https://api.ipify.org https://cloudflare-dns.com https://*.google.com https://*.adtrafficquality.google https://*.cloudflareinsights.com",
    "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://www.google.com https://*.adtrafficquality.google",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://formspree.io",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');
}

// Static fallback CSP for non-HTML responses — no nonce needed.
const CSP_STATIC = [
  "default-src 'self'",
  `script-src 'self' ${SCRIPT_ALLOW}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
  `img-src 'self' data: blob: ${AD_IMG}`,
  "connect-src 'self' https://pagead2.googlesyndication.com https://formspree.io https://ipapi.co https://api.ipify.org https://cloudflare-dns.com https://*.google.com https://*.adtrafficquality.google https://*.cloudflareinsights.com",
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://www.google.com https://*.adtrafficquality.google",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://formspree.io",
  "frame-ancestors 'none'",
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
  'picture-in-picture=()',
  'publickey-credentials-get=()',
  'screen-wake-lock=()',
  'serial=()',
  'sync-xhr=(self)',
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
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
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
