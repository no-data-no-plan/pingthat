<script lang="ts">
  import { onMount } from "svelte";
  import InfoTip from './InfoTip.svelte';
  import type { Lang } from '../i18n/index';
  import { getPrivacyCheck } from '../i18n/components';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getPrivacyCheck(lang));

  interface CheckItem {
    label: string;
    value: string;
    status: "safe" | "exposed" | "note";
  }

  let checks = $state<CheckItem[]>([]);
  let loading = $state(true);
  let copied = $state(false);

  function getStatus(label: string, value: string): "safe" | "exposed" | "note" {
    const lower = value.toLowerCase();
    if (label === t.doNotTrack) return lower === t.enabled.toLowerCase() ? "safe" : "note";
    if (label === t.cookiesEnabled) return lower === t.yes.toLowerCase() ? "note" : "safe";
    if (label === t.webrtcLeak) return lower.includes(t.noLeakDetected.toLowerCase()) ? "safe" : "exposed";
    if (label === t.canvasFingerprint) return "exposed";
    if (label === t.audioFingerprint) return lower === t.notSupported.toLowerCase() ? "safe" : "exposed";
    if (label === t.webglVendor) return lower === t.notAvailable.toLowerCase() ? "safe" : "exposed";
    if (label === t.hardwareConcurrency) return "note";
    if (label === t.deviceMemory) return lower === t.notAvailable.toLowerCase() ? "safe" : "exposed";
    if (label === t.touchSupport) return "note";
    return "note";
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
    items.push({ label: t.doNotTrack, value: dnt, status: getStatus(t.doNotTrack, dnt) });

    const cookies = navigator.cookieEnabled ? t.yes : t.no;
    items.push({ label: t.cookiesEnabled, value: cookies, status: getStatus(t.cookiesEnabled, cookies) });

    const webrtc = await checkWebRTC();
    items.push({ label: t.webrtcLeak, value: webrtc, status: getStatus(t.webrtcLeak, webrtc) });

    const canvas = getCanvasFingerprint();
    items.push({ label: t.canvasFingerprint, value: canvas, status: getStatus(t.canvasFingerprint, canvas) });

    const audio = getAudioFingerprint();
    items.push({ label: t.audioFingerprint, value: audio, status: getStatus(t.audioFingerprint, audio) });

    const webgl = getWebGLVendor();
    items.push({ label: t.webglVendor, value: webgl, status: getStatus(t.webglVendor, webgl) });

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    items.push({ label: t.timezone, value: tz, status: "note" });

    const screen = `${window.screen.width} x ${window.screen.height}`;
    items.push({ label: t.screenResolution, value: screen, status: "note" });

    items.push({ label: t.language, value: navigator.language || t.unknown, status: "note" });

    const cores = navigator.hardwareConcurrency?.toString() || t.unknown;
    items.push({ label: t.hardwareConcurrency, value: `${cores} ${t.cores}`, status: getStatus(t.hardwareConcurrency, cores) });

    const mem = (navigator as any).deviceMemory;
    const memStr = mem ? `${mem} GB` : t.notAvailable;
    items.push({ label: t.deviceMemory, value: memStr, status: getStatus(t.deviceMemory, memStr) });

    const touch = navigator.maxTouchPoints;
    items.push({ label: t.touchSupport, value: touch > 0 ? `${t.yes} (${touch} ${t.points})` : t.no, status: "note" });

    items.push({ label: t.platform, value: navigator.platform || t.unknown, status: "note" });

    checks = items;
    loading = false;
  });

  const explainNote = $derived(lang === 'es'
    ? 'Esta página muestra qué APIs del navegador están disponibles y podrían usarse para fingerprinting. "Detectable" no significa que te estén rastreando — solo que la capacidad existe.'
    : 'This page shows which browser APIs are available and could be used for fingerprinting. "Detectable" does not mean you are being tracked — only that the capability exists.');

  function copyReport() {
    const text = checks.map((c) => `${c.label}: ${c.value} [${c.status.toUpperCase()}]`).join("\n");
    navigator.clipboard.writeText(`${t.clipboardTitle}\n${"=".repeat(40)}\n${text}`);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }

  const fireToolComplete = useToolComplete("privacy-check");
  let __ftcFirstRun = true;
  $effect(() => {
    checks; loading; copied;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
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
    <div class="card">
      <div class="card-header">
        <span class="card-title">{t.privacyReport}</span>
        <button class="btn-secondary" onclick={copyReport}>
          {copied ? t.copied : t.copyReport}
        </button>
      </div>
    </div>

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
                {#if check.label === t.canvasFingerprint}<InfoTip text={t.canvasTip} />{/if}
                {#if check.label === t.webrtcLeak}<InfoTip text={t.webrtcTip} />{/if}
                {#if check.label === t.doNotTrack}<InfoTip text={t.dntTip} />{/if}
              </span>
              {#if check.status === "safe"}
                <span class="badge badge-green">{t.safe}</span>
              {:else if check.status === "exposed"}
                <span class="badge badge-amber">{t.exposed}</span>
              {:else}
                <span class="badge badge-amber">{t.note}</span>
              {/if}
            </div>
            <div style="font-size: 13px; font-weight: 500; color: var(--color-text); word-break: break-word;">
              {check.value}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
