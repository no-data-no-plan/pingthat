// Docs/guides shell
const DocsPage = () => {
  const guides = [
    { ns: 'dns', t: 'Reading an MX record', d: 'What priority means, why two MX hosts is the minimum, and how to test failover.', read: '4 min', date: '2026-04-12' },
    { ns: 'dns', t: 'SPF, DKIM, DMARC in 10 minutes', d: 'The three records that decide whether your email lands in inbox, spam, or void.', read: '9 min', date: '2026-04-02' },
    { ns: 'tls', t: 'Why your cert is "valid" but browsers complain', d: 'Chain order, intermediate gaps, and the SCT requirement most lints miss.', read: '6 min', date: '2026-03-28' },
    { ns: 'tls', t: 'HSTS preload — what it actually costs', d: 'Submitting is easy. Removing yourself takes 18 weeks. Read first.', read: '5 min', date: '2026-03-15' },
    { ns: 'http', t: 'A field guide to security headers', d: 'CSP, COEP, COOP, CORP, X-*. Which ones matter, which ones are theater.', read: '12 min', date: '2026-03-04' },
    { ns: 'http', t: 'Reading a redirect chain', d: 'When 301 vs 302 matters, why HTTP→HTTPS→canonical isn\'t one hop, and SEO myths.', read: '5 min', date: '2026-02-22' },
    { ns: 'net', t: 'WebRTC leaks for the impatient', d: 'How RTCPeerConnection exposes your real IP behind a VPN, and three mitigations.', read: '4 min', date: '2026-02-09' },
    { ns: 'net', t: 'IPv6 readiness without the politics', d: 'A practical checklist: AAAA on apex, www, NS, MX. What to fix first.', read: '7 min', date: '2026-01-28' },
    { ns: 'sec', t: 'Password entropy, plainly', d: 'Bits of entropy, why "P@ssw0rd!" is 28 bits, and what crack-time numbers mean.', read: '6 min', date: '2026-01-12' },
  ];

  const groups = {
    dns: 'DNS',
    tls: 'TLS & certificates',
    http: 'HTTP & headers',
    net: 'Network & IP',
    sec: 'Security primitives',
  };

  return (
    <div className="docs-page">
      <Topbar active="docs" />

      <div className="v3-shell">
        <aside className="v3-side">
          <div className="side-head mono">guides</div>
          <ul className="side-list">
            <li className="side-section">getting started</li>
            <li><a href="#" className="active">overview</a></li>
            <li><a href="#">how to read this site</a></li>
            <li><a href="#">conventions</a></li>
            {Object.entries(groups).map(([k, label]) => (
              <React.Fragment key={k}>
                <li className="side-section">{label.toLowerCase()}</li>
                {guides.filter(g => g.ns === k).map(g => (
                  <li key={g.t}><a href="#">{g.t.toLowerCase()}</a></li>
                ))}
              </React.Fragment>
            ))}
          </ul>
          <div className="side-foot mono">
            <div><span className="led ok"></span>9 guides · last update 2026-04-12</div>
            <div className="muted-2">edit on github →</div>
          </div>
        </aside>

        <main className="v3-main docs-main">
          <div className="v3-header">
            <div className="mono muted" style={{ fontSize: 11, letterSpacing:'.12em', textTransform:'uppercase' }}>
              # / guides
            </div>
            <h1>Short, practical, no fluff.</h1>
            <p className="lede">
              Field notes from running these tools and getting them wrong. Each guide
              pairs to a tool you can run in the next tab. No tutorials about choosing
              a domain registrar.
            </p>
            <div className="docs-meta mono">
              <span><span className="led ok"></span>9 guides</span>
              <span className="muted">·</span>
              <span>median 6 min</span>
              <span className="muted">·</span>
              <span>RSS available</span>
              <span className="muted">·</span>
              <span>edits welcome</span>
            </div>
          </div>

          <div className="v3-section">
            <h2 className="mono-h">## index</h2>
            <ol className="docs-list">
              {guides.map((g, i) => (
                <li key={g.t}>
                  <a className="docs-row" href="#">
                    <span className="docs-num mono">{String(i+1).padStart(2, '0')}</span>
                    <span className="docs-ns mono"><span style={{ color: 'var(--accent)' }}>{g.ns}/</span></span>
                    <span className="docs-t">{g.t}</span>
                    <span className="docs-d">{g.d}</span>
                    <span className="docs-meta-cell mono muted">{g.read}</span>
                    <span className="docs-date mono muted-2">{g.date}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>

          <div className="v3-section">
            <h2 className="mono-h">## sample — reading an MX record</h2>
            <article className="prose">
              <p>
                An <code>MX</code> record tells the rest of the Internet where to deliver
                mail for a domain. It has two parts: a <em>priority</em> (lower = preferred)
                and a <em>target hostname</em> (which must itself resolve to an A or AAAA).
              </p>
              <pre className="codeblock">{`pingthat.dev.   3600  IN  MX   10 mail.protonmail.ch.
pingthat.dev.   3600  IN  MX   20 mailsec.protonmail.ch.`}</pre>
              <p>
                Two hosts at different priorities is the minimum. If <code>mail.protonmail.ch</code>
                stops responding on port 25, sending servers retry against the priority-20
                host. A single MX record is a single point of failure for inbound mail.
              </p>
              <h3 style={{ marginTop: 24, fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--accent)' }}>### gotchas</h3>
              <ul>
                <li>The target of an MX record cannot be a CNAME. RFC 2181 §10.3.</li>
                <li>An empty MX (<code>"."</code>) means <em>this domain accepts no mail</em>. Use it on parked domains to kill spoofing.</li>
                <li>TTLs under 300 seconds are usually a bad idea on MX. Resolvers may ignore them, and you'll thrash secondary lookups.</li>
              </ul>
              <div className="callout mono">
                <span className="led ok"></span>
                run <a href="#" style={{ color: 'var(--accent)' }}>net/dns-lookup</a> with type=MX on your domain — and your competitors'.
              </div>
            </article>
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
};

window.DocsPage = DocsPage;
