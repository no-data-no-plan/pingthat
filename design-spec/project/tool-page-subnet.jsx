// Subnet Calculator tool page — engagement audit Theme H
//
// Resolves:
//   - F-03: unified CIDR input that accepts "192.168.1.0/24" OR "192.168.1.0"
//     in a single field, then auto-splits. The current production has IP +
//     range slider as separate controls; users pasting "192.168.1.0/24"
//     break the parser silently.
//   - F-01: pre-rendered SSR result table is in the markup so cold visitors
//     see numbers above-fold even before hydration. No 80vh blank wait.
//   - F-05: instructional subtext above the input clarifies the pre-filled
//     example so users know they can replace it.
//
// This is the design surface — production migration wires the parse logic
// (existing in SubnetCalculator.svelte parseIp/cidr -> derive network/
// broadcast/range) to a single input string with regex /^(\d+\.\d+\.\d+\.\d+)(?:\s*\/\s*(\d+))?$/.

const SubnetToolPage = () => {
  const [cidr, setCidr] = useState('192.168.1.0/24');

  // Demo result for the design — production replaces with $derived.by(parse)
  const result = {
    network: '192.168.1.0',
    broadcast: '192.168.1.255',
    netmask: '255.255.255.0',
    wildcard: '0.0.0.255',
    firstHost: '192.168.1.1',
    lastHost: '192.168.1.254',
    totalHosts: 256,
    usableHosts: 254,
    cidrBits: 24,
    binaryNetwork: '11000000.10101000.00000001.00000000',
  };

  return (
    <div className="tool-page">
      <LangBanner lang="es" />
      <Topbar active="tools" />

      <div className="shell">
        <div className="crumbs mono">
          <a href="#">tools</a>
          <span className="muted-2">/</span>
          <a href="#" style={{ color: 'var(--accent-2)' }}>calc</a>
          <span className="muted-2">/</span>
          <span>subnet-calculator</span>
        </div>

        <div className="tool-head">
          <div>
            <h1 className="tool-h1">Subnet Calculator</h1>
            <p className="tool-sub">
              Network, broadcast, host range, wildcard mask, and binary breakdown
              from any CIDR. Paste <span className="mono" style={{ color: 'var(--accent)' }}>192.168.1.0/24</span> directly — the input
              accepts the full notation or just the IP.
            </p>
          </div>
          <div className="tool-meta mono">
            <div><span className="muted">tool</span> calc/subnet-calculator</div>
            <div><span className="muted">version</span> 0.42.1</div>
            <div><span className="muted">runs in</span> &lt;1 ms</div>
            <div><span className="led ok"></span> client-only</div>
          </div>
        </div>

        <div className="tool-form subnet-form">
          {/* Single unified CIDR input — replaces the legacy split IP+slider.
              Placeholder is the same example value so users see what the
              expected input shape looks like even when the field is empty. */}
          <div className="form-row subnet-input-row">
            <label className="mono">network</label>
            <input
              value={cidr}
              onChange={e => setCidr(e.target.value)}
              className="mono subnet-input"
              placeholder="192.168.1.0/24  (or just 192.168.1.0)"
              autoFocus
            />
            <span className="mono muted subnet-hint">
              try <code>10.0.0.0/16</code> · <code>172.16.0.0/12</code> · <code>2001:db8::/32</code>
            </span>
          </div>
          <div className="form-row">
            <span className="mono muted" style={{ fontSize: 12 }}>
              Pre-filled with <code>192.168.1.0/24</code> as an example — type your CIDR to replace.
            </span>
          </div>
        </div>

        <div className="result subnet-result">
          <div className="result-head mono">
            <span><span className="led ok"></span>parsed</span>
            <span className="muted">·</span>
            <span>{result.cidrBits}-bit prefix</span>
            <span className="muted">·</span>
            <span>{result.usableHosts} usable hosts</span>
            <span className="muted">·</span>
            <span>RFC 1918 private space</span>
            <span style={{ marginLeft: 'auto' }} className="muted">computed in 0.4 ms</span>
          </div>

          <div className="subnet-grid">
            <SubnetTile label="network address"   value={result.network}    sub={`${result.cidrBits}-bit prefix`} />
            <SubnetTile label="broadcast"         value={result.broadcast}  sub="last address" />
            <SubnetTile label="netmask"           value={result.netmask}    sub={result.binaryNetwork} mono />
            <SubnetTile label="wildcard"          value={result.wildcard}   sub="ACL inverse" />
            <SubnetTile label="first usable host" value={result.firstHost}  sub="assignable" status="ok" />
            <SubnetTile label="last usable host"  value={result.lastHost}   sub="assignable" status="ok" />
            <SubnetTile label="total addresses"   value={String(result.totalHosts)}  sub={`${result.cidrBits}-bit /${result.cidrBits}`} />
            <SubnetTile label="usable hosts"      value={String(result.usableHosts)} sub="excludes net + bcast" status="ok" />
          </div>

          <div className="result-foot mono">
            <details>
              <summary>binary breakdown</summary>
              <pre className="codeblock">{`network  ${result.binaryNetwork}
mask     11111111.11111111.11111111.00000000
host     ........ ........ ........ XXXXXXXX  (8 bits)`}</pre>
            </details>
          </div>
        </div>

        {/* Chain CTA: actively prompts user to follow up with related tools
            on the same domain. Resolves Agent 3 "chain feature invisible". */}
        <div className="related">
          <div className="mono muted" style={{ fontSize: 11, letterSpacing:'.12em', textTransform:'uppercase', marginBottom: 12 }}>
            also useful on this network
          </div>
          <div className="related-grid">
            {['ip-converter', 'my-ip', 'ipv6-check', 'reverse-dns', 'port-scan'].map(s => {
              const t = window.TOOLS.find(x => x.slug === s);
              if (!t) return null;
              return (
                <a key={s} className="related-card" href="#">
                  <div className="mono muted" style={{ fontSize: 11 }}>{t.ns}/{s}</div>
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

function SubnetTile({ label, value, sub, status, mono }) {
  return (
    <div className="tile">
      <div className="label">
        {status && <span className={`led ${status}`} style={{ marginRight: 6 }}></span>}
        {label}
      </div>
      <div className="val" style={mono ? { fontSize: 12 } : null}>{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

window.SubnetToolPage = SubnetToolPage;
