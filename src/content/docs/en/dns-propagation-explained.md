---
title: "DNS Propagation — Why \"Wait 48 Hours\" Is Mostly Wrong"
description: "DNS changes do not propagate — caches expire. Here is how TTL, negative caching, and public resolvers actually work during a migration."
category: dns
relatedToolIds: ["dns-lookup", "whois-lookup", "resolver-compare", "dnssec-check", "reverse-dns"]
publishedAt: 2026-04-17
lang: en
tags: ["dns", "ttl", "propagation", "resolvers"]
excerpt: "Nobody is \"propagating\" anything. DNS is a cache-expiry problem, and you can largely control it. Here is what actually happens."
faq:
  - q: "Why does dig show different results from different resolvers?"
    a: "Because DNS is a cache-expiry problem, not a propagation one. When you change a record, your authoritative server serves the new value immediately, but resolvers worldwide still hold the old value in cache until their individual TTL expires. A resolver that fetched your record 300 seconds ago with a TTL of 3600 will keep serving stale data for another 3300 seconds regardless of what you change upstream. Running dig against 1.1.1.1, 8.8.8.8, and 9.9.9.9 often shows different answers because each resolver's cache expired at a different moment."
  - q: "How low can I safely set a DNS TTL?"
    a: "Most public resolvers respect TTLs down to about 30 seconds (Cloudflare 1.1.1.1 enforces a ~30s minimum), and anything 60-300 seconds is safe in practice. Some ISP resolvers and corporate caches enforce minimums around 300 seconds, so values below that get silently rounded up. For a migration, lower the TTL to 300 about 24-48 hours ahead of the change, then raise it back to 3600 or 86400 once stable — constant DNS lookups for unchanged records waste resources and give you no benefit."
  - q: "Is DNSSEC required to monitor DNS properly?"
    a: "No, but if your zone is signed, monitoring gets more complex. Stale caches are worse with DNSSEC because validating resolvers also cache RRSIG records with their own TTLs. A record change means the old signature becomes stale too, and some validating resolvers reject until both expire. If you use DNSSEC, lower TTLs 72 hours ahead of changes, never rotate DNSSEC keys during a migration, and use WHOIS to confirm your registrar has the correct DS record — a mismatched DS is the most common cause of validation failures."
  - q: "What is negative caching and how does it break new DNS records?"
    a: "When a resolver queries a name that does not exist (NXDOMAIN) or a missing record type (like an absent AAAA), it caches the negative answer. The cache duration comes from the SOA record's minimum field. If you ask for mail.example.com, it does not exist, and your resolver caches NXDOMAIN for 3600 seconds. You then create the record — users still get NXDOMAIN for the next hour. To avoid this, lower the SOA minimum to 300 before creating new names."
  - q: "How long do NS record changes actually take?"
    a: "NS changes at your registrar are the one case where 48 hours is a reasonable estimate. TLD nameservers themselves cache delegation records, and their TTLs are typically 1-2 days. Unlike normal A or CNAME changes, you cannot just lower the TTL ahead of time because the TLD controls those caches. Plan NS migrations with extra lead time: lower sub-record TTLs in advance, keep the old nameservers serving correct data for at least 48 hours after the change, and verify with dig +trace."
---

Every DNS tutorial tells you to "wait 48 hours for propagation" after a change. That advice is a relic from when domain registrars pushed zone files to root servers on a schedule. Modern DNS is a distributed caching system — nothing propagates, caches expire. Understanding the difference saves you hours of staring at `dig` output wondering why one resolver updated and another did not.

## What "propagation" actually is

When you change a DNS record, the authoritative server serves the new value immediately. What takes time is the world of resolvers still holding the old value in cache. Each cached copy expires on its own schedule, governed by the TTL (time-to-live) in seconds that the authoritative server sent along with the original answer.

A resolver that fetched your old A record 300 seconds ago with a TTL of 3600 will serve that stale value for another 3300 seconds, no matter what you change upstream. There is no mechanism for the authoritative server to invalidate caches — it just waits for them to time out and come back for a fresh answer.

The "48 hours" advice is a worst case that assumes some resolvers in obscure ISP setups have 48-hour TTLs baked in. For the public resolvers most of your users hit, the reality is much cleaner.

## The resolvers that matter

Roughly 70-80% of global DNS queries go through a handful of public resolvers plus the big ISP ones. All of the major public resolvers respect the TTL you set, with minor rounding:

| Resolver | IP | TTL behavior |
|---|---|---|
| Cloudflare | 1.1.1.1 | Respects TTL exactly, minimum ~30s |
| Google | 8.8.8.8 | Respects TTL, rounds down very long TTLs |
| Quad9 | 9.9.9.9 | Respects TTL exactly |
| OpenDNS | 208.67.222.222 | Respects TTL, some minimums on paid plans |
| Most ISP resolvers | varies | Usually respect TTL but some enforce 300s minimum or 86400s maximum |

The practical upshot: if you set a TTL of 300 seconds (5 minutes), 80% of your users will see the new record within 5 minutes of the change. The remaining 20% are behind resolvers with their own minimum TTL (often 1 hour), corporate caches, or their local OS cache. Verify any resolver with the [DNS lookup tool](/dns-lookup/).

## The pre-migration checklist

If you know you are going to change a record (IP migration, CDN swap, MX change), lower the TTL 24-48 hours ahead of the change:

```dns
# Before migration, set TTL low
example.com.  300  IN  A  192.0.2.10

# Wait for the OLD TTL (e.g. 3600s) to expire everywhere
# Now you can migrate with a 5-minute recovery window

# After migration is stable, raise TTL back up
example.com.  3600  IN  A  192.0.2.20
```

A lower TTL means more queries to your authoritative server, but for 48 hours around a migration, that cost is trivial. Once the migration is done, put the TTL back up to 3600 or 86400 — constant DNS lookups for records that never change are a waste.

## Negative caching: the one that gets you

When a resolver queries for a name that does not exist (NXDOMAIN) or a record type that does not exist (e.g. there is no AAAA), it caches the negative response. The TTL for negative caching comes from the SOA record, specifically the minimum field:

```dns
example.com.  IN  SOA  ns1.example.com. admin.example.com. (
                  2026041700  ; serial
                  3600        ; refresh
                  1800        ; retry
                  1209600     ; expire
                  3600 )      ; minimum TTL (for NXDOMAIN)
```

Scenario: you ask for `mail.example.com`, it does not exist, your resolver caches "mail.example.com does not exist" for 3600 seconds. You create the record. Users get NXDOMAIN for the next hour despite the record being live. Set your SOA minimum to 300 before changes that involve creating new names.

## Using dig +trace to bypass caches

When you are debugging a change, you want to ask the authoritative server directly, not your resolver. `dig +trace` walks from the root servers down:

```bash
# Follow the whole delegation chain, ignore local cache
dig +trace example.com A

# Ask a specific authoritative server directly
dig @ns1.example.com example.com A

# Compare answers from multiple public resolvers
for r in 1.1.1.1 8.8.8.8 9.9.9.9; do
  echo "=== $r ==="
  dig @$r example.com A +short
done
```

If `dig +trace` shows the new value but `dig @8.8.8.8` still shows the old one, the change is live and you are just waiting for Google's cache. If `dig +trace` still shows old, the change did not go through — check your DNS provider's dashboard.

## DNSSEC complicates things

If your zone is signed, stale caches are worse because validating resolvers also cache RRSIG records with their own TTLs. Changing a record in a signed zone means the old record's signature becomes stale too, and some validating resolvers get unhappy until both expire. The rule: if you use DNSSEC, lower TTLs further ahead (72 hours) and do not rotate DNSSEC keys during a migration. Use the [WHOIS lookup tool](/whois-lookup/) to confirm your registrar has the correct DS record published — a mismatched DS is the most common reason DNSSEC validation fails after a change.

## Record types that have their own rules

Some record types behave slightly differently in caching:

| Type | Caching quirks |
|---|---|
| A/AAAA | Standard TTL behavior |
| MX | Standard, but email is retried for days — old MX in cache is less painful |
| TXT (SPF/DKIM/DMARC) | Standard, but SPF lookups happen per-email, so old records cause auth failures |
| CAA | Checked only at cert issuance, cached briefly by CAs (8 hours typical at Let's Encrypt) |
| NS | Cached by both resolvers and TLDs; changing NS records truly can take 48h |
| CNAME | Cached twice (the CNAME and the final A), so perceived TTL = sum of both |

NS changes at your registrar are the one legitimate case where "48 hours" is reasonable, because TLD nameservers themselves cache the delegation.

## The practical summary

DNS changes are fast if you prepared (low TTL ahead of time). DNS changes are slow if you did not (high TTL baked into every cache). If you are ever tempted to tell someone "wait 48 hours," ask first: what was the original TTL? That is your real worst case.

## Further reading on PingThat

- [/docs/email-auth-spf-dkim-dmarc/](/docs/email-auth-spf-dkim-dmarc/) covers DNS-based email authentication records and why SPF lookups fail
- [/docs/ssl-certificate-monitoring-basics/](/docs/ssl-certificate-monitoring-basics/) explains how CAA records interact with cert renewal
- [/docs/http-status-codes-in-monitoring/](/docs/http-status-codes-in-monitoring/) shows how DNS failures surface as HTTP errors in your monitors
