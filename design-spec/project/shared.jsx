// Shared chrome — topbar + footer + small helpers
const { useEffect, useState, useMemo, useRef } = React;

function Brand() {
  return (
    <a href="#" className="brand">
      <span className="dot"></span>
      <span>pingthat</span>
      <span style={{ color: 'var(--fg-3)' }}>/</span>
      <span style={{ color: 'var(--fg-2)' }}>dev</span>
    </a>
  );
}

function Topbar({ active }) {
  return (
    <header className="topbar">
      <div className="lhs">
        <Brand />
        <nav>
          <a href="#" style={active === 'tools' ? { color: 'var(--fg)' } : null}>tools</a>
          <a href="#" style={active === 'docs' ? { color: 'var(--fg)' } : null}>guides</a>
          <a href="#">changelog</a>
          <a href="#">about</a>
        </nav>
      </div>
      <div className="rhs">
        <span className="pill"><span className="led"></span>all systems normal</span>
        <span className="muted-2">v0.42.1</span>
        <a href="#" style={{ color: 'var(--fg-2)' }}>github ↗</a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-identity">
        <div>
          © 2025–2026 pingthat.dev — runs entirely in your browser. no data collected. no accounts. no tracking.
        </div>
        <div className="footer-stamp mono">
          built by <a href="https://github.com/allopen" style={{ color: 'var(--fg-1)' }}>marco bia</a>
          <span className="muted-2"> · </span>
          <a href="mailto:hello@pingthat.dev">hello@pingthat.dev</a>
          <span className="muted-2"> · </span>
          <span className="muted-2">since 2025 · v0.42.1 · last verified may 2026</span>
        </div>
      </div>
      <div className="footer-links">
        <a href="#">about</a>
        <a href="#">privacy</a>
        <a href="#">guides</a>
        <a href="#">changelog</a>
        <a href="#">rss</a>
        <a href="#" className="muted-2">github ↗</a>
      </div>
    </footer>
  );
}

// Non-intrusive language banner for ES visitors arriving via Spanish queries
// (24/51 user share over 28d in the engagement audit). Renders a single-line
// strip at the very top — no modal, no overlay; user can dismiss or click
// through to /es. Detection happens in real impl via Accept-Language at
// the edge (CF Worker) — the design just shows the surface.
function LangBanner({ lang = 'es' }) {
  const copy = lang === 'es'
    ? '¿Prefieres español? — esta página existe en tu idioma'
    : 'Prefer English? — this page is available in your language';
  const target = lang === 'es' ? '/es/' : '/';
  return (
    <div className="lang-banner mono">
      <span className="led" style={{ background: 'var(--accent)' }}></span>
      <span className="lang-banner-copy">{copy}</span>
      <a href={target} className="lang-banner-cta">ver en {lang === 'es' ? 'español' : 'english'} →</a>
      <button className="lang-banner-dismiss" aria-label="dismiss">×</button>
    </div>
  );
}

// -- Fake live network data, deterministic-ish so screenshots are stable
function useFakeNetwork() {
  return useMemo(() => ({
    ip4: '186.45.218.127',
    ip6: '2803:9810:5183:c45f::a4',
    asn: 'AS22927 Telecom Argentina S.A.',
    city: 'Buenos Aires, AR',
    resolver: '1.1.1.1 (Cloudflare)',
    rtt: 14,
    tls: 'TLS 1.3 — X25519 / AES_256_GCM',
    ua: 'Chrome 138 on macOS 15.4',
    rdns: 'host127.218.45.186.telecom.com.ar',
    mtu: 1500,
    proxy: false,
  }), []);
}

// Group tools by namespace
function groupTools(tools) {
  const order = ['net', 'sec', 'perf', 'calc'];
  const groups = {};
  tools.forEach(t => { (groups[t.ns] ||= []).push(t); });
  return order.filter(k => groups[k]).map(k => ({ ns: k, label: window.NS_LABEL[k], items: groups[k] }));
}

Object.assign(window, { Brand, Topbar, Footer, LangBanner, useFakeNetwork, groupTools });
