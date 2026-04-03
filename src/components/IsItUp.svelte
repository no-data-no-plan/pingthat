<script lang="ts">
  import type { Lang } from '../i18n/index';
  import { getIsItUp } from '../i18n/components';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getIsItUp(lang));

  let url = $state("");
  let loading = $state(false);
  let error = $state("");
  let result = $state<any>(null);

  async function check() {
    if (!url.trim()) return;
    loading = true; error = ""; result = null;
    try {
      const res = await fetch("/api/check-site", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }), signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (data.error && !data.url) { error = data.error; } else { result = data; }
    } catch { error = t.checkFailed; } finally { loading = false; }
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
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.urlLabel}</label>
      <input type="text" bind:value={url} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && check()} style="width: 100%;" />
      <button class="btn-primary" onclick={check} disabled={loading || !url.trim()}>{loading ? t.checking : t.check}</button>
    </div>
  </div>

  {#if error}<div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>{/if}

  {#if result}
    <div class="card">
      <div class="card-header"><span class="card-title">{t.statusReport}</span></div>
      <div class="card-body space-y-3">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">{result.up ? "\u2705" : "\u274C"}</span>
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
