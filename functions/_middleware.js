export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname.endsWith('.pages.dev')) {
    return new Response(null, {
      status: 301,
      headers: { 'Location': 'https://pingthat.dev' + url.pathname + url.search }
    });
  }
  return await context.next();
}
