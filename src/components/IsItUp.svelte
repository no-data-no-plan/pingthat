<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import { getIsItUp } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { isValidUrl, getValidationError } from '../lib/validation';
  import { readQuery, updateQuery } from '../lib/share-state';
  import type { CheckSiteResult } from '../lib/api-types';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getIsItUp(lang));
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

  function ratingColor(ms: number): string {
    if (ms < 300) return "var(--color-accent)";
    if (ms < 1000) return "#f59e0b";
    return "var(--color-red)";
  }

  function ratingLabel(ms: number): string {
    if (ms < 300) return t.fast;
    if (ms < 1000) return t.moderate;
    return t.slow;
  }

  const fireToolComplete = useToolComplete("is-it-up");
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
      <label for="isitup-url" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.urlLabel}</label>
      <input id="isitup-url" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={url} placeholder={t.placeholder} onkeydown={(e) => e.key === 'Enter' && !e.isComposing && !loading && check()} style="width: 100%;" />
      <button class="btn-primary" onclick={check} disabled={loading || !url.trim()}>{loading ? t.checking : t.check}</button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
  {#if error}<div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>{/if}

  {#if result}
    <div class="card">
      <div class="card-header"><span class="card-title">{t.statusReport}</span></div>
      <div class="card-body space-y-3">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;" role="img" aria-label={result.up ? (lang === 'es' ? 'Activo' : 'Up') : (lang === 'es' ? 'Caído' : 'Down')}>{result.up ? "\u2705" : "\u274C"}</span>
          <span style="font-size: 16px; font-weight: 600;">{result.up ? t.online : t.offline}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="card" style="padding: 12px; text-align: center;">
            <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase;">{t.responseTime}</div>
            <div style="font-size: 24px; font-weight: 700; color: {ratingColor(result.responseTime)};">{result.responseTime}ms</div>
            <div style="font-size: 11px; color: {ratingColor(result.responseTime)};">{ratingLabel(result.responseTime)}</div>
          </div>
          <div class="card" style="padding: 12px; text-align: center;">
            <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase;">{t.httpStatus}</div>
            <div style="font-size: 24px; font-weight: 700;">{result.status}</div>
            <div style="font-size: 11px; color: var(--color-text-muted);">{result.statusText}</div>
          </div>
        </div>
        {#if result.server}<div style="font-size: 13px; color: var(--color-text-muted);">Server: {result.server}</div>{/if}
        {#if result.contentType}<div style="font-size: 13px; color: var(--color-text-muted);">Content-Type: {result.contentType}</div>{/if}
      </div>
    </div>
  {/if}
  </div>
</div>
