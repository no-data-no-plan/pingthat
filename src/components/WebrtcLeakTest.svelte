<script lang="ts">
  import { onMount } from "svelte";
  import InfoTip from './InfoTip.svelte';
  import type { Lang } from '../i18n/index';
  import { getWebrtcLeakTest } from '../i18n/components';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getWebrtcLeakTest(lang));

  interface IpResult {
    ip: string;
    type: "Local" | "Public" | "IPv6" | "mDNS";
  }

  let results = $state<IpResult[]>([]);
  let hasLeak = $state(false);
  let testing = $state(true);
  let error = $state("");
  let supported = $state(true);

  function classifyIp(ip: string): IpResult["type"] {
    if (ip.includes(":")) return "IPv6";
    if (ip.endsWith(".local") || ip.includes(".local")) return "mDNS";
    if (
      ip.startsWith("10.") ||
      ip.startsWith("192.168.") ||
      /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip)
    ) return "Local";
    return "Public";
  }

  function getTypeLabel(type: IpResult["type"]): string {
    if (type === "Local") return t.local;
    if (type === "Public") return t.public;
    return type; // IPv6 and mDNS stay as-is (technical terms)
  }

  async function runTest() {
    results = [];
    hasLeak = false;
    testing = true;
    error = "";

    try {
      if (typeof RTCPeerConnection === "undefined") {
        supported = false;
        testing = false;
        return;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      const found = new Set<string>();

      await new Promise<void>((resolve) => {
        pc.createDataChannel("");
        pc.createOffer().then((offer) => pc.setLocalDescription(offer)).catch(() => {});

        pc.onicecandidate = (e) => {
          if (!e.candidate) {
            resolve();
            return;
          }

          const candidate = e.candidate.candidate;

          // Match IPv4
          const ipv4Match = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(candidate);
          if (ipv4Match && !found.has(ipv4Match[1])) {
            found.add(ipv4Match[1]);
            const type = classifyIp(ipv4Match[1]);
            results = [...results, { ip: ipv4Match[1], type }];
          }

          // Match IPv6
          const ipv6Match = /([a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/i.exec(candidate);
          if (ipv6Match && !found.has(ipv6Match[1])) {
            found.add(ipv6Match[1]);
            results = [...results, { ip: ipv6Match[1], type: "IPv6" }];
          }

          // Match mDNS
          const mdnsMatch = /([a-f0-9-]+\.local)/.exec(candidate);
          if (mdnsMatch && !found.has(mdnsMatch[1])) {
            found.add(mdnsMatch[1]);
            results = [...results, { ip: mdnsMatch[1], type: "mDNS" }];
          }
        };

        setTimeout(resolve, 5000);
      });

      pc.close();
      hasLeak = results.some((r) => r.type === "Local");
    } catch {
      error = t.errorMessage;
    }

    testing = false;
  }

  onMount(runTest);

  const disclaimerTitle = $derived(lang === 'es' ? 'Sobre este resultado' : 'About this result');
  const disclaimerBody = $derived(lang === 'es'
    ? '"Sin fugas detectadas" puede significar que tu VPN funciona correctamente O que WebRTC está bloqueado en tu navegador. Verifica con una herramienta independiente como ipleak.net si usas VPN.'
    : '"No leak detected" can mean either your VPN is working OR that WebRTC is blocked by your browser. Verify with an independent tool like ipleak.net if you use a VPN.');
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  {#if testing}
    <div class="card">
      <div class="card-body" style="text-align: center; padding: 48px 20px;">
        <p style="color: var(--color-text-muted); font-size: 13px;">{t.runningTest}</p>
      </div>
    </div>
  {:else if !supported}
    <div class="card">
      <div class="card-body" style="text-align: center; padding: 48px 20px;">
        <p style="color: var(--color-amber); font-size: 13px;">{t.notSupported}</p>
      </div>
    </div>
  {:else if error}
    <div class="card">
      <div class="card-body" style="text-align: center; padding: 48px 20px;">
        <p style="color: var(--color-red); font-size: 13px;">{error}</p>
      </div>
    </div>
  {:else}
    <!-- Result Banner -->
    <div class="card" style="border-color: {hasLeak ? 'var(--color-red)' : 'var(--color-green)'};">
      <div class="card-body" style="text-align: center; padding: 32px 20px;">
        {#if hasLeak}
          <p style="font-size: 24px; font-weight: 700; color: var(--color-red); margin-bottom: 8px;">
            {t.leakDetected}
          </p>
          <p style="font-size: 13px; color: var(--color-text-muted);">
            {t.leakDescription}
          </p>
        {:else}
          <p style="font-size: 24px; font-weight: 700; color: var(--color-green); margin-bottom: 8px;">
            {t.noLeak}
          </p>
          <p style="font-size: 13px; color: var(--color-text-muted);">
            {t.noLeakDescription} {results.length === 0 ? t.noIpsFound : ""}
          </p>
        {/if}
      </div>
    </div>

    <!-- IPs Found -->
    {#if results.length > 0}
      <div class="card">
        <div class="card-header">
          <span class="card-title">{t.ipsFound} ({results.length})</span>
          <button class="btn-secondary" onclick={runTest}>{t.runAgain}</button>
        </div>
        <div class="card-body" style="padding: 0;">
          {#each results as result}
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--color-border);">
              <span style="font-size: 14px; font-weight: 500; color: var(--color-text); font-family: monospace;">
                {result.ip}
              </span>
              <span style="display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; white-space: nowrap;">
                <span class="badge {result.type === 'Local' ? 'badge-red' : result.type === 'Public' ? 'badge-green' : result.type === 'mDNS' ? 'badge-amber' : 'badge-blue'}">
                  {getTypeLabel(result.type)}
                </span>
                {#if result.type === 'Local'}<InfoTip text={t.localTip} />{/if}
                {#if result.type === 'Public'}<InfoTip text={t.publicTip} />{/if}
              </span>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div style="text-align: center;">
        <button class="btn-primary" onclick={runTest}>{t.runTestAgain}</button>
      </div>
    {/if}

    <!-- False-negative disclaimer -->
    {#if !testing}
      <div class="card" style="border-color: var(--color-amber); background: rgba(234,179,8,0.05);">
        <div class="card-body" style="color: var(--color-text-muted); font-size: 12px; line-height: 1.5;">
          <strong style="color: var(--color-text);">{disclaimerTitle}</strong>
          <br />
          {disclaimerBody}
        </div>
      </div>
    {/if}

    <!-- Explanation -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">{t.whatIsWebrtcLeak}</span>
      </div>
      <div class="card-body">
        <div style="font-size: 13px; color: var(--color-text-muted); line-height: 1.7;">
          <p style="margin-bottom: 12px;">
            {t.explanation1} <InfoTip text={t.stunTip} /> {t.explanation1End}
          </p>
          <p style="margin-bottom: 12px;">
            {t.explanation2Prefix}<strong style="color: var(--color-text);">{t.explanation2Bold}</strong>{t.explanation2Suffix}
          </p>
          <p>
            <strong style="color: var(--color-text);">{t.preventPrefix}</strong>{t.preventText}<code style="color: var(--color-accent-fg);">{t.preventCode}</code>{t.preventEnd}
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
