// PingThat tool catalog
window.TOOLS = [
  // net/ping fixes the brand–feature mismatch flagged in the engagement audit:
  // visitors arriving on a site called "PingThat" expect a ping. HTTP HEAD
  // latency check is the in-browser equivalent (no ICMP from a sandbox).
  { ns: 'net', slug: 'ping', name: 'Ping', desc: 'HTTP latency check — round-trip time to any host.', kbd: 'g .' },
  { ns: 'net', slug: 'my-ip', name: 'What Is My IP', desc: 'Public IP, location, ISP, network details.', kbd: 'g i' },
  { ns: 'net', slug: 'privacy-check', name: 'Browser Privacy Check', desc: 'Tracking protection, fingerprint exposure.', kbd: 'g p' },
  { ns: 'net', slug: 'webrtc-leak-test', name: 'WebRTC Leak Test', desc: 'Detect real IP leaks via WebRTC.', kbd: 'g w' },
  { ns: 'net', slug: 'dns-lookup', name: 'DNS Lookup', desc: 'Query A, AAAA, MX, CNAME, TXT, NS, SOA.', kbd: 'g d' },
  { ns: 'net', slug: 'email-auth', name: 'Email Auth', desc: 'SPF, DKIM, DMARC records for any domain.', kbd: 'g e' },
  { ns: 'net', slug: 'port-scan', name: 'Port Scanner', desc: 'Scan common ports on any host.', kbd: 'g o' },
  { ns: 'net', slug: 'ipv6-check', name: 'IPv6 Readiness', desc: 'AAAA records for apex, www, NS, mail.', kbd: 'g 6' },
  { ns: 'net', slug: 'reverse-dns', name: 'Reverse DNS', desc: 'PTR records for IPv4 / IPv6 addresses.', kbd: 'g r' },
  { ns: 'net', slug: 'resolver-compare', name: 'Resolver Compare', desc: 'Cloudflare, Google, AdGuard, NextDNS latency.', kbd: 'g c' },

  { ns: 'sec', slug: 'ssl-checker', name: 'SSL Checker', desc: 'Certificate status, HSTS, CT logs.', kbd: 's s' },
  { ns: 'sec', slug: 'http-headers', name: 'HTTP Headers', desc: 'Inspect response headers and security policy.', kbd: 's h' },
  { ns: 'sec', slug: 'whois-lookup', name: 'WHOIS Lookup', desc: 'Registrar, contacts, nameservers via RDAP.', kbd: 's w' },
  { ns: 'sec', slug: 'redirect-checker', name: 'Redirect Checker', desc: 'Trace full redirect chain with status codes.', kbd: 's r' },
  { ns: 'sec', slug: 'caa-lookup', name: 'CAA Checker', desc: 'Authorized Certificate Authorities for a domain.', kbd: 's c' },
  { ns: 'sec', slug: 'dnssec-check', name: 'DNSSEC Check', desc: 'Signing status, DS chain, validator behavior.', kbd: 's d' },

  { ns: 'perf', slug: 'is-it-up', name: 'Website Status', desc: 'Uptime, response time, server status.', kbd: 'p u' },
  { ns: 'perf', slug: 'is-it-down', name: 'Is It Down?', desc: 'Down for everyone, or just you.', kbd: 'p d' },
  { ns: 'perf', slug: 'site-speed', name: 'Site Speed', desc: 'Real-user Core Web Vitals from CrUX.', kbd: 'p s' },

  { ns: 'calc', slug: 'subnet-calculator', name: 'Subnet Calculator', desc: 'Network, broadcast, host range from CIDR.', kbd: 'c s' },
  { ns: 'calc', slug: 'ip-converter', name: 'IP Address Converter', desc: 'Decimal, binary, hex, octal conversion.', kbd: 'c i' },
  { ns: 'calc', slug: 'password-strength', name: 'Password Strength', desc: 'Entropy and crack-time estimation.', kbd: 'c p' },
  { ns: 'calc', slug: 'jwt-decoder', name: 'JWT Decoder', desc: 'Header, payload, signature inspection.', kbd: 'c j' },
  { ns: 'calc', slug: 'url-parser', name: 'URL Parser', desc: 'Protocol, host, path, query, hash.', kbd: 'c u' },
];

window.NS_LABEL = {
  net: 'network',
  sec: 'security',
  perf: 'speed & uptime',
  calc: 'calculators',
};
