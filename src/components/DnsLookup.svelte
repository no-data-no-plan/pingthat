<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import { getDnsLookup } from '../i18n/components';
  import { readQuery, updateQuery, pushRecent, getRecent } from '../lib/share-state';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getDnsLookup(lang));

  let domain = $state("");
  let recordType = $state("A");
  let results = $state<{ name: string; type: number; TTL: number; data: string }[]>([]);
  let loading = $state(false);
  let error = $state("");
  let requestId = $state(0);
  let recent = $state<string[]>([]);

  const types = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "SRV"];

  onMount(() => {
    // Hydrate from URL (?domain=...&type=...) for shareable links.
    const q = readQuery(["domain", "type"]);
    if (q.domain) domain = q.domain;
    if (q.type && types.includes(q.type)) recordType = q.type;
    recent = getRecent("dns-lookup");
    if (q.domain) lookup();
  });

  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  async function lookup() {
    if (!domain.trim()) return;
    requestId++;
    const myId = requestId;
    loading = true;
    error = "";
    results = [];

    if (!domainRegex.test(domain.trim())) {
      error = t.invalidDomain;
      loading = false;
      return;
    }

    // Mirror the input state into the URL + recent history. Done here
    // (not on every keystroke) so only successful-format queries are
    // persisted.
    updateQuery({ domain: domain.trim(), type: recordType });
    pushRecent("dns-lookup", domain.trim());
    recent = getRecent("dns-lookup");

    try {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain.trim())}&type=${recordType}`,
        { headers: { Accept: "application/dns-json" }, signal: AbortSignal.timeout(5000) }
      );
      if (myId !== requestId) return;
      if (!res.ok) throw new Error("DNS query failed");
      const data = await res.json();
      if (myId !== requestId) return;
      results = data.Answer || [];
      if (results.length === 0) error = t.noRecords;
    } catch (e: any) {
      if (myId !== requestId) return;
      if (e?.name === 'AbortError' || e?.name === 'TimeoutError') {
        error = lang === 'es'
          ? 'La petición ha tardado demasiado. Inténtalo de nuevo.'
          : 'Request timed out. Please try again.';
      } else {
        error = t.lookupFailed;
      }
    } finally {
      if (myId === requestId) loading = false;
    }
  }

  function typeLabel(type: number): string {
    const map: Record<number, string> = { 1: "A", 28: "AAAA", 5: "CNAME", 15: "MX", 2: "NS", 16: "TXT", 6: "SOA", 33: "SRV" };
    return map[type] || String(type);
  }

  const fireToolComplete = useToolComplete("dns-lookup");
  let __ftcFirstRun = true;
  $effect(() => {
    domain; recordType; results; loading; error; requestId; recent;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="dns-domain" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.domainLabel}</label>
      <input id="dns-domain" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={domain} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && lookup()} style="width: 100%;" />
      {#if recent.length > 0}
        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;" aria-label={lang === 'es' ? 'Consultas recientes' : 'Recent queries'}>
          <span style="font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{lang === 'es' ? 'Recientes' : 'Recent'}</span>
          {#each recent.slice(0, 5) as q}
            <button type="button" class="btn-secondary" style="padding: 4px 10px; font-size: 11px; min-height: auto;" onclick={() => { domain = q; lookup(); }}>{q}</button>
          {/each}
        </div>
      {/if}
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;" role="group" aria-label={t.recordType}>
        <span style="font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.recordType}</span>
        {#each types as rt}
          <button class={recordType === rt ? "btn-primary" : "btn-secondary"} style="padding: 10px 14px; font-size: 12px; min-height: 44px; min-width: 44px;" onclick={() => { recordType = rt; if (domain.trim()) lookup(); }}>{rt}</button>
        {/each}
      </div>
      <button class="btn-primary" onclick={lookup} disabled={loading || !domain.trim()}>
        {loading ? t.looking : t.lookup}
      </button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
  {#if error}
    <div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>
  {/if}

  {#if results.length > 0}
    <div class="card">
      <div class="card-header"><span class="card-title">{t.results} ({results.length})</span></div>
      <div class="card-body" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--color-border);">
              <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">{t.type}</th>
              <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">{t.value}</th>
              <th style="text-align: left; padding: 6px; color: var(--color-text-muted);">TTL</th>
            </tr>
          </thead>
          <tbody>
            {#each results as record}
              <tr style="border-bottom: 1px solid var(--color-border);">
                <td style="padding: 6px; font-weight: 600; color: var(--color-accent-fg);">{typeLabel(record.type)}</td>
                <td style="padding: 6px; font-family: monospace; word-break: break-all;">{record.data}</td>
                <td style="padding: 6px; color: var(--color-text-muted);">{record.TTL}s</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
  </div>
</div>
