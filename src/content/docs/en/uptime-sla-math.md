---
title: "Uptime SLA Math — What 99.9% vs 99.99% Actually Means (and Costs)"
description: "The real cost of each extra nine in your uptime SLA, in minutes of downtime, architecture changes, and engineering effort."
category: monitoring
relatedToolIds: ["is-it-up", "is-it-down"]
publishedAt: 2026-04-17
lang: en
tags: ["sla", "uptime", "monitoring", "availability"]
excerpt: "Each nine gets about 10x more expensive than the last. Here is the honest math and what it takes to actually deliver each tier."
---

Every vendor slide deck promises "five nines" of uptime. Most of them do not deliver it, and most customers do not need it. Understanding the math of availability tiers, and what each tier costs in architecture and process, is how you avoid over-engineering (or worse, under-engineering) your own systems.

## The downtime budget for each tier

Availability percentages sound abstract until you convert them to allowed downtime. Here is the practical table:

| Availability | Downtime per year | Downtime per month | Downtime per week |
|---|---|---|---|
| 99% (two nines) | 87.6 hours | 7.3 hours | 1.68 hours |
| 99.5% | 43.8 hours | 3.65 hours | 50.4 min |
| 99.9% (three nines) | 8.76 hours | 43.8 min | 10.1 min |
| 99.95% | 4.38 hours | 21.9 min | 5.04 min |
| 99.99% (four nines) | 52.56 min | 4.38 min | 1.01 min |
| 99.999% (five nines) | 5.26 min | 26.3 sec | 6.05 sec |

Notice the curve: each additional nine cuts downtime by roughly 10x, and each tier's monthly budget drops faster than feels intuitive. 99.9% gives you 43 minutes a month — enough to absorb a bad deploy. 99.99% gives you 4 minutes — barely enough to notice, let alone respond.

## What each tier actually requires

The budget tells you what is at stake. What it takes to deliver it is a different story:

- **99%** — one server, regular backups, someone who wakes up for alerts. Hobby projects and internal tools.
- **99.5%** — monitoring that works, on-call rotation, tested restore procedure, decent change management. Small SaaS.
- **99.9%** — redundant infrastructure at the app layer, load balancer, database replicas (or managed DB), CDN, real incident response process. Most mid-size SaaS lives here.
- **99.95%** — 99.9% plus multi-AZ everything, automated failover, runbooks for the top 20 incident types, on-call rotation large enough to not burn people out.
- **99.99%** — multi-region active-passive, zero-downtime deploys, automated remediation for common failures, chaos engineering, dedicated SRE team. You are now a platform company.
- **99.999%** — multi-region active-active, cell-based architecture, formal verification of critical paths, 24/7 NOC with escalation tiers, and sub-minute automated response. Few companies outside telecom, banking, and big cloud providers deliver this.

The jump from 99.9% to 99.99% is where most organisations fail to deliver what they sold. Getting from 99% to 99.9% is usually a weekend of redundant infrastructure. Getting from 99.9% to 99.99% is a six-month architecture project. Getting from 99.99% to 99.999% is a multi-year company-wide effort.

## The cost curve is exponential

Rough cost-to-deliver multipliers (engineering time and infrastructure combined):

```
99%     baseline (call it 1x)
99.5%   ~1.5x
99.9%   ~3x
99.95%  ~5x
99.99%  ~15x
99.999% ~75x
```

These numbers are not scientific, but the shape is right. Each nine requires eliminating a new class of failure. At 99% you absorb human error; at 99.9% you survive single-server failure; at 99.99% you survive single-region failure; at 99.999% you survive single-provider failure. Each of those is an order of magnitude more expensive than the last.

## SLA credits are not compensation

Vendor SLAs usually promise credits — 10% of the monthly bill if they miss their target, 25% for a major breach, 100% in catastrophe. Read the actual numbers. A 99.9% SLA with a 10% credit on a monthly bill of $500 means $50 back if they were down 43 minutes. If your site made $500/minute during those 43 minutes, that credit covers 6 seconds of lost revenue.

SLA credits are a reputational lever, not a financial one. If availability actually matters to your business, the credit is irrelevant — you need the uptime, not the refund. A monitor like [is-it-up](/is-it-up) gives you an independent second opinion when your vendor's status page disagrees with reality.

## Measuring uptime honestly

Your measured uptime depends entirely on your probe setup:

- Probe every 60 seconds from one location: maximum resolution is ~1 minute. A 40-second outage might be missed entirely.
- Probe every 30 seconds from 3 regions: catches most short outages, but you pay for 3x the probe volume.
- Alert on N consecutive failures: smooths out transient blips, but N=3 at 60s means a 3-minute floor before you alert.

For a 99.99% target (4 min/month budget), probing every 60 seconds is too coarse. You need 10-30s probe intervals from multiple regions. [Is it down](/is-it-down) is useful for the "someone thinks it's broken" anecdata that comes in during an incident — you check from an outside vantage point before spending engineering time on a non-issue.

## The composite availability problem

If your service depends on three vendors, each with 99.9% SLA, your theoretical ceiling is:

```
0.999 × 0.999 × 0.999 = 0.997 ≈ 99.7%
```

That is 26 hours of downtime a year, not 9. And that assumes the three vendors' outages are independent, which they are not if they all depend on the same cloud provider's DNS, IAM, or network. Your real ceiling is worse than the math suggests.

## Mean time to recovery is the lever

A 99.99% target with 4 minutes of monthly budget means your MTTR needs to be comfortably under 4 minutes for most incidents. That is not a human timeline — it is automation territory:

```cron
# Example: auto-restart a failed health check every minute
* * * * * /usr/local/bin/check-health.sh || /usr/local/bin/restart-service.sh
```

That cron is a toy, but the principle is real. To hit four nines, most recovery has to be automated. Human-in-the-loop MTTR is 10-30 minutes even with a great team, which caps you at 99.9% to 99.95% in practice.

## Pick the tier you need, not the one that sounds good

Most B2B SaaS customers accept 99.9%. Most consumer apps accept 99.5%. Most internal tools accept "usually works." Before you commit to 99.99%, check whether any customer actually asked for it in writing. Most of the time "99.99%" on a sales page is aspirational, not architectural — and the gap between claim and reality is where credibility dies.

## Further reading on PingThat

- [/docs/http-status-codes-in-monitoring/](/docs/http-status-codes-in-monitoring/) — how status codes map to your downtime accounting
- [/docs/ssl-certificate-monitoring-basics/](/docs/ssl-certificate-monitoring-basics/) — cert expiries are a top-10 cause of "unplanned" downtime
- [/docs/dns-propagation-explained/](/docs/dns-propagation-explained/) — DNS issues often look like downtime but have their own recovery timeline
