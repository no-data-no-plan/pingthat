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
    { authors: "Grassi, P. A., et al.", year: "2017", title: "Digital Identity Guidelines: Authentication and Lifecycle Management", venue: "NIST Special Publication 800-63B (Memorandum, June 2017; revisions through 2020)" },
    { authors: "Wheeler, D. L.", year: "2016", title: "zxcvbn: Low-budget password strength estimation", venue: "USENIX Security Symposium 2016, 157–173" },
  ],
  "webrtc-leak-test": [
    { authors: "Alvestrand, H.", year: "2021", title: "Overview: Real-Time Protocols for Browser-Based Applications", venue: "RFC 8825, IETF" },
    { authors: "Uberti, J., Jennings, C., & Rescorla, E. (Eds.)", year: "2021", title: "JavaScript Session Establishment Protocol (JSEP)", venue: "RFC 8829, IETF" },
    { authors: "Rekhter, Y., Moskowitz, B., Karrenberg, D., de Groot, G. J., & Lear, E.", year: "1996", title: "Address Allocation for Private Internets", venue: "RFC 1918, IETF (private IPv4 ranges)" },
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
    { authors: "Fielding, R., Nottingham, M., & Reschke, J. (Eds.)", year: "2022", title: "HTTP Semantics", venue: "RFC 9110, IETF" },
    { authors: "Fielding, R., Nottingham, M., & Reschke, J. (Eds.)", year: "2022", title: "HTTP Caching", venue: "RFC 9111, IETF" },
    { authors: "West, M.", year: "2023", title: "Content Security Policy Level 3", venue: "W3C Working Draft" },
  ],
  "url-parser": [
    { authors: "Berners-Lee, T., Fielding, R., & Masinter, L.", year: "2005", title: "Uniform Resource Identifier (URI): Generic Syntax", venue: "RFC 3986, IETF" },
    { authors: "WHATWG", year: "2024", title: "URL Living Standard", venue: "WHATWG, url.spec.whatwg.org" },
  ],
  "email-auth": [
    { authors: "Kitterman, S.", year: "2014", title: "Sender Policy Framework (SPF) for Authorizing Use of Domains in Email, Version 1", venue: "RFC 7208, IETF" },
    { authors: "Crocker, D., Hansen, T., & Kucherawy, M. (Eds.)", year: "2011", title: "DomainKeys Identified Mail (DKIM) Signatures", venue: "RFC 6376, IETF" },
    { authors: "Kucherawy, M., & Zwicky, E. (Eds.)", year: "2015", title: "Domain-based Message Authentication, Reporting, and Conformance (DMARC)", venue: "RFC 7489, IETF" },
  ],
  "whois-lookup": [
    { authors: "Daigle, L.", year: "2004", title: "WHOIS Protocol Specification", venue: "RFC 3912, IETF" },
    { authors: "Hollenbeck, S., & Newton, A.", year: "2015", title: "Registration Data Access Protocol (RDAP) Query Format", venue: "RFC 7482, IETF" },
    { authors: "Newton, A., & Hollenbeck, S.", year: "2015", title: "JSON Responses for the Registration Data Access Protocol (RDAP)", venue: "RFC 7483, IETF" },
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
};

export function getSources(slug: string): Source[] {
  return SOURCES[slug] ?? [];
}
