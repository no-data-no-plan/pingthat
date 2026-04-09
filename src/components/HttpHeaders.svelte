<script lang="ts">
  import type { Lang } from '../i18n/index';
  import { getHttpHeaders } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { isValidUrl, getValidationError } from '../lib/validation';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getHttpHeaders(lang));
  const c = $derived(getCommon(lang));

  let url = $state("");
  let loading = $state(false);
  let error = $state("");
  let result = $state<any>(null);
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
      const res = await fetch("/api/http-headers", {
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
      <label style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.urlLabel}</label>
      <input type="text" bind:value={url} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && check()} style="width: 100%;" />
      <button class="btn-primary" onclick={check} disabled={loading || !url.trim()}>{loading ? t.checking : t.check}</button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true">
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
            <span style="font-size: 12px; font-weight: 600; color: var(--color-accent); font-family: monospace; min-width: 120px;">{key}</span>
            <span style="font-size: 12px; font-family: monospace; word-break: break-all; flex: 1;">{value}</span>
            <button class="btn-secondary" style="font-size: 10px; padding: 2px 6px; white-space: nowrap;" onclick={() => copy(String(value))}>{t.copy}</button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
  </div>
</div>
