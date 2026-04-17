---
title: "Port Scanning — Legality, Ethics, and Safe Use"
description: "When port scanning is legal, when it is a crime, and how to use scanners responsibly — with a jurisdictional breakdown and tool tradeoffs."
category: security
relatedToolIds: ["port-scan"]
publishedAt: 2026-04-17
lang: en
tags: ["port-scanning", "security", "legality", "ethics"]
excerpt: "Scanning your own systems is fine. Scanning someone else's without permission is a crime in most jurisdictions. Here is the line, with citations."
---

Port scanning is the cheapest reconnaissance there is, which is why every security curriculum starts with it and every junior engineer eventually gets a legal letter about it. The tool is neutral, the legality is not. This guide covers what you are allowed to scan, what you need authorization for, and how to use scanners without creating problems for yourself or the target.

## The line: authorization

In almost every jurisdiction, the test is **authorization**, not intent. Scanning an IP you own, or one you have written permission to scan, is fine. Scanning a third party without permission is unauthorized access under most computer-crime statutes, even if you do not connect to anything and even if you do not find anything.

What counts as authorization:

- You own the IP (your home network, your server, your company's infrastructure if you are employed to secure it)
- Written permission from the owner — a bug bounty program scope document, a pentest engagement letter, or a contract
- A public platform that explicitly authorizes scanning: Hack The Box, TryHackMe, OverTheWire, CTF-in-scope targets
- In rare cases, a statutory research exemption — these are narrow and jurisdiction-specific

What does not count:

- "It was on Shodan so it's public"
- "I was just checking if the port was open, I didn't connect"
- "The site has a responsible disclosure page" (disclosure ≠ scanning authorization)
- "I'm a security researcher" (the law does not recognize this as a category by itself in most places)

## Jurisdictional summary

Rules differ and actually matter. A short non-exhaustive table:

| Jurisdiction | Relevant law | Position on unauthorized scanning |
|---|---|---|
| United States | Computer Fraud and Abuse Act (CFAA), 18 U.S.C. § 1030 | Unauthorized access; scanning alone has been prosecuted, but case law is mixed. Van Buren (2021) narrowed scope slightly. |
| United Kingdom | Computer Misuse Act 1990, § 1-3 | Unauthorized access to computer material is an offence. Scanning to identify services has been charged. |
| Spain | Código Penal, Artículo 197 bis (modified 2015) | Unauthorized access or facilitation is punishable; mere scanning prosecuted less often but statute covers it. |
| Germany | §§ 202a, 202c StGB (Hackerparagraph) | Broad; even possessing scanning tools "for" unauthorized access has been controversial. |
| France | Article 323-1 du Code pénal | Unauthorized access; scanning has been charged as preparatory acts. |
| Netherlands | Wet Computercriminaliteit | Unauthorized access illegal; responsible disclosure guidance exists but does not grant blanket scanning rights. |
| Australia | Criminal Code Act 1995, Part 10.7 | Unauthorized access offences; scanning has been prosecuted. |
| Brazil | Lei 12.737/2012 (Lei Carolina Dieckmann) | Unauthorized access criminalized. |

Do not take this as legal advice. The pattern across jurisdictions is the same: authorization is the test. If in doubt, assume it is illegal and get written permission.

## When it is clearly fine

- Your own IPs, your own domains, your own cloud accounts
- A pentest engagement with a signed SOW and IP scope
- A bug bounty program with the target in scope (read the scope document — many programs explicitly exclude active scanning)
- Lab environments: Hack The Box, TryHackMe, PortSwigger's Web Academy targets, DVWA, your own VMs
- CTF competitions, in-scope targets only
- Public IP ranges your employer owns, if your job description covers security testing

If you are doing learning-oriented scanning and not sure whether a target is fair game, use Hack The Box or similar. They exist precisely to avoid this problem. You can also use the [port scan tool](/port-scan) against your own servers to verify exposed services.

## When it is clearly a problem

- Scanning a business competitor's infrastructure "to see what they run"
- Running a wide-range scanner against a cloud provider's IP space without authorization
- Scanning a dating app, SaaS product, or game server you are not authorized to test, even if you find a bug
- Posting scan results publicly, even if the scan was anonymous
- Scanning from an IP you do not want associated with your identity — if you need to hide it, you should not be doing it

Internet-wide scanners (ZMap, Masscan at full speed) are their own category. Even when legally operated by a research institution, they generate abuse complaints. Do not run one from a residential connection.

## Safe and useful scanning

For legitimate use — your own infrastructure, a client's with authorization, or a lab — choose tools to match the job:

```bash
# nmap: the default, accurate, slow-ish, great service detection
nmap -sS -sV -p- -T4 --open 192.0.2.10

# rustscan: fast TCP port discovery, pipes to nmap for service detection
rustscan -a 192.0.2.10 --ulimit 5000 -- -sV

# naabu: fast SYN scanner from ProjectDiscovery, good for automation
naabu -host 192.0.2.10 -p - -rate 1000

# masscan: stateless, very fast, you can oversaturate your own network
masscan 192.0.2.10 -p0-65535 --rate 10000
```

Trade-offs:

| Tool | Speed | Accuracy | Service detection | Best for |
|---|---|---|---|---|
| nmap | Medium | Highest | Yes, extensive | Thorough audit, scripting (NSE) |
| rustscan | Very fast | High (ports), delegates detection | Via nmap pipe | Quick port discovery before nmap |
| naabu | Very fast | High | No (pair with others) | Automation pipelines |
| masscan | Fastest | Lower per-port | No | Internet-scale research with authorization |

A typical workflow: rustscan or naabu for port discovery, nmap with `-sV` on the discovered ports for service fingerprinting, manual follow-up on anything interesting.

## Ethics beyond legality

Legal does not mean appropriate:

- **Rate limits**: scanning a small target at 10,000 packets per second can saturate their network even if you are authorized. Start slow.
- **Noise**: leave a calling card in your User-Agent or scan banner if you are doing research, so the target knows who to contact.
- **Data handling**: if your scan incidentally reveals exposed data (open S3 buckets, unauthenticated admin panels), do not poke further — report it through a responsible disclosure channel.
- **Logging**: keep your own logs of what you scanned, when, and under what authorization, for a few years. If someone ever complains, you want proof.

## If you receive a complaint

It happens — an abuse email from a cloud provider, a cease-and-desist, or worse. The advice is universal: stop immediately, preserve your records, and get a lawyer if it escalates beyond "please stop." Do not argue the technical point with the complainant. The question "was the scan harmful?" is not the legal question; "was it authorized?" is.

## Further reading on PingThat

- [/docs/http-status-codes-in-monitoring/](/docs/http-status-codes-in-monitoring/) — once you have identified services, monitoring their health is the next step
- [/docs/ssl-certificate-monitoring-basics/](/docs/ssl-certificate-monitoring-basics/) — port scanning reveals TLS services, then you check their certs
- [/docs/dns-propagation-explained/](/docs/dns-propagation-explained/) — understanding what hostnames resolve where is part of knowing your own attack surface
