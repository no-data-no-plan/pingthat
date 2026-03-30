<script lang="ts">
  import { onMount } from "svelte";

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

  onMount(async () => {
    language = navigator.language || "Unknown";
    online = navigator.onLine;
    platform = navigator.platform || "Unknown";
    userAgent = navigator.userAgent || "Unknown";

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
    } catch {
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
    } catch {
      // Both failed
    }

    error = "Could not detect your IP address. Check your connection or try again.";
    loading = false;
  });

  function copyIp() {
    if (!ip) return;
    navigator.clipboard.writeText(ip);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  {#if loading}
    <div class="card">
      <div class="card-body" style="text-align: center; padding: 48px 20px;">
        <p style="color: var(--color-text-muted); font-size: 13px;">Detecting your IP address...</p>
      </div>
    </div>
  {:else if error}
    <div class="card">
      <div class="card-body" style="text-align: center; padding: 48px 20px;">
        <p style="color: var(--color-red); font-size: 13px;">{error}</p>
      </div>
    </div>
  {:else}
    <!-- IP Display -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Your Public IP</span>
        <button class="btn-secondary" onclick={copyIp}>
          {copied ? "Copied!" : "Copy IP"}
        </button>
      </div>
      <div class="card-body" style="text-align: center; padding: 32px 20px;">
        <p style="font-size: 32px; font-weight: 700; color: var(--color-accent); letter-spacing: -0.02em; font-family: 'Inter', monospace;">
          {ip}
        </p>
      </div>
    </div>

    <!-- Location & Network -->
    <div class="metrics-grid cols-2">
      <div class="metric">
        <div class="metric-label">Location</div>
        <div class="metric-value" style="font-size: 16px;">
          {city && country ? `${city}, ${country}` : city || country || "Unknown"}
        </div>
        {#if region}
          <div class="metric-sub">{region}</div>
        {/if}
      </div>
      <div class="metric">
        <div class="metric-label">ISP / Organization</div>
        <div class="metric-value" style="font-size: 16px; word-break: break-word;">
          {isp || "Unknown"}
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">Timezone</div>
        <div class="metric-value" style="font-size: 16px;">
          {timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown"}
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">ASN</div>
        <div class="metric-value" style="font-size: 16px;">
          {asn || "Unknown"}
        </div>
      </div>
    </div>

    <!-- Connection Info -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Your Connection</span>
      </div>
      <div class="card-body">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div style="font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 4px;">Language</div>
            <div style="font-size: 14px; color: var(--color-text);">{language}</div>
          </div>
          <div>
            <div style="font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 4px;">Status</div>
            <div style="font-size: 14px;">
              {#if online}
                <span class="badge badge-green">Online</span>
              {:else}
                <span class="badge badge-red">Offline</span>
              {/if}
            </div>
          </div>
          <div>
            <div style="font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 4px;">Platform</div>
            <div style="font-size: 14px; color: var(--color-text);">{platform}</div>
          </div>
          <div>
            <div style="font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 4px;">Browser</div>
            <div style="font-size: 12px; color: var(--color-text); word-break: break-word; line-height: 1.4;">{userAgent.slice(0, 80)}{userAgent.length > 80 ? '...' : ''}</div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
