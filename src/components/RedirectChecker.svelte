<script lang="ts">
  import type { Lang } from '../i18n/index';
  import { getRedirectChecker } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { isValidUrl, getValidationError } from '../lib/validation';
  import type { RedirectCheckerResult } from '../lib/api-types';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getRedirectChecker(lang));
  const c = $derived(getCommon(lang));

  let url = $state("");
  let loading = $state(false);
  let error = $state("");
  let result = $state<RedirectCheckerResult | null>(null);
  let requestId = $state(0);

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
    try {
      const res = await fetch(`/api/redirect-checker?lang=${lang}`, {
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

  function statusColor(status: number): string {
    if (status >= 300 && status < 400) return "#f59e0b";
    if (status >= 200 && status < 300) return "var(--color-accent)";
    return "var(--color-red)";
  }
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.urlLabel}</label>
      <input type="text" bind:value={url} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && check()} style="width: 100%;" />
      <button class="btn-primary" onclick={check} disabled={loading || !url.trim()}>{loading ? t.checking : t.check}</button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true">
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
              <div style="font-size: 11px; color: var(--color-accent); margin-top: 4px;">\u2192 {step.location}</div>
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
