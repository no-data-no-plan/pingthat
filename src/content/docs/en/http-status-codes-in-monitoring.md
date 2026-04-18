---
title: "HTTP Status Codes in Monitoring — Which Trigger Alerts, Which Don't"
description: "Not every non-200 is an outage. A practical guide to which HTTP status codes should page you and which are just noise."
category: http
relatedToolIds: ["http-headers", "redirect-checker", "is-it-up", "site-speed"]
publishedAt: 2026-04-17
lang: en
tags: ["http", "monitoring", "status-codes", "alerts"]
excerpt: "Alerting on every non-2xx is how you train your team to ignore alerts. Here is a saner mapping of status codes to severity."
faq:
  - q: "Should I alert on HTTP 429 responses?"
    a: "Usually no. A 429 Too Many Requests almost always means your own monitor is hitting a rate limit, not that users are seeing outages. The fix is to back off the probe frequency or add the monitor to an allowlist, not to page someone. The exception is when 429s appear from real user traffic in your application logs — that signals you need more capacity or a better rate-limit tier. For the monitor itself, suppress 429 alerts and lower the probe rate."
  - q: "Is a 503 Service Unavailable always an outage?"
    a: "Not always. A well-designed application serves 503 with a Retry-After header during planned deploys or maintenance, and that is expected behavior. The rule: 503 with Retry-After or during a known maintenance window is a warning, 503 without either is critical. Configure your monitor to read a maintenance flag or parse the Retry-After header, and suppress alerts when those indicate planned downtime. Recurring 503s during normal hours mean your app is out of capacity and you should page."
  - q: "Do 3xx redirect responses count as downtime?"
    a: "No, as long as the redirect chain ends in a valid 2xx. Configure your monitor to follow redirects up to 5 hops and evaluate the final status. A 301 to a working destination is not an outage — a 301 to a broken destination is. Redirect loops and chains longer than 3 hops usually indicate misconfiguration. Use a redirect checker periodically to audit your redirects for accidental loops, method changes (POST to GET), or chains that drop query parameters."
  - q: "When should a 404 trigger an alert?"
    a: "Alert when a 404 appears on a URL that you explicitly monitor — something that should exist and used to return 2xx. Do not alert on 404s from random crawled paths, scanner probes, or URLs you never advertised. The severity signal is a sudden 404 on a stable monitored endpoint, which almost always means a deploy removed or moved the resource. For analytics purposes track aggregate 404 rates separately, but page only on monitored-URL failures."
  - q: "Should I page on a single 5xx response?"
    a: "No. A single 500 is rounding error in most setups — network weather, a retry storm, or a one-off crash. Page on N consecutive failures (typically 2 or 3) from multiple geographic probes, and only when a majority of probes agree on the failure. This smooths out transient blips without losing signal on real outages. For stricter SLAs (99.99% and up) probe every 10-30 seconds from 3+ regions so N=2 still fires within your downtime budget."
---

A naive uptime monitor treats anything outside the 200-299 range as a failure. That is why so many teams have alert fatigue — they are paged for 301 redirects, 401 auth prompts, and 429 rate-limit blips that are not actually outages. Mapping HTTP status codes to alert severity correctly is one of the cheapest ways to cut pager noise without losing real signal.

## The five status classes at a glance

| Class | Meaning | Default action for a monitor |
|---|---|---|
| 1xx Informational | Rare in the wild (100 Continue, 101 Switching Protocols) | Ignore, they are not final responses |
| 2xx Success | Request succeeded | Green |
| 3xx Redirection | Resource moved | Follow redirects, check final status |
| 4xx Client error | Something about the request was wrong | Context-dependent, often not an outage |
| 5xx Server error | Server knows it failed | Alert, almost always |

That table is the starting point, not the rule. Each class has exceptions worth understanding.

## 2xx: not as simple as it looks

A 200 response means the server responded. It does not mean the response is correct. A page can return HTTP 200 with:

- An HTML error page that says "We're sorry, something went wrong"
- An empty body because a backend API silently failed
- A login form because the session expired and the app does not return 401
- A JSON `{"error": "database unavailable"}` with a 200 wrapper (bad API design, very common)

A real HTTP monitor does content validation on top of status: check for an expected string, a JSON field, a content-length minimum. If your homepage always contains `<title>Example Corp</title>`, match on that — a 200 with an empty body should page you. You can inspect actual headers and body with the [HTTP headers tool](/http-headers/).

## 3xx: follow the chain, then judge

A 301 or 302 to a working destination is not an outage. A 301 to a broken destination is. A redirect loop is definitely an outage. Most monitors should follow redirects (up to a limit, say 5) and evaluate the final status.

Key 3xx codes:

- **301 Moved Permanently** — cached hard, use for final URL changes only. Getting this wrong is a long-term SEO bug, not an outage
- **302 Found** — temporary, re-requested each time. Normal for "login then redirect back"
- **303 See Other** — Post/Redirect/Get pattern, always GET on the redirect
- **307 Temporary Redirect / 308 Permanent Redirect** — same as 302/301 but method-preserving (a POST redirected with 307 stays a POST)
- **304 Not Modified** — cache validation; treat as 200 for monitoring purposes

The [redirect checker](/redirect-checker/) helps audit redirect chains and spot loops. A chain longer than 3 hops is almost always a bug.

## 4xx: the nuance zone

This is where most false-positive pages happen. Not every 4xx is an outage:

- **400 Bad Request** — your monitor sent a bad request, or a WAF is rejecting the probe. Investigate the monitor, not the server
- **401 Unauthorized / 403 Forbidden** — almost never an outage on its own. If your monitor hit a page that requires auth and got 401, fix the monitor. A 403 on a page that used to be public IS an outage (misconfigured access control)
- **404 Not Found** — context-dependent. A 404 on a URL that should exist is an alert. A 404 on a random crawled path is not
- **408 Request Timeout** — the server gave up waiting for the client; on the client side, a timeout looks like this. Worth alerting on if recurring
- **410 Gone** — intentional, do not alert
- **429 Too Many Requests** — rate limiting, often your monitor itself hitting a threshold. Back off the probe frequency, do not alert
- **451 Unavailable for Legal Reasons** — you have bigger problems than monitoring

The rule of thumb: alert on 4xx only when the request shape has not changed and the previous response was 2xx. Sudden 404s on stable URLs are suspicious. Sudden 401s on public endpoints mean someone pushed broken auth middleware. Confirm reachability from outside your network with [is-it-up](/is-it-up/).

## 5xx: almost always alert

Server errors are the server admitting it failed:

- **500 Internal Server Error** — something crashed, always alert
- **501 Not Implemented** — rare, usually means a load balancer is misconfigured
- **502 Bad Gateway** — upstream is not responding or returned garbage. Alert
- **503 Service Unavailable** — can be intentional (maintenance page) or unintentional (out of capacity). Alert, then check for a planned maintenance flag
- **504 Gateway Timeout** — upstream did not respond in time. Alert
- **507 Insufficient Storage** — disk full, alert hard
- **511 Network Authentication Required** — captive portal, your monitor is somewhere weird

503 is the one to think about. A well-designed app serves 503 with a `Retry-After` header during deploys or maintenance. You can either suppress alerts when `Retry-After` is present, or maintain a maintenance-window flag that your monitor reads.

## A sane alert severity map

Here is what I actually use:

| Status | Severity |
|---|---|
| 200 with valid content match | OK |
| 200 with content mismatch | Warning, escalate after 3 consecutive |
| 301/302/307/308 followed to 2xx | OK |
| 3xx chain > 5 hops or loop | Warning |
| 401/403 on public endpoint | Critical |
| 404 on monitored URL | Critical |
| 429 | Suppress, lower probe frequency |
| 500, 502, 504 | Critical, page immediately |
| 503 with Retry-After or in maintenance window | Warning |
| 503 otherwise | Critical |
| Connection refused, DNS failure, TLS error | Critical |

Adjust for your environment — a personal blog does not need pages at 2am, a payment processor does.

## Consecutive failures, not single blips

A single 500 is a rounding error in most setups. Alert on N consecutive failures (typically 2 or 3) from multiple geographic probes:

```bash
# Typical curl-based probe, emits exit codes your monitor can trap
curl -sS -o /dev/null -w "%{http_code} %{time_total}\n" \
  --max-time 10 \
  --retry 2 --retry-delay 5 \
  https://example.com/health
```

Good monitors probe from 3+ locations and only alert when a majority see the failure. A single probe seeing 500 probably means network weather, not an outage.

## Don't alert on what you can't fix

If your monitor alerts on status codes your team cannot affect, it is noise. Third-party API 503s your app surfaces as 502: alert, because you can add a circuit breaker. Third-party 503s from an unrelated partner dashboard: do not alert, you are going to ignore them anyway.

## Further reading on PingThat

- [/docs/ssl-certificate-monitoring-basics/](/docs/ssl-certificate-monitoring-basics/) — cert errors often surface as connection failures, not HTTP codes
- [/docs/dns-propagation-explained/](/docs/dns-propagation-explained/) — DNS failures surface differently than HTTP ones
- [/docs/uptime-sla-math/](/docs/uptime-sla-math/) — how consecutive failure windows affect your measured uptime
