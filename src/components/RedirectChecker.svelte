<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import { getRedirectChecker } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { isValidUrl, getValidationError } from '../lib/validation';
  import { readQuery, updateQuery } from '../lib/share-state';
  import type { RedirectCheckerResult } from '../lib/api-types';
  import { isAbortError, isUserCancelled, USER_CANCELLED_REASON } from '../lib/cancel-discriminator';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getRedirectChecker(lang));
  const c = $derived(getCommon(lang));

  let url = $state("");
  let loading = $state(false);
  let error = $state("");
  let result = $state<RedirectCheckerResult | null>(null);
  let requestId = $state(0);
  let abortController: AbortController | null = null;

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
    abortController?.abort();
    abortController = new AbortController();
    const ctrl = abortController;
    const timeoutId = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(`/api/redirect-checker?lang=${lang}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }), signal: ctrl.signal,
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
      if (isAbortError(e)) {
        error = isUserCancelled(ctrl.signal) ? "" : c.requestTimeout;
      } else {
        error = t.checkFailed;
      }
    } finally {
      clearTimeout(timeoutId);
      if (myId === requestId) loading = false;
    }
  }

  function cancel() {
    if (!loading) return;
    abortController?.abort(USER_CANCELLED_REASON);
  }

  function statusColor(status: number): string {
    if (status >= 300 && status < 400) return "#f59e0b";
    if (status >= 200 && status < 300) return "var(--color-accent)";
    return "var(--color-red)";
  }

  const fireToolComplete = useToolComplete("redirect-checker");
  let __ftcFirstRun = true;
  $effect(() => {
    url; loading; error; result; requestId;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="redirect-url" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.urlLabel}</label>
      <input id="redirect-url" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={url} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && check()} style="width: 100%;" />
      <div style="display: flex; gap: 8px;">
        <button class="btn-primary" onclick={check} disabled={loading || !url.trim()} style="flex: 1;">{loading ? t.checking : t.check}</button>
        {#if loading}
          <button type="button" onclick={cancel} aria-label={c.cancel}
                  style="padding: 0 16px; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); border-radius: 4px; cursor: pointer;">
            {c.cancel}
          </button>
        {/if}
      </div>
      {#if loading}
        <div role="status" aria-live="polite"
             style="font-size: 12px; color: var(--color-text-muted); display: flex; align-items: center; gap: 8px; padding-top: 4px;">
          <span class="pt-spinner" aria-hidden="true"></span>
          <span>{t.checking}</span>
        </div>
      {/if}
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
  {#if error}<div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>{/if}

  {#if result}
    <div class="card">
      <div class="card-header"><span class="card-title">{t.redirectChain} ({result.redirectCount} {result.redirectCount === 1 ? t.redirect : t.redirects})</span></div>
      <div class="card-body">
        {#each result.chain as step, i}
          <div style="padding: 10px 0; border-bottom: 1px solid var(--color-border);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 11px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 4px; padding: 2px 6px;">#{i + 1}</span>
              <span style="font-size: 14px; font-weight: 700; color: {statusColor(step.status)};">{step.status}</span>
              <span style="font-size: 12px; color: var(--color-text-muted);">{step.statusText}</span>
            </div>
            <div style="font-family: monospace; font-size: 12px; word-break: break-all; color: var(--color-text-muted);">{step.url}</div>
            {#if step.location}
              <div style="font-size: 11px; color: var(--color-accent-fg); margin-top: 4px;">\u2192 {step.location}</div>
            {/if}
          </div>
        {/each}

        <div style="margin-top: 12px; padding: 10px; background: var(--color-surface); border-radius: 6px;">
          <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase;">{t.finalUrl}</div>
          <div style="font-family: monospace; font-size: 13px; word-break: break-all; margin-top: 4px;">{result.finalUrl}</div>
        </div>
      </div>
    </div>
  {/if}
  </div>
</div>

<style>
  .pt-spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: pt-spinner-spin 0.8s linear infinite;
  }
  @keyframes pt-spinner-spin {
    to { transform: rotate(360deg); }
  }
</style>
