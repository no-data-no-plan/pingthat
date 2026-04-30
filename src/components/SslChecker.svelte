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
  // User-cancellable abort handle (Nielsen audit Phase 6, PT F7). Pre-fix
  // we relied on AbortSignal.timeout(30s); now we own the AbortController
  // so the Cancel button can abort imperatively.
  let abortController: AbortController | null = null;

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
    abortController?.abort();
    abortController = new AbortController();
    const ctrl = abortController;
    const timeoutId = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(`/api/ssl-checker?lang=${lang}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }), signal: ctrl.signal,
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
        // Distinguish user-cancelled from a 30s timeout. `controller.abort()`
        // with no arg sets `signal.reason` to a default DOMException — so
        // both paths have a non-undefined reason. Discriminate by the
        // STRING reason cancel() passes ('user-cancelled') instead.
        // Round-2 review fix 2026-04-30.
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

  function expiryColor(days: number | null): string {
    if (days === null) return "var(--color-text-muted, #64748b)";
    if (days < 0) return "var(--color-red, #ef4444)";
    if (days <= 7) return "var(--color-red, #ef4444)";
    if (days <= 30) return "var(--color-yellow, #eab308)";
    return "var(--color-green, #22c55e)";
  }

  function expiryLabel(days: number | null): string {
    if (days === null) return t.unknownExpiry;
    if (days < 0) return t.expired;
    if (days === 0) return t.expiresToday;
    if (days === 1) return t.expires1Day;
    return t.expiresInDays.replace("{days}", String(days));
  }

  function formatMaxAge(seconds: number | null): string {
    if (seconds === null) return "—";
    const days = Math.round(seconds / 86400);
    if (days >= 365) return `${(days / 365).toFixed(1)}y (${seconds.toLocaleString()}s)`;
    return `${days}d (${seconds.toLocaleString()}s)`;
  }
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="ssl-domain" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.domainLabel}</label>
      <input id="ssl-domain" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={domain} placeholder={t.placeholder} onkeypress={(e) => e.key === 'Enter' && check()} style="width: 100%;" />
      <div style="display: flex; gap: 8px;">
        <button class="btn-primary" onclick={check} disabled={loading || !domain.trim()} style="flex: 1;">{loading ? t.checking : t.check}</button>
        {#if loading}
          <button type="button" onclick={cancel} class="btn-secondary" aria-label={c.cancel}
                  style="padding: 0 16px; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); border-radius: 4px; cursor: pointer;">
            {c.cancel}
          </button>
        {/if}
      </div>
      {#if loading}
        <div role="status" aria-live="polite"
             style="font-size: 12px; color: var(--color-text-muted); display: flex; align-items: center; gap: 8px; padding-top: 4px;">
          <span class="ssl-spinner" aria-hidden="true"></span>
          <span>{t.checking}</span>
        </div>
      {/if}
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
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
        </div>
      </div>
    </div>

    {#if result.ctError && !result.activeCertificate}
      <div class="card" style="border-left: 3px solid var(--color-yellow);">
        <div class="card-body" style="font-size: 13px; color: var(--color-text-muted);">
          {result.ctError}
        </div>
      </div>
    {/if}

    {#if result.activeCertificate}
      {@const ac = result.activeCertificate}
      <div class="card" style="border-left: 3px solid {expiryColor(ac.daysRemaining)};">
        <div class="card-header"><span class="card-title">{t.activeCertificate}</span></div>
        <div class="card-body space-y-2">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div>
              <div style="font-weight: 700; font-size: 14px;">{ac.commonName}</div>
              <div style="font-size: 12px; color: var(--color-text-muted);">{t.issuer}: {ac.issuer}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 700; color: {expiryColor(ac.daysRemaining)};">{expiryLabel(ac.daysRemaining)}</div>
              <div style="font-size: 11px; color: var(--color-text-muted);">{t.validUntil}: {ac.notAfter || "—"}</div>
            </div>
          </div>
          {#if ac.sans.length > 0}
            <div style="margin-top: 8px;">
              <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">{t.sans} ({ac.sans.length})</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                {#each ac.sans.slice(0, 30) as san}
                  <span style="font-family: monospace; font-size: 11px; padding: 2px 8px; background: var(--color-bg-muted, #f1f5f9); border-radius: 4px; word-break: break-all;">{san}</span>
                {/each}
                {#if ac.sans.length > 30}
                  <span style="font-size: 11px; color: var(--color-text-muted); padding: 2px 8px;">+{ac.sans.length - 30} {t.more}</span>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <div class="card">
      <div class="card-header"><span class="card-title">HSTS</span></div>
      <div class="card-body space-y-2">
        {#if result.hstsDetails}
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--color-green);">\u2713</span>
            <span style="font-weight: 600;">{t.hstsEnabled}</span>
          </div>
          <div style="font-size: 12px; color: var(--color-text-muted); display: grid; grid-template-columns: auto 1fr; gap: 4px 12px;">
            <span>max-age:</span><span>{formatMaxAge(result.hstsDetails.maxAge)}</span>
            <span>includeSubDomains:</span><span>{result.hstsDetails.includeSubDomains ? "\u2713" : "\u2717"}</span>
            <span>preload:</span><span>{result.hstsDetails.preload ? "\u2713" : "\u2717"}</span>
            <span>{t.preloadEligible}:</span>
            <span style="color: {result.hstsDetails.preloadEligible ? 'var(--color-green)' : 'var(--color-yellow)'};">
              {result.hstsDetails.preloadEligible ? t.yes : t.no}
              {#if !result.hstsDetails.preloadEligible}
                <span style="color: var(--color-text-muted); font-size: 11px; margin-left: 6px;">{t.preloadNeeds}</span>
              {/if}
            </span>
          </div>
          <div style="font-family: monospace; font-size: 11px; color: var(--color-text-muted); word-break: break-all; padding-top: 4px; border-top: 1px solid var(--color-border);">{result.hstsDetails.raw}</div>
        {:else}
          <div style="color: var(--color-red); font-weight: 600;">{t.notSet}</div>
        {/if}
      </div>
    </div>

    {#if result.certificates?.length > 1}
      <div class="card">
        <div class="card-header"><span class="card-title">{t.certHistory} ({result.certificates.length})</span></div>
        <div class="card-body">
          {#each result.certificates as cert}
            <div style="padding: 10px 0; border-bottom: 1px solid var(--color-border);">
              <div style="display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                <div style="font-weight: 600; font-size: 13px;">{cert.commonName}</div>
                <div style="font-size: 12px; color: {expiryColor(cert.daysRemaining)};">{expiryLabel(cert.daysRemaining)}</div>
              </div>
              <div style="font-size: 12px; color: var(--color-text-muted);">
                {t.issuer}: {cert.issuer}<br />
                {t.validFrom}: {cert.notBefore || "—"} → {cert.notAfter || "—"}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
  </div>
</div>

<style>
  /* Top-level scoped style (Round-2 review fix 2026-04-30): a <style> tag
     inside an {#if} block injects a raw <style> node on every mount and
     never cleans up — duplicate @keyframes accumulate in the DOM head. */
  .ssl-spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: ssl-spinner-spin 0.8s linear infinite;
  }
  @keyframes ssl-spinner-spin {
    to { transform: rotate(360deg); }
  }
</style>
