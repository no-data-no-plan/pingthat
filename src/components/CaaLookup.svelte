<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import { getCaaLookup } from '../i18n/components';
  import { readQuery, updateQuery } from '../lib/share-state';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getCaaLookup(lang));

  interface CaaRecord { flags: number; tag: string; value: string; ttl: number; critical: boolean; raw: string; }
  interface LookupState {
    records: CaaRecord[];
    resolvedFrom: string | null;
    noPolicy: boolean;
  }

  let domain = $state("");
  let state = $state<LookupState | null>(null);
  let loading = $state(false);
  let error = $state("");
  let requestId = $state(0);

  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  function parseGenericRdata(hex: string): { flags: number; tag: string; value: string } | null {
    // RFC 3597 generic RDATA: "\# <length-in-decimal> <hex-bytes>"
    const cleaned = hex.trim().replace(/^\\#\s+\d+\s+/, "");
    const bytes = cleaned.split(/\s+/).map((h) => parseInt(h, 16));
    if (bytes.length < 2 || bytes.some(isNaN)) return null;
    const flags = bytes[0];
    const tagLen = bytes[1];
    if (bytes.length < 2 + tagLen) return null;
    const tag = String.fromCharCode(...bytes.slice(2, 2 + tagLen));
    const value = String.fromCharCode(...bytes.slice(2 + tagLen));
    return { flags, tag, value };
  }

  function parseInlineCaa(data: string): { flags: number; tag: string; value: string } | null {
    // Parsed format: "0 issue \"letsencrypt.org\""
    const m = data.match(/^(\d+)\s+(\w+)\s+"?([^"]*)"?$/);
    if (!m) return null;
    return { flags: parseInt(m[1], 10), tag: m[2], value: m[3] };
  }

  async function queryDomain(name: string): Promise<{ records: CaaRecord[]; hasAuthority: boolean }> {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=CAA`,
      { headers: { Accept: "application/dns-json" }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error("DNS query failed");
    const data = await res.json();
    const answers = (data.Answer || []) as Array<{ name: string; type: number; TTL: number; data: string }>;
    const authority = (data.Authority || []) as Array<{ name: string; type: number }>;
    const records: CaaRecord[] = [];
    for (const a of answers) {
      if (a.type !== 257) continue;
      const parsed = a.data.startsWith("\\#") ? parseGenericRdata(a.data) : parseInlineCaa(a.data);
      if (!parsed) continue;
      records.push({
        flags: parsed.flags,
        tag: parsed.tag,
        value: parsed.value,
        ttl: a.TTL,
        critical: (parsed.flags & 0x80) !== 0,
        raw: a.data,
      });
    }
    return { records, hasAuthority: authority.length > 0 };
  }

  // CW-PT-04 / Theme A (2026-05-02): Hydrate from URL.
  onMount(() => {
    const q = readQuery(["domain"]);
    if (q.domain) {
      domain = q.domain;
      lookup();
    }
  });

  async function lookup() {
    if (!domain.trim()) return;
    requestId++;
    const myId = requestId;
    loading = true; error = ""; state = null;

    const target = domain.trim().toLowerCase();
    if (!domainRegex.test(target)) {
      error = t.invalidDomain;
      loading = false;
      return;
    }
    updateQuery({ domain: target });

    try {
      // Walk up the tree: CAA policy applies from nearest ancestor with records
      const parts = target.split(".");
      let resolvedFrom: string | null = null;
      let records: CaaRecord[] = [];
      for (let i = 0; i < parts.length - 1; i++) {
        const candidate = parts.slice(i).join(".");
        const { records: recs } = await queryDomain(candidate);
        if (myId !== requestId) return;
        if (recs.length > 0) { records = recs; resolvedFrom = candidate; break; }
      }
      if (myId !== requestId) return;
      state = { records, resolvedFrom, noPolicy: records.length === 0 };
    } catch (e: any) {
      if (myId !== requestId) return;
      if (e?.name === 'AbortError' || e?.name === 'TimeoutError') {
        error = lang === 'es' ? 'La petici\u00f3n ha tardado demasiado. Int\u00e9ntalo de nuevo.' : 'Request timed out. Please try again.';
      } else {
        error = t.lookupFailed;
      }
    } finally {
      if (myId === requestId) loading = false;
    }
  }

  const TAG_DESCRIPTIONS: Record<string, { en: string; es: string }> = {
    issue: {
      en: "Authorizes a CA to issue certificates for this domain",
      es: "Autoriza a una CA a emitir certificados para este dominio",
    },
    issuewild: {
      en: "Authorizes a CA to issue wildcard certificates",
      es: "Autoriza a una CA a emitir certificados wildcard",
    },
    iodef: {
      en: "URL or email for the CA to report policy violations",
      es: "URL o email para que la CA reporte violaciones de pol\u00edtica",
    },
    contactemail: {
      en: "Email for the domain operator",
      es: "Email del operador del dominio",
    },
    contactphone: {
      en: "Phone for the domain operator",
      es: "Tel\u00e9fono del operador del dominio",
    },
  };

  function tagDescription(tag: string): string {
    const entry = TAG_DESCRIPTIONS[tag];
    if (!entry) return "";
    return lang === "es" ? entry.es : entry.en;
  }

  const COMMON_CAS = [
    { value: "letsencrypt.org", label: "Let's Encrypt" },
    { value: "pki.goog", label: "Google Trust Services" },
    { value: "digicert.com", label: "DigiCert" },
    { value: "sectigo.com", label: "Sectigo" },
    { value: "comodoca.com", label: "Comodo CA" },
    { value: "ssl.com", label: "SSL.com" },
    { value: "amazon.com", label: "Amazon" },
    { value: "buypass.com", label: "Buypass" },
  ];

  let selectedCa = $state("");

  interface CaCheckResult { ca: string; allowed: boolean; allowedWildcard: boolean; reason: string; }
  const caResult = $derived.by<CaCheckResult | null>(() => {
    if (!state || state.noPolicy || !selectedCa) return null;
    const ca = selectedCa.trim().toLowerCase();
    // RFC 8659: if no issue tag, no CA is allowed. An empty value denies issuance.
    const issueRecords = state.records.filter((r) => r.tag === "issue");
    const issueWildRecords = state.records.filter((r) => r.tag === "issuewild");

    const matches = (records: CaaRecord[]): { allowed: boolean; empty: boolean } => {
      if (records.length === 0) return { allowed: false, empty: true };
      for (const r of records) {
        const val = r.value.split(";")[0].trim().toLowerCase();
        if (val === "") continue; // explicit deny record
        if (val === ca || ca.endsWith("." + val) || val.endsWith("." + ca)) return { allowed: true, empty: false };
      }
      return { allowed: false, empty: false };
    };

    const issueCheck = matches(issueRecords);
    // issuewild falls back to issue when no issuewild records exist per RFC 8659
    const wildCheck = issueWildRecords.length > 0 ? matches(issueWildRecords) : issueCheck;

    const allowed = issueCheck.allowed;
    const allowedWildcard = wildCheck.allowed;
    let reason: string;
    if (allowed && allowedWildcard) reason = t.reasonAllowedAll;
    else if (allowed) reason = t.reasonAllowedNonWildcard;
    else if (issueCheck.empty) reason = t.reasonNoIssueRecords;
    else reason = t.reasonNotListed;
    return { ca, allowed, allowedWildcard, reason };
  });

  const fireToolComplete = useToolComplete("caa-lookup");
  let __ftcFirstRun = true;
  $effect(() => {
    domain; state; loading; error; requestId; selectedCa;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    if (error) return;
    if (!state) return;
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="caa-domain" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.domainLabel}</label>
      <input id="caa-domain" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={domain} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && lookup()} style="width: 100%;" />
      <button class="btn-primary" onclick={lookup} disabled={loading || !domain.trim()}>
        {loading ? t.looking : t.lookup}
      </button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
  {#if error}
    <div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>
  {/if}

  {#if state}
    {#if state.noPolicy}
      <div class="card" style="border-left: 3px solid var(--color-yellow, #eab308);">
        <div class="card-body">
          <div style="font-weight: 600; margin-bottom: 4px;">{t.noPolicyTitle}</div>
          <div style="font-size: 13px; color: var(--color-text-muted);">{t.noPolicyExplanation}</div>
        </div>
      </div>
    {:else}
      <div class="card" style="border-left: 3px solid var(--color-green, #22c55e); margin-bottom: 16px;">
        <div class="card-body">
          <div style="font-weight: 600; margin-bottom: 4px;">{t.policyFoundTitle}</div>
          {#if state.resolvedFrom && state.resolvedFrom !== domain.trim().toLowerCase()}
            <div style="font-size: 13px; color: var(--color-text-muted);">{t.inheritedFrom} <code>{state.resolvedFrom}</code></div>
          {/if}
        </div>
      </div>

      <div class="card" style="margin-bottom: 16px;">
        <div class="card-header"><span class="card-title">{t.caCheckTitle}</span></div>
        <div class="card-body space-y-3">
          <div style="font-size: 12px; color: var(--color-text-muted);">{t.caCheckHint}</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            {#each COMMON_CAS as ca}
              <button type="button" class={selectedCa === ca.value ? "btn-primary" : "btn-secondary"} style="padding: 6px 12px; font-size: 12px;" onclick={() => { selectedCa = ca.value; }}>{ca.label}</button>
            {/each}
          </div>
          <input type="text" bind:value={selectedCa} placeholder={t.caCheckPlaceholder} style="width: 100%;" spellcheck="false" autocapitalize="off" autocorrect="off" />
          {#if caResult}
            <div style="padding: 10px 14px; border-radius: 6px; border-left: 3px solid {caResult.allowed ? 'var(--color-green)' : 'var(--color-red)'}; background: var(--color-bg-muted, #f1f5f9);">
              <div style="font-weight: 700; color: {caResult.allowed ? 'var(--color-green)' : 'var(--color-red)'};">
                {caResult.allowed ? t.allowed : t.notAllowed}: <span style="font-family: monospace;">{caResult.ca}</span>
              </div>
              <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 4px;">{caResult.reason}</div>
              {#if caResult.allowed && !caResult.allowedWildcard}
                <div style="font-size: 12px; color: var(--color-yellow); margin-top: 4px;">{t.wildcardBlocked}</div>
              {/if}
            </div>
          {/if}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">{t.records} ({state.records.length})</span></div>
        <div class="card-body" style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 1px solid var(--color-border);">
                <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">{t.colTag}</th>
                <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">{t.colValue}</th>
                <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">{t.colFlags}</th>
                <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">TTL</th>
              </tr>
            </thead>
            <tbody>
              {#each state.records as r}
                <tr style="border-bottom: 1px solid var(--color-border);">
                  <td style="padding: 6px; font-weight: 600; color: var(--color-accent-fg);">
                    {r.tag}
                    {#if tagDescription(r.tag)}
                      <div style="font-size: 11px; font-weight: 400; color: var(--color-text-muted); margin-top: 2px;">{tagDescription(r.tag)}</div>
                    {/if}
                  </td>
                  <td style="padding: 6px; font-family: monospace; word-break: break-all;">{r.value || t.anyCa}</td>
                  <td style="padding: 6px;">
                    {r.flags}
                    {#if r.critical}
                      <span style="display: inline-block; margin-left: 6px; padding: 1px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; color: #fff; background: var(--color-red, #ef4444);">{t.critical}</span>
                    {/if}
                  </td>
                  <td style="padding: 6px; color: var(--color-text-muted);">{r.ttl}s</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {/if}
  </div>
</div>
