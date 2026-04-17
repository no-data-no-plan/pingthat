---
title: "Email Authentication — SPF, DKIM, and DMARC Explained Properly"
description: "How SPF, DKIM and DMARC actually work together to authenticate email, with the gotchas that break deliverability in production."
category: email
relatedToolIds: ["email-auth", "dns-lookup"]
publishedAt: 2026-04-17
lang: en
tags: ["email", "spf", "dkim", "dmarc", "deliverability"]
excerpt: "Three records, one job: prove your email is really yours. Here is how each works, how they interact, and the traps that quietly tank your deliverability."
---

Email authentication has three moving parts — SPF, DKIM, and DMARC — and most teams configure one of them, declare victory, and wonder why their newsletters land in spam. This guide walks through what each does, how they interact, and the specific misconfigurations that break real-world deliverability. Verify any domain's current setup with the [email authentication tool](/email-auth).

## The three records at a glance

| Record | DNS location | What it proves | Type |
|---|---|---|---|
| SPF | `example.com` TXT | This IP is allowed to send for this domain | Path-based |
| DKIM | `selector._domainkey.example.com` TXT | This message was signed by a key controlled by this domain | Cryptographic |
| DMARC | `_dmarc.example.com` TXT | What to do when SPF/DKIM fail, and where to send reports | Policy |

Each answers a different question. SPF asks "is the sending server allowed?", DKIM asks "was the message altered in transit?", and DMARC asks "what should the receiver do if those checks fail?". You need all three because each alone has blind spots.

## SPF: path authentication with a hard limit

SPF (Sender Policy Framework) is a TXT record listing the IPs and domains authorized to send email on your behalf. A typical record:

```
example.com.  3600  IN  TXT  "v=spf1 mx a:mail.example.com include:_spf.google.com include:mailgun.org ip4:203.0.113.5 -all"
```

The mechanisms:

- `v=spf1` — version, always first
- `mx` — allow any IP listed in your MX records
- `a` — allow any IP listed in an A record for this domain
- `a:host.example.com` — allow A records for a specific host
- `include:domain` — include another domain's SPF record
- `ip4:` / `ip6:` — raw IP ranges
- `-all` — hard fail everything else
- `~all` — soft fail (deliverable but marked)
- `+all` — pass everything (never use this)
- `?all` — neutral, which is what happens if you have no record at all

The trap: **SPF is limited to 10 DNS lookups**. Each `include:`, `a`, `mx`, or `redirect=` counts. If your SPF exceeds 10 lookups, receivers treat the record as a `permerror`, which most scoring engines treat the same as no SPF at all. A record that looks like this is already broken:

```
"v=spf1 include:_spf.google.com include:mailgun.org include:sendgrid.net include:_spf.salesforce.com include:mktomail.com -all"
```

Each of those nested includes has its own lookups. `_spf.google.com` alone pulls 4+. Check your own with `dig +short TXT` and count — or use the [DNS lookup tool](/dns-lookup) to see the full chain. SPF flattening (resolving everything to raw IPs once and updating on a schedule) is the common workaround; several paid services automate it.

## DKIM: cryptographic signing, per selector

DKIM (DomainKeys Identified Mail) signs each outgoing message with a private key. The public key lives in DNS at a selector, so receivers can verify the signature:

```
mail2026._domainkey.example.com.  3600  IN  TXT  "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."
```

Key choices:

- **RSA-2048** — current baseline, widely supported, larger TXT records (split across multiple strings)
- **RSA-1024** — still accepted but considered weak, Gmail has warned about this for years
- **Ed25519** — smaller, faster, emerging support, not yet a safe-by-default standalone

Rotate selectors at least annually. The selector is the `mail2026` part above — you create a new one, add it to DNS, cut over your mail server, then remove the old one after 30 days (enough for any in-flight messages to be verified). Good operational practice is also to rotate after any suspected key compromise or after an employee with access leaves.

DKIM alignment is what DMARC cares about: the `d=` domain in the DKIM signature must match the `From:` header domain (or one of its subdomains in relaxed mode). If your provider signs with `d=sendgrid.net` and you send from `@example.com`, DKIM passes for SendGrid's domain but fails alignment for yours. Always configure custom DKIM so the signing domain matches your sending domain.

## DMARC: the policy glue

DMARC (Domain-based Message Authentication, Reporting and Conformance) sits on top of SPF and DKIM, telling receivers what to do when alignment fails and where to send reports:

```
_dmarc.example.com.  3600  IN  TXT  "v=DMARC1; p=reject; rua=mailto:dmarc-reports@example.com; pct=100; sp=reject; adkim=s; aspf=s"
```

Key tags:

- `p=none` — monitor only, no enforcement. Start here.
- `p=quarantine` — send failures to spam.
- `p=reject` — tell receivers to drop failures.
- `rua=` — aggregate reports (daily XML summaries from receivers like Google, Microsoft, Yahoo)
- `ruf=` — forensic reports (per-message, rarely sent in practice due to privacy laws — most receivers do not honor `ruf=`)
- `pct=` — percentage of mail the policy applies to (gradual rollout: 10, 50, 100)
- `sp=` — policy for subdomains. If you do not set this, subdomains inherit `p=`. Set `sp=reject` to block spoofing of `anything.example.com`.
- `adkim` / `aspf` — alignment mode, `s` for strict (exact domain match), `r` for relaxed (subdomains ok)

The policy progression every team should follow:

| Stage | Policy | Duration | Goal |
|---|---|---|---|
| 1. Deploy | `p=none` | 2-4 weeks | Collect reports, find every legitimate sender |
| 2. Gradual enforcement | `p=quarantine; pct=10` | 1-2 weeks | Break a small slice, measure complaints |
| 3. Ramp | `p=quarantine; pct=50` then `pct=100` | 2-4 weeks | Full quarantine |
| 4. Enforce | `p=reject` | Ongoing | Spoofers drop, legitimate mail unaffected |

Skipping stages is how you break a marketing campaign. The aggregate reports during `p=none` tell you every IP sending as your domain — some will be vendors you forgot about, some will be legitimate internal tools, some will be spoofers. Until you have identified all the legitimate senders and brought them into SPF/DKIM, enforcing is premature.

## The interaction that breaks things

DMARC requires either SPF OR DKIM to pass AND align. Pass without alignment does not save you. Common scenarios:

- **SPF passes, alignment fails, no DKIM**: DMARC fails. This is the forwarded-email problem — a mailing list resends your message from its own IP with your `From:` header.
- **DKIM passes and aligns, SPF fails**: DMARC passes. This is why DKIM matters more than SPF for forwarded mail.
- **Both fail**: DMARC applies its policy.

The practical takeaway: configure DKIM on every sender. SPF alone will not survive forwarding. DKIM survives mailing lists that preserve headers, and it is the only authentication that works when an intermediate MTA replays a message later.

## Reading aggregate reports

Aggregate reports arrive as zipped XML files, one per receiver per day. Raw XML is painful; use a parser. What to look for:

- Volume by source IP: the top sources should all be senders you recognise
- Disposition: `none`, `quarantine`, `reject` — confirms what receivers actually did
- Alignment outcomes: separated for SPF and DKIM, tells you which is breaking

If you see significant volume from an IP you do not recognise passing SPF, it means an old `include:` in your SPF record still authorizes someone you no longer use. Clean it up.

## Further reading on PingThat

- [/docs/dns-propagation-explained/](/docs/dns-propagation-explained/) — SPF/DKIM/DMARC all live in DNS, so cache TTLs affect rollouts
- [/docs/ssl-certificate-monitoring-basics/](/docs/ssl-certificate-monitoring-basics/) — mail server certs matter too, for STARTTLS and MTA-STS
- [/docs/http-status-codes-in-monitoring/](/docs/http-status-codes-in-monitoring/) — monitoring your DMARC report inbox follows the same alerting principles
