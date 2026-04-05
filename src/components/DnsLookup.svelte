<script lang="ts">
  import type { Lang } from '../i18n/index';
  import { getDnsLookup } from '../i18n/components';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getDnsLookup(lang));

  let domain = $state("");
  let recordType = $state("A");
  let results = $state<{ name: string; type: number; TTL: number; data: string }[]>([]);
  let loading = $state(false);
  let error = $state("");
  let requestId = $state(0);

  const types = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "SRV"];

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
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.domainLabel}</label>
      <input type="text" bind:value={domain} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && lookup()} style="width: 100%;" />
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <label style="font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.recordType}</label>
        {#each types as rt}
          <button class={recordType === rt ? "btn-primary" : "btn-secondary"} style="padding: 4px 10px; font-size: 12px;" onclick={() => { recordType = rt; if (domain.trim()) lookup(); }}>{rt}</button>
        {/each}
      </div>
      <button class="btn-primary" onclick={lookup} disabled={loading || !domain.trim()}>
        {loading ? t.looking : t.lookup}
      </button>
    </div>
  </div>

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
                <td style="padding: 6px; font-weight: 600; color: var(--color-accent);">{typeLabel(record.type)}</td>
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
