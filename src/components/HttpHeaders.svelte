<script lang="ts">
  import type { Lang } from '../i18n/index';
  import { getHttpHeaders } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { isValidUrl, getValidationError } from '../lib/validation';
  import type { HttpHeadersResult } from '../lib/api-types';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getHttpHeaders(lang));
  const c = $derived(getCommon(lang));

  let url = $state("");
  let loading = $state(false);
  let error = $state("");
  let result = $state<HttpHeadersResult | null>(null);
  let requestId = $state(0);
  // User-cancellable abort handle (Phase 6.5 — propagating SslChecker pattern).
  let abortController: AbortController | null = null;

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
    abortController?.abort();
    abortController = new AbortController();
    const ctrl = abortController;
    const timeoutId = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(`/api/http-headers?lang=${lang}`, {
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
      if (e?.name === 'AbortError' || e?.name === 'TimeoutError') {
        if (ctrl.signal.reason === 'user-cancelled') {
          error = "";
        } else {
          error = c.requestTimeout;
        }
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
    abortController?.abort('user-cancelled');
  }

  function copy(val: string) { navigator.clipboard.writeText(val); }

  const securityLabels: Record<string, string> = {
    hsts: "Strict-Transport-Security",
    csp: "Content-Security-Policy",
    xFrameOptions: "X-Frame-Options",
    xContentType: "X-Content-Type-Options",
    referrerPolicy: "Referrer-Policy",
    permissionsPolicy: "Permissions-Policy",
  };
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="headers-url" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.urlLabel}</label>
      <input id="headers-url" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={url} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && check()} style="width: 100%;" />
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
      <div class="card-header"><span class="card-title">{t.securityScore}: {result.securityScore}/{result.maxScore}</span></div>
      <div class="card-body">
        {#each Object.entries(result.security) as [key, present]}
          <div style="display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--color-border);">
            <span style="font-size: 14px;" role="img" aria-label={present ? (lang === 'es' ? 'Presente' : 'Present') : (lang === 'es' ? 'Ausente' : 'Missing')}>{present ? "\u2705" : "\u274C"}</span>
            <span style="font-size: 13px; font-family: monospace;">{securityLabels[key]}</span>
          </div>
        {/each}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">{t.allHeaders} ({Object.keys(result.headers).length})</span></div>
      <div class="card-body">
        {#each Object.entries(result.headers) as [key, value]}
          <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid var(--color-border); gap: 8px;">
            <span style="font-size: 12px; font-weight: 600; color: var(--color-accent-fg); font-family: monospace; min-width: 120px;">{key}</span>
            <span style="font-size: 12px; font-family: monospace; word-break: break-all; flex: 1;">{value}</span>
            <button class="btn-secondary" style="font-size: 10px; padding: 2px 6px; white-space: nowrap;" onclick={() => copy(String(value))}>{t.copy}</button>
          </div>
        {/each}
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
