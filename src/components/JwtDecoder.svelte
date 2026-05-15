<script lang="ts">
  import InfoTip from './InfoTip.svelte';
  import type { Lang } from '../i18n/index';
  import { getJwtDecoder } from '../i18n/components';
  import { verifyJwt, type VerifyResult, type JwtAlg } from '../lib/jwt-verify';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getJwtDecoder(lang));

  let token = $state("");
  let copiedSection = $state("");
  let verifyKey = $state("");
  let verifyResult = $state<VerifyResult | null>(null);
  let verifying = $state(false);

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

  async function copySection(text: string, section: string) {
    if (await copyAndNotify(text, c.copied, c.copyFailed)) {
      copiedSection = section;
      setTimeout(() => (copiedSection = ""), 1500);
    }
  }

  const sampleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjIsInJvbGUiOiJhZG1pbiJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  const noneAlgTitle = $derived(lang === 'es' ? 'Algoritmo "none" detectado' : '"none" algorithm detected');
  const noneAlgBody = $derived(lang === 'es'
    ? 'Este token usa alg=none, lo que significa que no tiene firma. Cualquiera puede haber creado o modificado las claims. No confíes en este token.'
    : 'This token uses alg=none, meaning it has NO signature. Anyone could have created or modified the claims. Do not trust this token.');

  // Detected algorithm drives the key-input label + placeholder so users know
  // whether to paste a shared secret (HS256) or a PEM public key (RS256/ES256).
  const detectedAlg = $derived.by((): JwtAlg | null => {
    const a = decoded?.header?.alg;
    if (a === "HS256" || a === "RS256" || a === "ES256") return a;
    return null;
  });

  const keyLabel = $derived(
    detectedAlg === "HS256" ? t.verifyKeyLabelHs
      : detectedAlg === "RS256" || detectedAlg === "ES256" ? t.verifyKeyLabelPem
      : t.verifyKeyLabelGeneric,
  );
  const keyPlaceholder = $derived(
    detectedAlg === "HS256" ? t.verifyKeyPlaceholderHs : t.verifyKeyPlaceholderPem,
  );
  // CW-PT-01 + CW-PT-02 (2026-05-02): Verify panel renders even before
  // a token is pasted so users can discover the workflow.
  const verifyEnabled = $derived(!!decoded && !decoded.error);
  const keyHint = $derived(
    detectedAlg === "HS256" ? t.verifyKeyHintHs
      : (detectedAlg === "RS256" || detectedAlg === "ES256") ? t.verifyKeyHintPem
      : "",
  );

  // Debounced live verification. Re-runs whenever the token or key changes,
  // cancels the previous timer if still pending, and discards stale results
  // so a fast typer never sees an out-of-order response.
  $effect(() => {
    const tk = token.trim();
    const k = verifyKey;
    if (!tk || !k.trim()) {
      verifyResult = null;
      verifying = false;
      return;
    }
    let cancelled = false;
    verifying = true;
    const id = setTimeout(async () => {
      const r = await verifyJwt(tk, k);
      if (cancelled) return;
      verifyResult = r;
      verifying = false;
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  });

  function verifyMessage(r: VerifyResult): string {
    if (r.ok) return t.verifyValid;
    switch (r.reason) {
      case "signature-mismatch": return t.verifyInvalidSignature;
      case "invalid-key-format": return t.verifyInvalidKeyFormat;
      case "empty-key": return t.verifyEmptyKey;
      case "alg-none-rejected": return t.verifyAlgNone;
      case "unsupported-alg": return `${t.verifyAlgUnsupported}${r.detail ? ` (${r.detail})` : ""}`;
      case "alg-mismatch": return t.verifyAlgMismatch;
      case "malformed-token": return t.verifyMalformed;
    }
  }

  const fireToolComplete = useToolComplete("jwt-decoder");
  let __ftcFirstRun = true;
  $effect(() => {
    token; copiedSection; verifyKey; verifyResult; verifying;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <!-- Privacy notice -->
  <div style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; background: var(--color-accent-dim); border: 1px solid rgba(16, 185, 129, 0.2);">
    <span style="font-size: 12px; color: var(--color-accent-fg);">{t.privacyNotice}</span>
  </div>

  <!-- Input -->
  <div class="card">
    <div class="card-header">
      <label for="jwt-token-input" class="card-title">{t.jwtToken}</label>
      <button class="btn-secondary" onclick={() => (token = sampleJwt)}>{t.loadExample}</button>
    </div>
    <div class="card-body">
      <textarea
        id="jwt-token-input"
        bind:value={token}
        placeholder={t.placeholder}
        rows="4"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
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

      <!-- alg:none warning -->
      {#if decoded?.header?.alg && String(decoded.header.alg).toLowerCase() === 'none'}
        <div class="card" style="border-color: var(--color-red); background: rgba(239,68,68,0.05);">
          <div class="card-body" style="color: var(--color-red); font-size: 13px; line-height: 1.5;">
            <strong>⚠ {noneAlgTitle}</strong>
            <br />
            {noneAlgBody}
          </div>
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

  <!-- Verify Signature — always rendered so the workflow is discoverable
       even before a token is pasted. CW-PT-01 + CW-PT-02 (2026-05-02). -->
  <div class="card" style={verifyEnabled ? "" : "opacity: 0.6;"}>
    <div class="card-header">
      <span class="card-title">{t.verifyTitle} <InfoTip text={t.verifyTip} /></span>
      {#if verifyEnabled && detectedAlg}
        <span class="badge" style="font-family: monospace; background: var(--color-surface2); color: var(--color-text-muted); border: 1px solid var(--color-border2);">alg: {detectedAlg}</span>
      {/if}
    </div>
    <div class="card-body" style="display: flex; flex-direction: column; gap: 10px;">
      <label for="jwt-verify-key" style="font-size: 12px; color: var(--color-text-muted);">{keyLabel}</label>
      <textarea
        id="jwt-verify-key"
        bind:value={verifyKey}
        placeholder={keyPlaceholder}
        rows={detectedAlg === "HS256" ? 2 : 5}
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        disabled={!verifyEnabled}
        style="width: 100%; font-family: monospace; font-size: 12px; resize: vertical; background: var(--color-surface2); border: 1px solid var(--color-border2); border-radius: 8px; padding: 12px; color: var(--color-text);"
      ></textarea>
      <p style="font-size: 11px; color: var(--color-text-dim); margin: 0;">{t.verifyAutoNote}</p>

      {#if !verifyEnabled}
        <div role="status" aria-live="polite" style="padding: 10px 14px; border-radius: 8px; background: var(--color-surface2); border: 1px solid var(--color-border2); font-size: 12px; color: var(--color-text-muted);">
          {t.verifyNoTokenYet}
        </div>
      {:else if !verifyKey.trim()}
        <div role="status" aria-live="polite" style="padding: 10px 14px; border-radius: 8px; background: var(--color-surface2); border: 1px solid var(--color-border2); font-size: 12px; color: var(--color-text-muted);">
          {keyHint || t.verifyEmptyKey}
        </div>
      {:else if verifying}
        <div role="status" aria-live="polite" style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 8px; background: var(--color-surface2); border: 1px solid var(--color-border2); font-size: 13px; color: var(--color-text-muted);">
          {t.verifyChecking}
        </div>
      {:else if verifyResult}
        {#if verifyResult.ok}
          <div role="status" aria-live="polite" style="padding: 12px 16px; border-radius: 8px; background: var(--color-accent-dim); border: 1px solid rgba(16, 185, 129, 0.35);">
            <p style="font-size: 13px; color: var(--color-accent-fg); margin: 0; font-weight: 500;">
              {t.verifyValid} <span style="font-family: monospace; opacity: 0.7;">({verifyResult.alg})</span>
            </p>
            <p style="font-size: 11px; color: var(--color-text-muted); margin: 4px 0 0;">{t.verifyValidNote}</p>
          </div>
        {:else}
          <div role="status" aria-live="polite" style="padding: 12px 16px; border-radius: 8px; background: var(--color-red-dim); border: 1px solid rgba(255, 107, 107, 0.35);">
            <p style="font-size: 13px; color: var(--color-red); margin: 0; font-weight: 500;">{verifyMessage(verifyResult)}</p>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>
