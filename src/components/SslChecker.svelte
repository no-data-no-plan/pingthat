<script lang="ts">
  import type { Lang } from '../i18n/index';
  import { getSslChecker } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { isValidDomain, getValidationError } from '../lib/validation';
  import type { SslCheckerResult } from '../lib/api-types';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getSslChecker(lang));
  const c = $derived(getCommon(lang));

  let domain = $state("");
  let loading = $state(false);
  let error = $state("");
  let result = $state<SslCheckerResult | null>(null);
  let requestId = $state(0);

  async function check() {
    if (!domain.trim()) return;
    if (!isValidDomain(domain.trim())) {
      error = getValidationError('domain', lang as 'en' | 'es');
      result = null;
      return;
    }
    requestId++;
    const myId = requestId;
    loading = true; error = ""; result = null;
    try {
      const res = await fetch(`/api/ssl-checker?lang=${lang}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }), signal: AbortSignal.timeout(15000),
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
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="ssl-domain" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.domainLabel}</label>
      <input id="ssl-domain" type="text" bind:value={domain} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && check()} style="width: 100%;" />
      <button class="btn-primary" onclick={check} disabled={loading || !domain.trim()}>{loading ? t.checking : t.check}</button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true">
  {#if error}<div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>{/if}

  {#if result}
    <div class="card">
      <div class="card-header"><span class="card-title">{t.sslStatus}</span></div>
      <div class="card-body space-y-2">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;" role="img" aria-label={result.httpsOk ? (lang === 'es' ? 'Seguro' : 'Secure') : (lang === 'es' ? 'No seguro' : 'Not secure')}>{result.httpsOk ? "\u2705" : "\u274C"}</span>
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
</div>
