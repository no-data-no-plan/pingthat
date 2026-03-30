<script lang="ts">
  import { onMount } from "svelte";

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
        pc.createOffer().then((offer) => pc.setLocalDescription(offer));

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
      error = "Failed to run WebRTC test. Your browser may block this.";
    }

    testing = false;
  }

  onMount(runTest);
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  {#if testing}
    <div class="card">
      <div class="card-body" style="text-align: center; padding: 48px 20px;">
        <p style="color: var(--color-text-muted); font-size: 13px;">Running WebRTC leak test...</p>
      </div>
    </div>
  {:else if !supported}
    <div class="card">
      <div class="card-body" style="text-align: center; padding: 48px 20px;">
        <p style="color: var(--color-amber); font-size: 13px;">WebRTC is not supported in your browser.</p>
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
            Leak Detected!
          </p>
          <p style="font-size: 13px; color: var(--color-text-muted);">
            WebRTC is exposing your local/private IP address. If you're using a VPN, your real IP may be visible.
          </p>
        {:else}
          <p style="font-size: 24px; font-weight: 700; color: var(--color-green); margin-bottom: 8px;">
            No Leak Detected
          </p>
          <p style="font-size: 13px; color: var(--color-text-muted);">
            WebRTC is not exposing any private IP addresses. {results.length === 0 ? "No IPs were found in ICE candidates." : ""}
          </p>
        {/if}
      </div>
    </div>

    <!-- IPs Found -->
    {#if results.length > 0}
      <div class="card">
        <div class="card-header">
          <span class="card-title">IPs Found ({results.length})</span>
          <button class="btn-secondary" onclick={runTest}>Run Again</button>
        </div>
        <div class="card-body" style="padding: 0;">
          {#each results as result}
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--color-border);">
              <span style="font-size: 14px; font-weight: 500; color: var(--color-text); font-family: monospace;">
                {result.ip}
              </span>
              <span class="badge {result.type === 'Local' ? 'badge-red' : result.type === 'Public' ? 'badge-green' : result.type === 'mDNS' ? 'badge-amber' : 'badge-blue'}">
                {result.type}
              </span>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div style="text-align: center;">
        <button class="btn-primary" onclick={runTest}>Run Test Again</button>
      </div>
    {/if}

    <!-- Explanation -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">What is a WebRTC leak?</span>
      </div>
      <div class="card-body">
        <div style="font-size: 13px; color: var(--color-text-muted); line-height: 1.7;">
          <p style="margin-bottom: 12px;">
            WebRTC (Web Real-Time Communication) enables peer-to-peer connections in browsers for video calls, file sharing, and more. During connection setup, it uses STUN/TURN servers to discover your network addresses.
          </p>
          <p style="margin-bottom: 12px;">
            A <strong style="color: var(--color-text);">WebRTC leak</strong> occurs when your browser reveals your local (private) IP address through ICE candidates, even when you're behind a VPN. This can expose your real network identity.
          </p>
          <p>
            <strong style="color: var(--color-text);">To prevent leaks:</strong> Use a browser extension that blocks WebRTC, disable WebRTC in browser settings (Firefox: <code style="color: var(--color-accent);">media.peerconnection.enabled = false</code>), or use a VPN with built-in WebRTC protection.
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
