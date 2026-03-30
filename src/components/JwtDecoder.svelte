<script lang="ts">
  import InfoTip from './InfoTip.svelte';
  let token = $state("");
  let copiedSection = $state("");

  interface DecodedJwt {
    header: any;
    headerRaw: string;
    payload: any;
    payloadRaw: string;
    signature: string;
    isExpired: boolean;
    error: string;
  }

  function base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad === 2) base64 += "==";
    else if (pad === 3) base64 += "=";
    try {
      return decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    } catch {
      return atob(base64);
    }
  }

  function formatTimestamp(ts: number): string {
    try {
      const d = new Date(ts * 1000);
      return `${d.toISOString()} (${d.toLocaleString()})`;
    } catch {
      return String(ts);
    }
  }

  function formatPayload(payload: any): any {
    const formatted = { ...payload };
    const timeFields = ["exp", "iat", "nbf", "auth_time"];
    for (const f of timeFields) {
      if (typeof formatted[f] === "number") {
        formatted[`${f}_human`] = formatTimestamp(formatted[f]);
      }
    }
    return formatted;
  }

  let decoded = $derived.by((): DecodedJwt | null => {
    const trimmed = token.trim();
    if (!trimmed) return null;

    const parts = trimmed.split(".");
    if (parts.length !== 3) {
      return { header: null, headerRaw: "", payload: null, payloadRaw: "", signature: "", isExpired: false, error: "Invalid JWT format. Expected 3 parts separated by dots." };
    }

    try {
      const headerStr = base64UrlDecode(parts[0]);
      const payloadStr = base64UrlDecode(parts[1]);
      const header = JSON.parse(headerStr);
      const payload = JSON.parse(payloadStr);

      const isExpired = typeof payload.exp === "number" && payload.exp * 1000 < Date.now();

      return {
        header,
        headerRaw: JSON.stringify(header, null, 2),
        payload: formatPayload(payload),
        payloadRaw: JSON.stringify(formatPayload(payload), null, 2),
        signature: parts[2],
        isExpired,
        error: "",
      };
    } catch (e) {
      return { header: null, headerRaw: "", payload: null, payloadRaw: "", signature: "", isExpired: false, error: "Failed to decode JWT. Check the format." };
    }
  });

  function copySection(text: string, section: string) {
    navigator.clipboard.writeText(text);
    copiedSection = section;
    setTimeout(() => (copiedSection = ""), 1500);
  }

  const sampleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjIsInJvbGUiOiJhZG1pbiJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <!-- Privacy notice -->
  <div style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; background: var(--color-accent-dim); border: 1px solid rgba(16, 185, 129, 0.2);">
    <span style="font-size: 12px; color: var(--color-accent);">Your token never leaves your browser. All decoding is done locally.</span>
  </div>

  <!-- Input -->
  <div class="card">
    <div class="card-header">
      <span class="card-title">JWT Token</span>
      <button class="btn-secondary" onclick={() => (token = sampleJwt)}>Load Example</button>
    </div>
    <div class="card-body">
      <textarea
        bind:value={token}
        placeholder="Paste your JWT token here..."
        rows="4"
        style="width: 100%; font-family: monospace; font-size: 12px; resize: vertical; background: var(--color-surface2); border: 1px solid var(--color-border2); border-radius: 8px; padding: 12px; color: var(--color-text);"
      ></textarea>
    </div>
  </div>

  {#if decoded}
    {#if decoded.error}
      <div class="card" style="border-color: var(--color-red);">
        <div class="card-body" style="text-align: center; padding: 32px 20px;">
          <p style="color: var(--color-red); font-size: 13px;">{decoded.error}</p>
        </div>
      </div>
    {:else}
      <!-- Expiry badge -->
      {#if decoded.isExpired}
        <div style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; background: var(--color-red-dim); border: 1px solid rgba(255, 107, 107, 0.2);">
          <span style="font-size: 12px; color: var(--color-red);">This token is expired.</span>
        </div>
      {/if}

      <!-- Header -->
      <div class="card" style="border-color: rgba(74, 143, 255, 0.3);">
        <div class="card-header" style="border-bottom-color: rgba(74, 143, 255, 0.15);">
          <span class="card-title" style="color: var(--color-blue);">Header <InfoTip text="Contains the signing algorithm (e.g. HS256, RS256) and token type. Tells the server how to verify the signature." /></span>
          <button class="btn-secondary" onclick={() => copySection(decoded!.headerRaw, "header")}>
            {copiedSection === "header" ? "Copied!" : "Copy"}
          </button>
        </div>
        <div class="card-body">
          <pre style="font-family: monospace; font-size: 13px; color: var(--color-blue); white-space: pre-wrap; word-break: break-all; margin: 0; line-height: 1.6;">{decoded.headerRaw}</pre>
        </div>
      </div>

      <!-- Payload -->
      <div class="card" style="border-color: rgba(62, 207, 142, 0.3);">
        <div class="card-header" style="border-bottom-color: rgba(62, 207, 142, 0.15);">
          <span class="card-title" style="color: var(--color-green);">Payload <InfoTip text="Contains claims -- data like subject (sub), expiration (exp), and issued-at (iat). Not encrypted, only base64-encoded." /></span>
          <div style="display: flex; gap: 8px; align-items: center;">
            {#if decoded.isExpired}
              <span class="badge badge-red">Expired</span>
            {/if}
            <button class="btn-secondary" onclick={() => copySection(decoded!.payloadRaw, "payload")}>
              {copiedSection === "payload" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div class="card-body">
          <pre style="font-family: monospace; font-size: 13px; color: var(--color-green); white-space: pre-wrap; word-break: break-all; margin: 0; line-height: 1.6;">{decoded.payloadRaw}</pre>
        </div>
      </div>

      <!-- Signature -->
      <div class="card" style="border-color: rgba(255, 107, 107, 0.3);">
        <div class="card-header" style="border-bottom-color: rgba(255, 107, 107, 0.15);">
          <span class="card-title" style="color: var(--color-red);">Signature <InfoTip text="Created by signing header + payload with a secret key. Verifying it proves the token hasn't been tampered with." /></span>
          <button class="btn-secondary" onclick={() => copySection(decoded!.signature, "sig")}>
            {copiedSection === "sig" ? "Copied!" : "Copy"}
          </button>
        </div>
        <div class="card-body">
          <p style="font-family: monospace; font-size: 13px; color: var(--color-red); word-break: break-all; margin: 0;">
            {decoded.signature}
          </p>
          <p style="font-size: 11px; color: var(--color-text-dim); margin-top: 8px;">
            Signature verification requires the secret key, which is not done client-side for security.
          </p>
        </div>
      </div>
    {/if}
  {/if}
</div>
