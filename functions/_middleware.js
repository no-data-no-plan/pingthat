const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.googletagservices.com https://adservice.google.com https://adservice.google.es https://fundingchoicesmessages.google.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://pagead2.googlesyndication.com https://formspree.io https://ipapi.co https://api.ipify.org https://*.google.com https://*.cloudflareinsights.com",
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://www.google.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://formspree.io",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname.endsWith('.pages.dev')) {
    return new Response(null, {
      status: 301,
      headers: { 'Location': 'https://pingthat.dev' + url.pathname + url.search }
    });
  }
  const response = await context.next();
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-Frame-Options', 'SAMEORIGIN');
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  newHeaders.set('Content-Security-Policy', CSP);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
