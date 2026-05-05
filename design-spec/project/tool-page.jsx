// DNS Lookup tool page
const ToolPage = () => {
  const [domain, setDomain] = useState('pingthat.dev');
  const [type, setType] = useState('A');
  const [resolver, setResolver] = useState('1.1.1.1');

  const records = {
    A: [
      { name: 'pingthat.dev.', ttl: 300, data: '104.21.48.117' },
      { name: 'pingthat.dev.', ttl: 300, data: '172.67.142.18' },
    ],
    AAAA: [
      { name: 'pingthat.dev.', ttl: 300, data: '2606:4700:3036::6815:3075' },
      { name: 'pingthat.dev.', ttl: 300, data: '2606:4700:3036::ac43:8e12' },
    ],
    MX: [
      { name: 'pingthat.dev.', ttl: 3600, data: '10 mail.protonmail.ch.' },
      { name: 'pingthat.dev.', ttl: 3600, data: '20 mailsec.protonmail.ch.' },
    ],
    NS: [
      { name: 'pingthat.dev.', ttl: 86400, data: 'kira.ns.cloudflare.com.' },
      { name: 'pingthat.dev.', ttl: 86400, data: 'walt.ns.cloudflare.com.' },
    ],
    TXT: [
      { name: 'pingthat.dev.', ttl: 300, data: '"v=spf1 include:_spf.protonmail.ch ~all"' },
      { name: '_dmarc.pingthat.dev.', ttl: 300, data: '"v=DMARC1; p=quarantine; rua=mailto:dmarc@pingthat.dev"' },
    ],
  };
  const r = records[type] || records.A;

  return (
    <div className="tool-page">
      <Topbar active="tools" />

      <div className="shell">
        <div className="crumbs mono">
          <a href="#">tools</a>
          <span className="muted-2">/</span>
          <a href="#" style={{ color: 'var(--accent-2)' }}>net</a>
          <span className="muted-2">/</span>
          <span>dns-lookup</span>
        </div>

        <div className="tool-head">
          <div>
            <h1 className="tool-h1">DNS Lookup</h1>
            <p className="tool-sub">
              Query authoritative DNS for any domain. Sends DoH directly from your
              browser to the resolver of your choice. Nothing reaches our servers.
            </p>
          </div>
          <div className="tool-meta mono">
            <div><span className="muted">tool</span> net/dns-lookup</div>
            <div><span className="muted">version</span> 0.42.1</div>
            <div><span className="muted">avg latency</span> 24 ms</div>
            <div><span className="led ok"></span> resolver online</div>
          </div>
        </div>

        <div className="tool-form">
          <div className="form-row">
            <label className="mono">domain</label>
            <input value={domain} onChange={e => setDomain(e.target.value)} className="mono" />
          </div>
          <div className="form-row narrow">
            <label className="mono">type</label>
            <div className="seg">
              {['A','AAAA','MX','NS','TXT','CNAME','SOA','CAA'].map(t => (
                <button key={t} className={`seg-btn ${type===t?'on':''}`} onClick={() => setType(t)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="form-row narrow">
            <label className="mono">resolver</label>
            <div className="seg">
              {['1.1.1.1','8.8.8.8','9.9.9.9','dns.adguard.com'].map(t => (
                <button key={t} className={`seg-btn ${resolver===t?'on':''}`} onClick={() => setResolver(t)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <button className="btn primary">resolve →</button>
            <span className="mono muted" style={{ fontSize: 12, marginLeft: 12 }}>
              <kbd>↵</kbd> to run
            </span>
          </div>
        </div>

        <div className="result">
          <div className="result-head mono">
            <span><span className="led ok"></span>NOERROR</span>
            <span className="muted">·</span>
            <span>{r.length} answer{r.length === 1 ? '' : 's'}</span>
            <span className="muted">·</span>
            <span>{type}</span>
            <span className="muted">·</span>
            <span>{resolver}</span>
            <span className="muted">·</span>
            <span>22 ms</span>
            <span style={{ marginLeft: 'auto' }} className="muted">queried at 14:08:21 UTC</span>
          </div>

          <table className="dns-table">
            <thead>
              <tr><th>name</th><th>type</th><th>ttl</th><th>data</th></tr>
            </thead>
            <tbody>
              {r.map((rec, i) => (
                <tr key={i}>
                  <td className="mono">{rec.name}</td>
                  <td className="mono"><span style={{ color: 'var(--accent-2)' }}>{type}</span></td>
                  <td className="mono muted">{rec.ttl}</td>
                  <td className="mono">{rec.data}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="result-foot mono">
            <details>
              <summary>raw response</summary>
              <pre className="codeblock">{JSON.stringify({
                Status: 0,
                TC: false, RD: true, RA: true, AD: false, CD: false,
                Question: [{ name: domain, type }],
                Answer: r.map(x => ({ name: x.name, type, TTL: x.ttl, data: x.data })),
              }, null, 2)}</pre>
            </details>
          </div>
        </div>

        <div className="related">
          <div className="mono muted" style={{ fontSize: 11, letterSpacing:'.12em', textTransform:'uppercase', marginBottom: 12 }}>related</div>
          <div className="related-grid">
            {['reverse-dns', 'email-auth', 'dnssec-check', 'resolver-compare', 'caa-lookup'].map(s => {
              const t = window.TOOLS.find(x => x.slug === s);
              return (
                <a key={s} className="related-card" href="#">
                  <div className="mono muted" style={{ fontSize: 11 }}>net/{s}</div>
                  <div style={{ fontWeight: 500, marginTop: 4 }}>{t.name}</div>
                  <div style={{ color: 'var(--fg-1)', fontSize: 13, marginTop: 4 }}>{t.desc}</div>
                </a>
              );
            })}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

window.ToolPage = ToolPage;
