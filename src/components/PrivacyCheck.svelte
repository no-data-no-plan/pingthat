<script lang="ts">
  import { onMount } from "svelte";

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
    if (label === "Do Not Track") return lower === "enabled" ? "safe" : "note";
    if (label === "Cookies Enabled") return lower === "yes" ? "note" : "safe";
    if (label === "WebRTC Leak") return lower.includes("no leak") ? "safe" : "exposed";
    if (label === "Canvas Fingerprint") return "exposed";
    if (label === "Audio Fingerprint") return lower === "not supported" ? "safe" : "exposed";
    if (label === "WebGL Vendor") return lower === "not available" ? "safe" : "exposed";
    if (label === "Hardware Concurrency") return "note";
    if (label === "Device Memory") return lower === "not available" ? "safe" : "exposed";
    if (label === "Touch Support") return "note";
    return "note";
  }

  async function checkWebRTC(): Promise<string> {
    return new Promise((resolve) => {
      try {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        const ips: string[] = [];
        let resolved = false;

        pc.createDataChannel("");
        pc.createOffer().then((offer) => pc.setLocalDescription(offer));

        pc.onicecandidate = (e) => {
          if (!e.candidate) {
            if (!resolved) {
              resolved = true;
              pc.close();
              if (ips.length === 0) resolve("No leak detected");
              else {
                const hasLocal = ips.some(
                  (ip) => ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.")
                );
                resolve(hasLocal ? `Leak: ${ips.join(", ")}` : "No leak detected");
              }
            }
            return;
          }
          const match = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(e.candidate.candidate);
          if (match && !ips.includes(match[1])) {
            const ip = match[1];
            if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.")) {
              ips.push(ip);
            }
          }
        };

        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            pc.close();
            resolve(ips.length > 0 ? `Leak: ${ips.join(", ")}` : "No leak detected");
          }
        }, 3000);
      } catch {
        resolve("Not supported");
      }
    });
  }

  function getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "Not supported";
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
      return "Not supported";
    }
  }

  function getAudioFingerprint(): string {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ctx.close();
      return "Detectable";
    } catch {
      return "Not supported";
    }
  }

  function getWebGLVendor(): string {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "Not available";
      const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
      if (!debugInfo) return "Hidden";
      return (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "Unknown";
    } catch {
      return "Not available";
    }
  }

  onMount(async () => {
    const items: CheckItem[] = [];

    const dnt = navigator.doNotTrack === "1" ? "Enabled" : "Disabled";
    items.push({ label: "Do Not Track", value: dnt, status: getStatus("Do Not Track", dnt) });

    const cookies = navigator.cookieEnabled ? "Yes" : "No";
    items.push({ label: "Cookies Enabled", value: cookies, status: getStatus("Cookies Enabled", cookies) });

    const webrtc = await checkWebRTC();
    items.push({ label: "WebRTC Leak", value: webrtc, status: getStatus("WebRTC Leak", webrtc) });

    const canvas = getCanvasFingerprint();
    items.push({ label: "Canvas Fingerprint", value: canvas, status: getStatus("Canvas Fingerprint", canvas) });

    const audio = getAudioFingerprint();
    items.push({ label: "Audio Fingerprint", value: audio, status: getStatus("Audio Fingerprint", audio) });

    const webgl = getWebGLVendor();
    items.push({ label: "WebGL Vendor", value: webgl.length > 50 ? webgl.slice(0, 50) + "..." : webgl, status: getStatus("WebGL Vendor", webgl) });

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    items.push({ label: "Timezone", value: tz, status: "note" });

    const screen = `${window.screen.width} x ${window.screen.height}`;
    items.push({ label: "Screen Resolution", value: screen, status: "note" });

    items.push({ label: "Language", value: navigator.language || "Unknown", status: "note" });

    const cores = navigator.hardwareConcurrency?.toString() || "Unknown";
    items.push({ label: "Hardware Concurrency", value: `${cores} cores`, status: getStatus("Hardware Concurrency", cores) });

    const mem = (navigator as any).deviceMemory;
    const memStr = mem ? `${mem} GB` : "Not available";
    items.push({ label: "Device Memory", value: memStr, status: getStatus("Device Memory", memStr) });

    const touch = navigator.maxTouchPoints;
    items.push({ label: "Touch Support", value: touch > 0 ? `Yes (${touch} points)` : "No", status: "note" });

    items.push({ label: "Platform", value: navigator.platform || "Unknown", status: "note" });

    checks = items;
    loading = false;
  });

  function copyReport() {
    const text = checks.map((c) => `${c.label}: ${c.value} [${c.status.toUpperCase()}]`).join("\n");
    navigator.clipboard.writeText(`Browser Privacy Report - PingThat.dev\n${"=".repeat(40)}\n${text}`);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  {#if loading}
    <div class="card">
      <div class="card-body" style="text-align: center; padding: 48px 20px;">
        <p style="color: var(--color-text-muted); font-size: 13px;">Running privacy checks...</p>
      </div>
    </div>
  {:else}
    <div class="card">
      <div class="card-header">
        <span class="card-title">Privacy Report</span>
        <button class="btn-secondary" onclick={copyReport}>
          {copied ? "Copied!" : "Copy Report"}
        </button>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
      {#each checks as check}
        <div class="card">
          <div class="card-body" style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <span style="font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-muted);">
                {check.label}
              </span>
              {#if check.status === "safe"}
                <span class="badge badge-green">Safe</span>
              {:else if check.status === "exposed"}
                <span class="badge badge-red">Exposed</span>
              {:else}
                <span class="badge badge-amber">Note</span>
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
