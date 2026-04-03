<script lang="ts">
  import type { Lang } from '../i18n/index';
  import { getWhoisLookup } from '../i18n/components';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getWhoisLookup(lang));

  let domain = $state("");
  let loading = $state(false);
  let error = $state("");
  let result = $state<any>(null);

  async function lookup() {
    if (!domain.trim()) return;
    loading = true; error = ""; result = null;
    try {
      const res = await fetch("/api/whois-lookup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }), signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (data.error && !data.found) { error = data.error; } else { result = data; }
    } catch { error = t.lookupFailed; } finally { loading = false; }
  }

  function formatDate(d: string | null): string { return d ? new Date(d).toLocaleDateString() : "N/A"; }
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.domainLabel}</label>
      <input type="text" bind:value={domain} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && lookup()} style="width: 100%;" />
      <button class="btn-primary" onclick={lookup} disabled={loading || !domain.trim()}>{loading ? t.looking : t.lookup}</button>
    </div>
  </div>

  {#if error}<div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>{/if}

  {#if result?.found}
    <div class="card">
      <div class="card-header"><span class="card-title">{t.domainInfo}</span></div>
      <div class="card-body">
        {#each [
          { label: t.registrar, value: result.registrar || "N/A" },
          { label: t.created, value: formatDate(result.created) },
          { label: t.updated, value: formatDate(result.updated) },
          { label: t.expires, value: formatDate(result.expires) },
        ] as row}
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
            <span style="font-size: 12px; color: var(--color-text-muted);">{row.label}</span>
            <span style="font-size: 13px; font-weight: 600;">{row.value}</span>
          </div>
        {/each}
      </div>
    </div>

    {#if result.nameservers?.length > 0}
      <div class="card">
        <div class="card-header"><span class="card-title">{t.nameservers}</span></div>
        <div class="card-body">
          {#each result.nameservers as ns}
            <div style="padding: 6px 0; border-bottom: 1px solid var(--color-border); font-family: monospace; font-size: 13px;">{ns}</div>
          {/each}
        </div>
      </div>
    {/if}

    {#if result.statuses?.length > 0}
      <div class="card">
        <div class="card-header"><span class="card-title">{t.statuses}</span></div>
        <div class="card-body" style="display: flex; flex-wrap: wrap; gap: 6px;">
          {#each result.statuses as status}
            <span style="font-size: 11px; padding: 3px 8px; border-radius: 4px; background: var(--color-surface); border: 1px solid var(--color-border);">{status}</span>
          {/each}
        </div>
      </div>
    {/if}
  {:else if result && !result.found}
    <div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{result.error || t.notFound}</div></div>
  {/if}
</div>
