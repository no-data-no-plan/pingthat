<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import { getWhoisLookup } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { isValidDomain, getValidationError } from '../lib/validation';
  import type { WhoisLookupResult } from '../lib/api-types';
  import { readQuery, updateQuery } from '../lib/share-state';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getWhoisLookup(lang));
  const c = $derived(getCommon(lang));

  let domain = $state("");
  let loading = $state(false);
  let error = $state("");
  let result = $state<WhoisLookupResult | null>(null);
  let requestId = $state(0);

  // CW-PT-04 / Theme A (2026-05-02): Hydrate from URL so DNS→WHOIS chains
  // preserve domain context. Auto-execute when arriving with ?domain= set.
  onMount(() => {
    const q = readQuery(["domain"]);
    if (q.domain) {
      domain = q.domain;
      lookup();
    }
  });

  async function lookup() {
    if (!domain.trim()) return;
    if (!isValidDomain(domain.trim())) {
      error = getValidationError('domain', lang as 'en' | 'es');
      result = null;
      return;
    }
    updateQuery({ domain: domain.trim() });
    requestId++;
    const myId = requestId;
    loading = true; error = ""; result = null;
    try {
      const res = await fetch(`/api/whois-lookup?lang=${lang}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }), signal: AbortSignal.timeout(15000),
      });
      if (myId !== requestId) return;
      if (!res.ok) {
        let msg = t.lookupFailed;
        try { const d = await res.json(); if (d?.error) msg = d.error; } catch {}
        error = msg;
        return;
      }
      const data = await res.json();
      if (myId !== requestId) return;
      if (data.error) { error = data.error; } else { result = data; }
    } catch (e: any) {
      if (myId !== requestId) return;
      if (e?.name === 'AbortError' || e?.name === 'TimeoutError') {
        error = c.requestTimeout;
      } else {
        error = t.lookupFailed;
      }
    } finally {
      if (myId === requestId) loading = false;
    }
  }

  function formatDate(d: string | null): string { return d ? new Date(d).toLocaleDateString() : "N/A"; }

  const fireToolComplete = useToolComplete("whois-lookup");
  let __ftcFirstRun = true;
  $effect(() => {
    domain; loading; error; result; requestId;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    if (error) { fireToolComplete('error'); return; }
    if (!result) return;
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="whois-domain" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.domainLabel}</label>
      <input id="whois-domain" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={domain} placeholder={t.placeholder} onkeydown={(e) => e.key === 'Enter' && !e.isComposing && lookup()} style="width: 100%;" />
      <button class="btn-primary" onclick={lookup} disabled={loading || !domain.trim()}>{loading ? t.looking : t.lookup}</button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
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
</div>
