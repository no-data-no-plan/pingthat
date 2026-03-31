<script lang="ts">
  import InfoTip from './InfoTip.svelte';
  import type { Lang } from '../i18n/index';
  import { getJwtDecoder } from '../i18n/components';

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getJwtDecoder(lang));

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
      return { header: null, headerRaw: "", payload: null, payloadRaw: "", signature: "", isExpired: false, error: t.invalidFormat };
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
      return { header: null, headerRaw: "", payload: null, payloadRaw: "", signature: "", isExpired: false, error: t.decodeFailed };
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
    <span style="font-size: 12px; color: var(--color-accent);">{t.privacyNotice}</span>
  </div>

  <!-- Input -->
  <div class="card">
    <div class="card-header">
      <span class="card-title">{t.jwtToken}</span>
      <button class="btn-secondary" onclick={() => (token = sampleJwt)}>{t.loadExample}</button>
    </div>
    <div class="card-body">
      <textarea
        bind:value={token}
        placeholder={t.placeholder}
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
          <span style="font-size: 12px; color: var(--color-red);">{t.tokenExpired}</span>
        </div>
      {/if}

      <!-- Header -->
      <div class="card" style="border-color: rgba(74, 143, 255, 0.3);">
        <div class="card-header" style="border-bottom-color: rgba(74, 143, 255, 0.15);">
          <span class="card-title" style="color: var(--color-blue);">{t.header} <InfoTip text={t.headerTip} /></span>
          <button class="btn-secondary" onclick={() => copySection(decoded!.headerRaw, "header")}>
            {copiedSection === "header" ? t.copied : t.copy}
          </button>
        </div>
        <div class="card-body">
          <pre style="font-family: monospace; font-size: 13px; color: var(--color-blue); white-space: pre-wrap; word-break: break-all; margin: 0; line-height: 1.6;">{decoded.headerRaw}</pre>
        </div>
      </div>

      <!-- Payload -->
      <div class="card" style="border-color: rgba(62, 207, 142, 0.3);">
        <div class="card-header" style="border-bottom-color: rgba(62, 207, 142, 0.15);">
          <span class="card-title" style="color: var(--color-green);">{t.payload} <InfoTip text={t.payloadTip} /></span>
          <div style="display: flex; gap: 8px; align-items: center;">
            {#if decoded.isExpired}
              <span class="badge badge-red">{t.expired}</span>
            {/if}
            <button class="btn-secondary" onclick={() => copySection(decoded!.payloadRaw, "payload")}>
              {copiedSection === "payload" ? t.copied : t.copy}
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
          <span class="card-title" style="color: var(--color-red);">{t.signature} <InfoTip text={t.signatureTip} /></span>
          <button class="btn-secondary" onclick={() => copySection(decoded!.signature, "sig")}>
            {copiedSection === "sig" ? t.copied : t.copy}
          </button>
        </div>
        <div class="card-body">
          <p style="font-family: monospace; font-size: 13px; color: var(--color-red); word-break: break-all; margin: 0;">
            {decoded.signature}
          </p>
          <p style="font-size: 11px; color: var(--color-text-dim); margin-top: 8px;">
            {t.signatureNote}
          </p>
        </div>
      </div>
    {/if}
  {/if}
</div>
