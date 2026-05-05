// V1 — Live network readout hero + dense table tool index
const HomeV1 = () => {
  const net = useFakeNetwork();
  const groups = groupTools(window.TOOLS);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');
  const ss = String(now.getUTCSeconds()).padStart(2, '0');

  // Pill row content — picks the highest-value tools for cold-landing scan.
  // Order matches "queries that brought you here" patterns: subnet (top GSC
  // query Spanish-leaning), DNS, SSL, JWT, plus the live tool count for
  // visible scale signal. Each pill is a one-tap deep-link from above-fold —
  // resolves Agent 1's "0 clickables besides search" finding.
  const pills = [
    { ns: 'calc', slug: 'subnet-calculator', label: 'subnet calc' },
    { ns: 'net',  slug: 'dns-lookup',         label: 'DNS lookup' },
    { ns: 'sec',  slug: 'ssl-checker',        label: 'SSL checker' },
    { ns: 'calc', slug: 'jwt-decoder',        label: 'JWT decoder' },
    { ns: 'net',  slug: 'my-ip',              label: 'what is my IP' },
  ];

  return (
    <div className="page-v1">
      {/* Visible only when CF Worker detects Accept-Language: es and user is
          not already on /es/. Stays a single non-modal strip — engagement
          audit flagged 24/51 users from Spain on EN page as the primary
          back-button trigger for queries like "calculadora subneteo". */}
      <LangBanner lang="es" />

      <Topbar active="tools" />

      <section className="shell hero">
        <div className="hero-grid">
          <div className="hero-left">
            <div className="kicker mono">
              <span className="led ok"></span>
              connected · {hh}:{mm}:{ss} UTC
            </div>
            <h1>
              Network tools<br/>
              that don't&nbsp;phone&nbsp;home.
            </h1>
            <p className="lede">
              23 diagnostics for DNS, TLS, HTTP, IP, and the wires in between.
              Every check runs in the tab you have open right now — your inputs,
              your outputs, your machine.
              <br/><br/>
              <span style={{ color: 'var(--fg-2)' }}>
                Results carry between tools — check DNS, then SSL, then headers
                on the same domain without retyping.
              </span>
            </p>

            {/* Pill row: scannable jump-table to the 5 most-searched tools.
                Closes Agent 1's "user has nowhere to tap besides search". */}
            <div className="hero-pills">
              {pills.map(p => (
                <a key={p.slug} className="hero-pill mono" href={`#${p.slug}`}>
                  <span style={{ color: 'var(--accent-2)' }}>{p.ns}/</span>
                  <span>{p.label}</span>
                </a>
              ))}
              <span className="hero-pill-meta mono muted">+18 more</span>
            </div>

            <div className="hero-cta">
              <a className="btn primary" href="#tools">browse all 23 →</a>
              <span className="muted mono" style={{ fontSize: 12 }}>
                or press <kbd>⌘</kbd> <kbd>K</kbd> to search
              </span>
            </div>
          </div>

          <div className="hero-right">
            <div className="readout">
              <div className="readout-head">
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', textTransform:'uppercase', letterSpacing:'.1em' }}>
                  $ pingthat --inspect self
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{net.ua}</span>
              </div>
              <div className="readout-grid">
                <Tile label="public ipv4" value={net.ip4} sub="rdns ok" status="ok" />
                <Tile label="public ipv6" value={net.ip6} sub="aaaa reachable" status="ok" />
                <Tile label="asn / origin" value={net.asn.split(' ')[0]} sub={net.asn.split(' ').slice(1).join(' ')} />
                <Tile label="approx location" value={net.city} sub={`mtu ${net.mtu} · no proxy`} />
                <Tile label="dns resolver" value={net.resolver.split(' ')[0]} sub={`${net.resolver.split(' ').slice(1).join(' ')} · ${net.rtt}ms`} status="ok" />
                <Tile label="tls" value="1.3" sub="x25519 · aes_256_gcm" status="ok" />
                <Tile label="webrtc leak" value="none" sub="rtcpeerconnection blocked stun" status="ok" />
                <Tile label="cookies / 3p" value="strict" sub="totp + tracking blocked" status="ok" />
              </div>
              <div className="readout-foot mono">
                <span className="muted">8 checks · 142 ms · client-only</span>
                <a href="#" className="muted">re-run ↻</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell strip">
        <Strip k="tools" v="23" />
        <Strip k="bytes sent to server" v="0" accent />
        <Strip k="cookies set" v="0" accent />
        <Strip k="open source" v="MIT" />
        <Strip k="median request rtt" v="—" sub="(none made)" accent />
      </section>

      <section className="shell" id="tools" style={{ paddingTop: 56 }}>
        <div className="section-head">
          <div>
            <div className="mono" style={{ color:'var(--fg-2)', fontSize:11, letterSpacing:'.12em', textTransform:'uppercase' }}>§ catalog</div>
            <h2>All 23 tools</h2>
          </div>
          <div className="filter">
            <span className="mono muted" style={{ fontSize: 12 }}>filter</span>
            <span className="chip active">all</span>
            <span className="chip">network</span>
            <span className="chip">security</span>
            <span className="chip">speed</span>
            <span className="chip">calc</span>
          </div>
        </div>

        <table className="tools-list">
          <thead>
            <tr>
              <th style={{ width: 140 }}>path</th>
              <th style={{ width: 220 }}>tool</th>
              <th>description</th>
              <th style={{ width: 60, textAlign: 'right' }}>key</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <React.Fragment key={g.ns}>
                <tr className="section-row">
                  <td colSpan="3"><span className="section-title">{g.label}</span></td>
                  <td className="section-meta" style={{ textAlign: 'right' }}>{g.items.length} tools</td>
                </tr>
                {g.items.map(t => (
                  <tr key={t.slug} className="row">
                    <td className="path"><span className="ns">{t.ns}</span>/{t.slug}</td>
                    <td className="name">{t.name}</td>
                    <td className="desc">{t.desc}</td>
                    <td className="kbd"><kbd>{t.kbd}</kbd></td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </section>

      <section className="shell compare">
        <div className="mono" style={{ color:'var(--fg-2)', fontSize:11, letterSpacing:'.12em', textTransform:'uppercase', marginBottom:12 }}>§ side by side</div>
        <h2>Compare with the legacy guys.</h2>
        <div className="compare-grid">
          {[
            ['mxtoolbox', 'ad-laden, server-side, signs you up'],
            ['dnschecker', 'lots of regions, lots of trackers'],
            ['hackertarget', 'paywalled past 5 lookups'],
            ['securityheaders', 'one trick, no API'],
            ['whatismyip', 'what year is it'],
          ].map(([n, d]) => (
            <a key={n} className="compare-card" href="#">
              <div className="mono" style={{ color: 'var(--accent)', fontSize: 12 }}>vs {n}</div>
              <div style={{ color: 'var(--fg-1)', fontSize: 13, marginTop: 4 }}>{d}</div>
              <div className="mono" style={{ color: 'var(--fg-2)', fontSize: 11, marginTop: 16 }}>read →</div>
            </a>
          ))}
        </div>
      </section>

      <div className="shell"><Footer /></div>
    </div>
  );
};

function Tile({ label, value, sub, status }) {
  return (
    <div className="tile">
      <div className="label">
        {status && <span className={`led ${status}`} style={{ marginRight: 6 }}></span>}
        {label}
      </div>
      <div className="val">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

function Strip({ k, v, sub, accent }) {
  return (
    <div className={`strip-cell ${accent ? 'accent' : ''}`}>
      <div className="strip-k mono">{k}</div>
      <div className="strip-v mono">{v}</div>
      {sub && <div className="strip-sub mono">{sub}</div>}
    </div>
  );
}

window.HomeV1 = HomeV1;
