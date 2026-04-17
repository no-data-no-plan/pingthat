---
title: "SSL Certificate Monitoring — What to Watch and When to Alert"
description: "Practical guide to monitoring TLS certificates — expiry thresholds, CAA records, OCSP stapling, and what actually breaks in production."
category: monitoring
relatedToolIds: ["ssl-checker", "is-it-up"]
publishedAt: 2026-04-17
lang: en
tags: ["ssl", "tls", "certificates", "monitoring"]
excerpt: "An expired cert takes a site down hard. Here's what to monitor, what thresholds to set, and the subtle issues most checkers miss."
---

Every sysadmin has the same story: a production cert expired on a Sunday morning, and Monday was spent explaining why the checkout page was broken. Certificate monitoring is not glamorous, but it is one of the highest-ROI checks you can automate. This guide covers what to monitor beyond the expiry date, because "days until expiry" alone misses half the real failure modes.

## Why certificate expiry alone is not enough

Expiry is the obvious failure mode, but certs break in several other ways that a naive "valid until" check will not catch:

- The certificate chain is incomplete (a browser accepts it, `curl` does not, or vice versa)
- The hostname is missing from the Subject Alternative Name list
- The issuing CA was distrusted (Symantec, TrustCor, and others in recent years)
- OCSP stapling is misconfigured, causing 3-5 second TLS handshakes
- A CAA record blocks your renewal CA
- Your renewal ran, but the new cert was never loaded (nginx was not reloaded)

A proper monitor checks all of these. You can verify any of them quickly with the [SSL checker](/ssl-checker) before putting a production site behind your monitoring stack.

## Expiry thresholds that work

For a Let's Encrypt cert with automated renewal, you should alert earlier than you think, because renewal can silently fail for weeks before the cert actually expires:

| Days to expiry | Severity | What to do |
|---|---|---|
| 30 | Info | Log it, no action required if auto-renew is working |
| 14 | Warning | Investigate — renewal should have happened by now |
| 7 | Critical | Manual intervention: run `certbot renew --dry-run`, check logs |
| 3 | Page | Wake someone up |
| 1 | Page + public comms | Prepare to fall back to a backup cert |

For manually renewed certs (longer validity, often 1 year), shift thresholds up: 60/30/14/7. The point is that your alert window should cover at least two full renewal cycles, so a broken renewal does not surprise you.

## Check the certificate chain, not just the leaf

A cert with a broken intermediate chain works in Chrome (which downloads missing intermediates via AIA) but fails in `curl`, Android, Go's default HTTP client, and most backend HTTP libraries. You find out when your webhook delivery starts failing.

```bash
# Full chain check — fails if any intermediate is missing
openssl s_client -connect example.com:443 -servername example.com \
  -showcerts < /dev/null

# Shorter check for the leaf cert dates
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \
  | openssl x509 -noout -dates -subject -issuer
```

A good monitor parses the full chain and verifies each link reaches a trusted root. Do not rely on your browser to tell you the chain is fine — browsers are too forgiving.

## CAA records: the renewal killer nobody checks

CAA (Certificate Authority Authorization) records in DNS tell public CAs which of them are allowed to issue certs for your domain. They are great for security, and they silently break renewals when you add them incorrectly.

```
example.com.  300  IN  CAA  0 issue "letsencrypt.org"
example.com.  300  IN  CAA  0 issue "pki.goog"
example.com.  300  IN  CAA  0 iodef "mailto:security@example.com"
```

If you change from Let's Encrypt to ZeroSSL and forget the CAA record, the next renewal fails with a message most people ignore. Add CAA monitoring to your checklist — a CAA record that lists a CA you no longer use is a slow-motion outage. You can look up current CAA records with the [DNS lookup tool](/dns-lookup).

## OCSP stapling and OCSP Must-Staple

OCSP (Online Certificate Status Protocol) lets a client check whether a cert has been revoked. Three flavors exist, with different operational costs:

- **Plain OCSP** — the client queries the CA's OCSP responder. Slow, leaks browsing data to the CA, and if the CA is down, the client either soft-fails (most browsers) or hard-fails
- **OCSP stapling** — your server fetches the OCSP response periodically and attaches it to the TLS handshake. Fast, private, but a misconfigured nginx/Apache serves a stale stapled response and gets rejected
- **OCSP Must-Staple** — a cert extension that tells clients "reject any handshake from this cert without a valid stapled response." Strong security, but one stapling config bug takes the site down

If you use stapling, monitor the stapled response age. Most server configs refresh every hour; if yours is serving a response older than 24 hours, something is wrong with the OCSP fetcher.

## Let's Encrypt specifics

Let's Encrypt certs are valid for 90 days by default, and `certbot` renews at 60 days. The failure modes are predictable:

- Rate limits hit (50 certs per registered domain per week) — rare, but ugly during incidents
- HTTP-01 challenge fails because `/.well-known/acme-challenge/` is not reachable (redirects, CDN rules, Basic auth)
- DNS-01 challenge fails because of a stale API token
- `certbot` renews, but the post-hook that reloads nginx never runs

Add an integration test: curl your own site through the public internet once a day and check the leaf cert's "Not After" is beyond 60 days. If it drifts below 60, your renewal chain is broken and you have ~30 days to fix it before alerts fire. Pair that with an [is-it-up](/is-it-up) check to confirm the site is still responding after renewal.

## What to actually alert on

Noise kills monitoring. Here is a sensible baseline for certificate alerts:

- Page on: expiry < 3 days, hostname mismatch, broken chain (cert does not verify against Mozilla's root store), cert revoked
- Warn on: expiry 3-14 days, OCSP stapling stale > 24h, chain includes a deprecated algorithm (SHA-1, RSA < 2048, or in 2026+, RSA < 3072)
- Info on: expiry 14-30 days, new issuer detected, new Subject Alternative Name added

Everything else is noise. Do not alert on "TLS 1.0 supported" unless your security team has signed off on removing it — that is a project, not an alert.

## Further reading on PingThat

- [/docs/dns-propagation-explained/](/docs/dns-propagation-explained/) covers CAA propagation and why your renewal might wait on TTL
- [/docs/http-status-codes-in-monitoring/](/docs/http-status-codes-in-monitoring/) explains which response codes a cert failure surfaces as
- [/docs/uptime-sla-math/](/docs/uptime-sla-math/) puts a 4-hour TLS outage in context against your SLA budget

Certificates are boring until they are not. Automate the check, set the thresholds conservatively, and move on.
