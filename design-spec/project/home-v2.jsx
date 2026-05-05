// V2 — Terminal hero with typing prompt, sectioned grid index
const HomeV2 = () => {
  const groups = groupTools(window.TOOLS);
  const lines = [
    { p: '$', t: 'pingthat dns-lookup pingthat.dev MX' },
    { o: 'pingthat.dev.   3600  IN  MX   10 mail.protonmail.ch.' },
    { o: 'pingthat.dev.   3600  IN  MX   20 mailsec.protonmail.ch.' },
    { p: '$', t: 'pingthat ssl-checker pingthat.dev' },
    { o: 'subject : CN=pingthat.dev' },
    { o: 'issuer  : Let\'s Encrypt R11 — valid 67 days' },
    { o: 'tls     : 1.3 · X25519 · AES_256_GCM' },
    { o: 'hsts    : max-age=63072000; includeSubDomains; preload' },
    { p: '$', t: 'pingthat headers pingthat.dev | grep -i security' },
    { o: 'strict-transport-security: max-age=63072000; includeSubDomains; preload' },
    { o: 'content-security-policy: default-src \'self\'; ...' },
    { o: 'x-content-type-options: nosniff' },
    { o: 'referrer-policy: strict-origin-when-cross-origin' },
    { p: '$', t: '_', cursor: true },
  ];

  return (
    <div className="page-v2">
      <Topbar active="tools" />

      <section className="shell hero2">
        <div className="hero2-left">
          <div className="kicker mono">// network tools, no server round-trip</div>
          <h1>Diagnose the wire.<br/>Trust nobody — including&nbsp;us.</h1>
          <p className="lede">
            DNS, TLS, headers, latency, leaks. Twenty-three tools that ship as
            static HTML, run in your browser, and never see your queries.
          </p>
          <div className="hero-cta">
            <a className="btn primary" href="#tools">all tools</a>
            <a className="btn" href="#">read the source ↗</a>
          </div>

          <ul className="trust mono">
            <li><span className="led ok"></span>0 KB shipped to our servers</li>
            <li><span className="led ok"></span>0 cookies, 0 trackers, 0 analytics</li>
            <li><span className="led ok"></span>open source · MIT · diff-able</li>
            <li><span className="led ok"></span>23 tools · 1 binary · ~480 KB gzipped</li>
          </ul>
        </div>

        <div className="hero2-right">
          <div className="terminal">
            <div className="t-bar mono">
              <span style={{ color: 'var(--fg-2)' }}>~/pingthat</span>
              <span className="muted-2">— zsh — 96×24</span>
            </div>
            <div className="t-body mono">
              {lines.map((l, i) => (
                <div className="t-line" key={i}>
                  {l.p ? (
                    <>
                      <span className="t-prompt">{l.p}</span>
                      <span className="t-cmd">{l.t}{l.cursor && <span className="caret"></span>}</span>
                    </>
                  ) : (
                    <span className="t-out">{l.o}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="t-foot mono">
              <span className="muted">3 commands · 0 net requests to pingthat · 218 ms</span>
              <span className="muted-2">all queries resolved client-side</span>
            </div>
          </div>
        </div>
      </section>

      <section className="shell" id="tools" style={{ paddingTop: 64 }}>
        <div className="section-head">
          <div>
            <div className="mono" style={{ color:'var(--fg-2)', fontSize:11, letterSpacing:'.12em', textTransform:'uppercase' }}>§ catalog</div>
            <h2>23 tools, four namespaces.</h2>
          </div>
        </div>

        {groups.map(g => (
          <div className="ns-block" key={g.ns}>
            <div className="ns-head">
              <div className="ns-title mono">
                <span style={{ color: 'var(--accent)' }}>{g.ns}/</span>
                <span style={{ color: 'var(--fg-1)' }}>{g.label}</span>
              </div>
              <div className="ns-meta mono muted">{g.items.length} tools · ~{(g.items.length * 12)} KB</div>
            </div>
            <div className="ns-grid">
              {g.items.map(t => (
                <a className="ns-card" key={t.slug} href="#">
                  <div className="ns-card-top mono">
                    <span className="muted">{g.ns}/{t.slug}</span>
                    <kbd>{t.kbd}</kbd>
                  </div>
                  <div className="ns-card-name">{t.name}</div>
                  <div className="ns-card-desc">{t.desc}</div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="shell" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="cta-block">
          <div>
            <div className="mono muted" style={{ fontSize: 11, letterSpacing:'.12em', textTransform:'uppercase', marginBottom: 8 }}>§ for nerds</div>
            <h2 style={{ maxWidth: 560 }}>The whole site is a static folder. Read it. Mirror it. Self-host it.</h2>
          </div>
          <div className="cta-side mono">
            <pre className="codeblock">{`$ git clone https://github.com/allopen/pingthat
$ cd pingthat && python -m http.server
serving on 0.0.0.0:8000 — done.`}</pre>
            <a className="btn" href="#">view on GitHub ↗</a>
          </div>
        </div>
      </section>

      <div className="shell"><Footer /></div>
    </div>
  );
};

window.HomeV2 = HomeV2;
