export interface Source {
  authors: string;
  year: string;
  title: string;
  venue?: string;
}

const SOURCES: Record<string, Source[]> = {
  "jwt-decoder": [
    { authors: "Jones, M., Bradley, J., & Sakimura, N.", year: "2015", title: "JSON Web Token (JWT)", venue: "RFC 7519, IETF" },
    { authors: "Jones, M., Bradley, J., & Sakimura, N.", year: "2015", title: "JSON Web Signature (JWS)", venue: "RFC 7515, IETF" },
    { authors: "Jones, M.", year: "2015", title: "JSON Web Algorithms (JWA)", venue: "RFC 7518, IETF" },
  ],
  "password-strength": [
    { authors: "Grassi, P. A., et al.", year: "2017", title: "Digital Identity Guidelines: Authentication and Lifecycle Management", venue: "NIST Special Publication 800-63B Rev 3 (final, June 2017; updates through March 2020)" },
    { authors: "National Institute of Standards and Technology (NIST)", year: "2025", title: "Digital Identity Guidelines (Revision 4)", venue: "NIST SP 800-63-4 (final published July 2025; supersedes 800-63-3 / 800-63B-3 series)" },
    { authors: "Wheeler, D. L.", year: "2016", title: "zxcvbn: Low-budget password strength estimation", venue: "USENIX Security Symposium 2016, 157–173" },
    { authors: "Hunt, T.", year: "live", title: "Have I Been Pwned — Pwned Passwords API (k-anonymity model)", venue: "haveibeenpwned.com/api/v3 (5-character SHA-1 prefix, 16^5 = 1,048,576 hash range buckets)" },
    { authors: "Electronic Frontier Foundation (EFF)", year: "2016", title: "EFF's New Wordlists for Random Passphrases (long list)", venue: "eff.org/dice — 7,776 words = 6^5, ~12.9 bits/word, 6-word recommended for ~77 bits entropy" },
  ],
  "webrtc-leak-test": [
    { authors: "Alvestrand, H.", year: "2021", title: "Overview: Real-Time Protocols for Browser-Based Applications", venue: "RFC 8825, IETF (January 2021 — WebRTC suite overview)" },
    { authors: "Uberti, J., Jennings, C., & Rescorla, E. (Eds.)", year: "2021", title: "JavaScript Session Establishment Protocol (JSEP)", venue: "RFC 8829, IETF (January 2021 — SDP offer/answer model used by WebRTC)" },
    { authors: "Keränen, A., Holmberg, C., & Rosenberg, J.", year: "2018", title: "Interactive Connectivity Establishment (ICE): A Protocol for Network Address Translator (NAT) Traversal", venue: "RFC 8445, IETF (July 2018 — Internet Standards Track; obsoletes RFC 5245; defines host/srflx/prflx/relay candidate types)" },
    { authors: "Rescorla, E.", year: "2021", title: "WebRTC Security Architecture", venue: "RFC 8827, IETF (January 2021 — companion to RFC 8826 threat model)" },
    { authors: "Rekhter, Y., Moskowitz, B., Karrenberg, D., de Groot, G. J., & Lear, E.", year: "1996", title: "Address Allocation for Private Internets", venue: "RFC 1918, IETF (private IPv4 ranges 10/8, 172.16/12, 192.168/16)" },
    { authors: "Borst, J. de, Fablet, Y., Uberti, J., & Wang, Q.", year: "2020", title: "Using Multicast DNS to Protect Privacy When Exposing ICE Candidates", venue: "IETF draft-ietf-mmusic-mdns-ice-candidates; default in Chrome 76 (August 2019, after experimental Chrome 73 March 2019), Firefox 75 (April 2020 for outgoing obfuscation; Firefox 68 July 2019 added incoming-candidate handling only), and Safari iOS 12.2+ (March 2019); obfuscates host candidate IPs via .local mDNS hostnames" },
    { authors: "Cheshire, S., & Krochmal, M.", year: "2013", title: "Multicast DNS", venue: "RFC 6762, IETF (February 2013 — link-local name resolution used for .local hostnames)" },
  ],
  "subnet-calculator": [
    { authors: "Fuller, V., & Li, T.", year: "2006", title: "Classless Inter-domain Routing (CIDR): The Internet Address Assignment and Aggregation Plan", venue: "RFC 4632, IETF" },
    { authors: "Postel, J.", year: "1981", title: "Internet Protocol", venue: "RFC 791, IETF" },
    { authors: "Hinden, R., & Deering, S.", year: "2006", title: "IP Version 6 Addressing Architecture", venue: "RFC 4291, IETF" },
  ],
  "dns-lookup": [
    { authors: "Mockapetris, P.", year: "1987", title: "Domain Names — Implementation and Specification", venue: "RFC 1035, IETF" },
    { authors: "Hoffman, P., & McManus, P.", year: "2018", title: "DNS Queries over HTTPS (DoH)", venue: "RFC 8484, IETF" },
    { authors: "Thomson, S., Huitema, C., Ksinant, V., & Souissi, M.", year: "2003", title: "DNS Extensions to Support IP Version 6", venue: "RFC 3596, IETF" },
  ],
  "ssl-checker": [
    { authors: "Cooper, D., Santesson, S., Farrell, S., Boeyen, S., Housley, R., & Polk, W.", year: "2008", title: "Internet X.509 Public Key Infrastructure Certificate and CRL Profile", venue: "RFC 5280, IETF" },
    { authors: "Rescorla, E.", year: "2018", title: "The Transport Layer Security (TLS) Protocol Version 1.3", venue: "RFC 8446, IETF" },
    { authors: "Hodges, J., Jackson, C., & Barth, A.", year: "2012", title: "HTTP Strict Transport Security (HSTS)", venue: "RFC 6797, IETF" },
  ],
  "dnssec-check": [
    { authors: "Arends, R., Austein, R., Larson, M., Massey, D., & Rose, S.", year: "2005", title: "Resource Records for the DNS Security Extensions", venue: "RFC 4034, IETF" },
    { authors: "Arends, R., Austein, R., Larson, M., Massey, D., & Rose, S.", year: "2005", title: "Protocol Modifications for the DNS Security Extensions", venue: "RFC 4035, IETF" },
  ],
  "reverse-dns": [
    { authors: "Mockapetris, P.", year: "1987", title: "Domain Names — Implementation and Specification (in-addr.arpa zone)", venue: "RFC 1035, IETF" },
    { authors: "Thomson, S., Huitema, C., Ksinant, V., & Souissi, M.", year: "2003", title: "DNS Extensions to Support IP Version 6 (ip6.arpa zone)", venue: "RFC 3596, IETF" },
  ],
  "http-headers": [
    { authors: "Fielding, R., Nottingham, M., & Reschke, J. (Eds.)", year: "2022", title: "HTTP Semantics", venue: "RFC 9110, IETF (June 2022 — Internet Standard STD 97; obsoletes RFC 2818 + 7231-7233 + 7235 + 7538/7615/7694 + portions of 7230; RFC 7234 → RFC 9111; RFC 7230 messaging → RFC 9112)" },
    { authors: "Fielding, R., Nottingham, M., & Reschke, J. (Eds.)", year: "2022", title: "HTTP Caching", venue: "RFC 9111, IETF (June 2022 — obsoletes RFC 7234)" },
    { authors: "Hodges, J., Jackson, C., & Barth, A.", year: "2012", title: "HTTP Strict Transport Security (HSTS)", venue: "RFC 6797, IETF (19 November 2012 — Strict-Transport-Security header field)" },
    { authors: "West, M. (Ed.)", year: "2026", title: "Content Security Policy Level 3", venue: "W3C Working Draft (latest revision April 2026; supersedes CSP Level 2; frame-ancestors directive — introduced in CSP Level 2 (W3C Recommendation December 2016) and carried forward in Level 3 — supersedes X-Frame-Options RFC 7034)" },
    { authors: "W3C Web Application Security WG", year: "2025", title: "Permissions Policy", venue: "W3C Working Draft (replaces deprecated Feature-Policy after 2020 split into Permissions-Policy + Document-Policy)" },
    { authors: "Ross, D., & Gondrom, T.", year: "2013", title: "HTTP Header Field X-Frame-Options", venue: "RFC 7034, IETF (October 2013, Informational; obsoleted by CSP frame-ancestors directive introduced in CSP Level 2)" },
    { authors: "OWASP", year: "2025", title: "OWASP Secure Headers Project", venue: "owasp.org/www-project-secure-headers — recommended baseline: HSTS preload + CSP + X-Content-Type-Options nosniff + Referrer-Policy strict-origin-when-cross-origin + Permissions-Policy" },
  ],
  "url-parser": [
    { authors: "Berners-Lee, T., Fielding, R., & Masinter, L.", year: "2005", title: "Uniform Resource Identifier (URI): Generic Syntax", venue: "RFC 3986, IETF (January 2005 — Internet Standard STD 66; scheme/authority/path/query/fragment)" },
    { authors: "Duerst, M., & Suignard, M.", year: "2005", title: "Internationalized Resource Identifiers (IRIs)", venue: "RFC 3987, IETF (January 2005 — Unicode/ISO 10646 in URIs; complement to RFC 3986)" },
    { authors: "Klensin, J.", year: "2010", title: "Internationalized Domain Names for Applications (IDNA): Definitions and Document Framework", venue: "RFC 5890, IETF (August 2010 — IDNA2008 base definitions)" },
    { authors: "Klensin, J.", year: "2010", title: "Internationalized Domain Names in Applications (IDNA): Protocol", venue: "RFC 5891, IETF (August 2010 — IDNA2008 lookup/registration; Punycode xn-- prefix; updates and replaces RFC 3490 IDNA2003)" },
    { authors: "Costello, A.", year: "2003", title: "Punycode: A Bootstring encoding of Unicode for Internationalized Domain Names in Applications (IDNA)", venue: "RFC 3492, IETF (March 2003 — encoding scheme used by IDNA2008 to map Unicode hostnames to ASCII xn-- form)" },
    { authors: "WHATWG", year: "live", title: "URL Living Standard", venue: "url.spec.whatwg.org — browser-aligned parser; differs from RFC 3986 in error handling and percent-encoding" },
    { authors: "WICG / W3C Web Performance WG", year: "2024", title: "URLPattern", venue: "WICG draft (urlpattern.spec.whatwg.org); shipped stable in Chromium 95 / Edge 95 (October 2021); Chrome 117 (August 2023) extended ServiceWorker Static Routing API integration; Safari support announced WWDC 2025; Firefox in development" },
  ],
  "email-auth": [
    { authors: "Kitterman, S.", year: "2014", title: "Sender Policy Framework (SPF) for Authorizing Use of Domains in Email, Version 1", venue: "RFC 7208, IETF" },
    { authors: "Crocker, D., Hansen, T., & Kucherawy, M. (Eds.)", year: "2011", title: "DomainKeys Identified Mail (DKIM) Signatures", venue: "RFC 6376, IETF" },
    { authors: "Kucherawy, M., & Zwicky, E. (Eds.)", year: "2015", title: "Domain-based Message Authentication, Reporting, and Conformance (DMARC)", venue: "RFC 7489, IETF" },
    { authors: "Andersen, K., Long, B. (Ed.), Blank, S. (Ed.), & Kucherawy, M. (Ed.)", year: "2019", title: "The Authenticated Received Chain (ARC) Protocol", venue: "RFC 8617, IETF (July 2019)" },
    { authors: "Levine, J.", year: "2017", title: "Signaling One-Click Functionality for List Email Headers", venue: "RFC 8058, IETF" },
    { authors: "Google + Yahoo Postmaster", year: "2024", title: "Bulk Sender Requirements (≥5,000 messages/day)", venue: "Effective 1 February 2024 — DMARC + aligned SPF/DKIM + valid PTR + TLS + one-click unsubscribe + spam rate <0.10% (support.google.com/mail/answer/81126)" },
  ],
  "whois-lookup": [
    { authors: "Daigle, L.", year: "2004", title: "WHOIS Protocol Specification", venue: "RFC 3912, IETF (September 2004 — TCP port 43, obsoletes RFC 954)" },
    { authors: "Newton, A., Ellacott, B., & Kong, N.", year: "2015", title: "HTTP Usage in the Registration Data Access Protocol (RDAP)", venue: "RFC 7480, IETF (March 2015)" },
    { authors: "Hollenbeck, S., & Newton, A.", year: "2021", title: "Registration Data Access Protocol (RDAP) Query Format", venue: "RFC 9082, IETF (June 2021 — obsoletes RFC 7482)" },
    { authors: "Newton, A., & Hollenbeck, S.", year: "2015", title: "JSON Responses for the Registration Data Access Protocol (RDAP)", venue: "RFC 7483, IETF (March 2015)" },
    { authors: "Blanchet, M.", year: "2015", title: "Finding the Authoritative Registration Data (RDAP) Service", venue: "RFC 7484, IETF (March 2015 — RDAP bootstrap registry; obsoleted by RFC 9224 in 2022)" },
    { authors: "Hollenbeck, S.", year: "2009", title: "Extensible Provisioning Protocol (EPP) Domain Name Mapping", venue: "RFC 5731, IETF (August 2009 — domain status codes: clientHold, serverTransferProhibited, etc.)" },
    { authors: "ICANN", year: "2025", title: "Registration Data Policy", venue: "ICANN consensus policy effective 21 August 2025 (codifies post-GDPR Temporary Specification, redaction rules and minimum publication requirements for gTLD registries)" },
  ],
  "resolver-compare": [
    { authors: "Mockapetris, P.", year: "1987", title: "Domain Names — Implementation and Specification", venue: "RFC 1035, IETF" },
    { authors: "Hoffman, P., & McManus, P.", year: "2018", title: "DNS Queries over HTTPS (DoH)", venue: "RFC 8484, IETF" },
  ],
  "ipv6-check": [
    { authors: "Hinden, R., & Deering, S.", year: "2006", title: "IP Version 6 Addressing Architecture", venue: "RFC 4291, IETF" },
    { authors: "Mockapetris, P.", year: "1987", title: "Domain Names — Implementation and Specification", venue: "RFC 1035, IETF" },
    { authors: "Hoffman, P., & McManus, P.", year: "2018", title: "DNS Queries over HTTPS (DoH)", venue: "RFC 8484, IETF" },
  ],
  "port-scan": [
    { authors: "Cotton, M., Eggert, L., Touch, J., Westerlund, M., & Cheshire, S.", year: "2011", title: "Internet Assigned Numbers Authority (IANA) Procedures for the Management of the Service Name and Transport Protocol Port Number Registry", venue: "RFC 6335, IETF" },
    { authors: "Eddy, W. (Ed.)", year: "2022", title: "Transmission Control Protocol (TCP)", venue: "RFC 9293, IETF (obsoletes RFC 793)" },
    { authors: "Postel, J.", year: "1980", title: "User Datagram Protocol", venue: "RFC 768, IETF" },
    { authors: "Postel, J.", year: "1981", title: "Internet Control Message Protocol", venue: "RFC 792, IETF" },
    { authors: "Internet Assigned Numbers Authority (IANA)", year: "live", title: "Service Name and Transport Protocol Port Number Registry", venue: "iana.org/assignments/service-names-port-numbers" },
  ],
  "ip-converter": [
    { authors: "Kawamura, S., & Kawashima, M.", year: "2010", title: "A Recommendation for IPv6 Address Text Representation", venue: "RFC 5952, IETF" },
    { authors: "Hinden, R., & Deering, S.", year: "2006", title: "IP Version 6 Addressing Architecture", venue: "RFC 4291, IETF (§2.5.5.2 IPv4-Mapped IPv6 Address)" },
    { authors: "Postel, J.", year: "1981", title: "Internet Protocol", venue: "RFC 791, IETF (§3.2 classful addressing)" },
    { authors: "Rekhter, Y., Moskowitz, B., Karrenberg, D., de Groot, G. J., & Lear, E.", year: "1996", title: "Address Allocation for Private Internets", venue: "RFC 1918, IETF" },
    { authors: "Weil, J., Kuarsingh, V., Donley, C., Liljenstolpe, C., & Azinger, M.", year: "2012", title: "IANA-Reserved IPv4 Prefix for Shared Address Space", venue: "RFC 6598, IETF (100.64.0.0/10 CGNAT)" },
    { authors: "Hinden, R., & Haberman, B.", year: "2005", title: "Unique Local IPv6 Unicast Addresses", venue: "RFC 4193, IETF (fc00::/7 with FD00::/8 locally-assigned half)" },
    { authors: "Rekhter, Y., & Li, T.", year: "1993", title: "An Architecture for IP Address Allocation with CIDR", venue: "RFC 1518, IETF (deprecated by RFC 4632)" },
    { authors: "Fuller, V., Li, T., Yu, J., & Varadhan, K.", year: "1993", title: "Classless Inter-Domain Routing (CIDR): an Address Assignment and Aggregation Strategy", venue: "RFC 1519, IETF (obsoleted by RFC 4632)" },
    { authors: "Fuller, V., & Li, T.", year: "2006", title: "Classless Inter-domain Routing (CIDR): The Internet Address Assignment and Aggregation Plan", venue: "RFC 4632, IETF (current canonical, obsoletes RFC 1519)" },
  ],
  "my-ip": [
    { authors: "Petersson, A., & Nilsson, M.", year: "2014", title: "Forwarded HTTP Extension", venue: "RFC 7239, IETF" },
    { authors: "Postel, J.", year: "1981", title: "Internet Protocol", venue: "RFC 791, IETF (32-bit IPv4 addressing)" },
    { authors: "Hinden, R., & Deering, S.", year: "2006", title: "IP Version 6 Addressing Architecture", venue: "RFC 4291, IETF" },
    { authors: "Rekhter, Y., Moskowitz, B., Karrenberg, D., de Groot, G. J., & Lear, E.", year: "1996", title: "Address Allocation for Private Internets", venue: "RFC 1918, IETF (10/8, 172.16/12, 192.168/16)" },
    { authors: "Weil, J., Kuarsingh, V., Donley, C., Liljenstolpe, C., & Azinger, M.", year: "2012", title: "IANA-Reserved IPv4 Prefix for Shared Address Space", venue: "RFC 6598, IETF (100.64.0.0/10 CGNAT)" },
    { authors: "Hawkinson, J., & Bates, T.", year: "1996", title: "Guidelines for creation, selection, and registration of an Autonomous System (AS)", venue: "RFC 1930, IETF" },
    { authors: "MaxMind", year: "live", title: "GeoLite2 Free Geolocation Database", venue: "maxmind.com/en/geoip2-services-and-databases" },
  ],
  "privacy-check": [
    { authors: "Eckersley, P.", year: "2010", title: "How Unique Is Your Web Browser?", venue: "Privacy Enhancing Technologies Symposium (PETS) 2010, LNCS 6205, Springer Berlin Heidelberg, pp. 1–18" },
    { authors: "Mozilla", year: "2019", title: "Resist Fingerprinting (privacy.resistFingerprinting preference, Firefox 67+ from Tor Uplift project)", venue: "support.mozilla.org/kb/resist-fingerprinting + Bugzilla 1333933" },
    { authors: "Apple Inc.", year: "2017", title: "Intelligent Tracking Prevention", venue: "webkit.org/blog (announced WWDC June 2017, shipped Safari 11 / iOS 11 September 2017)" },
    { authors: "W3C / WICG", year: "2021", title: "User-Agent Client Hints", venue: "wicg.github.io/ua-client-hints (shipped Chrome 89, March 2021)" },
    { authors: "European Parliament & Council", year: "2016", title: "Regulation (EU) 2016/679 (General Data Protection Regulation)", venue: "Article 6 lawful basis for processing, eur-lex.europa.eu" },
    { authors: "European Parliament & Council", year: "2002", title: "Directive 2002/58/EC (ePrivacy Directive), amended by Directive 2009/136/EC", venue: "Article 5(3) terminal device data consent, eur-lex.europa.eu" },
  ],
  "redirect-checker": [
    { authors: "Fielding, R., Nottingham, M., & Reschke, J. (Eds.)", year: "2022", title: "HTTP Semantics", venue: "RFC 9110, IETF (§15.4 Redirection 3xx — 301/302/303/307/308 method preservation)" },
    { authors: "Hodges, J., Jackson, C., & Barth, A.", year: "2012", title: "HTTP Strict Transport Security (HSTS)", venue: "RFC 6797, IETF (preload list interactions)" },
    { authors: "MITRE Corporation", year: "live", title: "CWE-601: URL Redirection to Untrusted Site ('Open Redirect')", venue: "cwe.mitre.org/data/definitions/601.html" },
    { authors: "Open Web Application Security Project (OWASP)", year: "2021", title: "OWASP Top 10:2021 — A01 Broken Access Control", venue: "owasp.org/Top10/A01_2021-Broken_Access_Control" },
    { authors: "Illyes, G. (Google)", year: "2016", title: "30x redirects don't lose PageRank anymore", venue: "Google Search Central confirmation (developers.google.com/search/docs/crawling-indexing/301-redirects)" },
  ],
  "caa-lookup": [
    { authors: "Hallam-Baker, P., Stradling, R., & Hoffman-Andrews, J.", year: "2019", title: "DNS Certification Authority Authorization (CAA) Resource Record", venue: "RFC 8659, IETF (obsoletes RFC 6844)" },
    { authors: "Hallam-Baker, P., & Stradling, R.", year: "2013", title: "DNS Certification Authority Authorization (CAA) Resource Record", venue: "RFC 6844, IETF (original spec, obsoleted by RFC 8659)" },
    { authors: "Landau, H.", year: "2019", title: "CAA Record Extensions for Account URI and ACME Method Binding", venue: "RFC 8657, IETF (accounturi, validationmethods parameters)" },
    { authors: "CA/Browser Forum", year: "2017", title: "Baseline Requirements §3.2.2.8 — CAA Records (Ballot 187 v1.4.3)", venue: "Effective 8 September 2017 (cabforum.org)" },
    { authors: "Danyliw, R., Meijer, J., & Demchenko, Y.", year: "2007", title: "The Incident Object Description Exchange Format (IODEF)", venue: "RFC 5070, IETF (iodef tag context for incident reporting)" },
  ],
  "is-it-up": [
    { authors: "Fielding, R., Nottingham, M., & Reschke, J. (Eds.)", year: "2022", title: "HTTP Semantics", venue: "RFC 9110, IETF (§15 status code classes 1xx-5xx)" },
    { authors: "Mockapetris, P.", year: "1987", title: "Domain Names — Implementation and Specification", venue: "RFC 1035, IETF (§4.1.1 RCODE field — NXDOMAIN/SERVFAIL)" },
    { authors: "Abley, J., & Lindqvist, K.", year: "2006", title: "Operation of Anycast Services", venue: "RFC 4786, IETF (BCP 126 — multi-region anycast routing)" },
    { authors: "Rescorla, E.", year: "2018", title: "The Transport Layer Security (TLS) Protocol Version 1.3", venue: "RFC 8446, IETF (handshake failures separate from HTTP layer)" },
  ],
  "site-speed": [
    { authors: "Google (web.dev / Chrome team)", year: "live", title: "Core Web Vitals — LCP, INP, CLS thresholds", venue: "web.dev/articles/vitals (LCP <2.5s, INP <200ms, CLS <0.1)" },
    { authors: "Google Chrome team", year: "live", title: "Chrome User Experience Report (CrUX) Methodology", venue: "developer.chrome.com/docs/crux (28-day rolling window, p75)" },
    { authors: "Google Search Central", year: "2024", title: "Interaction to Next Paint (INP) becomes a Core Web Vital on March 12", venue: "developers.google.com/search/blog/2023/05/introducing-inp + web.dev/blog/inp-cwv-march-12" },
    { authors: "Belshe, M., Peon, R., & Thomson, M. (Ed.)", year: "2015", title: "Hypertext Transfer Protocol Version 2 (HTTP/2)", venue: "RFC 7540, IETF" },
    { authors: "Bishop, M. (Ed.)", year: "2022", title: "HTTP/3", venue: "RFC 9114, IETF (HTTP semantics over QUIC)" },
  ],
};

export function getSources(slug: string): Source[] {
  return SOURCES[slug] ?? [];
}
