<script lang="ts">
  import { onMount } from "svelte";
  import InfoTip from './InfoTip.svelte';
  import StatusBadge from './ui/StatusBadge.svelte';
  import VerdictBanner from './ui/VerdictBanner.svelte';
  import type { Lang } from '../i18n/index';
  import type { Level } from '../lib/severity';
  import { getPrivacyCheck } from '../i18n/components';
  import { getCommon } from '../i18n/common';
  import { copyAndNotify } from '../lib/notify';
  import { useToolComplete } from "../lib/tool-complete.svelte";
  import { TIERS, NORMALIZED, summarizeIdentifiability, type SignalKey, type IdentTier } from '../lib/fp-tiers';
  import { detectFonts, createCanvasMeasure } from '../lib/font-detect';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const c = $derived(getCommon(lang as 'en' | 'es'));
  const t = $derived(getPrivacyCheck(lang));

  type CheckStatus = "safe" | "exposed" | "note";

  interface CheckItem {
    key: SignalKey;
    label: string;
    value: string;
    status: CheckStatus;
  }

  let checks = $state<CheckItem[]>([]);
  let loading = $state(true);
  let copied = $state(false);
  let fontsDetected = $state<string[]>([]);
  let fontsOpen = $state(false);

  function itemLevel(status: CheckItem['status']): Level {
    if (status === 'safe') return 'ok';
    if (status === 'exposed') return 'warn';
    return 'info';
  }

  const overallLevel = $derived.by<Level>(() => {
    if (checks.some(c => c.status === 'exposed')) return 'warn';
    if (checks.some(c => c.status === 'note')) return 'info';
    return 'ok';
  });

  const ident = $derived(summarizeIdentifiability(checks));
  const bannerTitle = $derived(
    ident.highExposed === 0 ? t.bannerNone
    : ident.highExposed === 1 ? t.bannerHighOne
    : t.bannerHighMany.replace('{n}', String(ident.highExposed)));

  const tierWord = $derived<Record<IdentTier, string>>({
    high: t.tierHigh, medium: t.tierMedium, low: t.tierLow,
  });
  const TIER_DOT: Record<IdentTier, string> = {
    high: 'var(--color-warn)', medium: 'var(--color-info)', low: 'var(--color-ok)',
  };
  function tierTip(key: SignalKey): string {
    const norm = NORMALIZED[key];
    if (norm === undefined) return t.tierTipNone;
    // es-ES decimal comma — the static copy around the figure uses it too
    const formatted = lang === 'es' ? norm.toFixed(3).replace('.', ',') : norm.toFixed(3);
    return t.tierTipNorm.replace('{norm}', formatted);
  }

  function getStatus(key: SignalKey, value: string): CheckStatus {
    const lower = value.toLowerCase();
    switch (key) {
      case 'dnt': return lower === t.enabled.toLowerCase() ? "safe" : "note";
      case 'cookies': return lower === t.yes.toLowerCase() ? "note" : "safe";
      case 'webrtc': return lower.includes(t.noLeakDetected.toLowerCase()) ? "safe" : "exposed";
      case 'canvas': return "exposed";
      case 'audio': return lower === t.notSupported.toLowerCase() ? "safe" : "exposed";
      case 'webgl': return lower === t.notAvailable.toLowerCase() ? "safe" : "exposed";
      case 'memory': return lower === t.notAvailable.toLowerCase() ? "safe" : "exposed";
      default: return "note";
    }
  }

  async function checkWebRTC(): Promise<string> {
    return new Promise((resolve) => {
      try {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        const ips: string[] = [];
        let resolved = false;

        pc.createDataChannel("");
        pc.createOffer().then((offer) => pc.setLocalDescription(offer)).catch(() => {});

        pc.onicecandidate = (e) => {
          if (!e.candidate) {
            if (!resolved) {
              resolved = true;
              pc.close();
              if (ips.length === 0) resolve(t.noLeakDetected);
              else {
                const hasLocal = ips.some(
                  (ip) => ip.startsWith("10.") || ip.startsWith("192.168.") || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip)
                );
                const leakLabel = lang === "es" ? "Fuga" : "Leak";
                resolve(hasLocal ? `${leakLabel}: ${ips.join(", ")}` : t.noLeakDetected);
              }
            }
            return;
          }
          const match = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(e.candidate.candidate);
          if (match && !ips.includes(match[1])) {
            const ip = match[1];
            if (ip.startsWith("10.") || ip.startsWith("192.168.") || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip)) {
              ips.push(ip);
            }
          }
        };

        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            pc.close();
            const leakLabel = lang === "es" ? "Fuga" : "Leak";
            resolve(ips.length > 0 ? `${leakLabel}: ${ips.join(", ")}` : t.noLeakDetected);
          }
        }, 3000);
      } catch {
        resolve(t.notSupported);
      }
    });
  }

  function getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext("2d");
      if (!ctx) return t.notSupported;
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("PingThat.dev", 2, 15);
      const data = canvas.toDataURL();
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash + char) | 0;
      }
      return Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
    } catch {
      return t.notSupported;
    }
  }

  function getAudioFingerprint(): string {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ctx.close();
      return t.detectable;
    } catch {
      return t.notSupported;
    }
  }

  function getWebGLVendor(): string {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return t.notAvailable;
      const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
      if (!debugInfo) return t.hidden;
      return (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || t.unknown;
    } catch {
      return t.notAvailable;
    }
  }

  onMount(async () => {
    const items: CheckItem[] = [];

    const dnt = navigator.doNotTrack === "1" ? t.enabled : t.disabled;
    items.push({ key: 'dnt', label: t.doNotTrack, value: dnt, status: getStatus('dnt', dnt) });

    const cookies = navigator.cookieEnabled ? t.yes : t.no;
    items.push({ key: 'cookies', label: t.cookiesEnabled, value: cookies, status: getStatus('cookies', cookies) });

    const webrtc = await checkWebRTC();
    items.push({ key: 'webrtc', label: t.webrtcLeak, value: webrtc, status: getStatus('webrtc', webrtc) });

    const canvas = getCanvasFingerprint();
    items.push({ key: 'canvas', label: t.canvasFingerprint, value: canvas, status: getStatus('canvas', canvas) });

    const measure = createCanvasMeasure();
    if (measure) {
      const { detected, tested } = detectFonts(measure);
      fontsDetected = detected;
      items.push({
        key: 'fonts',
        label: t.fontsDetected,
        value: `${detected.length} ${t.fontsOf} ${tested} ${t.fontsChecked}`,
        status: detected.length > 0 ? 'exposed' : 'note',
      });
    } else {
      items.push({ key: 'fonts', label: t.fontsDetected, value: t.notAvailable, status: 'note' });
    }

    const audio = getAudioFingerprint();
    items.push({ key: 'audio', label: t.audioFingerprint, value: audio, status: getStatus('audio', audio) });

    const webgl = getWebGLVendor();
    items.push({ key: 'webgl', label: t.webglVendor, value: webgl, status: getStatus('webgl', webgl) });

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    items.push({ key: 'timezone', label: t.timezone, value: tz, status: "note" });

    const screen = `${window.screen.width} x ${window.screen.height}`;
    items.push({ key: 'screen', label: t.screenResolution, value: screen, status: "note" });

    items.push({ key: 'language', label: t.language, value: navigator.language || t.unknown, status: "note" });

    const cores = navigator.hardwareConcurrency?.toString() || t.unknown;
    items.push({ key: 'cores', label: t.hardwareConcurrency, value: `${cores} ${t.cores}`, status: getStatus('cores', cores) });

    const mem = (navigator as any).deviceMemory;
    const memStr = mem ? `${mem} GB` : t.notAvailable;
    items.push({ key: 'memory', label: t.deviceMemory, value: memStr, status: getStatus('memory', memStr) });

    const touch = navigator.maxTouchPoints;
    items.push({ key: 'touch', label: t.touchSupport, value: touch > 0 ? `${t.yes} (${touch} ${t.points})` : t.no, status: "note" });

    items.push({ key: 'platform', label: t.platform, value: navigator.platform || t.unknown, status: "note" });

    checks = items;
    loading = false;
  });

  const explainNote = $derived(lang === 'es'
    ? 'Esta página muestra qué APIs del navegador están disponibles y podrían usarse para fingerprinting. "Detectable" no significa que te estén rastreando — solo que la capacidad existe.'
    : 'This page shows which browser APIs are available and could be used for fingerprinting. "Detectable" does not mean you are being tracked — only that the capability exists.');

  async function copyReport() {
    const text = checks.map((chk) => {
      const tier = TIERS[chk.key];
      const tag = tier ? ` {${t.identifies.toUpperCase()}: ${tierWord[tier].toUpperCase()}}` : '';
      return `${chk.label}: ${chk.value} [${chk.status.toUpperCase()}]${tag}`;
    }).join("\n");
    if (await copyAndNotify(`${t.clipboardTitle}\n${bannerTitle}\n${"=".repeat(40)}\n${text}`, c.copied, c.copyFailed)) {
      copied = true;
      setTimeout(() => (copied = false), 1500);
    }
  }

  const fireToolComplete = useToolComplete("privacy-check");
  let __ftcFirstRun = true;
  $effect(() => {
    checks; loading;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    if (loading || checks.length === 0) return;
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  {#if loading}
    <div class="card">
      <div class="card-body" style="text-align: center; padding: 48px 20px;">
        <p style="color: var(--color-text-muted); font-size: 13px;">{t.runningChecks}</p>
      </div>
    </div>
  {:else}
    <div class="card sev-accent is-{overallLevel}">
      <div class="card-header">
        <span class="card-title">{t.privacyReport}</span>
        <div style="display: flex; gap: 10px; align-items: center;">
          <StatusBadge level={overallLevel} label={overallLevel === 'bad' ? t.exposed : overallLevel === 'info' ? t.note : t.safe} {lang} />
          <button class="btn-secondary" onclick={copyReport}>
            {copied ? t.copied : t.copyReport}
          </button>
        </div>
      </div>
    </div>

    <VerdictBanner level={ident.level} title={bannerTitle} explanation={t.bannerExp} />

    <!-- Explanatory note -->
    <div class="card" style="border-color: var(--color-border); background: var(--color-surface);">
      <div class="card-body" style="color: var(--color-text-muted); font-size: 12px; line-height: 1.5;">
        {explainNote}
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
      {#each checks as check}
        <div class="card">
          <div class="card-body" style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <span style="font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-muted);">
                {check.label}
                {#if check.key === 'canvas'}<InfoTip text={t.canvasTip} {lang} />{/if}
                {#if check.key === 'fonts'}<InfoTip text={t.fontsTip} {lang} />{/if}
                {#if check.key === 'webrtc'}<InfoTip text={t.webrtcTip} {lang} />{/if}
                {#if check.key === 'dnt'}<InfoTip text={t.dntTip} {lang} />{/if}
              </span>
              <StatusBadge level={itemLevel(check.status)} size="sm" label={check.status === 'safe' ? t.safe : check.status === 'exposed' ? t.exposed : t.note} {lang} />
            </div>
            <div style="font-size: 13px; font-weight: 500; color: var(--color-text); word-break: break-word;">
              {check.value}
            </div>
            {#if check.key === 'fonts' && fontsDetected.length > 0}
              <button
                class="btn-secondary"
                style="margin-top: 8px; font-size: 11px;"
                aria-expanded={fontsOpen}
                onclick={() => (fontsOpen = !fontsOpen)}
              >
                {fontsOpen ? t.hideAllFonts : `${t.showAllFonts} (${fontsDetected.length})`}
              </button>
              {#if fontsOpen}
                <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 8px; line-height: 1.7; word-break: break-word;">
                  {fontsDetected.join(' · ')}
                </div>
              {/if}
            {/if}
            {#if TIERS[check.key]}
              {@const tier = TIERS[check.key] as IdentTier}
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--color-border); display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 10px; color: var(--color-text-muted); border: 1px solid var(--color-border2); border-radius: 999px; padding: 2px 8px;">
                  <span style="color: {TIER_DOT[tier]};" aria-hidden="true">●</span>
                  {t.identifies}: {tierWord[tier]}
                </span>
                <InfoTip text={tierTip(check.key)} {lang} />
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
