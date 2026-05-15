<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import { getIsItDown } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { isValidUrl, getValidationError } from '../lib/validation';
  import { readQuery, updateQuery } from '../lib/share-state';
  import type { CheckSiteResult } from '../lib/api-types';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getIsItDown(lang));
  const c = $derived(getCommon(lang));

  let url = $state("");
  let loading = $state(false);
  let error = $state("");
  let result = $state<CheckSiteResult | null>(null);
  let requestId = $state(0);

  // CW-PT-04 / Theme A (2026-05-03): Hydrate from URL.
  onMount(() => {
    const q = readQuery(["url"]);
    if (q.url) {
      url = q.url;
      check();
    }
  });

  async function check() {
    if (!url.trim()) return;
    if (!isValidUrl(url.trim())) {
      error = getValidationError('url', lang as 'en' | 'es');
      result = null;
      return;
    }
    requestId++;
    const myId = requestId;
    loading = true; error = ""; result = null;
    updateQuery({ url: url.trim() });
    try {
      const res = await fetch(`/api/check-site?lang=${lang}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }), signal: AbortSignal.timeout(15000),
      });
      if (myId !== requestId) return;
      if (!res.ok) {
        let msg = t.checkFailed;
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
        error = t.checkFailed;
      }
    } finally {
      if (myId === requestId) loading = false;
    }
  }

  const fireToolComplete = useToolComplete("is-it-down");
  let __ftcFirstRun = true;
  $effect(() => {
    url; loading; error; result; requestId;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    if (error) { fireToolComplete('error'); return; }
    if (!result) return;
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="isitdown-url" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.urlLabel}</label>
      <input id="isitdown-url" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={url} placeholder={t.placeholder} onkeydown={(e) => e.key === 'Enter' && !e.isComposing && check()} style="width: 100%;" />
      <button class="btn-primary" onclick={check} disabled={loading || !url.trim()}>{loading ? t.checking : t.check}</button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
  {#if error}<div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>{/if}

  {#if result}
    <div class="card" style="text-align: center; padding: 24px;">
      <div class="card-body">
        <div style="font-size: 48px; margin-bottom: 12px;" role="img" aria-label={result.up ? (lang === 'es' ? 'Activo' : 'Up') : (lang === 'es' ? 'Caído' : 'Down')}>{result.up ? "\u2705" : "\u274C"}</div>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">{result.up ? t.itsUp : t.itsDown}</div>
        <div style="font-size: 14px; color: var(--color-text-muted);">
          {#if result.up}{t.siteResponding}{:else}{result.error || t.siteNotResponding}{/if}
        </div>
        <div style="margin-top: 16px; font-size: 13px; color: var(--color-text-muted);">
          {t.status}: {result.status} {result.statusText} &middot; {result.responseTime}ms
          {#if result.server} &middot; {result.server}{/if}
        </div>
      </div>
    </div>
  {/if}
  </div>
</div>
