<script lang="ts">
  import type { Lang } from '../i18n/index';
  import { getIsItDown } from '../i18n/components';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getIsItDown(lang));

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
    <div class="card" style="text-align: center; padding: 24px;">
      <div class="card-body">
        <div style="font-size: 48px; margin-bottom: 12px;">{result.up ? "\u2705" : "\u274C"}</div>
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
