<script lang="ts">
  import InfoTip from './InfoTip.svelte';
  import type { Lang } from '../i18n/index';
  import { getIpConverter } from '../i18n/components';
  import { useToolComplete } from "../lib/tool-complete.svelte";

  interface Props { lang?: Lang; }
  let { lang = "en" }: Props = $props();
  const t = $derived(getIpConverter(lang));

  let input = $state("192.168.1.1");
  let copiedField = $state("");

  function parseDecimalDotted(s: string): number[] | null {
    const parts = s.split(".");
    if (parts.length !== 4) return null;
    const nums = parts.map(Number);
    if (nums.some((n) => isNaN(n) || n < 0 || n > 255)) return null;
    return nums;
  }

  function parseBinary(s: string): number[] | null {
    const parts = s.split(".");
    if (parts.length !== 4) return null;
    const nums = parts.map((p) => parseInt(p, 2));
    if (nums.some((n) => isNaN(n) || n < 0 || n > 255)) return null;
    if (!parts.every((p) => /^[01]{1,8}$/.test(p))) return null;
    return nums;
  }

  function parseHex(s: string): number[] | null {
    // Try dotted hex: C0.A8.01.01
    let cleaned = s.replace(/^0x/i, "");
    const parts = cleaned.split(".");
    if (parts.length === 4) {
      const nums = parts.map((p) => parseInt(p, 16));
      if (nums.every((n) => !isNaN(n) && n >= 0 && n <= 255)) return nums;
    }
    // Try single hex: C0A80101
    if (/^[0-9a-fA-F]{1,8}$/.test(cleaned)) {
      const n = parseInt(cleaned, 16);
      if (n >= 0 && n <= 0xffffffff) {
        return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
      }
    }
    return null;
  }

  function parseInteger(s: string): number[] | null {
    const n = parseInt(s, 10);
    if (isNaN(n) || n < 0 || n > 4294967295) return null;
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  }

  function detectAndParse(s: string): { octets: number[]; format: string } | null {
    const trimmed = s.trim();
    if (!trimmed) return null;

    // Binary dotted
    if (/^[01]+\.[01]+\.[01]+\.[01]+$/.test(trimmed)) {
      const o = parseBinary(trimmed);
      if (o) return { octets: o, format: t.binary };
    }

    // Hex dotted
    if (/^(0x)?[0-9a-fA-F]+\.[0-9a-fA-F]+\.[0-9a-fA-F]+\.[0-9a-fA-F]+$/i.test(trimmed)) {
      const o = parseHex(trimmed);
      if (o) return { octets: o, format: t.hexadecimal };
    }

    // Decimal dotted
    if (/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(trimmed)) {
      const o = parseDecimalDotted(trimmed);
      if (o) return { octets: o, format: t.decimal };
    }

    // Hex prefix
    if (/^0x[0-9a-fA-F]+$/i.test(trimmed)) {
      const o = parseHex(trimmed);
      if (o) return { octets: o, format: t.hexadecimal };
    }

    // Pure integer
    if (/^[0-9]+$/.test(trimmed)) {
      const n = parseInt(trimmed, 10);
      if (n > 255 && n <= 4294967295) {
        const o = parseInteger(trimmed);
        if (o) return { octets: o, format: t.integer };
      }
      // Could be decimal dotted partial? No. Try as integer anyway.
      const o = parseInteger(trimmed);
      if (o) return { octets: o, format: t.integer };
    }

    return null;
  }

  let parsed = $derived(detectAndParse(input));

  let decimal = $derived(parsed ? parsed.octets.join(".") : "");
  let binary = $derived(
    parsed ? parsed.octets.map((o) => o.toString(2).padStart(8, "0")).join(".") : ""
  );
  let hex = $derived(
    parsed ? parsed.octets.map((o) => o.toString(16).toUpperCase().padStart(2, "0")).join(".") : ""
  );
  let integer = $derived(
    parsed ? (((parsed.octets[0] << 24) | (parsed.octets[1] << 16) | (parsed.octets[2] << 8) | parsed.octets[3]) >>> 0).toString() : ""
  );
  let octal = $derived(
    parsed ? parsed.octets.map((o) => o.toString(8).padStart(3, "0")).join(".") : ""
  );
  let ipv6Mapped = $derived(parsed ? `::ffff:${parsed.octets.join(".")}` : "");

  function copy(value: string, field: string) {
    navigator.clipboard.writeText(value);
    copiedField = field;
    setTimeout(() => (copiedField = ""), 1500);
  }

  const fireToolComplete = useToolComplete("ip-converter");
  let __ftcFirstRun = true;
  $effect(() => {
    input; copiedField;
    if (__ftcFirstRun) { __ftcFirstRun = false; return; }
    fireToolComplete();
  });
</script>

<div class="px-6 sm:px-8 py-6 space-y-6" style="max-width: 48rem; margin: 0 auto;">
  <!-- Input -->
  <div class="card">
    <div class="card-header">
      <span class="card-title">{t.input}</span>
      {#if parsed}
        <span class="badge badge-accent">{t.detected}: {parsed.format}</span>
      {/if}
    </div>
    <div class="card-body">
      <input type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" bind:value={input} placeholder={t.placeholder} style="width: 100%; font-family: monospace;" />
      <p style="font-size: 11px; color: var(--color-text-dim); margin-top: 8px;">
        {t.inputHint}
      </p>
    </div>
  </div>

  {#if parsed}
    <!-- Conversions -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">{t.conversions}</span>
      </div>
      <div class="card-body" style="padding: 0;">
        {#each [
          { label: t.decimal, value: decimal, key: "decimal", tip: t.decimalTip },
          { label: t.binary, value: binary, key: "binary", tip: t.binaryTip },
          { label: t.hexadecimal, value: hex, key: "hex", tip: t.hexTip },
          { label: t.integer, value: integer, key: "integer", tip: t.integerTip },
          { label: t.octal, value: octal, key: "octal", tip: t.octalTip },
          { label: t.ipv4MappedIpv6, value: ipv6Mapped, key: "ipv6", tip: t.ipv6Tip },
        ] as row}
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid var(--color-border);">
            <div>
              <div style="font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 4px;">
                {row.label} <InfoTip text={row.tip} />
              </div>
              <div style="font-size: 14px; font-weight: 500; color: var(--color-text); font-family: monospace; word-break: break-all;">
                {row.value}
              </div>
            </div>
            <button class="btn-secondary" style="flex-shrink: 0; margin-left: 12px;" onclick={() => copy(row.value, row.key)}>
              {copiedField === row.key ? t.copied : t.copy}
            </button>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="card">
      <div class="card-body" style="text-align: center; padding: 32px 20px;">
        <p style="color: var(--color-text-muted); font-size: 13px;">{t.noIp}</p>
      </div>
    </div>
  {/if}
</div>
