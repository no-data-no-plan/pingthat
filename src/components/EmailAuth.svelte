<script lang="ts">
  import { onMount } from 'svelte';
  import type { Lang } from '../i18n/index';
  import { getEmailAuth } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { isValidDomain, getValidationError } from '../lib/validation';
  import type { EmailAuthResult } from '../lib/api-types';
  import { readQuery, updateQuery } from '../lib/share-state';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getEmailAuth(lang));
  const c = $derived(getCommon(lang));

  let domain = $state("");

  // CW-PT-04 / Theme A (2026-05-02): Hydrate from URL.
  onMount(() => {
    const q = readQuery(["domain"]);
    if (q.domain) {
      domain = q.domain;
      check();
    }
  });
  let loading = $state(false);
  let error = $state("");
  let result = $state<EmailAuthResult | null>(null);
  let requestId = $state(0);

  function badgeColor(assessment: "pass" | "warning" | "fail"): string {
    if (assessment === "pass") return "var(--color-green, #22c55e)";
    if (assessment === "warning") return "var(--color-yellow, #eab308)";
    return "var(--color-red, #ef4444)";
  }

  function badgeLabel(assessment: "pass" | "warning" | "fail"): string {
    if (assessment === "pass") return t.assessPass;
    if (assessment === "warning") return t.assessWarning;
    return t.assessFail;
  }

  async function check() {
    if (!domain.trim()) return;
    if (!isValidDomain(domain.trim())) {
      error = getValidationError('domain', lang as 'en' | 'es');
      result = null;
      return;
    }
    updateQuery({ domain: domain.trim() });
    requestId++;
    const myId = requestId;
    loading = true; error = ""; result = null;
    try {
      const res = await fetch(`/api/email-auth?lang=${lang}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }), signal: AbortSignal.timeout(30000),
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

  const fireToolComplete = useToolComplete("email-auth");
  let __ftcFirstRun = true;
  $effect(() => {
    domain; loading; error; result; requestId;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    if (error) { fireToolComplete('error'); return; }
    if (!result) return;
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card">
    <div class="card-body space-y-3">
      <label for="email-auth-domain" style="display: block; font-size: 9px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em;">{t.domainLabel}</label>
      <input id="email-auth-domain" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={domain} placeholder={t.placeholder} onkeydown={(e) => e.key === 'Enter' && !e.isComposing && check()} style="width: 100%;" />
      <button class="btn-primary" onclick={check} disabled={loading || !domain.trim()}>{loading ? t.checking : t.check}</button>
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
  {#if error}<div class="card" style="border-left: 3px solid var(--color-red);"><div class="card-body" style="color: var(--color-red);">{error}</div></div>{/if}

  {#if result}
    <div class="card-header" style="padding: 12px 16px;"><span class="card-title">{t.results} &mdash; {result.domain}</span></div>

    <!-- SPF -->
    <div class="card" style="margin-bottom: 16px;">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <span class="card-title">{t.spfTitle}</span>
        <span style="display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #fff; background: {badgeColor(result.spf.assessment)};">{badgeLabel(result.spf.assessment)}</span>
      </div>
      <div class="card-body space-y-2">
        {#if result.spf.found}
          <div style="font-size: 13px; font-weight: 600; color: var(--color-green, #22c55e);">{t.recordFound}</div>
          <div style="font-family: monospace; font-size: 12px; word-break: break-all; padding: 8px; background: var(--color-bg-secondary, #f9fafb); border-radius: 6px;">{result.spf.record}</div>
        {:else}
          <div style="font-size: 13px; font-weight: 600; color: var(--color-red);">{t.recordMissing}</div>
        {/if}
        <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 6px;">{t.tipSpf}</div>
      </div>
    </div>

    <!-- DMARC -->
    <div class="card" style="margin-bottom: 16px;">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <span class="card-title">{t.dmarcTitle}</span>
        <span style="display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #fff; background: {badgeColor(result.dmarc.assessment)};">{badgeLabel(result.dmarc.assessment)}</span>
      </div>
      <div class="card-body space-y-2">
        {#if result.dmarc.found}
          <div style="font-size: 13px; font-weight: 600; color: var(--color-green, #22c55e);">{t.recordFound}</div>
          <div style="font-family: monospace; font-size: 12px; word-break: break-all; padding: 8px; background: var(--color-bg-secondary, #f9fafb); border-radius: 6px;">{result.dmarc.record}</div>
          {#if result.dmarc.policy}
            <div style="font-size: 13px;">{t.policy}: <strong>{result.dmarc.policy}</strong></div>
          {/if}
        {:else}
          <div style="font-size: 13px; font-weight: 600; color: var(--color-red);">{t.recordMissing}</div>
        {/if}
        <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 6px;">{t.tipDmarc}</div>
      </div>
    </div>

    <!-- DKIM -->
    <div class="card" style="margin-bottom: 16px;">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <span class="card-title">{t.dkimTitle}</span>
        <span style="display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #fff; background: {badgeColor(result.dkim.assessment)};">{badgeLabel(result.dkim.assessment)}</span>
      </div>
      <div class="card-body space-y-2">
        {#if result.dkim.found}
          <div style="font-size: 13px; font-weight: 600; color: var(--color-green, #22c55e);">{t.selectors}: {result.dkim.selectors.length}</div>
          {#each result.dkim.selectors as sel}
            <div style="padding: 8px; background: var(--color-bg-secondary, #f9fafb); border-radius: 6px; margin-bottom: 6px;">
              <div style="font-size: 12px; font-weight: 600; color: var(--color-accent-fg);">{sel.selector}._domainkey</div>
              <div style="font-family: monospace; font-size: 11px; word-break: break-all; margin-top: 4px;">{sel.record}</div>
            </div>
          {/each}
        {:else}
          <div style="font-size: 13px; font-weight: 600; color: var(--color-red);">{t.recordMissing}</div>
        {/if}
        <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 6px;">{t.tipDkim}</div>
      </div>
    </div>
  {/if}
  </div>
</div>
