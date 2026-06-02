<script lang="ts">
  import { onMount } from "svelte";
  import InfoTip from './InfoTip.svelte';
  import type { Lang } from '../i18n/index';
  import { getMyIp } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { copyAndNotify } from '../lib/notify';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const c = $derived(getCommon(lang as 'en' | 'es'));
  const t = $derived(getMyIp(lang));

  let ip = $state("");
  let city = $state("");
  let region = $state("");
  let country = $state("");
  let isp = $state("");
  let timezone = $state("");
  let org = $state("");
  let asn = $state("");
  let loading = $state(true);
  let error = $state("");
  let copied = $state(false);

  // Browser info
  let language = $state("");
  let online = $state(true);
  let platform = $state("");
  let userAgent = $state("");

  // Privacy disclosure: this tool sends the user's public IP to third parties.
  const privacyNoteText = $derived(lang === 'es'
    ? 'Tu IP pública se envía a ipapi.co y api.ipify.org (EE.UU.) para obtener la geolocalización. '
    : 'Your public IP is sent to ipapi.co and api.ipify.org (US) to retrieve geolocation. ');
  const privacyLinkText = $derived(lang === 'es' ? 'Política de privacidad' : 'Privacy policy');
  const privacyHref = $derived(lang === 'es' ? '/es/privacy' : '/privacy');

  onMount(async () => {
    language = navigator.language || t.unknown;
    online = navigator.onLine;
    platform = navigator.platform || t.unknown;
    userAgent = navigator.userAgent || t.unknown;

    let timeoutHit = false;

    try {
      // Try ipapi.co first (has location data)
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        ip = data.ip || "";
        city = data.city || "";
        region = data.region || "";
        country = data.country_name || "";
        isp = data.org || "";
        timezone = data.timezone || "";
        org = data.org || "";
        asn = data.asn || "";
        loading = false;
        return;
      }
    } catch (e: any) {
      if (e?.name === 'AbortError' || e?.name === 'TimeoutError') {
        timeoutHit = true;
      }
      // Fallback to ipify
    }

    try {
      const res = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        ip = data.ip || "";
        loading = false;
        return;
      }
    } catch (e: any) {
      if (e?.name === 'AbortError' || e?.name === 'TimeoutError') {
        timeoutHit = true;
      }
      // Both failed
    }

    if (timeoutHit) {
      error = lang === 'es'
        ? 'La petición ha tardado demasiado. Inténtalo de nuevo.'
        : 'Request timed out. Please try again.';
    } else {
      error = t.couldNotDetect;
    }
    loading = false;
  });

  async function copyIp() {
    if (!ip) return;
    if (await copyAndNotify(ip, c.copied, c.copyFailed)) {
      copied = true;
      setTimeout(() => (copied = false), 1500);
    }
  }

  const fireToolComplete = useToolComplete("my-ip");
  let __ftcFirstRun = true;
  $effect(() => {
    ip; loading; error;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    if (error) { fireToolComplete('error'); return; }
    if (loading || !ip) return;
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <div class="card" style="border-color: var(--color-warn); background: var(--color-warn-dim);">
    <div class="card-body" style="color: var(--color-text-muted); font-size: 12px; line-height: 1.5;">
      &#8505;&#65039; {privacyNoteText}<a href={privacyHref} class="underline hover:text-[var(--color-accent)]">{privacyLinkText}</a>.
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" aria-busy={loading}>
  {#if error}
    <div class="card">
      <div class="card-body" style="text-align: center; padding: 48px 20px;">
        <p style="color: var(--color-bad); font-size: 13px;">{error}</p>
      </div>
    </div>
  {:else}
    <!-- IP Display — render skeleton immediately so LCP fires on the
         32px placeholder text, NOT on the API response. Detected
         2026-05-15 CWV audit: LCP was 3.95s (P1) because the LCP element
         only mounted after ipapi.co round-trip. Skeleton-then-swap brings
         LCP to ~sub-2s; IP value swaps in seamlessly when fetch resolves. -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">{t.yourPublicIp} <InfoTip text={t.publicIpTip} /></span>
        <button class="btn-secondary" onclick={copyIp} disabled={loading || !ip}>
          {copied ? t.copied : t.copyIp}
        </button>
      </div>
      <div class="card-body" style="text-align: center; padding: 32px 20px;">
        <p style="font-size: 32px; font-weight: 700; color: var(--color-accent-fg); letter-spacing: -0.02em; font-family: 'JetBrains Mono', monospace;{loading ? ' opacity: 0.65;' : ''}">
          {loading ? t.detectingIp : ip}
        </p>
      </div>
    </div>

    {#if !loading}
    <!-- Location & Network -->
    <div class="metrics-grid cols-2">
      <div class="metric">
        <div class="metric-label">{t.location}</div>
        <div class="metric-value" style="font-size: 16px;">
          {city && country ? `${city}, ${country}` : city || country || t.unknown}
        </div>
        {#if region}
          <div class="metric-sub">{region}</div>
        {/if}
      </div>
      <div class="metric">
        <div class="metric-label">{t.ispOrganization} <InfoTip text={t.ispTip} /></div>
        <div class="metric-value" style="font-size: 16px; word-break: break-word;">
          {isp || t.unknown}
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">{t.timezone}</div>
        <div class="metric-value" style="font-size: 16px;">
          {timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || t.unknown}
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">{t.asn}</div>
        <div class="metric-value" style="font-size: 16px;">
          {asn || t.unknown}
        </div>
      </div>
    </div>

    <!-- Connection Info -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">{t.yourConnection}</span>
      </div>
      <div class="card-body">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div style="font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 4px;">{t.language}</div>
            <div style="font-size: 14px; color: var(--color-text);">{language}</div>
          </div>
          <div>
            <div style="font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 4px;">{t.status}</div>
            <div style="font-size: 14px;">
              {#if online}
                <span class="badge badge-green">{t.online}</span>
              {:else}
                <span class="badge badge-red">{t.offline}</span>
              {/if}
            </div>
          </div>
          <div>
            <div style="font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 4px;">{t.platform}</div>
            <div style="font-size: 14px; color: var(--color-text);">{platform}</div>
          </div>
          <div>
            <div style="font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 4px;">{t.browser}</div>
            <div style="font-size: 12px; color: var(--color-text); word-break: break-word; line-height: 1.4;">{userAgent.slice(0, 80)}{userAgent.length > 80 ? '...' : ''}</div>
          </div>
        </div>
      </div>
    </div>
    {/if}
  {/if}
  </div>
</div>
