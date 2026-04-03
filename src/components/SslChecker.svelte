<script lang="ts">
  import type { Lang } from '../i18n/index';
  import { getSslChecker } from '../i18n/components';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getSslChecker(lang));

  let domain = $state("");
  let loading = $state(false);
  let error = $state("");
  let result = $state<any>(null);

  async function check() {
    if (!domain.trim()) return;
    loading = true; error = ""; result = null;
    try {
      const res = await fetch("/api/ssl-checker", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }), signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (data.error && !data.httpsOk) { error = data.error; } else { result = data; }
    } catch { error = t.checkFailed; } finally { loading = false; }
  }
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.domainLabel}</label>
      <input type="text" bind:value={domain} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && check()} style="width: 100%;" />
      <button class="btn-primary" onclick={check} disabled={loading || !domain.trim()}>{loading ? t.checking : t.check}</button>
    </div>
  </div>

  {#if error}<div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>{/if}

  {#if result}
    <div class="card">
      <div class="card-header"><span class="card-title">{t.sslStatus}</span></div>
      <div class="card-body space-y-2">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">{result.httpsOk ? "\u2705" : "\u274C"}</span>
          <span style="font-size: 16px; font-weight: 600;">{result.httpsOk ? t.secure : t.insecure}</span>
        </div>
        <div style="font-size: 13px; color: var(--color-text-muted);">
          <div>HTTPS Status: {result.httpsStatus} &middot; {result.responseTime}ms</div>
          {#if result.server}<div>Server: {result.server}</div>{/if}
          {#if result.hsts}<div>HSTS: {result.hsts}</div>{:else}<div style="color: var(--color-red);">HSTS: {t.notSet}</div>{/if}
        </div>
      </div>
    </div>

    {#if result.certificates?.length > 0}
      <div class="card">
        <div class="card-header"><span class="card-title">{t.certificates} ({result.certificates.length})</span></div>
        <div class="card-body">
          {#each result.certificates as cert}
            <div style="padding: 10px 0; border-bottom: 1px solid var(--color-border);">
              <div style="font-weight: 600; font-size: 13px;">{cert.commonName}</div>
              <div style="font-size: 12px; color: var(--color-text-muted);">
                {t.issuer}: {cert.issuer}<br />
                {t.validFrom}: {cert.notBefore || "N/A"}<br />
                {t.validUntil}: {cert.notAfter || "N/A"}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>
