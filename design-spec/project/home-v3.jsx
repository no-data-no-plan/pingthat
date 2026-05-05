// V3 — Command palette open by default, docs sidebar
const HomeV3 = () => {
  const groups = groupTools(window.TOOLS);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const filtered = useMemo(() => {
    if (!q) return window.TOOLS;
    const s = q.toLowerCase();
    return window.TOOLS.filter(t =>
      t.name.toLowerCase().includes(s) ||
      t.slug.includes(s) ||
      t.desc.toLowerCase().includes(s) ||
      t.ns.includes(s)
    );
  }, [q]);

  // Sidebar scroll-to anchor (visual only)
  const [activeNs, setActiveNs] = useState('net');

  return (
    <div className="page-v3">
      <Topbar active="tools" />

      <div className="v3-shell">
        <aside className="v3-side">
          <div className="side-head mono">contents</div>
          <ul className="side-list">
            <li className="side-section">homepage</li>
            <li><a href="#search" className="active">search</a></li>
            <li><a href="#index">tool index</a></li>
            <li><a href="#trust">trust model</a></li>
            <li><a href="#stack">stack</a></li>
            <li className="side-section">namespaces</li>
            {groups.map(g => (
              <li key={g.ns}>
                <a
                  href={`#ns-${g.ns}`}
                  className={activeNs === g.ns ? 'active' : ''}
                  onClick={() => setActiveNs(g.ns)}
                >
                  <span className="mono" style={{ color: 'var(--accent)' }}>{g.ns}/</span>
                  <span>{g.label}</span>
                  <span className="mono muted-2" style={{ marginLeft: 'auto', fontSize: 10 }}>{g.items.length}</span>
                </a>
              </li>
            ))}
            <li className="side-section">other</li>
            <li><a href="#">guides</a></li>
            <li><a href="#">changelog</a></li>
            <li><a href="#">comparisons</a></li>
            <li><a href="#">api (planned)</a></li>
          </ul>
          <div className="side-foot mono">
            <div><span className="led ok"></span>build a3f29c · 2026-04-29</div>
            <div className="muted-2">23 tools · 0 servers</div>
          </div>
        </aside>

        <main className="v3-main">
          <div className="v3-header" id="search">
            <div className="mono muted" style={{ fontSize: 11, letterSpacing:'.12em', textTransform:'uppercase' }}>
              # / homepage
            </div>
            <h1>Pick a tool. Or type one.</h1>
            <p className="lede">
              PingThat is a command palette over a flat list of network diagnostics.
              No dashboards, no logins, no telemetry. Search by name, by namespace,
              or by what you're trying to find out.
            </p>
          </div>

          <div className="palette" id="palette">
            <div className="palette-input">
              <span className="mono" style={{ color: 'var(--accent)' }}>›</span>
              <input
                value={q}
                onChange={e => { setQ(e.target.value); setActive(0); }}
                placeholder="search tools, e.g. dns, mx, ssl, leak…"
                autoFocus
              />
              <span className="mono muted" style={{ fontSize: 11 }}>{filtered.length} match</span>
              <kbd>esc</kbd>
            </div>

            <div className="palette-results">
              {filtered.length === 0 && (
                <div className="palette-empty mono muted">no tools match — try "ssl" or "ip"</div>
              )}
              {filtered.slice(0, 8).map((t, i) => (
                <a key={t.slug} className={`palette-row ${i === active ? 'active' : ''}`} href="#"
                   onMouseEnter={() => setActive(i)}>
                  <span className="mono palette-path">
                    <span style={{ color: 'var(--accent-2)' }}>{t.ns}</span>/{t.slug}
                  </span>
                  <span className="palette-name">{t.name}</span>
                  <span className="palette-desc">{t.desc}</span>
                  <kbd>{t.kbd}</kbd>
                </a>
              ))}
            </div>

            <div className="palette-foot mono">
              <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
              <span><kbd>↵</kbd> open</span>
              <span><kbd>tab</kbd> filter by ns</span>
              <span className="muted-2" style={{ marginLeft: 'auto' }}>fuzzy · client-side</span>
            </div>
          </div>

          <div className="v3-section" id="index">
            <h2 className="mono-h">## the full index</h2>
            {groups.map(g => (
              <div className="v3-ns" id={`ns-${g.ns}`} key={g.ns}>
                <div className="v3-ns-head">
                  <span className="mono"><span style={{ color: 'var(--accent)' }}>{g.ns}/</span><span style={{ color: 'var(--fg-1)' }}>{g.label}</span></span>
                  <span className="mono muted">{g.items.length} tools</span>
                </div>
                <ol className="v3-list">
                  {g.items.map((t, i) => (
                    <li key={t.slug}>
                      <a href="#" className="v3-item">
                        <span className="v3-num mono">{String(i+1).padStart(2, '0')}</span>
                        <span className="v3-name">{t.name}</span>
                        <span className="v3-slug mono muted">{t.slug}</span>
                        <span className="v3-desc">{t.desc}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          <div className="v3-section" id="trust">
            <h2 className="mono-h">## the trust model</h2>
            <div className="trust-grid">
              <TrustItem n="01" t="static html"
                d="The site is a folder of HTML, JS, and CSS. No application server, no database, no edge functions on the request path." />
              <TrustItem n="02" t="client-only queries"
                d="DNS goes to DoH endpoints (Cloudflare, Google) directly from your browser. Headers and TLS checks use the public Internet, not us." />
              <TrustItem n="03" t="no analytics"
                d="No GA, Plausible, Sentry, Posthog, etc. View-source confirms it. Fastly access logs are dropped after 7 days." />
              <TrustItem n="04" t="diff-able"
                d="The repo is on GitHub under MIT. Every release is signed. You can mirror this site in 30 seconds — `python -m http.server`." />
            </div>
          </div>

          <div className="v3-section" id="stack">
            <h2 className="mono-h">## the stack</h2>
            <table className="stack-table">
              <tbody>
                <tr><td className="mono">runtime</td><td>browser, anything ≥ 2020</td></tr>
                <tr><td className="mono">framework</td><td>none — vanilla JS + a couple of web components</td></tr>
                <tr><td className="mono">dns</td><td>DoH to 1.1.1.1, 8.8.8.8, 9.9.9.9, dns.adguard.com</td></tr>
                <tr><td className="mono">tls / certs</td><td>crt.sh, certificate transparency logs</td></tr>
                <tr><td className="mono">whois</td><td>RDAP (rdap.iana.org)</td></tr>
                <tr><td className="mono">build</td><td>esbuild, ~340 ms cold</td></tr>
                <tr><td className="mono">host</td><td>Cloudflare Pages, free tier</td></tr>
                <tr><td className="mono">total weight</td><td>~480 KB gz, 23 tools</td></tr>
              </tbody>
            </table>
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
};

function TrustItem({ n, t, d }) {
  return (
    <div className="trust-item">
      <div className="trust-n mono">{n}</div>
      <div className="trust-t">{t}</div>
      <div className="trust-d">{d}</div>
    </div>
  );
}

window.HomeV3 = HomeV3;
